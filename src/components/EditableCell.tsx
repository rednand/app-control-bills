'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrency, parseInput } from '@/lib/utils';

interface EditableCellProps {
  value: number;
  note?: string | null;
  onChange: (value: number) => void;
  onNoteChange?: (note: string) => void;
  dimZero?: boolean;
  className?: string;
}

export default function EditableCell({
  value,
  note,
  onChange,
  onNoteChange,
  dimZero = true,
  className = '',
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setInputVal(value > 0 ? String(value).replace('.', ',') : '');
    setEditing(true);
  };

  const commit = () => {
    onChange(parseInput(inputVal));
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-full min-w-[80px] text-right bg-white text-slate-800 border border-blue-400 rounded px-1 py-0.5 text-sm outline-none"
      />
    );
  }

  return (
    <div
      onClick={startEdit}
      title={onNoteChange ? 'Clique para editar valor' : undefined}
      className={`cursor-pointer select-none hover:bg-blue-50 rounded px-1 py-0.5 text-sm text-right transition-colors ${className}`}
    >
      {note ? (
        <span className="text-amber-500 italic text-xs">{note}</span>
      ) : value > 0 ? (
        <span className="text-slate-800">{formatCurrency(value)}</span>
      ) : dimZero ? (
        <span className="text-slate-300">—</span>
      ) : (
        <span className="text-slate-400">0,00</span>
      )}
    </div>
  );
}
