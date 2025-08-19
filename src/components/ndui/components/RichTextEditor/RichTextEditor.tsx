import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Button from '../Button/Button';

interface RichTextEditorProps {
  name: string;
  label?: string;
  className?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  label,
  className = '',
  placeholder = ''
}) => {
  const { register, setValue, getValues, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const initialContent = getValues(name) || '';

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setValue(name, editor.getHTML(), { shouldValidate: true });
    }
  });

  // مقدار پیش‌فرض را روی ویرایشگر ست کنیم
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) return null;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      
      <div className={`
        border rounded-lg p-4
        ${error ? 'border-error' : 'border-base-300'}
        ${className}
      `}>
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'primary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Bold
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'primary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Italic
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            Bullet List
          </Button>
        </div>
        
        <EditorContent placeholder={placeholder} editor={editor} />
      </div>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default RichTextEditor;
