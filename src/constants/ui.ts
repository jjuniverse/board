// constants/ui.ts
export const DATA_ATTR = {
  PRIMARY_FOCUS: 'data-primary-focus',
  RESTORE_FOCUS: 'data-restore-focus',
} as const;

export const SELECTOR = {
  PRIMARY_FOCUS: `[${DATA_ATTR.PRIMARY_FOCUS}]`,
  restoreFocus: (value?: string) =>
    value ? `[${DATA_ATTR.RESTORE_FOCUS}="${value}"]` : `[${DATA_ATTR.RESTORE_FOCUS}]`,
} as const;
