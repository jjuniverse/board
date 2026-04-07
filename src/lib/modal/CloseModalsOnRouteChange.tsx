'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { closeAll } from '@/store/modalSlice';
import { useAppDispatch } from '@/store/typedHooks';

export default function CloseModalsOnRouteChange() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if ((window as any).__suppressCloseModalsOnce__) {
      (window as any).__suppressCloseModalsOnce__ = false;
      return;
    }
    dispatch(closeAll());
  }, [pathname, dispatch]);

  return null;
}
