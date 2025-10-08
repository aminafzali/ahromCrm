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
import { useEffect, useMemo, useRef, useState } from "react";

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

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* -------------- ToolbarPlugin -------------- */
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<string>("paragraph");
  const [fontSize, setFontSize] = useState<string>("medium");

  // unregister properly and protect reader
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        try {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            setIsBold(false);
            setIsItalic(false);
            setIsUnderline(false);
            setIsStrikethrough(false);
            setIsCode(false);
            setCurrentBlock("paragraph");
            return;
          }

          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          setIsUnderline(selection.hasFormat("underline"));
          setIsStrikethrough(selection.hasFormat("strikethrough"));
          setIsCode(selection.hasFormat("code"));

          const anchor = selection.anchor.getNode();
          if (!anchor) {
            setCurrentBlock("paragraph");
            return;
          }

          // determine block type (heading/quote/paragraph)
          const element = anchor.getTopLevelElementOrThrow();
          const type = element.getType();
          if (type === "heading") {
            // HeadingNode has getTag() typically
            const tag = (element as HeadingNode).getTag
              ? (element as HeadingNode).getTag()
              : "1";
            setCurrentBlock(`h${tag}`);
          } else if (type === "quote") {
            setCurrentBlock("quote");
          } else {
            setCurrentBlock("paragraph");
          }
        } catch (e) {
          // prevent crashing UI
          // console.warn("Toolbar update failed", e);
        }
      });
    });

    return () => unregister();
  }, [editor]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatBlock = (blockType: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else if (blockType === "h1") {
          $setBlocksType(selection, () => $createHeadingNode("h1"));
        } else if (blockType === "h2") {
          $setBlocksType(selection, () => $createHeadingNode("h2"));
        } else if (blockType === "quote") {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  };

  // apply inline style by wrapping selection with styled span (preserves formatting)
  const applyInlineStyleToSelection = (style: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Get the selected content as HTML to preserve formatting
        const selectedNodes = selection.getNodes();
        if (selectedNodes.length === 0) return;

        // Create a temporary container to serialize the selection
        const tempDiv = document.createElement("div");
        selectedNodes.forEach((node) => {
          if (node.getType() === "text") {
            const textNode = document.createTextNode(node.getTextContent());
            tempDiv.appendChild(textNode);
          } else {
            // For other node types, we'll handle them differently
            const textNode = document.createTextNode(node.getTextContent());
            tempDiv.appendChild(textNode);
          }
        });

        const content = tempDiv.innerHTML || tempDiv.textContent || "";
        const wrappedHtml = `<span style="${style}">${content}</span>`;

        const parser = new DOMParser();
        const dom = parser.parseFromString(wrappedHtml, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        selection.insertNodes(nodes);
      }
    });
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    // apply as block-level class (global for selection)
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // wrap selection in a span with font-size
        const mapping =
          size === "small"
            ? "font-size:12px"
            : size === "large"
            ? "font-size:18px"
            : "font-size:14px";
        applyInlineStyleToSelection(mapping);
      }
    });
  };

  const insertLink = () => {
    const raw = window.prompt("آدرس لینک را وارد کنید");
    if (!raw) return;
    let url = raw.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    try {
      // validate URL
      new URL(url);
    } catch {
      alert("آدرس معتبر نیست");
      return;
    }

    const linkText = window.prompt("متن لینک (اختیاری)");
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const linkNode = $createLinkNode(url);
        const textNode = $createTextNode(linkText || url);
        linkNode.append(textNode);
        selection.insertNodes([linkNode]);
      }
    });
  };

  const insertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "3",
      rows: "3",
      includeHeaders: true,
    });
  };

  const insertImage = () => {
    // Create file input for image upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("لطفاً یک فایل تصویری انتخاب کنید");
        return;
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server (you'll need to implement this endpoint)
      fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.url) {
            // Insert image into editor
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const imageHtml = `<img src="${escapeHtml(
                  data.url
                )}" alt="تصویر" style="max-width:100%;height:auto;border-radius:8px;" />`;
                const parser = new DOMParser();
                const dom = parser.parseFromString(imageHtml, "text/html");
                const nodes = $generateNodesFromDOM(editor, dom);
                selection.insertNodes(nodes);
              }
            });
          } else {
            alert("خطا در آپلود تصویر");
          }
        })
        .catch((error) => {
          console.error("Upload error:", error);
          alert("خطا در آپلود تصویر");
        });
    };
    input.click();
  };

  const insertFile = () => {
    const url = window.prompt("آدرس فایل را وارد کنید");
    if (!url) return;
    const safeUrl = url.trim();
    if (!safeUrl) return;
    const name = window.prompt("نام فایل (اختیاری)") || "دانلود فایل";
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const linkNode = $createLinkNode(safeUrl);
        const textNode = $createTextNode(name);
        linkNode.append(textNode);
        selection.insertNodes([linkNode]);
      }
    });
  };

  const applyTextRight = () => {
    // wrap selection into div with RTL text-align: right
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        const html = `<div style="text-align:right; direction:rtl">${escapeHtml(
          text
        )}</div>`;
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        selection.insertNodes(nodes);
      }
    });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-rotate-left" cdi={false} />
          </button>
          <button
            aria-label="تکرار"
            title="تکرار (Ctrl+Y)"
            type="button"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-square" cdi={false} />
          </button>

          <select
            aria-label="نوع بلاک"
            className="select select-bordered select-sm min-w-[120px]"
            value={currentBlock.startsWith("h") ? currentBlock : "paragraph"}
            onChange={(e) => formatBlock(e.target.value)}
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-link" cdi={false} />
          </button>

          <button
            aria-label="جدول"
            title="درج جدول"
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-table" cdi={false} />
          </button>

          <button
            aria-label="تصویر"
            title="درج تصویر"
            onClick={insertImage}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-image" cdi={false} />
          </button>

          <button
            aria-label="فایل"
            title="درج فایل"
            onClick={insertFile}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-paperclip" cdi={false} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <button
            aria-label="ضخیم"
            title="ضخیم"
            onClick={() => formatText("bold")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isBold ? "bg-gray-100" : ""
            }`}
          >
            <span className="font-bold text-sm">B</span>
          </button>

          <button
            aria-label="ایتالیک"
            title="ایتالیک"
            onClick={() => formatText("italic")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isItalic ? "bg-gray-100" : ""
            }`}
          >
            <span className="italic text-sm">I</span>
          </button>

          <button
            aria-label="زیرخط"
            title="زیرخط"
            onClick={() => formatText("underline")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isUnderline ? "bg-gray-100" : ""
            }`}
          >
            <span className="underline text-sm">U</span>
          </button>

          <button
            aria-label="کد"
            title="کد"
            onClick={() => formatText("code")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isCode ? "bg-gray-100" : ""
            }`}
          >
            <DIcon icon="fa-code" cdi={false} />
          </button>

          <button
            aria-label="خط خورده"
            title="خط خورده"
            onClick={() => formatText("strikethrough")}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isStrikethrough ? "bg-gray-100" : ""
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-text-height" cdi={false} />
          </button>

          <select
            aria-label="اندازه قلم"
            className="select select-bordered select-sm min-w-[100px]"
            value={fontSize}
            onChange={(e) => changeFontSize(e.target.value)}
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
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-list-ul" cdi={false} />
          </button>
          <button
            aria-label="لیست شماره دار"
            title="لیست شماره‌دار"
            onClick={() =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <DIcon icon="fa-list-ol" cdi={false} />
          </button>
          <button
            aria-label="حذف لیست"
            title="حذف لیست"
            onClick={() =>
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
            }
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <DIcon icon="fa-rotate-left" cdi={false} />
            </button>
            <button
              aria-label="تکرار"
              onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <DIcon icon="fa-rotate-right" cdi={false} />
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
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
                      isBold ? "bg-blue-100 text-blue-600" : "bg-white"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => formatText("italic")}
                    className={`p-2 rounded text-sm ${
                      isItalic ? "bg-blue-100 text-blue-600" : "bg-white"
                    }`}
                  >
                    I
                  </button>
                  <button
                    onClick={() => formatText("underline")}
                    className={`p-2 rounded text-sm ${
                      isUnderline ? "bg-blue-100 text-blue-600" : "bg-white"
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
                    currentBlock.startsWith("h") ? currentBlock : "paragraph"
                  }
                  onChange={(e) => formatBlock(e.target.value)}
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
                    className="p-2 rounded bg-white text-xs"
                    title="تصویر"
                  >
                    🖼️
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
function InitialHTMLPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const lastHtmlRef = useRef<string>("");

  useEffect(() => {
    // initialize only once OR when html changes substantially (if desired)
    if (initializedRef.current && lastHtmlRef.current === html) return;
    editor.update(() => {
      try {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html || "<p></p>", "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        if (nodes.length === 0) {
          root.append($createParagraphNode());
        } else {
          nodes.forEach((node) => root.append(node));
        }
      } catch (error) {
        console.error("Error parsing HTML into editor:", error);
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
}: Props) {
  // default theme and nodes
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
        table: "border-collapse border border-gray-300 w-full",
        tableCell: "border border-gray-300 px-2 py-1",
        tableCellHeader:
          "border border-gray-300 px-2 py-1 bg-gray-100 font-semibold",
      },
    }),
    []
  );

  // debounce onChange to avoid heavy serialization on each key
  const changeTimeoutRef = useRef<number | null>(null);
  const onChangeHandler = (editorState: EditorState, editor: LexicalEditor) => {
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    changeTimeoutRef.current = window.setTimeout(() => {
      editorState.read(() => {
        try {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        } catch (e) {
          console.warn("Failed to generate HTML:", e);
        }
      });
    }, 250);
  };

  // better autolink regex (no global)
  const URL_MATCHERS = useMemo(
    () => [
      (text: string) => {
        const regex = /(https?:\/\/[^\s]+)/im;
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
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <ToolbarPlugin />
        <div className="relative" style={{ minHeight: 220 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="p-4 focus:outline-none min-h-[220px] text-base leading-relaxed"
                dir="rtl"
                style={{ minHeight: 220, direction: "rtl", textAlign: "right" }}
                aria-label="Rich text editor"
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
