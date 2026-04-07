import ConfirmModal from '@/components/modals/ConfirmModal';
import AlertModal from '@/components/modals/AlertModal';
import { ModalKey, MutableRef } from '@/models/modal';

const focusMap = new Map<string, HTMLElement | null>();

export function setInitialFocusEl(id: string, el: HTMLElement | null) {
  focusMap.set(id, el);
}

export function takeInitialFocusEl(id: string) {
  const el = focusMap.get(id) ?? null;
  focusMap.delete(id);
  return el;
}

export function getModalComponent<K extends ModalKey>(key: K) {
  const modalComponents = {
    ALERT: AlertModal,
    CONFIRM: ConfirmModal,
  };
  return modalComponents[key];
}

export function queryFirstFocusable(container: HTMLElement) {
  const selectors = [
    '[data-autofocus]', // 내가 정한 규칙
    '[autofocus]', // 표준 속성
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return container.querySelector<HTMLElement>(selectors);
}

export function getFocusable(element: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(element.querySelectorAll<HTMLElement>(selectors)).filter(
    el => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1' && !el.getAttribute('aria-hidden')
  );
}

export function isFocusable(el: HTMLElement | null | undefined, doc: Document) {
  if (!el) {
    return false;
  }
  const s = doc.defaultView?.getComputedStyle(el);
  if (!s || s.display === 'none' || s.visibility === 'hidden') {
    return false;
  }
  if ((el as any).disabled) {
    return false;
  }
  return el.tabIndex !== -1;
}

export function capturePrevFocus(container: HTMLElement, lastRef: MutableRef<HTMLElement | null>) {
  const doc = container.ownerDocument;
  const now = doc.activeElement as HTMLElement | null;
  if (now && !container.contains(now)) {
    lastRef.current = now;
  }
  if (!lastRef.current || lastRef.current === doc.body) {
    if (now && !container.contains(now)) {
      lastRef.current = now;
    }
  }
}

export function computeInitialFocusTarget(id: string, container: HTMLElement, initialSelector?: string): HTMLElement {
  // 모달 호출시 등록한 element
  const registered = takeInitialFocusEl(id);

  // hook 호출시 넣은 값으로 찾기 ex:'[data-primary-focus]'  (id || data-attribute)
  const bySelector = initialSelector ? (container.querySelector(initialSelector) as HTMLElement | null) : null;

  // 만든 규칙으로 찾기 ex: ['data-autofocus']
  const first = queryFirstFocusable(container) ?? null;
  return (registered || bySelector || first || container)!;
}

export function scheduleRestoreFocus(lastRef: MutableRef<HTMLElement | null>, latestSelector?: string): number {
  const doc = lastRef.current?.ownerDocument ?? document;
  const bySelector = latestSelector ? (doc.querySelector(latestSelector) as HTMLElement | null) : null;
  const appRoot = (doc.getElementById('__next') as HTMLElement | null) ?? doc.body;
  const target = bySelector || (isFocusable(lastRef.current, doc) ? lastRef.current! : appRoot);

  return requestAnimationFrame(() => {
    target?.focus?.();
  });
}

export function cancelScheduledRestoreFocus(rafRef: MutableRef<number | null>) {
  if (rafRef.current != null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
}
