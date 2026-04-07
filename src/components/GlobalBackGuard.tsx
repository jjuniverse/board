'use client';

import { useEffect, useRef } from 'react';
import { pushModal } from '@/store/modalSlice';
import { useAppDispatch } from '@/store/typedHooks';

type LeaveGuardState = {
  active: boolean;
  title?: string;
  message?: React.ReactNode;
};

export default function GlobalBackGuard() {
  const dispatch = useAppDispatch();
  const processingRef = useRef(false);
  const ignoreNextRef = useRef(false);

  useEffect(() => {
    const confirmWithModal = (title?: string, message?: React.ReactNode) => {
      return new Promise<boolean>(resolve => {
        (window as any).__suppressCloseModalsOnce__ = true;
        setTimeout(() => {
          dispatch(
            pushModal('CONFIRM', {
              title,
              message,
              cancelText: '취소',
              confirmText: '이동하기',
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false),
              onClose: () => resolve(false),
              size: 'small',
            })
          );
        }, 0);
      });
    };

    const onPop = async () => {
      if ((window as any).__ignoreNextPopstate__) {
        (window as any).__ignoreNextPopstate__ = false;
        return;
      }

      const g = (window as any).__leaveGuardState as LeaveGuardState | undefined;
      if (!g?.active) {
        return;
      }

      if (ignoreNextRef.current || processingRef.current) {
        return;
      }

      processingRef.current = true;
      try {
        const ok = await confirmWithModal(g.title, g.message);
        if (ok) {
          ignoreNextRef.current = true;
          history.back();
          setTimeout(() => {
            ignoreNextRef.current = false;
          }, 0);
        } else {
          ignoreNextRef.current = true;
          history.forward();
          setTimeout(() => {
            ignoreNextRef.current = false;
          }, 0);
        }
      } finally {
        processingRef.current = false;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [dispatch]);
  return null;
}
