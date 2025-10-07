// مسیر فایل: src/components/ui/RichTextEditor.tsx

"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useEffect, useRef, useState } from "react";
// ===== شروع اصلاحیه: ایمپورت به صورت named انجام شد =====
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
// ===== پایان اصلاحیه =====
import DIcon from "@/@Client/Components/common/DIcon";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
} from "lexical";

// ===================================================================
// ۱. کامپوننت نوار ابزار (Toolbar)
// ===================================================================
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));
      }
    });
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={`p-2 rounded hover:bg-gray-200 ${
          isBold ? "bg-gray-300" : ""
        }`}
        title="ضخیم"
      >
        <DIcon icon="fa-bold" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={`p-2 rounded hover:bg-gray-200 ${
          isItalic ? "bg-gray-300" : ""
        }`}
        title="کج"
      >
        <DIcon icon="fa-italic" cdi={false} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={`p-2 rounded hover:bg-gray-200 ${
          isUnderline ? "bg-gray-300" : ""
        }`}
        title="زیرخط"
      >
        <DIcon icon="fa-underline" cdi={false} />
      </button>
    </div>
  );
}

// ===================================================================
// ۲. پیکربندی اولیه ویرایشگر
// ===================================================================
const editorConfig = {
  namespace: "MyEditor",
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
  onError(error: Error) {
    throw error;
  },
  theme: {
    ltr: "text-left",
    rtl: "text-right",
    paragraph: "mb-4",
    quote: "border-r-4 border-gray-300 pr-4 italic",
    list: {
      nested: {
        listitem: "list-none",
      },
      ol: "list-decimal mr-8",
      ul: "list-disc mr-8",
    },
    link: "text-blue-500 hover:underline",
  },
};

// ===================================================================
// ۳. کامپوننت اصلی ویرایشگر
// ===================================================================
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  toolbar?: string[];
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  toolbar,
}: RichTextEditorProps) {
  const onChangeHandler = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onChange(html);
    });
  };

  function InitialHTMLPlugin({ html }: { html: string }) {
    const [editor] = useLexicalComposerContext();
    const initializedRef = useRef(false);
    useEffect(() => {
      if (initializedRef.current) return;
      editor.update(() => {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html || "", "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();
          root.clear();
          nodes.forEach((n: any) => root.append(n));
        } catch {}
      });
      initializedRef.current = true;
    }, [editor, html]);
    return null;
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border rounded-lg relative">
        <ToolbarPlugin />
        <div className="relative" style={{ minHeight: "250px" }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="p-4 focus:outline-none" dir="rtl" />
            }
            placeholder={
              <div className="absolute top-4 right-4 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={onChangeHandler} />
          <InitialHTMLPlugin html={value || ""} />
        </div>
      </div>
    </LexicalComposer>
  );
}
