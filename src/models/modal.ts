export type CloseReason = 'programmatic' | 'escape' | 'backdrop' | 'route';

export type ModalKey = 'ALERT' | 'CONFIRM';

export type ModalSize = 'small' | 'medium' | 'large';

export type ModalOptions = {
  disableBackdropClose?: boolean;
  initialFocusSelector?: string;
  latestFocusSelector?: string;
};

interface ModalBaseProps {
  id: string;
  title?: string;
  message?: React.ReactNode;
  size?: ModalSize;
  options?: ModalOptions;
  onClose?: (reason?: CloseReason) => void;
  registerInitialFocus?: (el: HTMLElement | null) => void;
}

export interface AlertModalProps extends ModalBaseProps {
  okText?: string;
  onOk?: () => void;
}
export interface ConfirmModalProps extends ModalBaseProps {
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
}

export interface ModalPropsMap {
  ALERT: Omit<AlertModalProps, 'id'>;
  CONFIRM: Omit<ConfirmModalProps, 'id'>;
}

export type ModalPayload<K extends ModalKey = ModalKey> = {
  id: string;
  key: K;
  props?: ModalPropsMap[K];
};

export type ModalState = {
  stack: ModalPayload[];
};

// deprecated 경고로 간단히 만듦.
export type MutableRef<T> = { current: T };
