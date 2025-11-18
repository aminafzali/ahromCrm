"use client";

import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { HtmlPlugin } from "@platejs/core";
import { ParagraphPlugin } from "@platejs/core/react";
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from "@platejs/list-classic/react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List as ListIcon,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import {
  Plate,
  PlateContent,
  useEditorRef,
  useEditorSelector,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
  usePlateEditor,
  type PlateEditor,
} from "platejs/react";
import { serializeHtml } from "platejs/static";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type RichTextEditorPlateProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const TOOLBAR_ICON_CLASS = "h-4 w-4";
const DEFAULT_VALUE = [
  {
    type: ParagraphPlugin.key,
    children: [{ text: "" }],
  },
];

const cloneDefaultValue = () => JSON.parse(JSON.stringify(DEFAULT_VALUE));

export default function RichTextEditorPlate({
  value = "",
  onChange,
  placeholder = "متن خود را وارد کنید...",
  disabled = false,
  className,
}: RichTextEditorPlateProps) {
  const plugins = useMemo(
    () => [
      HtmlPlugin,
      ParagraphPlugin,
      H1Plugin,
      H2Plugin,
      H3Plugin,
      BlockquotePlugin,
      HorizontalRulePlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      ListPlugin,
      ListItemPlugin,
      ListItemContentPlugin,
      BulletedListPlugin,
      NumberedListPlugin,
    ],
    []
  );

  const editor = usePlateEditor(
    {
      id: "knowledge-plate-editor",
      plugins,
      value: cloneDefaultValue(),
    },
    [plugins]
  );

  const lastHtmlRef = useRef(value ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!editor || typeof window === "undefined") return;
    const incoming = value ?? "";
    if (incoming === lastHtmlRef.current) return;

    if (!incoming.trim()) {
      editor.tf.setValue(cloneDefaultValue());
      lastHtmlRef.current = "";
      return;
    }

    const container = document.createElement("div");
    container.innerHTML = incoming;
    const nodes = editor.api.html.deserialize({ element: container });
    const nextValue = Array.isArray(nodes) ? nodes : nodes ? [nodes] : [];
    editor.tf.setValue(nextValue.length ? nextValue : cloneDefaultValue());
    lastHtmlRef.current = incoming;
  }, [editor, value]);

  const handleEditorChange = useCallback(
    async ({ editor }: { editor: PlateEditor }) => {
      if (disabled) return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const html = await serializeHtml(editor, {
            stripClassNames: true,
            stripDataAttributes: true,
          });

          const normalized = html
            .replace(/<[^>]*>/g, "")
            .replace(/(&nbsp;|\u00A0)/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          const nextValue = normalized.length ? html : "";

          if (nextValue === lastHtmlRef.current) return;
          lastHtmlRef.current = nextValue;
          onChange(nextValue);
        } catch (error) {
          console.warn("Plate serialize failed", error);
        }
      }, 200);
    },
    [disabled, onChange]
  );

  if (!editor) return null;

  return (
    <Plate
      editor={editor}
      onChange={handleEditorChange}
      readOnly={disabled}
      primary
    >
      <div
        className={cn(
          "border rounded-lg bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-primary/30",
          className,
          disabled && "opacity-60"
        )}
      >
        <EditorToolbar disabled={disabled} />
        <div className="px-4 pb-4">
          <PlateContent
            dir="rtl"
            placeholder={placeholder}
            className={cn(
              "min-h-[220px] w-full rounded-md px-3 py-3 text-base leading-relaxed text-right outline-none",
              disabled ? "cursor-not-allowed" : "cursor-text"
            )}
            disabled={disabled}
          />
        </div>
      </div>
    </Plate>
  );
}

function EditorToolbar({ disabled }: { disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 border-b bg-gray-50 px-4 py-2">
      <MarkButton
        nodeType={BoldPlugin.key}
        label="پررنگ"
        icon={<Bold className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <MarkButton
        nodeType={ItalicPlugin.key}
        label="مورب"
        icon={<Italic className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <MarkButton
        nodeType={UnderlinePlugin.key}
        label="خط زیر"
        icon={<Underline className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <MarkButton
        nodeType={StrikethroughPlugin.key}
        label="خط خورده"
        icon={<Strikethrough className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <ToolbarButton
        nodeType={H1Plugin.key}
        label="تیتر ۱"
        icon={<Heading1 className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <ToolbarButton
        nodeType={H2Plugin.key}
        label="تیتر ۲"
        icon={<Heading2 className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <ToolbarButton
        nodeType={BlockquotePlugin.key}
        label="نقل قول"
        icon={<Quote className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <ListButton
        nodeType={BulletedListPlugin.key}
        label="فهرست نقطه‌ای"
        icon={<ListIcon className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
      <ListButton
        nodeType={NumberedListPlugin.key}
        label="فهرست عددی"
        icon={<ListOrdered className={TOOLBAR_ICON_CLASS} />}
        disabled={disabled}
      />
    </div>
  );
}

function ToolbarSurfaceButton({
  icon,
  label,
  disabled,
  className,
  active,
  ...props
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition",
        "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
        active && "bg-primary text-white border-primary shadow-sm",
        disabled && "cursor-not-allowed opacity-40",
        className
      )}
      title={label}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
}

function MarkButton({
  nodeType,
  icon,
  label,
  disabled,
}: {
  nodeType: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const state = useMarkToolbarButtonState({ nodeType });
  const { props } = useMarkToolbarButton(state);
  const { pressed, ...rest } = props;

  return (
    <ToolbarSurfaceButton
      icon={icon}
      label={label}
      disabled={disabled}
      active={pressed}
      onMouseDown={rest.onMouseDown}
      onClick={rest.onClick}
    />
  );
}

function ToolbarButton({
  nodeType,
  icon,
  label,
  disabled,
}: {
  nodeType: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const { pressed, toggle } = useBlockToggle(nodeType);

  return (
    <ToolbarSurfaceButton
      icon={icon}
      label={label}
      disabled={disabled}
      active={pressed}
      onMouseDown={(event) => event.preventDefault()}
      onClick={toggle}
    />
  );
}

function ListButton({
  nodeType,
  icon,
  label,
  disabled,
}: {
  nodeType: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const { pressed, toggle } = useListToggle(nodeType);

  return (
    <ToolbarSurfaceButton
      icon={icon}
      label={label}
      disabled={disabled}
      active={pressed}
      onMouseDown={(event) => event.preventDefault()}
      onClick={toggle}
    />
  );
}

const useBlockToggle = (nodeType: string) => {
  const editor = useEditorRef();
  const pressed = useEditorSelector(
    (currentEditor) =>
      !!currentEditor.selection &&
      currentEditor.api.some({
        match: { type: currentEditor.getType(nodeType) },
      }),
    [nodeType]
  );

  const toggle = useCallback(() => {
    editor.tf.toggleBlock(nodeType, { defaultType: ParagraphPlugin.key });
    editor.tf.focus();
  }, [editor, nodeType]);

  return { pressed, toggle };
};

const useListToggle = (nodeType: string) => {
  const editor = useEditorRef();
  const pressed = useEditorSelector(
    (currentEditor) =>
      !!currentEditor.selection &&
      currentEditor.api.some({
        match: { type: currentEditor.getType(nodeType) },
      }),
    [nodeType]
  );

  const toggle = useCallback(() => {
    const listTransforms = editor.getTransforms(ListPlugin);
    listTransforms.toggle.list({ type: nodeType });
    editor.tf.focus();
  }, [editor, nodeType]);

  return { pressed, toggle };
};
