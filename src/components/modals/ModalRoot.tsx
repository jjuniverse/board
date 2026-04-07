'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useSearchParams } from 'next/navigation';
import BaseModal from './BaseModal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { RootState } from '@/store';
import { closeAll, closeById } from '@/store/modalSlice';
import { getModalComponent, setInitialFocusEl } from '@/lib/modal/modal';
import { CloseReason, ModalSize } from '@/models/modal';

const Z_BASE = 1300;

export default function ModalRoot() {
  const dispatch = useDispatch();
  const stack = useSelector((s: RootState) => s.modal.stack);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useBodyScrollLock(stack.length > 0);

  const pathname = usePathname();
  const sp = useSearchParams();
  const search = sp ? sp.toString() : null;

  useEffect(() => {
    if (pathname === null && search === null) {
      return;
    }
    if (stack.length > 0) {
      dispatch(closeAll());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-modal-root', 'true');
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  const portal = useMemo(() => {
    if (!portalEl) {
      return null;
    }
    return createPortal(
      <>
        {stack.map((item, idx) => {
          const isActive = idx === stack.length - 1;
          const Comp = getModalComponent(item.key);
          const options = item.props?.options;
          const size = item.props?.size as ModalSize;

          const userOnClose = item.props?.onClose;

          return (
            <BaseModal
              key={item.id}
              id={item.id}
              isActive={isActive}
              zIndex={Z_BASE + idx}
              size={size}
              options={options}
              onClose={(reason: CloseReason = 'programmatic') => {
                if (!isActive) {
                  return;
                }
                if (reason === 'backdrop' && options?.disableBackdropClose) {
                  return;
                }

                try {
                  userOnClose?.(reason);
                } catch (e) {
                  console.error(e);
                }
                dispatch(closeById(item.id));
              }}
            >
              <Comp
                {...item.props}
                id={item.id}
                onClose={(reason: CloseReason = 'programmatic') => {
                  try {
                    userOnClose?.(reason);
                  } catch (e) {
                    console.error(e);
                  }
                  dispatch(closeById(item.id));
                }}
                registerInitialFocus={el => setInitialFocusEl(item.id, el)}
              />
            </BaseModal>
          );
        })}
      </>,
      portalEl
    );
  }, [portalEl, stack, dispatch]);

  return portal;
}
