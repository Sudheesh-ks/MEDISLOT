import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, type TextFormatType } from 'lexical';

const Toolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const applyFormat = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="flex gap-2 border-b border-slate-700 pb-2 mb-2">
      <button
        onClick={() => applyFormat('bold')}
        className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
      >
        B
      </button>
      <button
        onClick={() => applyFormat('italic')}
        className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm italic"
      >
        I
      </button>
      {/* <button
        onClick={() => applyFormat("underline")}
        className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm underline"
      >
        U
      </button> */}
    </div>
  );
};

export default Toolbar;
