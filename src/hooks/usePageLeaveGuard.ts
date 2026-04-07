'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { pushModal } from '@/store/modalSlice';
import { useAppDispatch } from '@/store/typedHooks';

type Options = {
  isActive: boolean;
  title?: string;
  message?: React.ReactNode;
};

export function usePageLeaveGuard({
  isActive,
  title = '페이지를 나가시겠어요?',
  message = '이 페이지를 벗어나면 작성 중인 내용이 사라집니다. 이동하시겠습니까?',
}: Options) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isActiveRef = useRef(isActive);
  const pendingUrlRef = useRef<string | null>(null);
  isActiveRef.current = isActive;

  const openConfirmModal = useCallback(
    (onConfirm: () => void) => {
      dispatch(
        pushModal('CONFIRM', {
          title,
          message,
          cancelText: '취소',
          confirmText: '이동하기',
          onConfirm,
          size: 'small',
        })
      );
    },
    [dispatch, title, message]
  );

  // 라우트 외부 (새로고침/닫기 보호)
  useEffect(() => {
    const s = history.state || {};
    const hasTrap = s.__leaveTrap === true;

    if (isActive && !hasTrap) {
      history.pushState({ ...s, __leaveTrap: true }, '');
    }

    if (!isActive) {
      return;
    }
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const cur: any = history.state || {};
      if (cur.__leaveTrap) {
        (window as any).__ignoreNextPopstate__ = true;
        history.back();
        queueMicrotask(() => {
          const c: any = history.state || {};
          if (c.__leaveTrap) {
            history.replaceState({ ...c, __leaveTrap: false }, '');
          }
        });
      }
    };
  }, [isActive]);

  // 라우트 내부 (내부 링크 클릭)
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const onClickCapture = (e: MouseEvent) => {
      if (!isActiveRef.current || e.defaultPrevented) {
        return;
      }

      const el = e.target as Element | null;
      const anchor = el?.closest?.('a[href]') as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      if (
        (anchor.target && anchor.target != '_self') ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('rel')?.includes('external')
      ) {
        return;
      }

      const url = new URL(anchor.href, location.href);

      if (url.origin !== location.origin) {
        return;
      }

      e.preventDefault();
      pendingUrlRef.current = url.pathname + url.search + url.hash;

      openConfirmModal(() => {
        const href = pendingUrlRef.current;
        pendingUrlRef.current = null;
        isActiveRef.current = false;
        router.replace(href!);

        setTimeout(() => {
          isActiveRef.current = true;
        }, 0);
      });
    };

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [isActive, openConfirmModal, router]);

  // 브라우저 앞/뒤로 가기
  useEffect(() => {
    (window as any).__leaveGuardState = {
      active: isActive,
      message,
    };
  }, [isActive, message]);
}
