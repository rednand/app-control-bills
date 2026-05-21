'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Institution } from '@/lib/types';

interface Props {
  institutions: Institution[];
  currentId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

export default function InstitutionPicker({ institutions, currentId, onSelect, onClose, anchorRect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
  };

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        minWidth: '220px',
        padding: '4px 0',
      }}
    >
      <div
        style={{ ...itemStyle, color: '#94a3b8' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={() => { onSelect(null); onClose(); }}
      >
        <input type="radio" readOnly checked={currentId === null} />
        <span>Nenhuma</span>
      </div>
      {institutions.map((inst) => (
        <div
          key={inst.id}
          style={itemStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={() => { onSelect(inst.id); onClose(); }}
        >
          <input type="radio" readOnly checked={currentId === inst.id} />
          <span>{inst.name}</span>
          {inst.abbreviation && (
            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
              {inst.abbreviation}
            </span>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}
