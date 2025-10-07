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

import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";

import { CodeHighlightNode, CodeNode } from "@lexical/code";

import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

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

  const insertLink = () => {
    const url = window.prompt("آدرس لینک را وارد کنید");
    if (url !== null) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-gray-50 rounded-t-lg">
      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="بازگردانی"
      >
        <DIcon icon="fa-rotate-left" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="تکرار"
      >
        <DIcon icon="fa-rotate-right" cdi={false} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Block Type Selector */}
      <select
        className="select select-bordered select-sm"
        value={currentBlock.startsWith("heading") ? currentBlock : "paragraph"}
        onChange={(e) => formatBlock(e.target.value)}
      >
        <option value="paragraph">پاراگراف</option>
        <option value="h1">سرتیتر ۱</option>
        <option value="h2">سرتیتر ۲</option>
        <option value="quote">نقل قول</option>
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => formatText("bold")}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          isBold ? "bg-gray-300" : ""
        }`}
        title="ضخیم"
      >
        <DIcon icon="fa-bold" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => formatText("italic")}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          isItalic ? "bg-gray-300" : ""
        }`}
        title="کج"
      >
        <DIcon icon="fa-italic" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => formatText("underline")}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          isUnderline ? "bg-gray-300" : ""
        }`}
        title="زیرخط"
      >
        <DIcon icon="fa-underline" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => formatText("strikethrough")}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          isStrikethrough ? "bg-gray-300" : ""
        }`}
        title="خط خوردن"
      >
        <DIcon icon="fa-strikethrough" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => formatText("code")}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          isCode ? "bg-gray-300" : ""
        }`}
        title="کد"
      >
        <DIcon icon="fa-code" cdi={false} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="لیست نشانه‌دار"
      >
        <DIcon icon="fa-list-ul" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="لیست شماره‌دار"
      >
        <DIcon icon="fa-list-ol" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="حذف لیست"
      >
        <DIcon icon="fa-list" cdi={false} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Link */}
      <button
        type="button"
        onClick={insertLink}
        className="p-2 rounded hover:bg-gray-200 transition-colors"
        title="لینک"
      >
        <DIcon icon="fa-link" cdi={false} />
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
        paragraph: "mb-4",
        quote: "border-r-4 border-gray-300 pr-4 italic text-gray-600",
        heading: {
          h1: "text-2xl font-bold mb-4",
          h2: "text-xl font-bold mb-3",
        },
        list: {
          nested: {
            listitem: "list-none",
          },
          ol: "list-decimal mr-8",
          ul: "list-disc mr-8",
        },
        link: "text-blue-500 hover:underline",
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
      <div className="border rounded-lg bg-white">
        <ToolbarPlugin />
        <div className="relative" style={{ minHeight: "200px" }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="p-4 focus:outline-none min-h-[200px]"
                dir="rtl"
                style={{ minHeight: "200px" }}
              />
            }
            placeholder={
              <div className="absolute top-4 right-4 text-gray-400 pointer-events-none">
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
