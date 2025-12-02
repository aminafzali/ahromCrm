// Workflow Execution Engine
import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { ChatbotIntent } from "../types";
import {
  ThinkingLog,
  WorkflowDefinition,
  WorkflowExecutionState,
  WorkflowStep,
} from "../types/workflow";
import { ChatbotServiceApi } from "./ChatbotServiceApi";

export class WorkflowEngine {
  private chatbotService: ChatbotServiceApi;
  private thinkingLogs: ThinkingLog[] = [];

  constructor() {
    this.chatbotService = new ChatbotServiceApi();
  }

  /**
   * اجرای یک workflow
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: AuthContext,
    sessionId: number,
    onThinking?: (log: ThinkingLog) => void,
    onProgress?: (stepId: string, result: any) => void
  ): Promise<{
    success: boolean;
    results: Record<string, any>;
    finalReport?: string;
    error?: string;
  }> {
    const executionState: WorkflowExecutionState = {
      workflowId: workflow.id,
      currentStepId: workflow.startStepId,
      variables: workflow.variables || {},
      stepResults: {},
      status: "running",
      startedAt: new Date(),
    };

    this.addThinking(
      "workflow_start",
      "شروع workflow",
      {
        workflowName: workflow.name,
        startStepId: workflow.startStepId,
      },
      onThinking
    );

    try {
      let currentStep = this.findStep(workflow, executionState.currentStepId);

      if (!currentStep) {
        throw new Error(
          `مرحله شروع با شناسه ${executionState.currentStepId} پیدا نشد`
        );
      }

      while (currentStep && executionState.status === "running") {
        this.addThinking(
          "step_start",
          `شروع مرحله: ${currentStep.name}`,
          {
            stepId: currentStep.id,
            stepType: currentStep.type,
          },
          onThinking
        );

        // بررسی شرط اگر وجود دارد
        if (currentStep.condition) {
          const conditionMet = this.evaluateCondition(
            currentStep.condition,
            executionState.variables,
            executionState.stepResults
          );

          this.addThinking(
            "condition_check",
            `بررسی شرط: ${currentStep.name}`,
            {
              condition: currentStep.condition,
              result: conditionMet,
            },
            onThinking
          );

          if (!conditionMet) {
            this.addThinking(
              "condition_failed",
              `شرط برقرار نیست، رد شدن از مرحله`,
              {
                stepId: currentStep.id,
              },
              onThinking
            );

            const nextStepId = currentStep.onError;
            currentStep = nextStepId
              ? this.findStep(workflow, nextStepId)
              : null;

            if (!currentStep && nextStepId) {
              throw new Error(`مرحله با شناسه ${nextStepId} پیدا نشد`);
            }
            continue;
          }
        }

        // اجرای مرحله
        const result = await this.executeStep(
          currentStep,
          executionState,
          context,
          sessionId,
          onThinking
        );

        executionState.stepResults[currentStep.id] = result;

        if (onProgress) {
          onProgress(currentStep.id, result);
        }

        this.addThinking(
          "step_complete",
          `مرحله تکمیل شد: ${currentStep.name}`,
          {
            stepId: currentStep.id,
            result: result.success,
          },
          onThinking
        );

        // تاخیر اگر وجود دارد
        if (currentStep?.delay) {
          const delay = currentStep.delay;
          this.addThinking(
            "delay",
            `انتظار ${delay}ms`,
            {
              delay,
            },
            onThinking
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // تعیین مرحله بعدی
        if (!currentStep) {
          executionState.status = "completed";
          executionState.completedAt = new Date();
          break;
        }

        if (result.success && currentStep.onSuccess) {
          const nextStep = this.findStep(workflow, currentStep.onSuccess);
          if (!nextStep) {
            throw new Error(
              `مرحله بعدی با شناسه ${currentStep.onSuccess} پیدا نشد`
            );
          }
          currentStep = nextStep;
        } else if (!result.success && currentStep.onError) {
          const errorStep = this.findStep(workflow, currentStep.onError);
          if (!errorStep) {
            executionState.status = "failed";
            executionState.completedAt = new Date();
            break;
          }
          currentStep = errorStep;
        } else {
          executionState.status = "completed";
          executionState.completedAt = new Date();
          break;
        }
      }

      // تولید گزارش نهایی
      let finalReport: string | undefined;
      if (workflow.steps.some((s) => s.type === "REPORT")) {
        finalReport = this.generateReport(executionState, workflow);
        this.addThinking(
          "report_generated",
          "گزارش نهایی تولید شد",
          {
            reportLength: finalReport.length,
          },
          onThinking
        );
      }

      return {
        success: executionState.status === "completed",
        results: executionState.stepResults,
        finalReport,
      };
    } catch (error) {
      executionState.status = "failed";
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.addThinking(
        "error",
        `خطا در اجرای workflow: ${errorMessage}`,
        {
          error: errorMessage,
        },
        onThinking
      );

      return {
        success: false,
        results: executionState.stepResults,
        error: errorMessage,
      };
    }
  }

  /**
   * اجرای یک مرحله workflow
   */
  private async executeStep(
    step: WorkflowStep,
    state: WorkflowExecutionState,
    context: AuthContext,
    sessionId: number,
    onThinking?: (log: ThinkingLog) => void
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // جایگزینی متغیرها در params
      const resolvedParams = this.resolveVariables(
        step.params || {},
        state.variables
      );

      this.addThinking(
        "step_execute",
        `اجرای ${step.type}`,
        {
          stepId: step.id,
          params: resolvedParams,
        },
        onThinking
      );

      let result: any;

      switch (step.type) {
        case "USER_CREATE":
        case "USER_UPDATE":
        case "USER_LIST":
        case "USER_VIEW":
        case "LABEL_CREATE":
        case "LABEL_UPDATE":
        case "GROUP_CREATE":
        case "GROUP_UPDATE":
        case "USER_DELETE":
        case "LABEL_DELETE":
        case "GROUP_DELETE":
        case "USER_SEARCH":
        case "LABEL_SEARCH":
        case "GROUP_SEARCH":
        case "LABEL_LIST":
        case "LABEL_VIEW":
        case "GROUP_LIST":
        case "GROUP_VIEW": {
          const actionResult = await this.chatbotService.executeAction(
            step.type as ChatbotIntent,
            resolvedParams,
            context
          );
          // executeAction یک string برمی‌گرداند، آن را به object تبدیل می‌کنیم
          result = { success: true, message: actionResult, data: actionResult };
          break;
        }

        case "DELAY":
          await new Promise((resolve) =>
            setTimeout(resolve, step.delay || 1000)
          );
          result = { success: true, message: "تاخیر انجام شد" };
          break;

        case "REPORT":
          result = { success: true, data: state.stepResults };
          break;

        default:
          result = { success: false, error: `نوع مرحله نامعتبر: ${step.type}` };
      }

      // ذخیره نتیجه در متغیرها
      if (step.params?.saveAs) {
        state.variables[step.params.saveAs] = result;
      }

      return {
        success: true,
        data: typeof result === "string" ? { message: result } : result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.addThinking(
        "step_error",
        `خطا در مرحله ${step.name}`,
        {
          stepId: step.id,
          error: errorMessage,
        },
        onThinking
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * پیدا کردن یک مرحله در workflow
   */
  private findStep(
    workflow: WorkflowDefinition,
    stepId: string
  ): WorkflowStep | null {
    return workflow.steps.find((s) => s.id === stepId) || null;
  }

  /**
   * ارزیابی شرط
   */
  private evaluateCondition(
    condition: WorkflowStep["condition"],
    variables: Record<string, any>,
    stepResults: Record<string, any>
  ): boolean {
    if (!condition) return true;

    const value =
      variables[condition.field] || stepResults[condition.field]?.data;

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "contains":
        return String(value || "").includes(String(condition.value));
      case "greater_than":
        return Number(value) > Number(condition.value);
      case "less_than":
        return Number(value) < Number(condition.value);
      case "exists":
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  /**
   * جایگزینی متغیرها در params
   */
  private resolveVariables(
    params: Record<string, any>,
    variables: Record<string, any>
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (
        typeof value === "string" &&
        value.startsWith("${") &&
        value.endsWith("}")
      ) {
        const varName = value.slice(2, -1);
        resolved[key] = variables[varName];
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * تولید گزارش نهایی
   */
  private generateReport(
    state: WorkflowExecutionState,
    workflow: WorkflowDefinition
  ): string {
    const reportSteps = workflow.steps
      .filter((s) => s.type === "REPORT")
      .map((s) => {
        const result = state.stepResults[s.id];
        return `## ${s.name}\n${s.description || ""}\n\n${JSON.stringify(
          result,
          null,
          2
        )}`;
      })
      .join("\n\n---\n\n");

    return (
      `# گزارش اجرای Workflow: ${workflow.name}\n\n` +
      `**تاریخ:** ${state.startedAt.toLocaleString("fa-IR")}\n\n` +
      `**وضعیت:** ${
        state.status === "completed" ? "✅ موفق" : "❌ ناموفق"
      }\n\n` +
      `---\n\n${reportSteps}`
    );
  }

  /**
   * اضافه کردن لاگ thinking
   */
  private addThinking(
    step: string,
    action: string,
    thought: any,
    onThinking?: (log: ThinkingLog) => void
  ) {
    const log: ThinkingLog = {
      step,
      action,
      thought:
        typeof thought === "string"
          ? thought
          : JSON.stringify(thought, null, 2),
      data: typeof thought === "object" ? thought : undefined,
      timestamp: new Date(),
    };

    this.thinkingLogs.push(log);

    if (onThinking) {
      onThinking(log);
    }

    console.log(`[Workflow Thinking] [${step}] ${action}:`, thought);
  }

  /**
   * دریافت لاگ‌های thinking
   */
  getThinkingLogs(): ThinkingLog[] {
    return [...this.thinkingLogs];
  }

  /**
   * پاک کردن لاگ‌های thinking
   */
  clearThinkingLogs() {
    this.thinkingLogs = [];
  }
}
