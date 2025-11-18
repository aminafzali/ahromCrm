"use client";

import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  List as BulletListIcon,
  Heading1,
  Heading2,
  Italic,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Pilcrow,
  Quote,
  Redo2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import "./tiptap.css";

type RichTextEditorTiptapProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

type ToolbarAction = {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: (e?: MouseEvent<HTMLButtonElement>) => void;
};

const sanitizeHtml = (html: string) =>
  html
    .replace(/<p><\/p>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

export default function RichTextEditorTiptap({
  value = "",
  onChange,
  placeholder = "متن خود را وارد کنید...",
  disabled = false,
  className,
}: RichTextEditorTiptapProps) {
  const lastHtmlRef = useRef(value);
  const [isMobileToolbar, setIsMobileToolbar] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobileToolbar(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobileToolbar) {
      setShowMoreActions(false);
    }
  }, [isMobileToolbar]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: value || "<p></p>",
    editable: !disabled,
    onUpdate({ editor }) {
      if (disabled) return;
      const html = editor.getHTML();
      if (html === lastHtmlRef.current) return;

      const normalized = sanitizeHtml(html);
      lastHtmlRef.current = normalized.length ? html : "";
      onChange(lastHtmlRef.current);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    if (value === lastHtmlRef.current) return;
    lastHtmlRef.current = value;
    editor.commands.setContent(value || "<p></p>", false);
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
        در حال بارگذاری ویرایشگر ...
      </div>
    );
  }

  const buttonBase =
    "flex h-9 w-9 items-center justify-center rounded-md border text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

  const formatButton = ({
    icon,
    label,
    active,
    disabled,
    onClick,
  }: ToolbarAction) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        buttonBase,
        "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary",
        active && "border-primary bg-primary text-white shadow-sm"
      )}
      title={label}
    >
      {icon}
    </button>
  );

  const renderActions = (
    actions: ToolbarAction[],
    options?: { onAfterClick?: () => void }
  ) =>
    actions.map((action) => (
      <span key={action.key}>
        {formatButton({
          ...action,
          disabled: disabled || action.disabled,
          onClick: (event) => {
            action.onClick(event);
            options?.onAfterClick?.();
          },
        })}
      </span>
    ));

  const primaryActions: ToolbarAction[] = [
    {
      key: "bold",
      label: "پررنگ",
      icon: <Bold className="h-4 w-4" />,
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      label: "مورب",
      icon: <Italic className="h-4 w-4" />,
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "underline",
      label: "خط زیر",
      icon: <UnderlineIcon className="h-4 w-4" />,
      active: editor.isActive("underline"),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      key: "paragraph",
      label: "پاراگراف",
      icon: <Pilcrow className="h-4 w-4" />,
      active:
        editor.isActive("paragraph") &&
        !editor.isActive("heading") &&
        !editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      key: "bullet",
      label: "لیست نقطه‌ای",
      icon: <BulletListIcon className="h-4 w-4" />,
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "ordered",
      label: "لیست عددی",
      icon: <ListOrdered className="h-4 w-4" />,
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  const secondaryActions: ToolbarAction[] = [
    {
      key: "heading1",
      label: "هدینگ ۱",
      icon: <Heading1 className="h-4 w-4" />,
      active: editor.isActive("heading", { level: 1 }),
      onClick: () => {
        if (editor.isActive("heading", { level: 1 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().setHeading({ level: 1 }).run();
        }
      },
    },
    {
      key: "heading2",
      label: "هدینگ ۲",
      icon: <Heading2 className="h-4 w-4" />,
      active: editor.isActive("heading", { level: 2 }),
      onClick: () => {
        if (editor.isActive("heading", { level: 2 })) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().setHeading({ level: 2 }).run();
        }
      },
    },
    {
      key: "quote",
      label: "نقل قول",
      icon: <Quote className="h-4 w-4" />,
      active: editor.isActive("blockquote"),
      onClick: (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        editor.chain().focus().toggleBlockquote().run();
      },
    },
    {
      key: "horizontal",
      label: "خط افقی",
      icon: <Minus className="h-4 w-4" />,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      key: "clear",
      label: "حذف محتوا",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => editor.chain().focus().clearContent().run(),
    },
    {
      key: "undo",
      label: "بازگشت",
      icon: <Undo2 className="h-4 w-4" />,
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      key: "redo",
      label: "جلو رفتن",
      icon: <Redo2 className="h-4 w-4" />,
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          {renderActions(primaryActions)}
          {isMobileToolbar ? (
            <span key="more">
              {formatButton({
                key: "more",
                label: showMoreActions
                  ? "بستن ابزارهای بیشتر"
                  : "ابزارهای بیشتر",
                icon: <MoreHorizontal className="h-4 w-4" />,
                active: showMoreActions,
                disabled,
                onClick: () => setShowMoreActions((prev) => !prev),
              })}
            </span>
          ) : (
            renderActions(secondaryActions)
          )}
        </div>

        {isMobileToolbar && showMoreActions && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="flex flex-wrap gap-2">
              {renderActions(secondaryActions, {
                onAfterClick: () => setShowMoreActions(false),
              })}
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-1 shadow-sm",
          disabled && "opacity-60"
        )}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "tiptap-editor",
            disabled ? "cursor-not-allowed" : "cursor-text"
          )}
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}
