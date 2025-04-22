import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import './Editor.css';

const Editor = ({ onPublish }) => {
  const [content, setContent] = useState('');

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
    ],
    content: '<p>Start typing your content here...</p>',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handlePublish = () => {
    onPublish(content);
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>Document Editor</h2>
        <button className="publish-button" onClick={handlePublish}>
          Publish
        </button>
      </div>
      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;