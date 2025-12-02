// Workflow Types and Interfaces

export type WorkflowStepType =
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
  | "DELAY"
  | "CONDITION"
  | "REPORT";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description?: string;
  params?: Record<string, any>;
  condition?: {
    field: string;
    operator: "equals" | "contains" | "greater_than" | "less_than" | "exists";
    value: any;
  };
  delay?: number; // milliseconds
  onSuccess?: string; // next step ID
  onError?: string; // next step ID
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  startStepId: string;
  variables?: Record<string, any>; // برای ذخیره متغیرها بین مراحل
}

export interface WorkflowExecutionState {
  workflowId: string;
  currentStepId: string;
  variables: Record<string, any>;
  stepResults: Record<string, any>;
  status: "running" | "completed" | "failed" | "paused";
  startedAt: Date;
  completedAt?: Date;
}

export interface ThinkingLog {
  step: string;
  action: string;
  thought: string;
  data?: any;
  timestamp: Date;
}
