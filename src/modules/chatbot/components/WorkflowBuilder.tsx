// Component برای تعریف و مدیریت workflow ها
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useState } from "react";
import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowStepType,
} from "../types/workflow";

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: WorkflowDefinition) => void;
  onCancel?: () => void;
}

export default function WorkflowBuilder({
  workflowId,
  onSave,
  onCancel,
}: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    id: workflowId || `workflow-${Date.now()}`,
    name: "",
    description: "",
    steps: [],
    startStepId: "",
    variables: {},
  });

  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chatbot/workflow?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data.data || data);
      }
    } catch (error) {
      console.error("Error loading workflow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = (type: WorkflowStepType) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      name: `مرحله ${workflow.steps.length + 1}`,
      description: "",
      params: {},
    };

    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
      startStepId: workflow.startStepId || newStep.id,
    });

    setEditingStep(newStep);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteStep = (stepId: string) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter((s) => s.id !== stepId),
      startStepId:
        workflow.startStepId === stepId
          ? workflow.steps[0]?.id || ""
          : workflow.startStepId,
    });
  };

  const handleSave = async () => {
    if (!workflow.name || workflow.steps.length === 0) {
      alert("نام workflow و حداقل یک مرحله الزامی است");
      return;
    }

    try {
      const res = await fetch("/api/chatbot/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });

      if (res.ok) {
        const saved = await res.json();
        if (onSave) {
          onSave(saved.data || saved);
        }
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("خطا در ذخیره workflow");
    }
  };

  const stepTypes: { type: WorkflowStepType; label: string; icon: string }[] = [
    { type: "USER_CREATE", label: "ایجاد کاربر", icon: "fa-user-plus" },
    { type: "USER_UPDATE", label: "ویرایش کاربر", icon: "fa-user-edit" },
    { type: "USER_LIST", label: "لیست کاربران", icon: "fa-list" },
    { type: "USER_VIEW", label: "مشاهده کاربر", icon: "fa-eye" },
    { type: "LABEL_CREATE", label: "ایجاد برچسب", icon: "fa-tag" },
    { type: "LABEL_UPDATE", label: "ویرایش برچسب", icon: "fa-edit" },
    { type: "DELAY", label: "تاخیر", icon: "fa-clock" },
    { type: "REPORT", label: "گزارش", icon: "fa-file-alt" },
  ];

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          ساخت Workflow
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          یک workflow چند مرحله‌ای برای chatbot تعریف کنید
        </p>
      </div>

      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="نام workflow"
          value={workflow.name}
          onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
        <textarea
          placeholder="توضیحات (اختیاری)"
          value={workflow.description}
          onChange={(e) =>
            setWorkflow({ ...workflow, description: e.target.value })
          }
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {stepTypes.map((st) => (
          <button
            key={st.type}
            onClick={() => addStep(st.type)}
            className="flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary transition hover:bg-primary/10"
          >
            <DIcon icon={st.icon} />
            {st.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {workflow.steps.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-slate-500">
            <div>
              <DIcon icon="fa-list" className="mb-2 text-3xl" />
              <p>هیچ مرحله‌ای اضافه نشده است</p>
              <p className="mt-1 text-xs">
                از دکمه‌های بالا یک مرحله اضافه کنید
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                        {step.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {step.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingStep(step)}
                      className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <DIcon icon="fa-edit" />
                    </button>
                    <button
                      onClick={() => deleteStep(step.id)}
                      className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <DIcon icon="fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            انصراف
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!workflow.name || workflow.steps.length === 0}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ذخیره Workflow
        </button>
      </div>
    </div>
  );
}
