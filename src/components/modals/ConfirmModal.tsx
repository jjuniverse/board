'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonBaseActions, Divider, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DATA_ATTR } from '@/constants/ui';
import { ConfirmModalProps } from '@/models/modal';

export default function ConfirmModal({
  title = '삭제하시겠습니까?',
  message = '이 작업은 되돌릴 수 없습니다.',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  onClose,
  registerInitialFocus,
  confirmDisabled,
  confirmLoading,
}: ConfirmModalProps) {
  const actionRef = useRef<ButtonBaseActions>(null);
  const [pending, setPending] = useState(false);

  const handleCancel = () => {
    onCancel?.();
    onClose?.('programmatic');
  };
  const handleConfirm = async () => {
    try {
      setPending(true);
      await onConfirm?.();
      if (!confirmLoading && !pending) {
        onClose?.('programmatic');
      }
    } catch (e) {
      return;
    }

    setPending(false);
  };

  useEffect(() => {
    actionRef.current?.focusVisible();
  }, []);

  return (
    <>
      <Box p={2} display="flex" justifyContent="space-between">
        <Typography id="modal-title" variant="h6">
          {title}
        </Typography>
        <IconButton aria-label="닫기" onClick={() => onClose?.('programmatic')}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box id="modal-desc" py={2} px={3}>
        {typeof message === 'string' ? <Typography variant="body2">{message}</Typography> : message}
      </Box>
      <Divider />
      <Box p={1} display="flex" justifyContent="flex-end">
        <Stack direction="row" spacing={1}>
          <Button onClick={handleCancel} variant="outlined">
            {cancelText}
          </Button>
          <Button
            action={actionRef}
            ref={el => registerInitialFocus?.(el)}
            {...{ [DATA_ATTR.PRIMARY_FOCUS]: '' }}
            autoFocus
            onClick={handleConfirm}
            disabled={!!confirmDisabled}
            color="error"
            variant="contained"
          >
            {confirmText}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
