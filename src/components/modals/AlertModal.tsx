'use client';

import { useEffect, useRef } from 'react';
import { Box, Button, ButtonBaseActions, Divider, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AlertModalProps } from '@/models/modal';
import { DATA_ATTR } from '@/constants/ui';

export default function AlertModal({
  title = '알림',
  message,
  okText = '확인',
  onOk,
  onClose,
  registerInitialFocus,
}: AlertModalProps) {
  const actionRef = useRef<ButtonBaseActions>(null);

  const handleOk = () => {
    onOk?.();
    onClose?.('programmatic');
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
        <Button
          action={actionRef}
          ref={el => registerInitialFocus?.(el)}
          {...{ [DATA_ATTR.PRIMARY_FOCUS]: '' }}
          variant="contained"
          onClick={handleOk}
          autoFocus
        >
          {okText}
        </Button>
      </Box>
    </>
  );
}
