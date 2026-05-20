'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Institution, PaymentInstallment } from '@/lib/types';

interface Props {
  installment: PaymentInstallment;
  institutions: Institution[];
  onAssign: (institutionId: string, installment: PaymentInstallment | null) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}

export default function InstallmentSelector({ installment, institutions, onAssign, onClose, anchorRect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

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
      {institutions.length === 0 ? (
        <p style={{ padding: '8px 12px', fontSize: '12px', color: '#94a3b8' }}>
          Nenhuma instituição cadastrada
        </p>
      ) : (
        institutions.map((inst) => {
          const checked = inst.payment_installment === installment;
          return (
            <label
              key={inst.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onAssign(inst.id, checked ? null : installment)}
              />
              <span>{inst.name}</span>
              {inst.abbreviation && (
                <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
                  {inst.abbreviation}
                </span>
              )}
            </label>
          );
        })
      )}
    </div>,
    document.body
  );
}
