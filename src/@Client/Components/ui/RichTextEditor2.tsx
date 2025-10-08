"use client";

import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  REDO_COMMAND,
  TextFormatType,
  UNDO_COMMAND,
} from "lexical";

import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";

import { $setBlocksType } from "@lexical/selection";

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

import { $createLinkNode, AutoLinkNode, LinkNode } from "@lexical/link";

import { CodeHighlightNode, CodeNode } from "@lexical/code";

import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

import DIcon from "@/@Client/Components/common/DIcon";

// Types and Interfaces
type BlockType = "paragraph" | "h1" | "h2" | "quote";
type FontSize = "small" | "medium" | "large";

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  currentBlock: BlockType;
  fontSize: FontSize;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
  size?: number;
  type?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Utility functions
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getFontSizeValue(size: FontSize): string {
  switch (size) {
    case "small":
      return "12px";
    case "large":
      return "18px";
    default:
      return "14px";
  }
}

/* -------------- ToolbarPlugin -------------- */
interface ToolbarPluginProps {
  disabled?: boolean;
}

function ToolbarPlugin({ disabled = false }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    currentBlock: "paragraph",
    fontSize: "medium",
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update toolbar state based on selection
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        try {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            setToolbarState((prev) => ({
              ...prev,
              isBold: false,
              isItalic: false,
              isUnderline: false,
              isStrikethrough: false,
              isCode: false,
              currentBlock: "paragraph",
            }));
            return;
          }

          const newState: Partial<ToolbarState> = {
            isBold: selection.hasFormat("bold"),
            isItalic: selection.hasFormat("italic"),
            isUnderline: selection.hasFormat("underline"),
            isStrikethrough: selection.hasFormat("strikethrough"),
            isCode: selection.hasFormat("code"),
          };

          // Determine block type
          const anchor = selection.anchor.getNode();
          if (anchor) {
            const element = anchor.getTopLevelElementOrThrow();
            const type = element.getType();

            if (type === "heading") {
              const headingNode = element as HeadingNode;
              const tag = headingNode.getTag ? headingNode.getTag() : "1";
              newState.currentBlock = `h${tag}` as BlockType;
            } else if (type === "quote") {
              newState.currentBlock = "quote";
            } else {
              newState.currentBlock = "paragraph";
            }
          }

          setToolbarState((prev) => ({ ...prev, ...newState }));
        } catch (error) {
          console.warn("Toolbar update failed:", error);
        }
      });
    });

    return () => unregister();
  }, [editor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const formatText = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor]
  );

  const formatBlock = useCallback(
    (blockType: BlockType) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        try {
          switch (blockType) {
            case "paragraph":
              $setBlocksType(selection, () => $createParagraphNode());
              break;
            case "h1":
              $setBlocksType(selection, () => $createHeadingNode("h1"));
              break;
            case "h2":
              $setBlocksType(selection, () => $createHeadingNode("h2"));
              break;
            case "quote":
              $setBlocksType(selection, () => $createQuoteNode());
              break;
          }
        } catch (error) {
          console.warn("Failed to format block:", error);
        }
      });
    },
    [editor]
  );

  // Apply inline style to selection
  const applyInlineStyleToSelection = useCallback(
    (style: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        try {
          const selectedText = selection.getTextContent();
          if (!selectedText) return;

          // Create styled span element
          const styledHtml = `<span style="${escapeHtml(style)}">${escapeHtml(
            selectedText
          )}</span>`;

          const parser = new DOMParser();
          const dom = parser.parseFromString(styledHtml, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);

          if (nodes.length > 0) {
            selection.insertNodes(nodes);
          }
        } catch (error) {
          console.warn("Failed to apply inline style:", error);
        }
      });
    },
    [editor]
  );

  const changeFontSize = useCallback(
    (size: FontSize) => {
      setToolbarState((prev) => ({ ...prev, fontSize: size }));

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        try {
          const fontSizeValue = getFontSizeValue(size);
          applyInlineStyleToSelection(`font-size: ${fontSizeValue}`);
        } catch (error) {
          console.warn("Failed to change font size:", error);
        }
      });
    },
    [editor, applyInlineStyleToSelection]
  );

  const insertLink = useCallback(() => {
    const raw = window.prompt("آدرس لینک را وارد کنید");
    if (!raw) return;

    let url = raw.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    if (!isValidUrl(url)) {
      alert("آدرس معتبر نیست");
      return;
    }

    const linkText = window.prompt("متن لینک (اختیاری)") || url;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      try {
        const linkNode = $createLinkNode(url);
        const textNode = $createTextNode(linkText);
        linkNode.append(textNode);
        selection.insertNodes([linkNode]);
      } catch (error) {
        console.warn("Failed to insert link:", error);
      }
    });
  }, [editor]);

  const insertTable = useCallback(() => {
    try {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        columns: "3",
        rows: "3",
        includeHeaders: true,
      });
    } catch (error) {
      console.warn("Failed to insert table:", error);
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    if (isUploading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("لطفاً یک فایل تصویری انتخاب کنید");
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data: UploadResponse = await response.json();

        if (data.success && data.url) {
          const imageUrl = data.url;
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            try {
              const imageHtml = `<img src="${escapeHtml(
                imageUrl
              )}" alt="تصویر" style="max-width:100%;height:auto;border-radius:8px;" />`;
              const parser = new DOMParser();
              const dom = parser.parseFromString(imageHtml, "text/html");
              const nodes = $generateNodesFromDOM(editor, dom);
              selection.insertNodes(nodes);
            } catch (error) {
              console.warn("Failed to insert image:", error);
            }
          });
        } else {
          alert(data.error || "خطا در آپلود تصویر");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("خطا در آپلود تصویر");
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  }, [editor]);

  const insertFile = useCallback(() => {
    const url = window.prompt("آدرس فایل را وارد کنید");
    if (!url) return;

    const safeUrl = url.trim();
    if (!safeUrl || !isValidUrl(safeUrl)) {
      alert("آدرس معتبر نیست");
      return;
    }

    const name = window.prompt("نام فایل (اختیاری)") || "دانلود فایل";

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      try {
        const linkNode = $createLinkNode(safeUrl);
        const textNode = $createTextNode(name);
        linkNode.append(textNode);
        selection.insertNodes([linkNode]);
      } catch (error) {
        console.warn("Failed to insert file link:", error);
      }
    });
  }, [editor]);

  const applyTextRight = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      try {
        const text = selection.getTextContent();
        if (!text) return;

        const html = `<div style="text-align:right; direction:rtl">${escapeHtml(
          text
        )}</div>`;
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        selection.insertNodes(nodes);
      } catch (error) {
        console.warn("Failed to apply text alignment:", error);
      }
    });
  }, [editor]);

  return (
    <div className="border-b bg-white rounded-t">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex flex-wrap items-center gap-2 p-2">
        {/* Undo/Redo ON LEFT - accessible */}
        <div className="flex items-center gap-1">
          <button
            aria-label="بازگردانی"
            title="بازگردانی (Ctrl+Z)"
            type="button"
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-rotate-left" cdi={false} />
          </button>
          <button
            aria-label="تکرار"
            title="تکرار (Ctrl+Y)"
            type="button"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-rotate-right" cdi={false} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* main toolbar */}
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          <button
            aria-label="تراز راست"
            title="تراز راست"
            onClick={applyTextRight}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-align-right" cdi={false} />
          </button>

          <button
            aria-label="رنگ متن"
            title="رنگ متن"
            onClick={() => {
              const color = window.prompt(
                "رنگ متن را وارد کنید (مثال: #ff0000 یا red)"
              );
              if (color) applyInlineStyleToSelection(`color: ${color}`);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-palette" cdi={false} />
          </button>

          <button
            aria-label="رنگ پس‌زمینه"
            title="رنگ پس‌زمینه"
            onClick={() => {
              const color = window.prompt(
                "رنگ پس‌زمینه را وارد کنید (مثال: #ffff00 یا yellow)"
              );
              if (color)
                applyInlineStyleToSelection(`background-color: ${color}`);
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-highlighter" cdi={false} />
          </button>

          <button
            aria-label="حاشیه متن"
            title="حاشیه متن"
            onClick={() => {
              const color = window.prompt(
                "رنگ حاشیه را وارد کنید (مثال: #000000 یا black)"
              );
              if (color)
                applyInlineStyleToSelection(
                  `border: 1px solid ${color}; padding: 2px 4px; border-radius: 3px;`
                );
            }}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-square" cdi={false} />
          </button>

          <select
            aria-label="نوع بلاک"
            className="select select-bordered select-sm min-w-[120px]"
            value={
              toolbarState.currentBlock.startsWith("h")
                ? toolbarState.currentBlock
                : "paragraph"
            }
            onChange={(e) => formatBlock(e.target.value as BlockType)}
          >
            <option value="paragraph">پاراگراف</option>
            <option value="h1">سرتیتر ۱</option>
            <option value="h2">سرتیتر ۲</option>
            <option value="quote">نقل قول</option>
          </select>

          <button
            aria-label="لینک"
            title="درج لینک"
            onClick={insertLink}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-link" cdi={false} />
          </button>

          <button
            aria-label="جدول"
            title="درج جدول"
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-table" cdi={false} />
          </button>

          <button
            aria-label="تصویر"
            title={isUploading ? "در حال آپلود..." : "درج تصویر"}
            onClick={insertImage}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            ) : (
              <DIcon icon="fa-image" cdi={false} />
            )}
          </button>

          <button
            aria-label="فایل"
            title="درج فایل"
            onClick={insertFile}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-paperclip" cdi={false} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <button
            aria-label="ضخیم"
            title="ضخیم"
            onClick={() => formatText("bold")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              toolbarState.isBold ? "bg-gray-100" : ""
            }`}
          >
            <span className="font-bold text-sm">B</span>
          </button>

          <button
            aria-label="ایتالیک"
            title="ایتالیک"
            onClick={() => formatText("italic")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              toolbarState.isItalic ? "bg-gray-100" : ""
            }`}
          >
            <span className="italic text-sm">I</span>
          </button>

          <button
            aria-label="زیرخط"
            title="زیرخط"
            onClick={() => formatText("underline")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              toolbarState.isUnderline ? "bg-gray-100" : ""
            }`}
          >
            <span className="underline text-sm">U</span>
          </button>

          <button
            aria-label="کد"
            title="کد"
            onClick={() => formatText("code")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              toolbarState.isCode ? "bg-gray-100" : ""
            }`}
          >
            <DIcon icon="fa-code" cdi={false} />
          </button>

          <button
            aria-label="خط خورده"
            title="خط خورده"
            onClick={() => formatText("strikethrough")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              toolbarState.isStrikethrough ? "bg-gray-100" : ""
            }`}
          >
            <DIcon icon="fa-strikethrough" cdi={false} />
          </button>

          <button
            aria-label="زیرخط دوتایی"
            title="زیرخط دوتایی"
            onClick={() =>
              applyInlineStyleToSelection("text-decoration: double underline")
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-underline" cdi={false} />
          </button>

          <button
            aria-label="سایه متن"
            title="سایه متن"
            onClick={() =>
              applyInlineStyleToSelection(
                "text-shadow: 1px 1px 2px rgba(0,0,0,0.3)"
              )
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-text-height" cdi={false} />
          </button>

          <select
            aria-label="اندازه قلم"
            className="select select-bordered select-sm min-w-[100px]"
            value={toolbarState.fontSize}
            onChange={(e) => changeFontSize(e.target.value as FontSize)}
          >
            <option value="small">کوچک</option>
            <option value="medium">متوسط</option>
            <option value="large">بزرگ</option>
          </select>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <button
            aria-label="لیست نشانه دار"
            title="لیست نشانه‌دار"
            onClick={() =>
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-list-ul" cdi={false} />
          </button>
          <button
            aria-label="لیست شماره دار"
            title="لیست شماره‌دار"
            onClick={() =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-list-ol" cdi={false} />
          </button>
          <button
            aria-label="حذف لیست"
            title="حذف لیست"
            onClick={() =>
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon icon="fa-list" cdi={false} />
          </button>
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <button
              aria-label="بازگردانی"
              onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
              className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            >
              <DIcon icon="fa-rotate-left" cdi={false} />
            </button>
            <button
              aria-label="تکرار"
              onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
              className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            >
              <DIcon icon="fa-rotate-right" cdi={false} />
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <DIcon
              icon={isMobileMenuOpen ? "fa-chevron-up" : "fa-chevron-down"}
              cdi={false}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="p-2 border-b bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              {/* Basic Formatting */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600">فرمت متن</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => formatText("bold")}
                    className={`p-2 rounded text-sm ${
                      toolbarState.isBold
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => formatText("italic")}
                    className={`p-2 rounded text-sm ${
                      toolbarState.isItalic
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white"
                    }`}
                  >
                    I
                  </button>
                  <button
                    onClick={() => formatText("underline")}
                    className={`p-2 rounded text-sm ${
                      toolbarState.isUnderline
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white"
                    }`}
                  >
                    U
                  </button>
                </div>
              </div>

              {/* Block Types */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600">نوع بلاک</h4>
                <select
                  className="w-full text-xs p-1 border rounded"
                  value={
                    toolbarState.currentBlock.startsWith("h")
                      ? toolbarState.currentBlock
                      : "paragraph"
                  }
                  onChange={(e) => formatBlock(e.target.value as BlockType)}
                >
                  <option value="paragraph">پاراگراف</option>
                  <option value="h1">سرتیتر ۱</option>
                  <option value="h2">سرتیتر ۲</option>
                  <option value="quote">نقل قول</option>
                </select>
              </div>

              {/* Insert Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600">درج</h4>
                <div className="flex gap-1">
                  <button
                    onClick={insertLink}
                    className="p-2 rounded bg-white text-xs"
                    title="لینک"
                  >
                    🔗
                  </button>
                  <button
                    onClick={insertImage}
                    className="p-2 rounded bg-white text-xs disabled:opacity-50"
                    title={isUploading ? "در حال آپلود..." : "تصویر"}
                    disabled={isUploading}
                  >
                    {isUploading ? "⏳" : "🖼️"}
                  </button>
                  <button
                    onClick={insertTable}
                    className="p-2 rounded bg-white text-xs"
                    title="جدول"
                  >
                    📊
                  </button>
                </div>
              </div>

              {/* Lists */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600">لیست</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      editor.dispatchCommand(
                        INSERT_UNORDERED_LIST_COMMAND,
                        undefined
                      )
                    }
                    className="p-2 rounded bg-white text-xs"
                    title="لیست نشانه‌دار"
                  >
                    •
                  </button>
                  <button
                    onClick={() =>
                      editor.dispatchCommand(
                        INSERT_ORDERED_LIST_COMMAND,
                        undefined
                      )
                    }
                    className="p-2 rounded bg-white text-xs"
                    title="لیست شماره‌دار"
                  >
                    1.
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------- InitialHTMLPlugin -------------- */
interface InitialHTMLPluginProps {
  html: string;
}

function InitialHTMLPlugin({ html }: InitialHTMLPluginProps) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const lastHtmlRef = useRef<string>("");

  useEffect(() => {
    // Only initialize once or when HTML changes significantly
    if (initializedRef.current && lastHtmlRef.current === html) return;

    editor.update(() => {
      try {
        const root = $getRoot();
        root.clear();

        if (!html || html.trim() === "") {
          root.append($createParagraphNode());
          return;
        }

        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);

        if (nodes.length === 0) {
          root.append($createParagraphNode());
        } else {
          nodes.forEach((node) => {
            if (node) {
              root.append(node);
            }
          });
        }
      } catch (error) {
        console.error("Error parsing HTML into editor:", error);
        // Fallback to empty paragraph
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      }
    });

    initializedRef.current = true;
    lastHtmlRef.current = html;
  }, [editor, html]);

  return null;
}

/* -------------- Main Component -------------- */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "متن خود را وارد کنید...",
  disabled = false,
  className = "",
}: RichTextEditorProps) {
  // Editor configuration with performance optimizations
  const editorConfig = useMemo(
    () => ({
      namespace: "RichTextEditor",
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
      ],
      onError: (error: Error) => {
        console.error("Lexical Editor Error:", error);
      },
      editable: !disabled,
      theme: {
        // rtl content default
        ltr: "text-left",
        rtl: "text-right",
        paragraph: "mb-4 text-sm leading-relaxed",
        quote:
          "border-r-4 border-gray-300 pr-4 italic text-gray-600 bg-gray-50 p-3 rounded",
        heading: {
          h1: "text-2xl font-bold mb-4 text-gray-800",
          h2: "text-xl font-bold mb-3 text-gray-800",
        },
        list: {
          nested: {
            listitem: "list-none",
          },
          ol: "list-decimal mr-8",
          ul: "list-disc mr-8",
        },
        link: "text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 inline-flex items-center gap-1",
        code: "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono",
        image: "max-w-full h-auto rounded-lg shadow-sm",
        table: "border-collapse border border-gray-300 w-full my-4",
        tableCell: "border border-gray-300 px-2 py-1 text-sm",
        tableCellHeader:
          "border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-sm",
      },
    }),
    [disabled]
  );

  // Debounced onChange handler to avoid heavy serialization
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onChangeHandler = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }

      changeTimeoutRef.current = setTimeout(() => {
        editorState.read(() => {
          try {
            const html = $generateHtmlFromNodes(editor, null);
            onChange(html);
          } catch (error) {
            console.warn("Failed to generate HTML:", error);
          }
        });
      }, 250);
    },
    [onChange]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  // URL matchers for auto-linking
  const URL_MATCHERS = useMemo(
    () => [
      (text: string) => {
        const regex = /(https?:\/\/[^\s]+)/i;
        const match = regex.exec(text);
        if (match) {
          return {
            index: match.index,
            length: match[0].length,
            text: match[0],
            url: match[0],
          };
        }
        return null;
      },
    ],
    []
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div
        className={`border rounded-lg bg-white shadow-sm overflow-hidden ${className}`}
      >
        <ToolbarPlugin disabled={disabled} />
        <div className="relative" style={{ minHeight: 220 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="p-4 focus:outline-none min-h-[220px] text-base leading-relaxed"
                dir="rtl"
                style={{
                  minHeight: 220,
                  direction: "rtl",
                  textAlign: "right",
                  opacity: disabled ? 0.6 : 1,
                  pointerEvents: disabled ? "none" : "auto",
                }}
                aria-label="Rich text editor"
                readOnly={disabled}
              />
            }
            placeholder={
              <div className="absolute top-4 right-4 text-gray-400 pointer-events-none text-sm">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin matchers={URL_MATCHERS} />
          <HistoryPlugin />
          <OnChangePlugin onChange={onChangeHandler} />
          <InitialHTMLPlugin html={value || ""} />
        </div>
      </div>
    </LexicalComposer>
  );
}
