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

// Lexical imports
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

// Image node will be handled differently

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

import DIcon from "@/@Client/Components/common/DIcon";

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<string>("paragraph");
  const [fontSize, setFontSize] = useState<string>("medium");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          setIsUnderline(selection.hasFormat("underline"));
          setIsStrikethrough(selection.hasFormat("strikethrough"));
          setIsCode(selection.hasFormat("code"));

          const anchor = selection.anchor.getNode();
          const element = anchor.getTopLevelElementOrThrow();
          setCurrentBlock(element.getType());
        }
      });
    });
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

  const changeFontSize = (size: string) => {
    setFontSize(size);
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Apply font size styling using format
        const format =
          size === "small"
            ? "font-size: 12px;"
            : size === "medium"
            ? "font-size: 14px;"
            : "font-size: 18px;";
        // For now, we'll just store the size preference
        // The actual styling will be handled by CSS classes
      }
    });
  };

  const insertLink = () => {
    const url = window.prompt("آدرس لینک را وارد کنید");
    const linkText = window.prompt("متن لینک (اختیاری)");
    if (url !== null && url.trim()) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = $createLinkNode(url.trim());
          const textNode = $createTextNode(linkText || url.trim());
          const arrowNode = $createTextNode(" ↗");
          linkNode.append(textNode);
          linkNode.append(arrowNode);
          selection.insertNodes([linkNode]);
        }
      });
    }
  };

  const insertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "3",
      rows: "3",
      includeHeaders: true,
    });
  };

  const insertImage = () => {
    const url = window.prompt("آدرس تصویر را وارد کنید");
    if (url !== null && url.trim()) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Insert image as HTML
          const imageHtml = `<img src="${url.trim()}" alt="تصویر" style="max-width: 100%; height: auto; border-radius: 8px;" />`;
          const parser = new DOMParser();
          const dom = parser.parseFromString(imageHtml, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          selection.insertNodes(nodes);
        }
      });
    }
  };

  const insertFile = () => {
    const url = window.prompt("آدرس فایل را وارد کنید");
    const fileName = window.prompt("نام فایل (اختیاری)");
    if (url !== null && url.trim()) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = $createLinkNode(url.trim());
          const textNode = $createTextNode(fileName || "دانلود فایل");
          linkNode.append(textNode);
          selection.insertNodes([linkNode]);
        }
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-white">
      {/* Undo/Redo - Leftmost */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="بازگردانی"
      >
        <DIcon icon="fa-rotate-left" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="تکرار"
      >
        <DIcon icon="fa-rotate-right" cdi={false} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Align */}
      <button
        type="button"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.getNodes().forEach((node) => {
                if (node.getType() === "text") {
                  (node as any).setStyle("text-align: justify");
                }
              });
            }
          });
        }}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="تراز متن"
      >
        <DIcon icon="fa-align-justify" cdi={false} />
      </button>

      {/* Text Color */}
      <button
        type="button"
        onClick={() => {
          const color = window.prompt(
            "رنگ متن را وارد کنید (مثل: #ff0000 یا red)"
          );
          if (color) {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.getNodes().forEach((node) => {
                  if (node.getType() === "text") {
                    (node as any).setStyle(`color: ${color}`);
                  }
                });
              }
            });
          }
        }}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="رنگ متن"
      >
        <DIcon icon="fa-palette" cdi={false} />
      </button>

      {/* Block Type Selector */}
      <select
        className="select select-bordered select-sm min-w-[120px]"
        value={currentBlock.startsWith("heading") ? currentBlock : "paragraph"}
        onChange={(e) => formatBlock(e.target.value)}
      >
        <option value="paragraph">پاراگراف</option>
        <option value="h1">سرتیتر ۱</option>
        <option value="h2">سرتیتر ۲</option>
        <option value="quote">نقل قول</option>
      </select>

      {/* Link */}
      <button
        type="button"
        onClick={insertLink}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="لینک"
      >
        <DIcon icon="fa-link" cdi={false} />
      </button>

      {/* Table */}
      <button
        type="button"
        onClick={insertTable}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="جدول"
      >
        <DIcon icon="fa-table" cdi={false} />
      </button>

      {/* Image */}
      <button
        type="button"
        onClick={insertImage}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="تصویر"
      >
        <DIcon icon="fa-image" cdi={false} />
      </button>

      {/* File */}
      <button
        type="button"
        onClick={insertFile}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="فایل"
      >
        <DIcon icon="fa-paperclip" cdi={false} />
      </button>

      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => formatText("bold")}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          isBold ? "bg-gray-200" : ""
        }`}
        title="ضخیم"
      >
        <span className="font-bold text-sm">B</span>
      </button>
      <button
        type="button"
        onClick={() => formatText("italic")}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          isItalic ? "bg-gray-200" : ""
        }`}
        title="کج"
      >
        <span className="italic text-sm">I</span>
      </button>
      <button
        type="button"
        onClick={() => formatText("underline")}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          isUnderline ? "bg-gray-200" : ""
        }`}
        title="زیرخط"
      >
        <span className="underline text-sm">U</span>
      </button>
      <button
        type="button"
        onClick={() => formatText("code")}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          isCode ? "bg-gray-200" : ""
        }`}
        title="کد"
      >
        <DIcon icon="fa-code" cdi={false} />
      </button>

      {/* Font Size Selector */}
      <select
        className="select select-bordered select-sm min-w-[100px]"
        value={fontSize}
        onChange={(e) => changeFontSize(e.target.value)}
      >
        <option value="small">کوچک</option>
        <option value="medium">متوسط</option>
        <option value="large">بزرگ</option>
      </select>

      {/* Quote as separate button */}
      <button
        type="button"
        onClick={() => formatBlock("quote")}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
          currentBlock === "quote" ? "bg-gray-200" : ""
        }`}
        title="نقل قول"
      >
        <DIcon icon="fa-quote-left" cdi={false} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="لیست نشانه‌دار"
      >
        <DIcon icon="fa-list-ul" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="لیست شماره‌دار"
      >
        <DIcon icon="fa-list-ol" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="حذف لیست"
      >
        <DIcon icon="fa-list" cdi={false} />
      </button>
    </div>
  );
}

// Initial HTML Plugin
function InitialHTMLPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !html) return;

    editor.update(() => {
      try {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        nodes.forEach((node) => root.append(node));
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
    });

    initializedRef.current = true;
  }, [editor, html]);

  return null;
}

// Main Editor Component
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "متن خود را وارد کنید...",
}: RichTextEditorProps) {
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
        ltr: "text-left",
        rtl: "text-right",
        paragraph: "mb-4 text-sm",
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
        codeHighlight: {
          atrule: "text-purple-600",
          attr: "text-blue-600",
          boolean: "text-red-600",
          builtin: "text-purple-600",
          cdata: "text-gray-600",
          char: "text-green-600",
          class: "text-blue-600",
          "class-name": "text-blue-600",
          comment: "text-gray-500 italic",
          constant: "text-red-600",
          deleted: "text-red-600",
          doctype: "text-gray-600",
          entity: "text-orange-600",
          function: "text-blue-600",
          important: "text-red-600",
          inserted: "text-green-600",
          keyword: "text-purple-600",
          namespace: "text-blue-600",
          number: "text-red-600",
          operator: "text-gray-600",
          prolog: "text-gray-600",
          property: "text-blue-600",
          punctuation: "text-gray-600",
          regex: "text-green-600",
          selector: "text-purple-600",
          string: "text-green-600",
          symbol: "text-red-600",
          tag: "text-purple-600",
          url: "text-blue-600",
          variable: "text-red-600",
        },
        image: "max-w-full h-auto rounded-lg shadow-sm",
        table: "border-collapse border border-gray-300 w-full",
        tableCell: "border border-gray-300 px-2 py-1",
        tableCellHeader:
          "border border-gray-300 px-2 py-1 bg-gray-100 font-semibold",
      },
    }),
    []
  );

  const onChangeHandler = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onChange(html);
    });
  };

  const URL_MATCHERS = useMemo(
    () => [
      (text: string) => {
        const regex = /(https?:\/\/[^\s]+)/gim;
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
      <div className="border rounded-lg bg-white shadow-sm">
        <ToolbarPlugin />
        <div className="relative" style={{ minHeight: "200px" }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="p-4 focus:outline-none min-h-[200px] text-sm leading-relaxed"
                dir="rtl"
                style={{ minHeight: "200px" }}
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
