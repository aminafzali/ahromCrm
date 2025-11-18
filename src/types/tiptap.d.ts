declare module "@tiptap/react" {
  export type Editor = any;
  export type EditorEvents = any;
  export type EditorOptions = any;
  export function useEditor(
    options?: EditorOptions,
    deps?: unknown[]
  ): Editor | null;
  export const EditorContent: any;
}

declare module "@tiptap/starter-kit" {
  const StarterKit: any;
  export default StarterKit;
}

declare module "@tiptap/extension-placeholder" {
  const Placeholder: any;
  export default Placeholder;
}

declare module "@tiptap/extension-underline" {
  const Underline: any;
  export default Underline;
}
