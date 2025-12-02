import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import prisma from "@/lib/prisma";
import { LabelServiceApi } from "@/modules/labels/service/LabelServiceApi";
import { UserGroupServiceApi } from "@/modules/user-groups/service/UserGroupServiceApi";
import { WorkspaceUserServiceApi } from "@/modules/workspace-users/service/WorkspaceUserServiceApi";
import {
  ChatbotActionProgress,
  ChatbotCommandResult,
  ChatbotIntent,
  ChatbotSessionContextState,
} from "../types";
import { GeminiClient } from "./GeminiClient";

export class ChatbotServiceApi {
  private workspaceUserService = new WorkspaceUserServiceApi();
  private labelService = new LabelServiceApi();
  private userGroupService = new UserGroupServiceApi();
  private geminiClient = new GeminiClient();

  async handleMessage(
    rawMessage: string,
    context: AuthContext,
    sessionId?: number
  ): Promise<{
    sessionId: number;
    reply: string;
    intent: ChatbotIntent;
    completed?: boolean;
    quickReplies?: Array<{ label: string; value: string; color?: string }>;
  }> {
    const message = (rawMessage || "").trim();
    if (!message) {
      return {
        sessionId: sessionId ?? 0,
        reply: "لطفا متنی را وارد کنید.",
        intent: "UNKNOWN",
      };
    }

    if (!context.workspaceId || !context.workspaceUser) {
      throw new Error(
        "برای استفاده از چت‌بات باید در یک ورک‌اسپیس فعال باشید."
      );
    }

    const session = await this.getOrCreateSession(sessionId, context);
    
    console.log("[Chatbot] Session created/found:", {
      sessionId: session.id,
      workspaceId: session.workspaceId,
      workspaceUserId: session.workspaceUserId,
      title: session.title,
    });

    // اگر session جدید است و title ندارد، از اولین پیام title بساز
    let sessionTitle = session.title;
    if (!sessionTitle) {
      try {
        sessionTitle = await this.generateSessionTitle(message, session.id);
        if (sessionTitle) {
          // ذخیره title بلافاصله
          await prisma.chatbotSession.update({
            where: { id: session.id },
            data: { title: sessionTitle },
          });
          // به‌روزرسانی session object برای استفاده بعدی
          session.title = sessionTitle;
        }
      } catch (error) {
        console.error("[Chatbot] Error generating title:", error);
        // در صورت خطا، از پیام به عنوان title استفاده کن
        sessionTitle = this.getDefaultTitle(message);
        await prisma.chatbotSession.update({
          where: { id: session.id },
          data: { title: sessionTitle },
        });
        session.title = sessionTitle;
      }
    }

    // ذخیره پیام کاربر
    await prisma.chatbotMessage.create({
      data: {
        sessionId: session.id,
        role: "USER",
        content: message,
      },
    });

    // دریافت تاریخچه گفتگو
    const history = await this.getConversationHistory(session.id);

    // پردازش پیام با Gemini
    const result = await this.processWithGemini(
      session,
      message,
      history,
      context
    );

    // ذخیره پاسخ ربات
    await prisma.chatbotMessage.create({
      data: {
        sessionId: session.id,
        role: "BOT",
        content: result.reply,
        intent: result.intent !== "UNKNOWN" ? result.intent : null,
        isError: false,
      },
    });

    // به‌روزرسانی lastMessageAt در session (و title اگر هنوز تنظیم نشده)
    const updateData: any = {
      lastMessageAt: new Date(),
      currentIntent: result.intent !== "UNKNOWN" ? result.intent : null,
    };
    
    // اگر title هنوز تنظیم نشده و sessionTitle وجود دارد، آن را اضافه کن
    if (!session.title && sessionTitle) {
      updateData.title = sessionTitle;
    }
    
    await prisma.chatbotSession.update({
      where: { id: session.id },
      data: updateData,
    });
    
    // Verify session exists in database
    const verifiedSession = await prisma.chatbotSession.findUnique({
      where: { id: session.id },
      select: { id: true, workspaceId: true, workspaceUserId: true, title: true, lastMessageAt: true },
    });
    
    console.log("[Chatbot] Session verified after update:", verifiedSession);

    return {
      sessionId: session.id,
      reply: result.reply,
      intent: result.intent,
      completed: result.completed ?? false,
      quickReplies: result.quickReplies,
    };
  }

  private async processWithGemini(
    session: { id: number; context: any },
    userMessage: string,
    conversationHistory: Array<{ role: "user" | "bot"; content: string }>,
    context: AuthContext
  ): Promise<ChatbotCommandResult> {
    const ctxState: ChatbotSessionContextState =
      (session.context as ChatbotSessionContextState) ?? {};

    // اگر عملیات در حال انجام است، به ادامه آن پردازش می‌کنیم
    if (ctxState.progress) {
      return this.continueAction(
        session,
        userMessage,
        conversationHistory,
        ctxState,
        context
      );
    }

    // تشخیص قصد و استخراج داده با Gemini
    const detection = await this.geminiClient.detectIntentAndExtractData(
      userMessage,
      conversationHistory
    );

    // بررسی اینکه آیا چند دستور در یک پیام وجود دارد
    const multipleIntents = detection.extractedData?.multipleIntents;
    if (multipleIntents && Array.isArray(multipleIntents) && multipleIntents.length > 1) {
      // ساخت workflow برای اجرای چند دستور به ترتیب
      return await this.handleMultipleIntents(multipleIntents, userMessage, conversationHistory, session, context);
    }

    // اگر قصد نامشخص یا گفتگوی عادی بود
    if (detection.intent === "UNKNOWN" || detection.intent === "SMALL_TALK") {
      const response = await this.geminiClient.generateConversationalResponse(
        userMessage,
        conversationHistory,
        {}
      );
      
      // به‌روزرسانی lastMessageAt در session برای SMALL_TALK هم
      await prisma.chatbotSession.update({
        where: { id: session.id },
        data: {
          lastMessageAt: new Date(),
        },
      });
      
      return {
        reply: response.reply,
        intent: detection.intent,
        completed: true,
        quickReplies: response.quickReplies,
      };
    }

    // شروع عملیات جدید
    // برخی intent ها مستقیماً اجرا می‌شوند (نیازی به multi-step ندارند)
    const readOnlyIntents: ChatbotIntent[] = [
      "USER_SEARCH",
      "USER_LIST",
      "USER_VIEW",
      "LABEL_SEARCH",
      "LABEL_LIST",
      "LABEL_VIEW",
      "GROUP_SEARCH",
      "GROUP_LIST",
      "GROUP_VIEW",
    ];

    if (readOnlyIntents.includes(detection.intent)) {
      // اجرای مستقیم بدون multi-step
      try {
        const actionResult = await this.executeAction(
          detection.intent,
          detection.extractedData || {},
          context
        );

        // لاگ عملیات
        await prisma.chatbotAction.create({
          data: {
            sessionId: session.id,
            actionType: detection.intent,
            status: "SUCCESS",
            payload: detection.extractedData || {},
            result: { message: actionResult },
          },
        });

        // برای USER_UPDATE و USER_VIEW، مستقیماً از actionResult استفاده می‌کنیم
        // تا از تولید پاسخ‌های ساختگی توسط Gemini جلوگیری کنیم
        // اما Quick Replies را از Gemini می‌گیریم
        if (detection.intent === "USER_UPDATE" || detection.intent === "USER_VIEW") {
          const response = await this.geminiClient.generateConversationalResponse(
            userMessage,
            conversationHistory,
            {
              intent: detection.intent,
              actionResult,
            }
          );
          
          return {
            reply: actionResult, // استفاده مستقیم از نتیجه واقعی دیتابیس
            intent: detection.intent,
            completed: true,
            extractedData: detection.extractedData,
            quickReplies: response.quickReplies, // اضافه کردن Quick Replies از Gemini
          };
        }

        const response = await this.geminiClient.generateConversationalResponse(
          userMessage,
          conversationHistory,
          {
            intent: detection.intent,
            actionResult,
          }
        );

        return {
          reply: response.reply,
          intent: detection.intent,
          completed: true,
          extractedData: detection.extractedData,
          quickReplies: response.quickReplies,
        };
      } catch (error) {
        // لاگ خطا
        await prisma.chatbotAction.create({
          data: {
            sessionId: session.id,
            actionType: detection.intent,
            status: "FAILED",
            payload: detection.extractedData || {},
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
        });

        const response = await this.geminiClient.generateConversationalResponse(
          userMessage,
          conversationHistory,
          {
            intent: detection.intent,
            error: error instanceof Error ? error.message : "خطای ناشناخته",
          }
        );

        return {
          reply: response.reply,
          intent: detection.intent,
          completed: false,
          extractedData: detection.extractedData,
          quickReplies: response.quickReplies,
        };
      }
    }

    return this.startAction(
      session,
      detection.intent,
      detection.extractedData || {},
      conversationHistory,
      context
    );
  }

  private async startAction(
    session: { id: number; context: any },
    intent: ChatbotIntent,
    extractedData: Record<string, any>,
    conversationHistory: Array<{ role: "user" | "bot"; content: string }>,
    context: AuthContext
  ): Promise<ChatbotCommandResult> {
    // بررسی کامل بودن داده‌ها
    const validation = this.validateActionData(intent, extractedData);

    if (!validation.isComplete) {
      // داده‌ها کامل نیستند، از کاربر می‌پرسیم
      const progress: ChatbotActionProgress = {
        intent,
        collectedData: extractedData,
        missingFields: validation.missingFields,
        nextField: validation.missingFields[0],
      };

      await this.updateSessionContext(session.id, { progress });

      const response = await this.geminiClient.generateConversationalResponse(
        "",
        conversationHistory,
        {
          intent,
          missingFields: validation.missingFields,
          nextField: validation.missingFields[0],
        }
      );

      return {
        reply: response.reply,
        intent,
        extractedData,
        shouldAskForMore: true,
        missingFields: validation.missingFields,
        quickReplies: response.quickReplies,
      };
    }

    // داده‌ها کامل هستند
    // برای USER_UPDATE، اعتبارسنجی قبل از اجرا انجام می‌شود
    if (intent === "USER_UPDATE" && !extractedData.confirmed) {
      extractedData.needsConfirmation = true;
      // اجرای executeAction برای اعتبارسنجی (خطا برمی‌گرداند که باید به کاربر نمایش داده شود)
      try {
        await this.executeAction(intent, extractedData, context);
      } catch (validationError: any) {
        // این خطا باید به کاربر نمایش داده شود (پیام اعتبارسنجی)
        const progress: ChatbotActionProgress = {
          intent,
          collectedData: extractedData,
          missingFields: [],
        };

        await this.updateSessionContext(session.id, { progress });

        const errorMessage =
          validationError instanceof Error
            ? validationError.message
            : typeof validationError === "object" && validationError.message
            ? validationError.message
            : String(validationError);

        // اگر Quick Reply در error هست، آن را برمی‌گردانیم
        const quickReplies = validationError?.quickReplies || [
          { label: "✅ بله، تأیید می‌کنم", value: "بله", color: "green" },
          { label: "❌ خیر، انصراف", value: "انصراف", color: "red" },
        ];

        return {
          reply: errorMessage,
          intent,
          extractedData,
          shouldAskForMore: true,
          quickReplies,
        };
      }
    }

    // عملیات را اجرا می‌کنیم
    try {
      const actionResult = await this.executeAction(
        intent,
        extractedData,
        context
      );

      // لاگ عملیات
      await prisma.chatbotAction.create({
        data: {
          sessionId: session.id,
          actionType: intent,
          status: "SUCCESS",
          payload: extractedData,
          result: { message: actionResult },
        },
      });

      await this.updateSessionContext(session.id, { progress: null });

      // برای USER_UPDATE و USER_VIEW، مستقیماً از actionResult استفاده می‌کنیم
      // اما Quick Replies را از Gemini می‌گیریم
      if (intent === "USER_UPDATE" || intent === "USER_VIEW") {
        const response = await this.geminiClient.generateConversationalResponse(
          "",
          conversationHistory,
          {
            intent,
            actionResult,
          }
        );
        
        return {
          reply: actionResult, // استفاده مستقیم از نتیجه واقعی دیتابیس
          intent,
          completed: true,
          extractedData,
          quickReplies: response.quickReplies, // اضافه کردن Quick Replies از Gemini
        };
      }

      const response = await this.geminiClient.generateConversationalResponse(
        "",
        conversationHistory,
        {
          intent,
          actionResult,
        }
      );

      return {
        reply: response.reply,
        intent,
        completed: true,
        extractedData,
        quickReplies: response.quickReplies,
      };
    } catch (error) {
      // لاگ خطا
      await prisma.chatbotAction.create({
        data: {
          sessionId: session.id,
          actionType: intent,
          status: "FAILED",
          payload: extractedData,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      await this.updateSessionContext(session.id, { progress: null });

      const response = await this.geminiClient.generateConversationalResponse(
        "",
        conversationHistory,
        {
          intent,
          error: error instanceof Error ? error.message : "خطای ناشناخته",
        }
      );

      return {
        reply: response.reply,
        intent,
        completed: false,
        extractedData,
        quickReplies: response.quickReplies,
      };
    }
  }

  private async continueAction(
    session: { id: number; context: any },
    userMessage: string,
    conversationHistory: Array<{ role: "user" | "bot"; content: string }>,
    ctxState: ChatbotSessionContextState,
    context: AuthContext
  ): Promise<ChatbotCommandResult> {
    if (!ctxState.progress) {
      return {
        reply: "وضعیت عملیات نامشخص است. لطفا دوباره تلاش کنید.",
        intent: "UNKNOWN",
      };
    }

    const { progress } = ctxState;
    const workspaceId = context.workspaceId!;

    // بررسی اینکه آیا کاربر در حال تأیید یا رد یک عملیات است
    const normalizedMessage = userMessage.trim().toLowerCase();
    const isConfirmation =
      normalizedMessage === "بله" ||
      normalizedMessage === "آره" ||
      normalizedMessage === "yes" ||
      normalizedMessage === "تأیید" ||
      normalizedMessage === "مطمئنم";
    const isRejection =
      normalizedMessage === "خیر" ||
      normalizedMessage === "نه" ||
      normalizedMessage === "no" ||
      normalizedMessage === "انصراف";

    if (isRejection) {
      await this.updateSessionContext(session.id, { progress: null });
      return {
        reply: "عملیات لغو شد. اگر نیاز به کمک دارید، بپرسید.",
        intent: progress.intent,
        completed: true,
      };
    }

    // اگر تأیید شده بود، flag را اضافه می‌کنیم
    if (isConfirmation && progress.intent === "USER_UPDATE") {
      const updatedData = {
        ...progress.collectedData,
        confirmed: true,
      };

      try {
        const actionResult = await this.executeAction(
          progress.intent,
          updatedData,
          context
        );

        await prisma.chatbotAction.create({
          data: {
            sessionId: session.id,
            actionType: progress.intent,
            status: "SUCCESS",
            payload: updatedData,
            result: { message: actionResult },
          },
        });

        await this.updateSessionContext(session.id, { progress: null });

        const response = await this.geminiClient.generateConversationalResponse(
          userMessage,
          conversationHistory,
          {
            intent: progress.intent,
            actionResult,
          }
        );

        return {
          reply: response.reply,
          intent: progress.intent,
          completed: true,
          extractedData: updatedData,
          quickReplies: response.quickReplies,
        };
      } catch (error) {
        await prisma.chatbotAction.create({
          data: {
            sessionId: session.id,
            actionType: progress.intent,
            status: "FAILED",
            payload: updatedData,
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
        });

        await this.updateSessionContext(session.id, { progress: null });

        const response = await this.geminiClient.generateConversationalResponse(
          userMessage,
          conversationHistory,
          {
            intent: progress.intent,
            error: error instanceof Error ? error.message : "خطای ناشناخته",
          }
        );

        return {
          reply: response.reply,
          intent: progress.intent,
          completed: false,
          extractedData: updatedData,
          quickReplies: response.quickReplies,
        };
      }
    }

    // استخراج داده‌های جدید از پیام کاربر
    const detection = await this.geminiClient.detectIntentAndExtractData(
      userMessage,
      conversationHistory,
      {
        intent: progress.intent,
        collectedData: progress.collectedData,
        nextField: progress.nextField,
      }
    );

    // ترکیب داده‌های قبلی و جدید
    const updatedData = {
      ...progress.collectedData,
      ...detection.extractedData,
    };

    // بررسی کامل بودن داده‌ها
    const validation = this.validateActionData(progress.intent, updatedData);

    if (!validation.isComplete) {
      // هنوز داده‌ها کامل نیستند
      const updatedProgress: ChatbotActionProgress = {
        intent: progress.intent,
        collectedData: updatedData,
        missingFields: validation.missingFields,
        nextField: validation.missingFields[0],
      };

      await this.updateSessionContext(session.id, {
        progress: updatedProgress,
      });

      const response = await this.geminiClient.generateConversationalResponse(
        userMessage,
        conversationHistory,
        {
          intent: progress.intent,
          missingFields: validation.missingFields,
          nextField: validation.missingFields[0],
        }
      );

      return {
        reply: response.reply,
        intent: progress.intent,
        extractedData: updatedData,
        shouldAskForMore: true,
        missingFields: validation.missingFields,
        quickReplies: response.quickReplies,
      };
    }

    // داده‌ها کامل شدند، عملیات را اجرا می‌کنیم
    try {
      const actionResult = await this.executeAction(
        progress.intent,
        updatedData,
        context
      );

      // لاگ عملیات
      await prisma.chatbotAction.create({
        data: {
          sessionId: session.id,
          actionType: progress.intent,
          status: "SUCCESS",
          payload: updatedData,
          result: { message: actionResult },
        },
      });

      await this.updateSessionContext(session.id, { progress: null });

      // برای USER_UPDATE و USER_VIEW، مستقیماً از actionResult استفاده می‌کنیم
      // تا از تولید پاسخ‌های ساختگی توسط Gemini جلوگیری کنیم
      // اما اگر نیاز به تأیید یا Quick Reply دارد، از Gemini استفاده می‌کنیم
      if (progress.intent === "USER_UPDATE" || progress.intent === "USER_VIEW") {
        // اگر actionResult شامل نیاز به تأیید یا Quick Reply است، از Gemini استفاده می‌کنیم
        const response = await this.geminiClient.generateConversationalResponse(
          userMessage,
          conversationHistory,
          {
            intent: progress.intent,
            actionResult,
          }
        );
        
        return {
          reply: actionResult, // استفاده مستقیم از نتیجه واقعی دیتابیس
          intent: progress.intent,
          completed: true,
          extractedData: updatedData,
          quickReplies: response.quickReplies, // اضافه کردن Quick Replies از Gemini
        };
      }

      // اعتبارسنجی: بررسی اینکه reply شامل نام‌های ساختگی نیست
      const response = await this.geminiClient.generateConversationalResponse(
        userMessage,
        conversationHistory,
        {
          intent: progress.intent,
          actionResult,
        }
      );

      // Validation: بررسی اینکه reply شامل نام‌های ساختگی نباشد
      const sanitizedReply = this.validateAndSanitizeReply(response.reply, actionResult);

      return {
        reply: sanitizedReply,
        intent: progress.intent,
        completed: true,
        extractedData: updatedData,
        quickReplies: response.quickReplies,
      };
    } catch (error) {
      // بررسی اینکه آیا error شامل quickReplies است (برای خطاهای تأیید)
      const errorQuickReplies = (error as any)?.quickReplies;
      const isConfirmationError = (error as any)?.isConfirmationNeeded;
      
      // اگر خطای تأیید است و quickReplies دارد، مستقیماً برمی‌گردانیم
      if (isConfirmationError && errorQuickReplies) {
        const errorMessage = (error as any)?.message || (error instanceof Error ? error.message : String(error));
        return {
          reply: errorMessage,
          intent: progress.intent,
          completed: false,
          extractedData: updatedData,
          shouldAskForMore: true,
          quickReplies: errorQuickReplies,
        };
      }

      // لاگ خطا
      await prisma.chatbotAction.create({
        data: {
          sessionId: session.id,
          actionType: progress.intent,
          status: "FAILED",
          payload: updatedData,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      await this.updateSessionContext(session.id, { progress: null });

      const response = await this.geminiClient.generateConversationalResponse(
        userMessage,
        conversationHistory,
        {
          intent: progress.intent,
          error: error instanceof Error ? error.message : "خطای ناشناخته",
        }
      );

      // Validation: بررسی اینکه reply شامل نام‌های ساختگی نباشد
      const sanitizedReply = this.validateAndSanitizeReply(response.reply, "");

      return {
        reply: sanitizedReply,
        intent: progress.intent,
        completed: false,
        extractedData: updatedData,
        quickReplies: errorQuickReplies || response.quickReplies,
      };
    }
  }

  private validateActionData(
    intent: ChatbotIntent,
    data: Record<string, any>
  ): { isComplete: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    switch (intent) {
      case "USER_CREATE":
        if (!data.name) missingFields.push("name");
        if (!data.phone) missingFields.push("phone");
        break;
      case "USER_UPDATE":
        if (!data.identifier) missingFields.push("identifier");
        if (!data.field) missingFields.push("field");
        if (!data.value && !data.needsConfirmation) missingFields.push("value");
        // اگر confirmed وجود دارد، نیاز به value نداریم (در حال تأیید است)
        break;
      case "USER_DELETE":
        if (!data.identifier) missingFields.push("identifier");
        break;
      case "USER_SEARCH":
      case "USER_LIST":
        // هیچ فیلد الزامی ندارد، همه اختیاری است
        break;
      case "USER_VIEW":
        if (!data.identifier) missingFields.push("identifier");
        break;
      case "LABEL_CREATE":
        if (!data.name) missingFields.push("name");
        break;
      case "LABEL_UPDATE":
        if (!data.identifier) missingFields.push("identifier");
        if (!data.field) missingFields.push("field");
        if (!data.value) missingFields.push("value");
        break;
      case "LABEL_DELETE":
        if (!data.identifier) missingFields.push("identifier");
        break;
      case "LABEL_SEARCH":
      case "LABEL_LIST":
        // هیچ فیلد الزامی ندارد
        break;
      case "LABEL_VIEW":
        if (!data.identifier) missingFields.push("identifier");
        break;
      case "GROUP_CREATE":
        if (!data.name) missingFields.push("name");
        break;
      case "GROUP_UPDATE":
        if (!data.identifier) missingFields.push("identifier");
        if (!data.field) missingFields.push("field");
        if (!data.value) missingFields.push("value");
        break;
      case "GROUP_DELETE":
        if (!data.identifier) missingFields.push("identifier");
        break;
      case "GROUP_SEARCH":
      case "GROUP_LIST":
        // هیچ فیلد الزامی ندارد
        break;
      case "GROUP_VIEW":
        if (!data.identifier) missingFields.push("identifier");
        break;
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  }

  async executeAction(
    intent: ChatbotIntent,
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    switch (intent) {
      case "USER_CREATE":
        this.checkAdminAccess(context);
        return this.executeUserCreate(data, context);
      case "USER_UPDATE":
        this.checkAdminAccess(context);
        return this.executeUserUpdate(data, context);
      case "USER_DELETE":
        this.checkAdminAccess(context);
        return this.executeUserDelete(data, context);
      case "USER_SEARCH":
        return this.executeUserSearch(data, context);
      case "USER_LIST":
        return this.executeUserList(data, context);
      case "USER_VIEW":
        return this.executeUserView(data, context);
      case "LABEL_CREATE":
        this.checkAdminAccess(context);
        return this.executeLabelCreate(data, context);
      case "LABEL_UPDATE":
        this.checkAdminAccess(context);
        return this.executeLabelUpdate(data, context);
      case "LABEL_DELETE":
        this.checkAdminAccess(context);
        return this.executeLabelDelete(data, context);
      case "LABEL_SEARCH":
        return this.executeLabelSearch(data, context);
      case "LABEL_LIST":
        return this.executeLabelList(data, context);
      case "LABEL_VIEW":
        return this.executeLabelView(data, context);
      case "GROUP_CREATE":
        this.checkAdminAccess(context);
        return this.executeGroupCreate(data, context);
      case "GROUP_UPDATE":
        this.checkAdminAccess(context);
        return this.executeGroupUpdate(data, context);
      case "GROUP_DELETE":
        this.checkAdminAccess(context);
        return this.executeGroupDelete(data, context);
      case "GROUP_SEARCH":
        return this.executeGroupSearch(data, context);
      case "GROUP_LIST":
        return this.executeGroupList(data, context);
      case "GROUP_VIEW":
        return this.executeGroupView(data, context);
      default:
        throw new Error("عملیات پشتیبانی نمی‌شود");
    }
  }

  private checkAdminAccess(context: AuthContext): void {
    if (context.role?.name !== "Admin") {
      throw new Error(
        "شما دسترسی لازم برای انجام این عملیات را ندارید. فقط مدیران می‌توانند کاربران، برچسب‌ها و گروه‌ها را ایجاد، ویرایش یا حذف کنند."
      );
    }
  }

  private async executeUserCreate(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const name = data.name?.trim();
    const phone = data.phone?.trim();

    if (!name || !phone) {
      throw new Error("نام و شماره موبایل کاربر الزامی است");
    }

    // پیدا کردن role
    const role = await this.resolveRole(
      data.roleName?.trim(),
      workspaceId,
      context.workspaceUser?.role?.id
    );

    // resolve کردن labels
    const labels = await this.resolveLabels(
      Array.isArray(data.labels) ? data.labels : data.labels?.split(",") || [],
      workspaceId
    );

    // resolve کردن groups
    const groups = await this.resolveGroups(
      Array.isArray(data.groups) ? data.groups : data.groups?.split(",") || [],
      workspaceId
    );

    // ایجاد کاربر - مطمئن شو که role وجود دارد
    if (!role) {
      throw new Error("نقش کاربر باید مشخص شود. لطفاً نقش را تعیین کنید (مثلاً: کاربر عادی یا Admin)");
    }
    
    const created = await this.workspaceUserService.create(
      {
        name,
        phone,
        displayName: name,
        role: { id: role.id }, // حتماً role باید وجود داشته باشد
        labels: labels.length > 0 ? labels.map((l) => ({ id: l.id })) : undefined,
        userGroupId: groups.length > 0 ? groups[0].id : undefined, // تغییر به one-to-one
      },
      context
    );
    
    // Verify که کاربر در workspace ایجاد شده است
    const verifiedUser = await prisma.workspaceUser.findUnique({
      where: { id: created.id },
      include: {
        workspace: { select: { id: true } },
        user: { select: { id: true, name: true, phone: true } },
        role: { select: { id: true, name: true } },
        labels: { select: { id: true, name: true } },
        userGroup: { select: { id: true, name: true } },
      },
    });
    
    if (!verifiedUser || verifiedUser.workspace.id !== workspaceId) {
      throw new Error("خطا در ایجاد کاربر در workspace. لطفاً دوباره تلاش کنید.");
    }
    
    // ساخت پاسخ بر اساس اطلاعات واقعی از دیتابیس
    const actualRoleName = verifiedUser.role?.name || "ندارد";
    const actualLabels = verifiedUser.labels?.map((l) => l.name).join(", ") || "ندارد";
    const actualGroups = verifiedUser.userGroup?.name || "ندارد";
    
    // Verify changes
    const verified = await this.verifyChanges(
      "user",
      verifiedUser.id,
      "name",
      verifiedUser.displayName,
      workspaceId
    );
    
    if (labels.length > 0) {
      const labelsVerified = await this.verifyChanges(
        "user",
        verifiedUser.id,
        "labels",
        verifiedUser.labels?.map((l) => ({ id: l.id })) || [],
        workspaceId
      );
      if (!labelsVerified) {
        console.warn("[Chatbot] Labels verification failed for user", verifiedUser.id);
      }
    }
    
    if (groups.length > 0) {
      const groupsVerified = await this.verifyChanges(
        "user",
        verifiedUser.id,
        "userGroup",
        verifiedUser.userGroup ? { id: verifiedUser.userGroup.id } : null, // تغییر به one-to-one
        workspaceId
      );
      if (!groupsVerified) {
        console.warn("[Chatbot] Groups verification failed for user", verifiedUser.id);
      }
    }

    const responseMessage = `✅ کاربر ${verifiedUser.displayName || verifiedUser.user?.name} با شناسه ${verifiedUser.id} با موفقیت ایجاد شد.\n\nاطلاعات کاربر:\n🔹 نام: ${verifiedUser.displayName || verifiedUser.user?.name}\n🔹 شماره: ${verifiedUser.user?.phone || "ندارد"}\n🔹 نقش: ${actualRoleName}\n🔹 برچسب‌ها: ${actualLabels}\n🔹 گروه‌ها: ${actualGroups}`;

    return verified ? responseMessage : `کاربر ${verifiedUser.displayName || verifiedUser.user?.name} ایجاد شد.`;
  }

  private async executeUserUpdate(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = typeof data.identifier === "string" ? data.identifier.trim() : String(data.identifier || "").trim();
    let field: string = typeof data.field === "string" ? data.field.trim().toLowerCase() : String(data.field || "").trim().toLowerCase();
    const value = typeof data.value === "string" ? data.value.trim() : (data.value ? String(data.value).trim() : "");

    if (!identifier || !field) {
      throw new Error("شناسه کاربر و فیلد مورد نظر الزامی است");
    }

    // Normalize field names - تبدیل نام‌های فیلد به فرم استاندارد
    const fieldMap: Record<string, string> = {
      "rolename": "role",
      "role_name": "role",
      "label": "labels",
      "labelname": "labels",
      "label_name": "labels",
      "group": "groups",
      "groupname": "groups",
      "group_name": "groups",
      "usergroups": "groups",
      "user_groups": "groups",
    };
    
    field = fieldMap[field] || field;
    
    console.log("[Chatbot] executeUserUpdate - Normalized field:", {
      original: data.field,
      normalized: field,
      identifier,
      value,
    });

    // اگر confirmed است اما value نداریم، یعنی قبلاً اعتبارسنجی شده
    if (data.confirmed && !value && data.originalValue) {
      // از originalValue استفاده می‌کنیم
      // این حالت نباید اتفاق بیفتد چون باید value را داشته باشیم
    }

    if (!value && !data.needsConfirmation) {
      throw new Error("مقدار جدید الزامی است");
    }

    if (!value && data.needsConfirmation) {
      // در حالت اعتبارسنجی، value از collectedData باید آمده باشد
      // اگر نیست، باید از کاربر بپرسیم
      throw new Error("مقدار جدید را وارد کنید");
    }

    // پیدا کردن کاربر
    const user = await this.findUserByIdOrPhone(identifier, workspaceId);
    if (!user) {
      throw new Error("کاربری با این مشخصات پیدا نشد");
    }

    // بارگذاری اطلاعات کامل کاربر برای اعتبارسنجی
    const fullUser = await prisma.workspaceUser.findUnique({
      where: { id: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        labels: {
          select: {
            id: true,
            name: true,
          },
        },
        userGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!fullUser) {
      throw new Error("کاربر پیدا نشد");
    }

    // اعتبارسنجی و آماده‌سازی داده‌ها
    const updateData: Record<string, any> = {};
    let validationMessage = "";

    if (field === "name") {
      if (fullUser.displayName === value) {
        throw new Error(`نام کاربر قبلاً "${value}" است. تغییری اعمال نشد.`);
      }
      updateData.displayName = value;
      validationMessage = `نام از "${fullUser.displayName || fullUser.user?.name || "نامشخص"}" به "${value}" تغییر خواهد یافت.`;
    } else if (field === "phone") {
      if (fullUser.user?.phone === value) {
        throw new Error(
          `شماره تلفن کاربر قبلاً "${value}" است. تغییری اعمال نشد.`
        );
      }
      // برای تغییر شماره تلفن باید user را آپدیت کنیم
      await prisma.user.update({
        where: { id: fullUser.userId },
        data: { phone: value },
      });
      return `شماره تلفن کاربر ${fullUser.displayName || fullUser.id} از "${
        fullUser.user?.phone
      }" به "${value}" تغییر یافت.`;
    } else if (field === "role") {
      const role = await this.resolveRole(value, workspaceId);
      if (!role) throw new Error("نقشی با این نام یافت نشد");
      if (fullUser.role?.id === role.id) {
        throw new Error(
          `نقش کاربر قبلاً "${role.name}" است. تغییری اعمال نشد.`
        );
      }
      updateData.role = { id: role.id };
      validationMessage = `نقش از "${fullUser.role?.name || "ندارد"}" به "${role.name}" تغییر خواهد یافت.`;
    } else if (field === "labels") {
      const labelNames = value.split(",").map((n: string) => n.trim());
      const labels = await this.resolveLabels(labelNames, workspaceId);
      const currentLabelNames = fullUser.labels?.map((l) => l.name) || [];
      const newLabelNames = labels.map((l) => l.name);
      if (
        currentLabelNames.length === newLabelNames.length &&
        currentLabelNames.every((n) => newLabelNames.includes(n))
      ) {
        throw new Error(
          `برچسب‌های کاربر تغییری نکرده است. برچسب‌های فعلی: ${currentLabelNames.join(
            ", "
          )}`
        );
      }
      // برای labels باید به صورت { set: [...] } ارسال شود
      updateData.labels = labels.map((l) => ({ id: l.id }));
      validationMessage = `برچسب‌ها از "${
        currentLabelNames.join(", ") || "ندارد"
      }" به "${newLabelNames.join(", ")}" تغییر خواهد یافت.`;
      
      console.log("[Chatbot] executeUserUpdate - Labels prepared:", {
        labels: updateData.labels,
        count: updateData.labels.length,
      });
    } else if (field === "groups") {
      const groupNames = value.split(",").map((n: string) => n.trim());
      const groups = await this.resolveGroups(groupNames, workspaceId);
      const currentGroupName = fullUser.userGroup?.name || "ندارد"; // تغییر به one-to-one
      const newGroupName = groups.length > 0 ? groups[0].name : "ندارد"; // فقط اولین گروه
      if (currentGroupName === newGroupName) {
        throw new Error(
          `گروه کاربر تغییری نکرده است. گروه فعلی: ${currentGroupName}`
        );
      }
      // برای userGroup باید به صورت { id: ... } ارسال شود
      updateData.userGroupId = groups.length > 0 ? groups[0].id : null; // تغییر به one-to-one
      validationMessage = `گروه از "${currentGroupName}" به "${newGroupName}" تغییر خواهد یافت.`;
      
      console.log("[Chatbot] executeUserUpdate - Group prepared:", {
        userGroupId: updateData.userGroupId,
        oldGroup: currentGroupName,
        newGroup: newGroupName,
      });
    } else {
      throw new Error(
        `فیلد "${field}" قابل ویرایش نیست. فیلدهای قابل ویرایش: name, phone, role, labels, groups`
      );
    }

    // اگر نیاز به تأیید بود و تأیید نشده، پیام اعتبارسنجی برگردانیم با Quick Reply
    if (data.needsConfirmation && !data.confirmed) {
      const currentInfo = `اطلاعات فعلی کاربر:\n🔹 نام: ${
        fullUser.displayName || fullUser.user?.name
      }\n🔹 شماره: ${fullUser.user?.phone || "ندارد"}\n🔹 نقش: ${
        fullUser.role?.name || "ندارد"
      }\n🔹 برچسب‌ها: ${
        fullUser.labels?.map((l) => l.name).join(", ") || "ندارد"
      }\n🔹 گروه: ${
        fullUser.userGroup?.name || "ندارد"
      }`;
      
      const confirmationMessage = `${currentInfo}\n\n${validationMessage}\n\n⚠️ آیا مطمئن هستید که می‌خواهید این تغییر را اعمال کنید؟`;
      
      // استفاده از generateConversationalResponse برای Quick Reply
      const response = await this.geminiClient.generateConversationalResponse(
        "",
        [],
        {
          intent: "USER_UPDATE",
          needsConfirmation: true,
        }
      );
      
      // برگرداندن پیام تأیید با Quick Reply (به‌جای throw error)
      throw {
        message: confirmationMessage,
        isConfirmationNeeded: true,
        quickReplies: response.quickReplies || [
          { label: "✅ بله، تأیید می‌کنم", value: "بله", color: "green" },
          { label: "❌ خیر، انصراف", value: "انصراف", color: "red" },
        ],
      };
    }

    // نقش فعلی یا پیش‌فرض را برای پاس‌دادن به سرویس آماده کن
    let roleIdForUpdate: number | null =
      fullUser.role?.id !== undefined ? fullUser.role.id : null;
    if (!roleIdForUpdate) {
      const defaultRole =
        (await this.resolveRole("user", workspaceId)) ||
        (await this.resolveRole("کاربر عادی", workspaceId));
      if (!defaultRole) {
        const anyRole = await prisma.role.findFirst({
          where: { workspaceId },
          orderBy: { id: "asc" },
        });
        roleIdForUpdate = anyRole?.id ?? null;
      } else {
        roleIdForUpdate = defaultRole.id;
      }
    }

    if (!roleIdForUpdate) {
      throw new Error("هیچ نقشی برای این کاربر تعریف نشده است.");
    }

    const ensuredRoleId = roleIdForUpdate as number;
    const updatePayload: any = {};

    // فقط اگر role در حال تغییر است، آن را در payload بگذار
    if (field === "role" && updateData.role) {
      // استفاده از connect برای Prisma relation
      updatePayload.role = { connect: { id: updateData.role.id } };
    } else if (field === "role" && !updateData.role && ensuredRoleId) {
      // اگر role باید به مقدار پیش‌فرض برگردد
      updatePayload.role = { connect: { id: ensuredRoleId } };
    }
    // اگر field !== "role"، اصلاً role را در payload نگذاریم

    // اگر نام/نمایش تغییر کرده، مقدار جدید را بگذار؛ در غیر این صورت مقدار فعلی را ارسال کن
    if (field === "name" || updateData.displayName) {
      updatePayload.displayName =
        updateData.displayName || fullUser.displayName || fullUser.user?.name;
    }

    // برای labels: تبدیل آرایه به فرمت Prisma { set: [...] }
    if (field === "labels" && updateData.labels && Array.isArray(updateData.labels)) {
      updatePayload.labels = { set: updateData.labels };
      console.log("[Chatbot] executeUserUpdate - Labels in payload:", {
        labels: updatePayload.labels,
        count: updateData.labels.length,
      });
    } else if (field === "labels" && (!updateData.labels || !Array.isArray(updateData.labels))) {
      // اگر labels در حال به‌روزرسانی است اما updateData.labels وجود ندارد، برچسب‌های فعلی را حفظ کن
      updatePayload.labels = { set: fullUser.labels?.map(l => ({ id: l.id })) || [] };
    }

    // برای userGroup: تبدیل به فرمت Prisma (one-to-one)
    if (field === "groups" && updateData.userGroupId !== undefined) {
      updatePayload.userGroupId = updateData.userGroupId; // فقط ID را تنظیم می‌کنیم
      console.log("[Chatbot] executeUserUpdate - UserGroup in payload:", {
        userGroupId: updatePayload.userGroupId,
      });
    }

    console.log("[Chatbot] executeUserUpdate - Final updatePayload:", {
      userId: user.id,
      payload: JSON.stringify(updatePayload, null, 2),
      field,
    });

    // استفاده از transaction برای اطمینان از atomicity
    // خواندن را در داخل transaction انجام می‌دهیم تا مطمئن شویم که تغییرات commit شده‌اند
    let verifiedUser = await prisma.$transaction(async (tx) => {
      // Update را انجام می‌دهیم
      await tx.workspaceUser.update({
        where: { id: user.id },
        data: updatePayload,
      });
      
      console.log("[Chatbot] executeUserUpdate - Update completed in transaction, reading back...");
      
      // خواندن در همان transaction برای اطمینان از consistency
      const updated = await tx.workspaceUser.findUnique({
        where: { id: user.id },
        include: {
          workspace: { select: { id: true } },
          user: { select: { id: true, name: true, phone: true } },
          role: { select: { id: true, name: true } },
          labels: { select: { id: true, name: true, color: true } },
          userGroup: { select: { id: true, name: true } },
        },
      });
      
      if (!updated) {
        throw new Error("خطا در خواندن اطلاعات کاربر بعد از به‌روزرسانی");
      }
      
      // بررسی تطابق در داخل transaction برای اطمینان از صحت تغییرات
      if (field === "labels" && updateData.labels) {
        const expectedLabelIds = updateData.labels.map((l: { id: number }) => l.id).sort();
        const actualLabelIds = (updated.labels || []).map(l => l.id).sort();
        const idsMatch = JSON.stringify(expectedLabelIds) === JSON.stringify(actualLabelIds);
        
        if (!idsMatch) {
          console.error("[Chatbot] executeUserUpdate - Labels mismatch INSIDE transaction:", {
            expected: expectedLabelIds,
            actual: actualLabelIds,
            expectedNames: updateData.labels.map((l: any) => l.name || l.id),
            actualNames: updated.labels?.map(l => l.name),
          });
          // در داخل transaction، اگر mismatch بود، rollback می‌شود
          throw new Error(`خطا: تغییرات برچسب‌ها در transaction اعمال نشد. انتظار: [${expectedLabelIds.join(", ")}], واقعی: [${actualLabelIds.join(", ")}]`);
        }
        
        console.log("[Chatbot] executeUserUpdate - ✅ Labels verified INSIDE transaction:", {
          expected: expectedLabelIds,
          actual: actualLabelIds,
          names: updated.labels?.map(l => l.name),
        });
      }
      
      return updated;
    }, {
      timeout: 10000, // 10 seconds timeout
      // Note: Isolation level may vary by database, Prisma handles it automatically
    });
    
    // اگر هنوز تغییرات اعمال نشده، با retry mechanism تلاش می‌کنیم
    if (!verifiedUser) {
      throw new Error("خطا در خواندن اطلاعات کاربر بعد از به‌روزرسانی");
    }
    
    // بررسی تطابق: اگر برچسب‌ها تغییر نکرده‌اند، retry می‌کنیم
    if (field === "labels" && updateData.labels) {
      const expectedLabelIds = updateData.labels.map((l: { id: number }) => l.id).sort();
      const actualLabelIds = (verifiedUser.labels || []).map(l => l.id).sort();
      const idsMatch = JSON.stringify(expectedLabelIds) === JSON.stringify(actualLabelIds);
      
      if (!idsMatch) {
        console.error("[Chatbot] executeUserUpdate - Labels mismatch after transaction, retrying...", {
          expected: expectedLabelIds,
          actual: actualLabelIds,
        });
        
        // Retry mechanism: خواندن مجدد با exponential backoff
        let retries = 3;
        let lastError: Error | null = null;
        
        while (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 300 * (4 - retries))); // 300, 600, 900ms
          
          try {
            // استفاده از queryRaw برای اطمینان از خواندن از master database
            const retryUser = await prisma.workspaceUser.findUnique({
              where: { id: user.id },
              include: {
                workspace: { select: { id: true } },
                user: { select: { id: true, name: true, phone: true } },
                role: { select: { id: true, name: true } },
                labels: { select: { id: true, name: true, color: true } },
                userGroup: { select: { id: true, name: true } },
              },
            });
            
            if (retryUser) {
              const retryLabelIds = (retryUser.labels || []).map(l => l.id).sort();
              if (JSON.stringify(expectedLabelIds) === JSON.stringify(retryLabelIds)) {
                verifiedUser = retryUser;
                console.log("[Chatbot] executeUserUpdate - ✅ Labels matched after retry");
                break;
              }
            }
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
          }
          
          retries--;
        }
        
        // اگر بعد از retry هم تطابق نداشت، خطا می‌دهیم
        const finalLabelIds = (verifiedUser.labels || []).map(l => l.id).sort();
        if (JSON.stringify(expectedLabelIds) !== JSON.stringify(finalLabelIds)) {
          throw new Error(`❌ خطا: بعد از ${3} بار تلاش، برچسب‌های کاربر در دیتابیس به "${verifiedUser.labels?.map(l => l.name).join(", ")}" است، اما انتظار "${updateData.labels.map((l: any) => l.name || l.id).join(", ")}" داشتیم. تغییرات اعمال نشده است.`);
        }
      }
    }
    
    if (!verifiedUser || verifiedUser.workspace.id !== workspaceId) {
      throw new Error("خطا در به‌روزرسانی کاربر در workspace");
    }
    
    console.log("[Chatbot] executeUserUpdate - Verified user from DB:", {
      userId: verifiedUser.id,
      roleId: verifiedUser.role?.id,
      roleName: verifiedUser.role?.name,
      labelIds: verifiedUser.labels?.map(l => l.id),
      labelNames: verifiedUser.labels?.map(l => l.name),
      groupId: verifiedUser.userGroup?.id,
      groupName: verifiedUser.userGroup?.name,
    });
    
    // ساخت پاسخ بر اساس اطلاعات واقعی از دیتابیس
    const actualRoleName = verifiedUser.role?.name || "ندارد";
    const actualLabels = verifiedUser.labels?.map((l) => l.name).join(", ") || "ندارد";
    const actualGroups = verifiedUser.userGroup?.name || "ندارد";
    
    // بررسی اینکه آیا تغییرات واقعاً اعمال شده‌اند
    if (field === "role" && updateData.role) {
      const expectedRoleId = updateData.role.id;
      const actualRoleId = verifiedUser.role?.id;
      if (actualRoleId !== expectedRoleId) {
        console.error("[Chatbot] executeUserUpdate - Role mismatch:", {
          expected: expectedRoleId,
          actual: actualRoleId,
        });
        throw new Error(`خطا: نقش کاربر به ${actualRoleName} تغییر یافت، اما انتظار نقش دیگری داشتیم. لطفاً دوباره تلاش کنید.`);
      }
    }
    
    if (field === "labels" && updateData.labels) {
      const expectedLabelIds = updateData.labels.map((l: { id: number }) => l.id).sort();
      const actualLabelIds = (verifiedUser.labels || []).map(l => l.id).sort();
      if (JSON.stringify(expectedLabelIds) !== JSON.stringify(actualLabelIds)) {
        console.error("[Chatbot] executeUserUpdate - Labels mismatch:", {
          expected: expectedLabelIds,
          actual: actualLabelIds,
          expectedNames: updateData.labels.map((l: { id: number }) => {
            const label = updateData.labels.find((lb: any) => lb.id === l.id);
            return label?.name || l.id;
          }),
          actualNames: verifiedUser.labels?.map(l => l.name),
        });
        throw new Error(`❌ خطا: برچسب‌های کاربر در دیتابیس به "${actualLabels}" است، اما انتظار "${updateData.labels.map((l: any) => l.name || l.id).join(", ")}" داشتیم. تغییرات اعمال نشده است. لطفاً دوباره تلاش کنید.`);
      }
      console.log("[Chatbot] executeUserUpdate - ✅ Labels verified successfully:", {
        expected: expectedLabelIds,
        actual: actualLabelIds,
        names: actualLabels,
      });
    }
    
    if (field === "groups" && updateData.userGroupId !== undefined) {
      const expectedGroupId = updateData.userGroupId;
      const actualGroupId = verifiedUser.userGroup?.id || null;
      if (actualGroupId !== expectedGroupId) {
        console.error("[Chatbot] executeUserUpdate - Group mismatch:", {
          expected: expectedGroupId,
          actual: actualGroupId,
        });
        throw new Error(`خطا: گروه کاربر به ${actualGroups} تغییر یافت، اما گروه مورد انتظار اعمال نشده است. لطفاً دوباره بررسی کنید.`);
      }
    }
    
    // برای verify، مقادیر واقعی را استفاده کن
    let verifyValue: any;
    let verifyFieldName: string;
    
    if (field === "role") {
      verifyValue = verifiedUser.role?.id;
      verifyFieldName = "roleId";
    } else if (field === "labels") {
      verifyValue = verifiedUser.labels?.map((l) => ({ id: l.id })) || [];
      verifyFieldName = "labels";
    } else if (field === "groups") {
      verifyValue = verifiedUser.userGroup ? { id: verifiedUser.userGroup.id } : null; // تغییر به one-to-one
      verifyFieldName = "userGroup";
    } else {
      // برای فیلدهای دیگر مثل name و phone
      verifyValue = value;
      verifyFieldName = field;
    }
    
    // ساخت پاسخ دقیق بر اساس اطلاعات واقعی از دیتابیس
    // همیشه از verifiedUser استفاده می‌کنیم تا مطمئن شویم اطلاعات واقعی است
    const responseMessage = `✅ تغییرات با موفقیت اعمال شد.\n\nاطلاعات به‌روز شده کاربر (از دیتابیس):\n🔹 نام: ${verifiedUser.displayName || verifiedUser.user?.name}\n🔹 شماره: ${verifiedUser.user?.phone || "ندارد"}\n🔹 نقش: ${actualRoleName}\n🔹 برچسب‌ها: ${actualLabels}\n🔹 گروه: ${actualGroups}`;

    // اگر verifyChanges خطا داد، آن را throw می‌کنیم
    const verified = await this.verifyChanges(
      "user",
      identifier,
      verifyFieldName,
      verifyValue,
      workspaceId
    );

    if (!verified) {
      console.error("[Chatbot] executeUserUpdate - Verification failed:", {
        identifier,
        field: verifyFieldName,
        expectedValue: verifyValue,
        actualUser: verifiedUser,
      });
      throw new Error(`⚠️ هشدار: تغییرات ممکن است به درستی اعمال نشده باشند. لطفاً دوباره بررسی کنید.\n${responseMessage}`);
    }

    return responseMessage;
  }

  private async executeUserDelete(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();

    if (!identifier) {
      throw new Error("شناسه یا شماره موبایل کاربر الزامی است");
    }

    const user = await this.findUserByIdOrPhone(identifier, workspaceId);
    if (!user) {
      throw new Error("کاربری با این مشخصات پیدا نشد");
    }

    const userName = user.displayName || user.id;
    await this.workspaceUserService.delete(user.id);

    // Verify deletion
    const stillExists = await this.findUserByIdOrPhone(identifier, workspaceId);
    const verified = !stillExists;

    return verified
      ? `✅ کاربر ${userName} با موفقیت حذف شد.`
      : `کاربر ${userName} حذف شد.`;
  }

  private async executeUserSearch(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const searchQuery = data.query?.trim() || data.search?.trim();

    const filters: any = { workspaceId };

    // اگر query وجود داشت، جستجو در نام و شماره تلفن
    if (searchQuery) {
      filters.OR = [
        {
          displayName: {
            contains: searchQuery,
          },
        },
        {
          user: {
            name: {
              contains: searchQuery,
            },
          },
        },
        {
          user: {
            phone: {
              contains: searchQuery,
            },
          },
        },
      ];
    }

    // فیلتر بر اساس برچسب - همیشه جستجوی جدید از دیتابیس
    if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
      console.log(`[Chatbot] executeUserSearch - Searching for labels:`, data.labels);
      const labelIds = await this.resolveLabels(data.labels, workspaceId);
      console.log(`[Chatbot] executeUserSearch - Resolved label IDs:`, labelIds.map((l) => l.id));
      filters.labels = {
        some: {
          id: {
            in: labelIds.map((l) => l.id),
          },
        },
      };
    }

    // فیلتر بر اساس گروه
    if (data.groups && Array.isArray(data.groups) && data.groups.length > 0) {
      const groupIds = await this.resolveGroups(data.groups, workspaceId);
      filters.userGroupId = {
        in: groupIds.map((g) => g.id),
      };
    }

    console.log(`[Chatbot] executeUserSearch - Final filters:`, JSON.stringify(filters, null, 2));

    const users = await prisma.workspaceUser.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        userGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: data.limit ? Number(data.limit) : 20,
      orderBy: { createdAt: "desc" },
    });

    console.log(`[Chatbot] executeUserSearch - Found ${users.length} users`);

    if (users.length === 0) {
      // اگر با فیلتر برچسب جستجو شد، پیام دقیق‌تری بدهیم
      if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
        return `کاربری با برچسب‌(های) "${data.labels.join(", ")}" پیدا نشد.`;
      }
      if (searchQuery) {
        return `کاربری با کلمه کلیدی "${searchQuery}" پیدا نشد.`;
      }
      return "کاربری با این مشخصات پیدا نشد.";
    }

    const userList = users
      .map(
        (u) =>
          `• ${u.displayName || u.user?.name} (ID: ${u.id})\n  شماره: ${
            u.user?.phone || "ندارد"
          }\n  نقش: ${u.role?.name || "ندارد"}\n  برچسب‌ها: ${
            u.labels?.map((l) => l.name).join(", ") || "ندارد"
          }\n  گروه‌ها: ${
            u.userGroup?.name || "ندارد"
          }`
      )
      .join("\n\n");

    return `تعداد ${users.length} کاربر پیدا شد:\n\n${userList}`;
  }

  private async executeUserList(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;

    const filters: any = { workspaceId };

    // فیلتر بر اساس برچسب - همیشه جستجوی جدید از دیتابیس
    if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
      console.log(`[Chatbot] executeUserList - Searching for labels:`, data.labels);
      const labelIds = await this.resolveLabels(data.labels, workspaceId);
      console.log(`[Chatbot] executeUserList - Resolved label IDs:`, labelIds.map((l) => l.id));
      filters.labels = {
        some: {
          id: {
            in: labelIds.map((l) => l.id),
          },
        },
      };
    }

    // فیلتر بر اساس گروه
    if (data.groups && Array.isArray(data.groups) && data.groups.length > 0) {
      const groupIds = await this.resolveGroups(data.groups, workspaceId);
      filters.userGroupId = {
        in: groupIds.map((g) => g.id),
      };
    }

    console.log(`[Chatbot] executeUserList - Final filters:`, JSON.stringify(filters, null, 2));

    const limit = data.limit ? Number(data.limit) : 50;
    const users = await prisma.workspaceUser.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        userGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    console.log(`[Chatbot] executeUserList - Found ${users.length} users`);

    if (users.length === 0) {
      // اگر با فیلتر برچسب جستجو شد، پیام دقیق‌تری بدهیم
      if (data.labels && Array.isArray(data.labels) && data.labels.length > 0) {
        return `کاربری با برچسب‌(های) "${data.labels.join(", ")}" پیدا نشد.`;
      }
      return "کاربری پیدا نشد.";
    }

    const userList = users
      .map(
        (u, index) =>
          `${index + 1}. ${u.displayName || u.user?.name} (ID: ${
            u.id
          })\n   شماره: ${u.user?.phone || "ندارد"}\n   نقش: ${
            u.role?.name || "ندارد"
          }\n   برچسب‌ها: ${
            u.labels?.map((l) => l.name).join(", ") || "ندارد"
          }\n   گروه‌ها: ${
            u.userGroup?.name || "ندارد"
          }`
      )
      .join("\n\n");

    return `لیست کاربران (${users.length} مورد):\n\n${userList}`;
  }

  private async executeUserView(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();

    if (!identifier) {
      throw new Error("نام، شناسه یا شماره موبایل کاربر الزامی است");
    }

    const user = await this.findUserByIdOrPhone(identifier, workspaceId);

    if (!user) {
      throw new Error("کاربری با این مشخصات پیدا نشد");
    }

    // بارگذاری کامل اطلاعات کاربر
    const fullUser = await prisma.workspaceUser.findUnique({
      where: { id: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        userGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!fullUser) {
      throw new Error("کاربر پیدا نشد");
    }

    const info = [
      `🔹 نام نمایشی: ${
        fullUser.displayName || fullUser.user?.name || "ندارد"
      }`,
      `🔹 نام واقعی: ${fullUser.user?.name || "ندارد"}`,
      `🔹 شناسه: ${fullUser.id}`,
      `🔹 شماره تلفن: ${fullUser.user?.phone || "ندارد"}`,
      `🔹 نقش: ${fullUser.role?.name || "ندارد"}`,
      `🔹 برچسب‌ها: ${
        fullUser.labels?.map((l) => l.name).join(", ") || "ندارد"
      }`,
      `🔹 گروه: ${
        fullUser.userGroup?.name || "ندارد"
      }`,
      `🔹 تاریخ عضویت: ${new Date(fullUser.createdAt).toLocaleDateString(
        "fa-IR"
      )}`,
    ].join("\n");

    return `اطلاعات کاربر:\n\n${info}`;
  }

  /**
   * تبدیل اسم رنگ به hex code
   */
  private convertColorToHex(colorName: string): string {
    if (!colorName) return "#3b82f6"; // default blue

    const trimmed = colorName.trim();

    // اگر از قبل hex code است، برگردان
    if (trimmed.startsWith("#")) {
      return trimmed.length === 7 ? trimmed : `#${trimmed.replace("#", "")}`;
    }

    // تبدیل اسم رنگ به hex (انگلیسی و فارسی)
    const colorMap: Record<string, string> = {
      // انگلیسی
      primary: "#3b82f6",
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#10b981",
      yellow: "#f59e0b",
      purple: "#8b5cf6",
      pink: "#ec4899",
      orange: "#f97316",
      indigo: "#6366f1",
      teal: "#14b8a6",
      cyan: "#06b6d4",
      lime: "#84cc16",
      amber: "#f59e0b",
      emerald: "#10b981",
      violet: "#8b5cf6",
      fuchsia: "#d946ef",
      rose: "#f43f5e",
      slate: "#64748b",
      gray: "#6b7280",
      grey: "#6b7280",
      zinc: "#71717a",
      neutral: "#737373",
      stone: "#78716c",
      // فارسی
      قرمز: "#ef4444",
      آبی: "#3b82f6",
      سبز: "#10b981",
      زرد: "#f59e0b",
      بنفش: "#8b5cf6",
      صورتی: "#ec4899",
      نارنجی: "#f97316",
      ارغوانی: "#6366f1",
      فیروزه‌ای: "#14b8a6",
      "آبی آسمانی": "#06b6d4",
      آبی‌آسمانی: "#06b6d4",
      لیمویی: "#84cc16",
      کهربایی: "#f59e0b",
      زمردی: "#10b981",
      سرخابی: "#d946ef",
      رز: "#f43f5e",
      خاکستری: "#64748b",
      طوسی: "#6b7280",
      خنثی: "#737373",
      سنگی: "#78716c",
    };
    
    const normalized = trimmed.toLowerCase().trim();
    // حذف فاصله‌ها برای تطبیق بهتر
    const normalizedNoSpace = normalized.replace(/\s+/g, "");
    
    // اول بدون فاصله چک می‌کنیم
    if (colorMap[normalizedNoSpace]) {
      return colorMap[normalizedNoSpace];
    }
    
    // سپس با فاصله
    if (colorMap[normalized]) {
      return colorMap[normalized];
    }
    
    return "#3b82f6"; // default to blue
  }

  /**
   * بررسی تغییرات واقعی در دیتابیس بعد از عملیات
   */
  private async verifyChanges(
    entityType: "user" | "label" | "group",
    identifier: string | number,
    expectedField: string,
    expectedValue: any,
    workspaceId: number
  ): Promise<boolean> {
    try {
      if (entityType === "user") {
        const user = await this.findUserByIdOrPhone(
          String(identifier),
          workspaceId
        );
        if (!user) return false;

        const fullUser = await prisma.workspaceUser.findUnique({
          where: { id: user.id },
          include: {
            workspace: { select: { id: true } },
            user: { select: { phone: true, name: true } },
            role: { select: { id: true, name: true } },
            labels: { select: { id: true, name: true } },
            userGroup: { select: { id: true, name: true } },
          },
        });
        
        // بررسی workspaceId
        if (!fullUser || fullUser.workspace.id !== workspaceId) {
          return false;
        }

        if (!fullUser) return false;

        if (expectedField === "name") {
          return fullUser.displayName === expectedValue;
        } else if (expectedField === "phone") {
          return fullUser.user?.phone === expectedValue;
        } else if (expectedField === "role" || expectedField === "roleId") {
          // اگر expectedValue عدد است، مقایسه ID
          if (typeof expectedValue === "number") {
            return fullUser.role?.id === expectedValue;
          }
          // اگر object است، مقایسه ID
          if (typeof expectedValue === "object" && expectedValue?.id) {
            return fullUser.role?.id === expectedValue.id;
          }
          // در غیر این صورت مقایسه نام
          return fullUser.role?.name === expectedValue;
        } else if (expectedField === "labels") {
          // مقایسه آرایه ID های labels
          const expectedIds = Array.isArray(expectedValue)
            ? expectedValue.map((v) => (typeof v === "object" && v.id ? v.id : v)).sort((a, b) => Number(a) - Number(b))
            : [];
          const actualIds = (fullUser.labels || []).map((l) => l.id).sort((a, b) => a - b);
          
          if (expectedIds.length !== actualIds.length) return false;
          return expectedIds.every((id, idx) => Number(id) === actualIds[idx]);
        } else if (expectedField === "userGroup" || expectedField === "groups") {
          // مقایسه ID تکی userGroup (one-to-one)
          const expectedId = typeof expectedValue === "object" && expectedValue !== null && "id" in expectedValue
            ? expectedValue.id
            : expectedValue;
          const actualId = fullUser.userGroup?.id || null;
          
          return expectedId === actualId;
        }
        return false;
      } else if (entityType === "label") {
        const label = await this.findLabelByName(
          String(identifier),
          workspaceId
        );
        if (!label) return false;

        const updatedLabel = await prisma.label.findUnique({
          where: { id: label.id },
        });
        if (!updatedLabel) return false;

        return (
          updatedLabel[expectedField as keyof typeof updatedLabel] ===
          expectedValue
        );
      } else if (entityType === "group") {
        const group = await this.findGroupByName(
          String(identifier),
          workspaceId
        );
        if (!group) return false;

        const updatedGroup = await prisma.userGroup.findUnique({
          where: { id: group.id },
        });
        if (!updatedGroup) return false;

        return (
          updatedGroup[expectedField as keyof typeof updatedGroup] ===
          expectedValue
        );
      }
      return false;
    } catch {
      return false;
    }
  }

  private async executeLabelCreate(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const name = data.name?.trim();
    if (!name) {
      throw new Error("نام برچسب الزامی است");
    }

    const colorHex = this.convertColorToHex(data.color?.trim() || "primary");

    const created = await this.labelService.create(
      {
        name,
        color: colorHex,
      },
      context
    );

    // Verify changes
    const verified = await this.verifyChanges(
      "label",
      name,
      "name",
      name,
      context.workspaceId!
    );

    return verified
      ? `✅ برچسب "${name}" با موفقیت ایجاد شد. (رنگ: ${colorHex})`
      : `برچسب "${name}" ایجاد شد.`;
  }

  private async executeLabelUpdate(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();
    const field = data.field?.trim().toLowerCase();
    let value = data.value?.trim();

    if (!identifier || !field || !value) {
      throw new Error("شناسه برچسب، فیلد و مقدار جدید الزامی است");
    }

    const label = await this.findLabelByName(identifier, workspaceId);
    if (!label) {
      throw new Error("برچسبی با این نام یافت نشد");
    }

    if (!["name", "color"].includes(field)) {
      throw new Error(
        `فیلد "${field}" قابل ویرایش نیست. فیلدهای قابل ویرایش: name, color`
      );
    }

    // اگر field رنگ است، تبدیل به hex
    if (field === "color") {
      const originalValue = value;
      const convertedHex = this.convertColorToHex(value);
      
      // لاگ برای دیباگ
      console.log(`[Chatbot] رنگ تبدیل می‌شود: "${originalValue}" → "${convertedHex}"`);
      
      // اگر تبدیل نشد (default به blue رفت)، هشدار بده
      if (!originalValue.startsWith("#") && convertedHex === "#3b82f6") {
        const normalized = originalValue.toLowerCase().trim();
        if (normalized !== "blue" && normalized !== "آبی" && normalized !== "primary") {
          console.warn(`[Chatbot] رنگ "${originalValue}" به درستی تشخیص داده نشد، از رنگ پیش‌فرض (#3b82f6) استفاده شد.`);
          throw new Error(`رنگ "${originalValue}" شناخته شده نیست. لطفا از رنگ‌های معتبر استفاده کنید مثل: نارنجی، قرمز، آبی، سبز، زرد، بنفش، صورتی و... یا hex code مثل #f97316`);
        }
      }
      
      value = convertedHex;
    }

    // ذخیره رنگ قبلی برای مقایسه
    const oldColor = label.color;
    
    await this.labelService.update(label.id, { [field]: value });

    // Verify changes
    const verified = await this.verifyChanges(
      "label",
      identifier,
      field,
      value,
      workspaceId
    );

    // اگر رنگ تغییر کرده، نمایش رنگ قدیمی و جدید
    const colorChangeInfo = field === "color" && oldColor !== value
      ? `\nرنگ قبلی: ${oldColor}\nرنگ جدید: ${value}`
      : field === "color" ? `\nرنگ جدید: ${value}` : "";

    return verified
      ? `✅ برچسب "${label.name}" با موفقیت به‌روزرسانی شد.${colorChangeInfo}`
      : `برچسب "${label.name}" به‌روزرسانی شد.${colorChangeInfo}`;
  }

  private async executeLabelDelete(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();

    if (!identifier) {
      throw new Error("شناسه یا نام برچسب الزامی است");
    }

    const label = await this.findLabelByName(identifier, workspaceId);
    if (!label) {
      throw new Error("برچسبی با این نام یافت نشد");
    }

    const labelName = label.name;
    await this.labelService.delete(label.id);

    // Verify deletion
    const stillExists = await this.findLabelByName(identifier, workspaceId);
    const verified = !stillExists;

    return verified
      ? `✅ برچسب "${labelName}" با موفقیت حذف شد.`
      : `برچسب "${labelName}" حذف شد.`;
  }

  private async executeLabelSearch(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const searchQuery = data.query?.trim() || data.search?.trim();

    const filters: any = { workspaceId };

    if (searchQuery) {
      filters.name = {
        contains: searchQuery,
      };
    }

    const labels = await prisma.label.findMany({
      where: filters,
      take: data.limit ? Number(data.limit) : 20,
      orderBy: { createdAt: "desc" },
    });

    if (labels.length === 0) {
      return "برچسبی با این مشخصات پیدا نشد.";
    }

    const labelList = labels
      .map((l) => `• ${l.name} (ID: ${l.id})\n  رنگ: ${l.color}`)
      .join("\n\n");

    return `تعداد ${labels.length} برچسب پیدا شد:\n\n${labelList}`;
  }

  private async executeLabelList(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const limit = data.limit ? Number(data.limit) : 50;

    const labels = await prisma.label.findMany({
      where: { workspaceId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (labels.length === 0) {
      return "برچسبی پیدا نشد.";
    }

    const labelList = labels
      .map(
        (l, index) =>
          `${index + 1}. ${l.name} (ID: ${l.id})\n   رنگ: ${l.color}`
      )
      .join("\n\n");

    return `لیست برچسب‌ها (${labels.length} مورد):\n\n${labelList}`;
  }

  private async executeLabelView(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();

    if (!identifier) {
      throw new Error("نام یا شناسه برچسب الزامی است");
    }

    const label = await this.findLabelByName(identifier, workspaceId);
    if (!label) {
      throw new Error("برچسبی با این مشخصات پیدا نشد");
    }

    // Get full label info
    const fullLabel = await prisma.label.findUnique({
      where: { id: label.id },
      include: {
        _count: {
          select: {
            workspaceUsers: true,
          },
        },
      },
    });

    if (!fullLabel) {
      throw new Error("برچسب پیدا نشد");
    }

    const info = [
      `🔹 نام: ${fullLabel.name}`,
      `🔹 شناسه: ${fullLabel.id}`,
      `🔹 رنگ: ${fullLabel.color}`,
      `🔹 تعداد کاربران: ${fullLabel._count?.workspaceUsers || 0}`,
      `🔹 تاریخ ایجاد: ${new Date(fullLabel.createdAt).toLocaleDateString(
        "fa-IR"
      )}`,
    ].join("\n");

    return `اطلاعات برچسب:\n\n${info}`;
  }

  private async executeGroupCreate(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const name = data.name?.trim();
    if (!name) {
      throw new Error("نام گروه الزامی است");
    }

    await this.userGroupService.create(
      {
        name,
        description: data.description?.trim() || undefined,
      },
      context
    );

    return `گروه "${name}" با موفقیت ایجاد شد.`;
  }

  private async executeGroupUpdate(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();
    const field = data.field?.trim().toLowerCase();
    const value = data.value?.trim();

    if (!identifier || !field || !value) {
      throw new Error("شناسه گروه، فیلد و مقدار جدید الزامی است");
    }

    const group = await this.findGroupByName(identifier, workspaceId);
    if (!group) {
      throw new Error("گروهی با این نام یافت نشد");
    }

    if (!["name", "description"].includes(field)) {
      throw new Error(
        `فیلد "${field}" قابل ویرایش نیست. فیلدهای قابل ویرایش: name, description`
      );
    }

    await this.userGroupService.update(group.id, { [field]: value });

    // Verify changes
    const verified = await this.verifyChanges(
      "group",
      identifier,
      field,
      value,
      workspaceId
    );

    return verified
      ? `✅ گروه "${group.name}" با موفقیت به‌روزرسانی شد.`
      : `گروه "${group.name}" به‌روزرسانی شد.`;
  }

  private async executeGroupDelete(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();

    if (!identifier) {
      throw new Error("شناسه یا نام گروه الزامی است");
    }

    const group = await this.findGroupByName(identifier, workspaceId);
    if (!group) {
      throw new Error("گروهی با این نام یافت نشد");
    }

    const groupName = group.name;
    await this.userGroupService.delete(group.id);

    // Verify deletion
    const stillExists = await this.findGroupByName(identifier, workspaceId);
    const verified = !stillExists;

    return verified
      ? `✅ گروه "${groupName}" با موفقیت حذف شد.`
      : `گروه "${groupName}" حذف شد.`;
  }

  private async executeGroupSearch(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const searchQuery = data.query?.trim() || data.search?.trim();

    const filters: any = { workspaceId };

    if (searchQuery) {
      filters.OR = [
        {
          name: {
            contains: searchQuery,
          },
        },
        {
          description: {
            contains: searchQuery,
          },
        },
      ];
    }

    const groups = await prisma.userGroup.findMany({
      where: filters,
      take: data.limit ? Number(data.limit) : 20,
      orderBy: { createdAt: "desc" },
    });

    if (groups.length === 0) {
      return "گروهی با این مشخصات پیدا نشد.";
    }

    const groupList = groups
      .map(
        (g) =>
          `• ${g.name} (ID: ${g.id})\n  ${
            g.description ? `توضیحات: ${g.description}` : "بدون توضیحات"
          }`
      )
      .join("\n\n");

    return `تعداد ${groups.length} گروه پیدا شد:\n\n${groupList}`;
  }

  private async executeGroupList(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const limit = data.limit ? Number(data.limit) : 50;

    const groups = await prisma.userGroup.findMany({
      where: { workspaceId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (groups.length === 0) {
      return "گروهی پیدا نشد.";
    }

    const groupList = groups
      .map(
        (g, index) =>
          `${index + 1}. ${g.name} (ID: ${g.id})\n   ${
            g.description ? `توضیحات: ${g.description}` : "بدون توضیحات"
          }`
      )
      .join("\n\n");

    return `لیست گروه‌ها (${groups.length} مورد):\n\n${groupList}`;
  }

  private async executeGroupView(
    data: Record<string, any>,
    context: AuthContext
  ): Promise<string> {
    const workspaceId = context.workspaceId!;
    const identifier = data.identifier?.trim();

    if (!identifier) {
      throw new Error("نام یا شناسه گروه الزامی است");
    }

    const group = await this.findGroupByName(identifier, workspaceId);
    if (!group) {
      throw new Error("گروهی با این مشخصات پیدا نشد");
    }

    // Get full group info
    const fullGroup = await prisma.userGroup.findUnique({
      where: { id: group.id },
      include: {
        _count: {
          select: {
            workspaceUsers: true,
          },
        },
      },
    });

    if (!fullGroup) {
      throw new Error("گروه پیدا نشد");
    }

    const info = [
      `🔹 نام: ${fullGroup.name}`,
      `🔹 شناسه: ${fullGroup.id}`,
      `🔹 توضیحات: ${fullGroup.description || "ندارد"}`,
      `🔹 تعداد کاربران: ${fullGroup._count?.workspaceUsers || 0}`,
      `🔹 تاریخ ایجاد: ${new Date(fullGroup.createdAt).toLocaleDateString(
        "fa-IR"
      )}`,
    ].join("\n");

    return `اطلاعات گروه:\n\n${info}`;
  }

  // Helper methods
  private async findUserByIdOrPhone(
    identifier: string,
    workspaceId: number
  ): Promise<any> {
    const numericId = Number(identifier);
    if (!isNaN(numericId)) {
      const user = await prisma.workspaceUser.findFirst({
        where: { id: numericId, workspaceId },
      });
      if (user) return user;
    }

    // جستجو با شماره تلفن یا نام
    return prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        OR: [
          {
            user: {
              phone: identifier,
            },
          },
          {
            displayName: {
              contains: identifier,
            },
          },
          {
            user: {
              name: {
                contains: identifier,
              },
            },
          },
        ],
      },
    });
  }

  private async findLabelByName(
    identifier: string,
    workspaceId: number
  ): Promise<any> {
    const numericId = Number(identifier);
    if (!isNaN(numericId)) {
      const label = await prisma.label.findFirst({
        where: { id: numericId, workspaceId },
      });
      if (label) {
        console.log(`[Chatbot] findLabelByName - Found by ID: ${numericId}`);
        return label;
      }
    }

    // ابتدا همه برچسب‌ها را بگیریم و سپس case-insensitive جستجو کنیم
    const allLabels = await prisma.label.findMany({
      where: { workspaceId },
    });

    const normalizedIdentifier = identifier.trim().toLowerCase();

    // 1. جستجوی دقیق case-insensitive
    const exactMatch = allLabels.find(
      (l) => l.name.toLowerCase() === normalizedIdentifier
    );
    if (exactMatch) {
      console.log(`[Chatbot] findLabelByName - Found exact match: "${identifier}" → "${exactMatch.name}"`);
      return exactMatch;
    }

    // 2. جستجوی partial case-insensitive
    const partialMatch = allLabels.find((l) =>
      l.name.toLowerCase().includes(normalizedIdentifier) ||
      normalizedIdentifier.includes(l.name.toLowerCase())
    );
    if (partialMatch) {
      console.log(`[Chatbot] findLabelByName - Found partial match: "${identifier}" → "${partialMatch.name}"`);
      return partialMatch;
    }

    console.log(`[Chatbot] findLabelByName - Not found: "${identifier}" in workspace ${workspaceId}`);
    return null;
  }

  private async findGroupByName(
    identifier: string,
    workspaceId: number
  ): Promise<any> {
    const numericId = Number(identifier);
    if (!isNaN(numericId)) {
      const group = await prisma.userGroup.findFirst({
        where: { id: numericId, workspaceId },
      });
      if (group) return group;
    }

    return prisma.userGroup.findFirst({
      where: {
        workspaceId,
        name: {
          contains: identifier,
        },
      },
    });
  }

  private async resolveRole(
    roleName: string | undefined,
    workspaceId: number,
    fallbackRoleId?: number
  ): Promise<any> {
    if (roleName) {
      // نرمال‌سازی نام نقش
      const normalizedRoleName = roleName.trim().toLowerCase();
      const trimmedRoleName = roleName.trim();
      
      // ابتدا همه نقش‌ها را از workspace بگیر
      const allRoles = await prisma.role.findMany({
        where: { workspaceId },
      });
      
      // جستجوی دقیق (case-insensitive manual)
      const exactRole = allRoles.find(
        (r) => r.name.toLowerCase() === trimmedRoleName.toLowerCase()
      );
      if (exactRole) return exactRole;
      
      // جستجوی partial
      const partialRole = allRoles.find((r) =>
        r.name.toLowerCase().includes(trimmedRoleName.toLowerCase())
      );
      if (partialRole) return partialRole;
      
      // جستجوی برای نام‌های رایج فارسی/انگلیسی
      if (normalizedRoleName === "عادی" || normalizedRoleName === "user" || normalizedRoleName === "کاربر") {
        const userRole = allRoles.find(
          (r) =>
            r.name.toLowerCase() === "user" ||
            r.name === "کاربر" ||
            r.name === "کاربر عادی"
        );
        if (userRole) return userRole;
      }
      
      if (normalizedRoleName === "مدیر" || normalizedRoleName === "admin") {
        const adminRole = allRoles.find(
          (r) =>
            r.name.toLowerCase() === "admin" || r.name === "مدیر"
        );
        if (adminRole) return adminRole;
      }
    }

    if (fallbackRoleId) {
      const role = await prisma.role.findFirst({
        where: {
          id: fallbackRoleId,
          workspaceId,
        },
      });
      if (role) return role;
    }

    // اگر هیچ نقش مشخص نشد، سعی کن "User" یا "کاربر عادی" را پیدا کن (نه Admin!)
    const allRoles = await prisma.role.findMany({
      where: { workspaceId },
    });
    
    const defaultUserRole = allRoles.find(
      (r) =>
        r.name.toLowerCase() === "user" ||
        r.name === "کاربر" ||
        r.name === "کاربر عادی"
    );
    
    if (defaultUserRole) return defaultUserRole;
    
    // اگر User پیدا نشد، اولین نقش غیر Admin را برگردان
    const nonAdminRole = allRoles.find(
      (r) => r.name.toLowerCase() !== "admin" && r.name !== "مدیر"
    );
    
    // اگر هیچ نقش غیر Admin پیدا نشد، فقط اولین نقش را برگردان
    return nonAdminRole || allRoles[0] || null;
  }

  private async resolveLabels(
    names: string[],
    workspaceId: number
  ): Promise<any[]> {
    if (!names.length) return [];

    console.log(`[Chatbot] resolveLabels - Searching for labels:`, names, `in workspace ${workspaceId}`);

    // ابتدا همه برچسب‌های workspace را بگیریم
    const allLabels = await prisma.label.findMany({
      where: { workspaceId },
    });

    console.log(`[Chatbot] resolveLabels - Found ${allLabels.length} total labels in workspace`);

    // جستجوی case-insensitive برای هر نام
    const foundLabels: any[] = [];
    const missingNames: string[] = [];

    for (const name of names) {
      const normalizedName = name.trim().toLowerCase();
      
      // 1. جستجوی دقیق case-insensitive
      let found = allLabels.find(
        (l) => l.name.toLowerCase() === normalizedName
      );

      // 2. اگر پیدا نشد، جستجوی partial
      if (!found) {
        found = allLabels.find((l) =>
          l.name.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(l.name.toLowerCase())
        );
      }

      if (found) {
        foundLabels.push(found);
        console.log(`[Chatbot] resolveLabels - Found: "${name}" → "${found.name}"`);
      } else {
        missingNames.push(name);
        console.log(`[Chatbot] resolveLabels - Not found: "${name}"`);
      }
    }

    if (missingNames.length) {
      throw new Error(`برچسب‌های زیر پیدا نشدند: ${missingNames.join(", ")}`);
    }

    return foundLabels;
  }

  private async resolveGroups(
    names: string[],
    workspaceId: number
  ): Promise<any[]> {
    if (!names.length) return [];

    const groups = await prisma.userGroup.findMany({
      where: {
        workspaceId,
        name: {
          in: names,
        },
      },
    });

    // بررسی نام‌های پیدا نشده
    const foundNames = groups.map((g) => g.name.toLowerCase());
    const missing = names.filter(
      (name) => !foundNames.includes(name.toLowerCase())
    );

    if (missing.length) {
      throw new Error(`گروه‌های زیر پیدا نشدند: ${missing.join(", ")}`);
    }

    return groups;
  }

  private async getOrCreateSession(
    sessionId: number | undefined,
    context: AuthContext
  ): Promise<any> {
    if (sessionId) {
      const existing = await prisma.chatbotSession.findFirst({
        where: {
          id: sessionId,
          workspaceId: context.workspaceId!,
          workspaceUserId: context.workspaceUser!.id,
        },
      });
      if (existing) return existing;
    }

    const newSession = await prisma.chatbotSession.create({
      data: {
        workspaceId: context.workspaceId!,
        workspaceUserId: context.workspaceUser!.id,
        status: "ACTIVE",
      },
    });
    
    console.log("[Chatbot] New session created:", {
      id: newSession.id,
      workspaceId: newSession.workspaceId,
      workspaceUserId: newSession.workspaceUserId,
    });
    
    return newSession;
  }

  private async updateSessionContext(
    sessionId: number,
    updates: Partial<ChatbotSessionContextState>
  ): Promise<void> {
    const session = await prisma.chatbotSession.findUnique({
      where: { id: sessionId },
    });

    const currentContext: ChatbotSessionContextState =
      (session?.context as ChatbotSessionContextState) ?? {};

    const newContext: ChatbotSessionContextState = {
      ...currentContext,
      ...updates,
    };

    await prisma.chatbotSession.update({
      where: { id: sessionId },
      data: {
        context: newContext as any,
        currentIntent: updates.progress?.intent || updates.lastIntent || null,
        lastMessageAt: new Date(),
      },
    });
  }

  private async getConversationHistory(
    sessionId: number
  ): Promise<Array<{ role: "user" | "bot"; content: string }>> {
    const messages = await prisma.chatbotMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((msg) => ({
      role: msg.role === "USER" ? "user" : "bot",
      content: msg.content || "",
    }));
  }

  async getAllSessions(
    context: AuthContext,
    limit: number = 50
  ): Promise<any[]> {
    // اول مطمئن شو که workspaceId و workspaceUserId موجود هستند
    if (!context.workspaceId || !context.workspaceUser?.id) {
      console.error("[Chatbot] Missing workspaceId or workspaceUserId in context", {
        workspaceId: context.workspaceId,
        workspaceUserId: context.workspaceUser?.id,
      });
      return [];
    }
    
    console.log("[Chatbot] getAllSessions called with:", {
      workspaceId: context.workspaceId,
      workspaceUserId: context.workspaceUser.id,
      limit,
    });
    
    const sessions = await prisma.chatbotSession.findMany({
      where: {
        workspaceId: context.workspaceId,
        workspaceUserId: context.workspaceUser.id,
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: [
        {
          lastMessageAt: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          createdAt: "desc",
        },
      ],
      take: limit,
    });

    // گروه‌بندی sessions بر اساس title
    const groupedSessions: Record<string, any[]> = {};
    const sessionsWithoutTitle: any[] = [];
    
    sessions.forEach((session: any) => {
      const messages = session.messages || [];
      const lastMsg = messages.length > 0 ? messages[0] : null;
      
      const sessionData = {
        id: session.id,
        status: session.status,
        title: session.title || null,
        lastMessage: lastMsg?.content || null,
        lastMessageRole: lastMsg?.role || null,
        lastMessageAt: session.lastMessageAt || session.createdAt,
        messageCount: session._count?.messages || 0,
        createdAt: session.createdAt,
        currentIntent: session.currentIntent,
      };
      
      if (session.title) {
        if (!groupedSessions[session.title]) {
          groupedSessions[session.title] = [];
        }
        groupedSessions[session.title].push(sessionData);
      } else {
        sessionsWithoutTitle.push(sessionData);
      }
    });
    
    // مرتب‌سازی هر گروه بر اساس lastMessageAt
    Object.keys(groupedSessions).forEach((title) => {
      groupedSessions[title].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt).getTime();
        const dateB = new Date(b.lastMessageAt).getTime();
        return dateB - dateA; // جدیدترین اول
      });
    });
    
    // تبدیل به آرایه مسطح با حفظ گروه‌بندی (اول گفتگوهای با title، سپس بدون title)
    const result: any[] = [];
    
    // اول گفتگوهای گروه‌بندی شده بر اساس title
    Object.keys(groupedSessions).forEach((title) => {
      result.push(...groupedSessions[title]);
    });
    
    // سپس گفتگوهای بدون title
    sessionsWithoutTitle.sort((a, b) => {
      const dateA = new Date(a.lastMessageAt).getTime();
      const dateB = new Date(b.lastMessageAt).getTime();
      return dateB - dateA;
    });
    result.push(...sessionsWithoutTitle);
    
    console.log("[Chatbot] getAllSessions returning:", {
      totalSessions: result.length,
      sessionsWithTitle: Object.keys(groupedSessions).length,
      sessionsWithoutTitle: sessionsWithoutTitle.length,
      sessionIds: result.map((s) => s.id),
    });
    
    return result;
  }

  /**
   * تولید عنوان برای session بر اساس اولین پیام کاربر
   */
  private async generateSessionTitle(
    firstMessage: string,
    sessionId: number
  ): Promise<string | null> {
    try {
      const title = await this.geminiClient.generateSessionTitle(firstMessage);
      // محدود کردن طول title به 255 کاراکتر
      return title && title.length > 0
        ? title.substring(0, 255).trim()
        : this.getDefaultTitle(firstMessage);
    } catch (error) {
      console.error("[Chatbot] Error generating session title:", error);
      return this.getDefaultTitle(firstMessage);
    }
  }

  /**
   * ساخت عنوان پیش‌فرض از پیام کاربر
   */
  private getDefaultTitle(message: string): string {
    const trimmed = message.trim();
    if (trimmed.length <= 50) {
      return trimmed;
    }
    return trimmed.substring(0, 47) + "...";
  }

  /**
   * اعتبارسنجی و پاکسازی reply برای جلوگیری از نام‌های ساختگی
   */
  private validateAndSanitizeReply(reply: string, actionResult: string): string {
    // استخراج نام‌های کاربران از actionResult (اگر وجود داشته باشد)
    const validUserNames: string[] = [];
    
    if (actionResult) {
      // استخراج نام‌های کاربران از actionResult
      const userPatterns = [
        /(?:نام|کاربر|عضو):\s*([^\n،]+)/gi,
        /\d+\.\s*([^\n]+)\s*\(ID:/gi,
        /•\s*([^\n]+)\s*\(ID:/gi,
      ];
      
      for (const pattern of userPatterns) {
        let match;
        while ((match = pattern.exec(actionResult)) !== null) {
          const userName = match[1]?.trim();
          if (userName && userName.length > 2) {
            validUserNames.push(userName.toLowerCase());
          }
        }
      }
    }

    // لیست نام‌های ساختگی شناخته شده
    const fakeNames = [
      "مریم سلیمانی",
      "علی احمدی",
      "محمد رضایی",
      "فاطمه حسینی",
      "احمد محمدی",
      "سارا کریمی",
      "حسن مرادی",
    ];

    // بررسی اینکه آیا reply شامل نام‌های ساختگی است
    for (const fakeName of fakeNames) {
      if (reply.includes(fakeName)) {
        console.warn(`[Chatbot] ⚠️ Fake name detected in reply: "${fakeName}"`);
        console.warn(`[Chatbot] Valid user names from actionResult:`, validUserNames);
        
        // حذف کامل جمله‌ای که شامل نام ساختگی است
        const sentences = reply.split(/[.،\n]/);
        const cleanedSentences = sentences.filter(
          (sentence) => !sentence.includes(fakeName)
        );
        reply = cleanedSentences.join(". ");
        
        // اضافه کردن هشدار
        reply = "⚠️ توجه: اطلاعات نادرست حذف شد. " + reply;
      }
    }

    // اگر actionResult شامل "پیدا نشد" یا خالی است، نباید نام کاربری در reply باشد
    if (
      actionResult &&
      (actionResult.includes("پیدا نشد") ||
        actionResult.includes("خالی است") ||
        actionResult.includes("کاربری پیدا نشد"))
    ) {
      // استخراج نام‌های کاربران از reply
      const replyUserMatches = reply.match(/کاربر\s+([^،\n\.]+)/gi);
      if (replyUserMatches && replyUserMatches.length > 0) {
        const replyUserNames = replyUserMatches.map((m) =>
          m.replace(/کاربر\s+/i, "").trim().toLowerCase()
        );

        // بررسی اینکه آیا نام کاربری در reply هست که در validUserNames نیست
        const invalidNames = replyUserNames.filter(
          (name) => !validUserNames.some((valid) => valid.includes(name) || name.includes(valid))
        );

        if (invalidNames.length > 0) {
          console.error(
            `[Chatbot] ❌ Invalid user names in reply that don't exist in actionResult:`,
            invalidNames
          );

          // حذف نام‌های غیرمجاز
          for (const invalidName of invalidNames) {
            const regex = new RegExp(`کاربر\\s+${invalidName}[^،\n]*`, "gi");
            reply = reply.replace(regex, "");
          }

          reply = "⚠️ توجه: هیچ کاربری در نتیجه عملیات یافت نشد. " + reply.trim();
        }
      }
    }

    // اگر validUserNames وجود دارد، فقط همان نام‌ها باید در reply باشند
    if (validUserNames.length > 0) {
      // استخراج همه نام‌های کاربران از reply
      const allUserMatches = reply.match(/[^،\n\.]*?([آ-ی]+(?:\s+[آ-ی]+)*)[^،\n\.]*/g);
      if (allUserMatches) {
        for (const match of allUserMatches) {
          const possibleName = match.trim();
          if (possibleName.length > 3) {
            const isInvalid = !validUserNames.some(
              (valid) =>
                possibleName.toLowerCase().includes(valid) ||
                valid.includes(possibleName.toLowerCase())
            );

            // اگر نام در لیست معتبر نیست و شبیه نام کاربری است
            if (
              isInvalid &&
              (possibleName.match(/^[آ-ی]+\s+[آ-ی]+/) || // الگوی نام و نام خانوادگی
                fakeNames.some((fake) => possibleName.includes(fake)))
            ) {
              console.error(
                `[Chatbot] ❌ Suspicious name detected in reply: "${possibleName}"`
              );
              reply = reply.replace(possibleName, "[نام حذف شده]");
            }
          }
        }
      }
    }

    return reply.trim();
  }

  /**
   * مدیریت چند intent در یک پیام - اجرای به ترتیب
   */
  private async handleMultipleIntents(
    multipleIntents: Array<{ intent: ChatbotIntent; extractedData?: Record<string, any> }>,
    userMessage: string,
    conversationHistory: Array<{ role: "user" | "bot"; content: string }>,
    session: any,
    context: AuthContext
  ): Promise<{
    sessionId: number;
    reply: string;
    intent: ChatbotIntent;
    completed?: boolean;
    quickReplies?: Array<{ label: string; value: string; color?: string }>;
  }> {
    console.log("[Chatbot] handleMultipleIntents - Detected multiple intents:", multipleIntents.map(i => i.intent));

    // اجرای workflow: هر intent را به ترتیب اجرا می‌کنیم
    const results: string[] = [];
    let hasError = false;
    let errorMessage = "";

    for (let i = 0; i < multipleIntents.length; i++) {
      const intentData = multipleIntents[i];
      try {
        console.log(`[Chatbot] handleMultipleIntents - Executing intent ${i + 1}/${multipleIntents.length}: ${intentData.intent}`);
        
        const actionResult = await this.executeAction(
          intentData.intent,
          intentData.extractedData || {},
          context
        );
        results.push(actionResult);

        // لاگ عملیات
        await prisma.chatbotAction.create({
          data: {
            sessionId: session.id,
            actionType: intentData.intent,
            status: "SUCCESS",
            payload: intentData.extractedData || {},
            result: { message: actionResult },
          },
        });
      } catch (error) {
        hasError = true;
        errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Chatbot] handleMultipleIntents - Error in intent ${intentData.intent}:`, error);
        
        // لاگ خطا
        await prisma.chatbotAction.create({
          data: {
            sessionId: session.id,
            actionType: intentData.intent,
            status: "FAILED",
            payload: intentData.extractedData || {},
            errorMessage,
          },
        });
        break; // در صورت خطا، workflow را متوقف می‌کنیم
      }
    }

    // به‌روزرسانی lastMessageAt در session
    await prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        lastMessageAt: new Date(),
      },
    });

    // ساخت پاسخ نهایی
    if (hasError) {
      const response = await this.geminiClient.generateConversationalResponse(
        userMessage,
        conversationHistory,
        {
          intent: multipleIntents[0].intent,
          error: errorMessage,
        }
      );
      return {
        sessionId: session.id,
        reply: response.reply,
        intent: multipleIntents[0].intent,
        completed: false,
        quickReplies: response.quickReplies,
      };
    }

    // ترکیب نتایج - استفاده مستقیم از نتایج واقعی بدون تغییر توسط Gemini
    const combinedResult = results.join("\n\n---\n\n");
    
    return {
      sessionId: session.id,
      reply: combinedResult, // استفاده مستقیم از نتایج واقعی دیتابیس
      intent: multipleIntents[0].intent,
      completed: true,
    };
  }

  async getSessionHistory(
    sessionId: number,
    context: AuthContext
  ): Promise<any> {
    const session = await prisma.chatbotSession.findFirst({
      where: {
        id: sessionId,
        workspaceId: context.workspaceId!,
        workspaceUserId: context.workspaceUser!.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      throw new Error("جلسه‌ای با این شناسه پیدا نشد.");
    }

    return {
      ...session,
      messages: session.messages || [],
    };
  }
}
