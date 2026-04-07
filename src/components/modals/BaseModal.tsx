import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  getFocusable,
  cancelScheduledRestoreFocus,
  capturePrevFocus,
  computeInitialFocusTarget,
  scheduleRestoreFocus,
} from '@/lib/modal/modal';
import { CloseReason, ModalOptions, ModalSize } from '@/models/modal';

const MODAL_MS = 160;

type Props = {
  id: string;
  isActive: boolean;
  onClose: (reason: CloseReason) => void;
  options?: ModalOptions;
  children: React.ReactNode;
  zIndex: number;
  size: ModalSize;
};

export default function BaseModal({ id, isActive, onClose, options = {}, children, zIndex, size = 'medium' }: Props) {
  const { disableBackdropClose, initialFocusSelector, latestFocusSelector } = options;

  const contentRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(
    typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
  );
  const restoreRafRef = useRef<number | null>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    const currentModalEl = contentRef.current!;

    cancelScheduledRestoreFocus(restoreRafRef);

    capturePrevFocus(currentModalEl, lastFocusedRef);

    const focusTarget = computeInitialFocusTarget(id, currentModalEl, initialFocusSelector);
    focusTarget?.focus({ preventScroll: true });

    // 포커스 복귀
    return () => {
      restoreRafRef.current = scheduleRestoreFocus(lastFocusedRef, latestFocusSelector);
    };
  }, [id, initialFocusSelector, latestFocusSelector]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose('escape');
      }
      if (e.key === 'Tab') {
        const currentModalElement = contentRef.current!;
        const focusables = getFocusable(currentModalElement);
        if (focusables.length === 0) {
          e.preventDefault();
          currentModalElement.focus();
          return;
        }
        const firstFocusTarget = focusables[0];
        const lastFocusTarget = focusables[focusables.length - 1];
        const activeEl = document.activeElement as HTMLElement;
        if (!e.shiftKey && activeEl === lastFocusTarget) {
          e.preventDefault();
          firstFocusTarget.focus();
        } else if (e.shiftKey && activeEl === firstFocusTarget) {
          e.preventDefault();
          lastFocusTarget.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isActive, onClose]);

  const onBackdropMouseDown = (e: React.MouseEvent) => (mouseDownTarget.current = e.target);
  const onBackdropMouseUp = (e: React.MouseEvent) => {
    if (!isActive || disableBackdropClose) {
      return;
    }
    if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) {
      onClose('backdrop');
    }
  };

  const SIZE_WIDTH: Record<ModalSize, string> = {
    small: 'min(92vw, 360px)',
    medium: 'min(92vw, 560px)',
    large: 'min(92vw, 800px)',
  };

  return (
    <div
      aria-hidden={!isActive}
      onMouseDown={onBackdropMouseDown}
      onMouseUp={onBackdropMouseUp}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(0,0,0,0.45)',
        opacity: enter ? 1 : 0,
        transition: `opacity ${MODAL_MS}ms ease`,
        zIndex,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        ref={contentRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          width: SIZE_WIDTH[size],
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          outline: 'none',
          transform: enter ? 'translateY(0)' : 'translateY(8px)',
          opacity: enter ? 1 : 0,
          transition: `opacity ${MODAL_MS}ms ease, transform ${MODAL_MS}ms ease`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
