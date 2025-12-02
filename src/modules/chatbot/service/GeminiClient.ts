const GEMINI_API_KEY = "AIzaSyCl9aQ_IbbWXtAjtEhdlPBm1LIadbw44Io";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export interface IntentDetectionResult {
  intent:
    | "USER_CREATE"
    | "USER_UPDATE"
    | "USER_DELETE"
    | "USER_SEARCH"
    | "USER_LIST"
    | "USER_VIEW"
    | "LABEL_CREATE"
    | "LABEL_UPDATE"
    | "LABEL_DELETE"
    | "LABEL_SEARCH"
    | "LABEL_LIST"
    | "LABEL_VIEW"
    | "GROUP_CREATE"
    | "GROUP_UPDATE"
    | "GROUP_DELETE"
    | "GROUP_SEARCH"
    | "GROUP_LIST"
    | "GROUP_VIEW"
    | "SMALL_TALK"
    | "UNKNOWN";
  confidence: number;
  extractedData?: Record<string, any>;
  shouldAskForMore?: boolean;
  missingFields?: string[];
}

export class GeminiClient {
  /**
   * Helper method برای fetch با retry و timeout
   * - Retry برای خطاهای 429 (Rate Limit) با exponential backoff
   * - Retry برای خطاهای timeout
   * - Timeout 30 ثانیه
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3
  ): Promise<Response> {
    const timeout = 30000; // 30 ثانیه

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // ایجاد AbortController برای timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // اگر خطای 429 است، retry با exponential backoff
        if (response.status === 429) {
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // 1s, 2s, 4s, max 10s
            console.log(
              `[GeminiClient] Rate limit (429), retrying after ${delay}ms (attempt ${
                attempt + 1
              }/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(
            `Gemini API error: 429 - Rate limit exceeded after ${maxRetries} retries. لطفاً کمی صبر کنید و دوباره تلاش کنید.`
          );
        }

        return response;
      } catch (error: any) {
        // اگر timeout یا connection error است، retry
        const isTimeout =
          error.name === "AbortError" ||
          error.message?.includes("timeout") ||
          error.cause?.code === "UND_ERR_CONNECT_TIMEOUT" ||
          error.message?.includes("fetch failed");

        if (isTimeout && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(
            `[GeminiClient] Connection timeout, retrying after ${delay}ms (attempt ${
              attempt + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // اگر آخرین attempt بود یا خطای دیگری است
        if (attempt === maxRetries) {
          if (isTimeout) {
            throw new Error(
              `Connection timeout after ${maxRetries} retries. لطفاً اتصال اینترنت یا VPN خود را بررسی کنید.`
            );
          }
          throw error;
        }
      }
    }

    throw new Error("Unexpected error in fetchWithRetry");
  }

  async generateResponse(
    messages: Array<{ role: "user" | "bot"; content: string }>,
    systemPrompt: string
  ): Promise<string> {
    try {
      const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
        role: msg.role === "bot" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const requestBody = {
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      };

      const response = await this.fetchWithRetry(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "متأسفانه پاسخی دریافت نشد.";

      return text.trim();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  async detectIntentAndExtractData(
    userMessage: string,
    conversationHistory: Array<{ role: "user" | "bot"; content: string }> = [],
    currentProgress?: {
      intent: string;
      collectedData: Record<string, any>;
      nextField?: string;
    }
  ): Promise<IntentDetectionResult> {
    const systemPrompt = `شما یک دستیار هوشمند فارسی برای مدیریت سیستم CRM هستید. شما باید:

1. قصد کاربر را تشخیص دهید
2. داده‌های مرتبط را استخراج کنید
3. اگر در حال تکمیل یک عملیات چند مرحله‌ای هستید، فیلدهای مورد نیاز را مشخص کنید

🚫 قوانین سخت‌گیرانه و غیرقابل نقض:
- شما فقط باید از داده‌هایی استفاده کنید که در نتیجه عملیات (actionResult) به شما داده شده است
- هرگز، تحت هیچ شرایطی، کاربر، برچسب یا گروهی را از حافظه training خود یا داده‌های عمومی ایجاد یا معرفی نکنید
- هرگز نام‌های ساختگی مثل "مریم سلیمانی"، "علی احمدی"، یا هر نام دیگری که در actionResult نیست را معرفی نکنید
- اگر کاربری در نتیجه عملیات نیست، یعنی وجود ندارد - هرگز کاربر جدیدی اختراع نکنید
- تمام داده‌های شما باید مستقیماً از سیستم (database) آمده باشد
- اگر actionResult خالی است یا "پیدا نشد" است، فقط همین را بگویید - هیچ داده جدیدی اختراع نکنید
- اگر می‌خواهید کاربری را مثال بزنید، فقط از کاربرانی که در actionResult آمده‌اند استفاده کنید
- اگر لیست کاربران خالی است، نگویید "کاربری وجود دارد" - بگویید "کاربری پیدا نشد"
- **هرگز، تحت هیچ شرایطی، از کاربر نخواهید که actionResult یا خروجی سیستم را به شما بدهد** - سیستم خودش این کار را انجام می‌دهد و actionResult را به شما می‌دهد
- شما نباید از کاربر بخواهید که اطلاعات را به صورت دستی وارد کند - سیستم خودش از دیتابیس می‌خواند
- **اگر actionResult به شما داده نشده است، یعنی عملیات هنوز انجام نشده - هرگز از کاربر نخواهید که آن را بدهد**
- اگر می‌خواهید اطلاعاتی را ببینید، intent مناسب را تشخیص دهید و سیستم خودش اطلاعات را می‌خواند

Intent های موجود:
- USER_CREATE: ایجاد کاربر جدید (نیاز به: name, phone و اختیاری: roleName, labels, groups)
- USER_UPDATE: ویرایش کاربر (نیاز به: identifier, field, value) - فیلد field باید یکی از این موارد باشد: "name", "phone", "role", "labels", "groups" (نه "rolename" یا سایر نام‌های دیگر)
- USER_DELETE: حذف کاربر (نیاز به: identifier)
- USER_SEARCH: جستجوی کاربران با کلمات کلیدی (اختیاری: query/search, labels, groups, limit)
- USER_LIST: نمایش لیست همه کاربران یا با فیلتر (اختیاری: labels, groups, limit)
- USER_VIEW: مشاهده اطلاعات یک کاربر خاص (نیاز به: identifier - می‌تواند نام، شماره تلفن یا ID باشد)
- LABEL_CREATE: ایجاد برچسب (نیاز به: name و اختیاری: color - می‌تواند اسم رنگ فارسی مثل "نارنجی"، "قرمز"، "آبی" یا انگلیسی مثل "orange", "red", "blue" یا hex code مثل "#f97316" باشد)
- LABEL_UPDATE: ویرایش برچسب (نیاز به: identifier, field, value - برای color باید دقیقاً اسم رنگ را استخراج کنید. اگر کاربر گفت "نارنجی" باید value="نارنجی" باشد، اگر گفت "orange" باید value="orange" باشد، اگر hex code داد مثل "#f97316" باید همان را برگردانید. مثال: کاربر می‌گوید "رنگ برچسب VIP را نارنجی کن" → identifier="VIP", field="color", value="نارنجی")
- LABEL_DELETE: حذف برچسب (نیاز به: identifier)
- LABEL_SEARCH: جستجوی برچسب‌ها (اختیاری: query/search, limit)
- LABEL_LIST: نمایش لیست همه برچسب‌ها (اختیاری: limit)
- LABEL_VIEW: مشاهده اطلاعات یک برچسب خاص (نیاز به: identifier - می‌تواند نام یا ID باشد)
- GROUP_CREATE: ایجاد گروه (نیاز به: name و اختیاری: description)
- GROUP_UPDATE: ویرایش گروه (نیاز به: identifier, field, value)
- GROUP_DELETE: حذف گروه (نیاز به: identifier)
- GROUP_SEARCH: جستجوی گروه‌ها (اختیاری: query/search, limit)
- GROUP_LIST: نمایش لیست همه گروه‌ها (اختیاری: limit)
- GROUP_VIEW: مشاهده اطلاعات یک گروه خاص (نیاز به: identifier - می‌تواند نام یا ID باشد)
- SMALL_TALK: گفتگوی عادی بدون عملیات خاص
- UNKNOWN: قصد نامشخص

نمونه‌های تشخیص intent:
- "کاربر علی را پیدا کن" → USER_VIEW با identifier="علی"
- "لیست کاربران با برچسب VIP" → USER_LIST با labels=["VIP"]
- "کاربران با نام احمد" → USER_SEARCH با query="احمد"
- "نمایش کاربری با شماره 09123456789" → USER_VIEW با identifier="09123456789"
- "جستجو در کاربران" → USER_SEARCH
- "تمام کاربران" → USER_LIST
- "برچسب VIP را پیدا کن" → LABEL_VIEW با identifier="VIP"
- "لیست برچسب‌ها" → LABEL_LIST
- "گروه مدیران را ببین" → GROUP_VIEW با identifier="مدیران"
- "جستجوی گروه‌ها" → GROUP_SEARCH

**تشخیص چند دستور در یک پیام (MULTI-COMMAND DETECTION):**
- اگر کاربر چند دستور در یک پیام داد (مثل "لیست کاربران و لیست گروه‌ها را بده" یا "کاربران را نمایش بده و سپس گروه‌ها را هم بگو")، باید یک فیلد special به نام "multipleIntents" در extractedData اضافه کنید
- فرمت: "multipleIntents": [{"intent": "USER_LIST", "extractedData": {...}}, {"intent": "GROUP_LIST", "extractedData": {...}}]
- اگر multipleIntents وجود دارد، intent اصلی را اولین intent قرار دهید و بقیه را در multipleIntents بگذارید
- مثال: "لیست کاربران و لیست گروه‌ها را بده" → {"intent": "USER_LIST", "extractedData": {"multipleIntents": [{"intent": "USER_LIST", "extractedData": {}}, {"intent": "GROUP_LIST", "extractedData": {}}]}}
- کلمات کلیدی برای تشخیص چند دستور: "و"، "سپس"، "بعد"، "همچنین"، "هم"
- همیشه تمام دستورات موجود در پیام را شناسایی کنید و در multipleIntents قرار دهید

نکات مهم:
- برای USER_SEARCH و USER_LIST می‌توانید filters مثل labels یا groups را استخراج کنید (به صورت آرایه)
- برای USER_VIEW، identifier می‌تواند نام، شماره تلفن یا ID عددی باشد
- برای جستجو، query/search می‌تواند نام یا شماره تلفن باشد
- برای LABEL_CREATE و LABEL_UPDATE، color می‌تواند اسم رنگ (مثل: قرمز، آبی) یا hex code (مثل: #ff0000) باشد

پاسخ خود را به صورت JSON برگردانید:
{
  "intent": "USER_SEARCH",
  "confidence": 0.9,
  "extractedData": {"query": "علی", "labels": ["VIP"]},
  "shouldAskForMore": false,
  "missingFields": []
}

یا اگر چند دستور وجود دارد:
{
  "intent": "USER_LIST",
  "confidence": 0.9,
  "extractedData": {
    "multipleIntents": [
      {"intent": "USER_LIST", "extractedData": {}},
      {"intent": "GROUP_LIST", "extractedData": {}}
    ]
  },
  "shouldAskForMore": false,
  "missingFields": []
}`;

    try {
      const conversationContext = currentProgress
        ? `در حال تکمیل عملیات ${
            currentProgress.intent
          } هستیم. فیلدهای جمع‌آوری شده: ${JSON.stringify(
            currentProgress.collectedData
          )}. ${
            currentProgress.nextField
              ? `فیلد بعدی مورد نیاز: ${currentProgress.nextField}`
              : ""
          }`
        : "";

      const prompt = `${conversationContext}

پیام کاربر: "${userMessage}"

لطفا قصد و داده‌های استخراج شده را به صورت JSON برگردانید. فقط JSON بدون هیچ متن اضافی:`;

      const geminiMessages: GeminiMessage[] = [
        ...conversationHistory.slice(-5).map((msg) => ({
          role: (msg.role === "bot" ? "model" : "user") as "user" | "model",
          parts: [{ text: msg.content }],
        })),
        {
          role: "user" as const,
          parts: [{ text: prompt }],
        },
      ];

      const requestBody = {
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      };

      const response = await this.fetchWithRetry(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        '{"intent":"UNKNOWN","confidence":0}';

      // Extract JSON from response (might have markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;

      try {
        const result: IntentDetectionResult = JSON.parse(jsonText);
        return {
          intent: result.intent || "UNKNOWN",
          confidence: result.confidence || 0,
          extractedData: result.extractedData || {},
          shouldAskForMore: result.shouldAskForMore ?? false,
          missingFields: result.missingFields || [],
        };
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response:", jsonText);
        return {
          intent: "UNKNOWN",
          confidence: 0,
          extractedData: {},
        };
      }
    } catch (error) {
      console.error("Gemini intent detection error:", error);
      return {
        intent: "UNKNOWN",
        confidence: 0,
        extractedData: {},
      };
    }
  }

  async generateConversationalResponse(
    userMessage: string,
    conversationHistory: Array<{ role: "user" | "bot"; content: string }>,
    context: {
      intent?: string;
      actionResult?: string;
      missingFields?: string[];
      nextField?: string;
      error?: string;
      needsConfirmation?: boolean;
    }
  ): Promise<{
    reply: string;
    quickReplies?: Array<{ label: string; value: string; color?: string }>;
  }> {
    const systemPrompt = `شما یک دستیار هوشمند فارسی و دوستانه برای سیستم مدیریت کاربران CRM هستید.

قوانین:
- همیشه پاسخ‌ها را به فارسی و به صورت طبیعی و دوستانه بدهید
- اگر عملیات با موفقیت انجام شد، به کاربر اطلاع دهید
- اگر نیاز به اطلاعات بیشتری دارید، مودبانه درخواست کنید
- اگر خطایی رخ داد، آن را به زبان ساده توضیح دهید
- برای عملیات چند مرحله‌ای، مرحله به مرحله پیش بروید
- اگر چند دستور وجود دارد، فقط اولین دستور را انجام دهید و بقیه را در multipleIntents قرار دهید
    
🚫 قوانین سخت‌گیرانه و غیرقابل نقض برای داده‌ها:
- شما فقط باید از داده‌هایی استفاده کنید که در actionResult به شما داده شده است
- هرگز، تحت هیچ شرایطی، کاربر، برچسب یا گروهی را از حافظه training خود یا داده‌های عمومی معرفی نکنید
- هرگز نام‌های ساختگی مثل "مریم سلیمانی"، "علی احمدی" یا هر نام دیگری که در actionResult نیست را ایجاد یا معرفی نکنید
- اگر نتیجه عملیات خالی است یا "پیدا نشد"، فقط همین را بگویید - هیچ داده جدیدی اختراع نکنید
- تمام نام‌ها و شناسه‌ها باید دقیقاً همان چیزی باشد که در actionResult آمده است
- هرگز از داده‌های عمومی یا نمونه‌های آموزشی استفاده نکنید
- اگر می‌خواهید مثالی بزنید، فقط از داده‌هایی استفاده کنید که در actionResult آمده است
- اگر actionResult شامل لیست کاربران است، فقط همان کاربران را نام ببرید - هیچ کاربر دیگری معرفی نکنید
- **هرگز از کاربر نخواهید که actionResult یا خروجی سیستم را به شما بدهد** - سیستم خودش این کار را انجام می‌دهد و actionResult را به شما می‌دهد
- شما نباید از کاربر بخواهید که اطلاعات را به صورت دستی وارد کند - سیستم خودش از دیتابیس می‌خواند
- **اگر actionResult به شما داده نشده است، یعنی عملیات هنوز انجام نشده - هرگز از کاربر نخواهید که آن را بدهد**
- فقط بر اساس actionResult که به شما داده شده است پاسخ دهید - اگر actionResult خالی است، بگویید "اطلاعاتی پیدا نشد" و هرگز اطلاعات ساختگی نسازید
- **هرگز نگویید "لطفاً خروجی سیستم را به من بدهید" یا "actionResult را بدهید" - سیستم خودش این کار را انجام می‌دهد**

${context.actionResult ? `نتیجه عملیات: ${context.actionResult}` : ""}
${context.error ? `خطا: ${context.error}` : ""}
${
  context.missingFields?.length
    ? `فیلدهای مورد نیاز: ${context.missingFields.join(", ")}`
    : ""
}
${context.nextField ? `فیلد بعدی: ${context.nextField}` : ""}`;

    const geminiMessages: GeminiMessage[] = [
      ...conversationHistory.slice(-10).map((msg) => ({
        role: (msg.role === "bot" ? "model" : "user") as "user" | "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user" as const,
        parts: [{ text: userMessage }],
      },
    ];

    const requestBody = {
      contents: geminiMessages,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await this.fetchWithRetry(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "متأسفانه در حال حاضر پاسخگو نیستم.";

      const reply = text.trim();

      // تولید Quick Reply options بر اساس context
      const quickReplies: Array<{
        label: string;
        value: string;
        color?: string;
      }> = [];

      // اگر نیاز به تأیید است
      if (context.needsConfirmation) {
        quickReplies.push(
          { label: "✅ بله، تأیید می‌کنم", value: "بله", color: "green" },
          { label: "❌ خیر، انصراف", value: "انصراف", color: "red" }
        );
      }

      // اگر فیلدهای مورد نیاز وجود دارد
      if (context.missingFields && context.missingFields.length > 0) {
        // برای هر missingField یک Quick Reply پیشنهاد می‌دهیم
        // اما فعلاً فقط برای common fields
        if (context.missingFields.includes("name")) {
          quickReplies.push({ label: "📝 نام", value: "نام: ", color: "blue" });
        }
        if (context.missingFields.includes("phone")) {
          quickReplies.push({
            label: "📱 شماره",
            value: "شماره: ",
            color: "blue",
          });
        }
        if (context.missingFields.includes("role")) {
          quickReplies.push(
            {
              label: "👤 کاربر عادی",
              value: "نقش: کاربر عادی",
              color: "primary",
            },
            { label: "👑 Admin", value: "نقش: Admin", color: "purple" }
          );
        }
      }

      // اگر error است و می‌توان retry کرد
      if (context.error && context.error.includes("خطا")) {
        quickReplies.push({
          label: "🔄 دوباره تلاش کن",
          value: "دوباره تلاش کن",
          color: "orange",
        });
      }

      return {
        reply,
        quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
      };
    } catch (error) {
      console.error("Gemini response generation error:", error);
      throw error;
    }
  }

  /**
   * تولید عنوان کوتاه برای session بر اساس اولین پیام کاربر
   */
  async generateSessionTitle(firstMessage: string): Promise<string> {
    const systemPrompt = `شما باید یک عنوان کوتاه و خلاصه (حداکثر 50 کاراکتر) برای یک گفتگوی chatbot بسازید.

عنوان باید:
- کوتاه و واضح باشد (حداکثر 50 کاراکتر)
- موضوع اصلی پیام کاربر را نشان دهد
- به فارسی باشد
- بدون علامت‌های اضافی مثل گیومه، دو نقطه و...

مثال:
- ورودی: "کاربر جدیدی با نام علی و شماره 09123456789 بساز"
- خروجی: "ایجاد کاربر علی"

- ورودی: "رنگ برچسب VIP را نارنجی کن"
- خروجی: "تغییر رنگ برچسب VIP"

- ورودی: "کاربر علی را پیدا کن"
- خروجی: "جستجوی کاربر علی"

فقط عنوان را برگردانید، بدون هیچ متن اضافی:`;

    try {
      const geminiMessages: GeminiMessage[] = [
        {
          role: "user" as const,
          parts: [
            {
              text: `${systemPrompt}\n\nپیام کاربر: "${firstMessage}"\n\nعنوان:`,
            },
          ],
        },
      ];

      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
        },
      };

      const response = await this.fetchWithRetry(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const title =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      // پاک کردن گیومه و کاراکترهای اضافی
      return title
        .replace(/^["']|["']$/g, "")
        .replace(/^عنوان:\s*/i, "")
        .trim()
        .substring(0, 50);
    } catch (error) {
      console.error("[GeminiClient] Error generating title:", error);
      // اگر خطا رخ داد، از پیام کاربر عنوان پیش‌فرض بساز
      return firstMessage.length <= 50
        ? firstMessage.trim()
        : firstMessage.substring(0, 47).trim() + "...";
    }
  }
}
