'use client';

import { FormEvent, ChangeEvent, useState, useEffect, useMemo, useRef } from 'react';
import { usePageLeaveGuard } from '@/hooks/usePageLeaveGuard';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormValue } from '@/models/board';

interface Props {
  initial?: FormValue;
  onSubmit: (payload: FormValue) => Promise<void> | void;
  submitText?: string;
  isSubmitting?: boolean;
  serverError?: string;
}

export default function PostForm({
  initial = { title: '', body: '' },
  onSubmit,
  submitText = '등록하기',
  isSubmitting = false,
  serverError,
}: Props) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const newError: { title?: string; body?: string } = {};
    if (title.trim().length === 0) {
      newError.title = '제목을 입력해주세요.';
    }
    if (body.trim().length === 0) {
      newError.body = '내용을 입력해주세요.';
    }
    return newError;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isSubmitting) {
      return;
    }
    await onSubmit({ title: title.trim(), body });
  };

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleChangeBody = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBody(e.target.value);
  };

  const dirty = useMemo(
    () => title !== initial.title || body !== initial.body,
    [title, body, initial.title, initial.body]
  );

  usePageLeaveGuard({
    isActive: dirty,
    title: `${initial.title ? '수정' : '작성'} 중인 내용이 있습니다.`,
    message: (
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          {`이 페이지를 벗어나면 ${initial.title ? '수정' : '작성'} 중인 내용이 사라집니다.`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이동하시겠습니까?
        </Typography>
      </Box>
    ),
  });

  useEffect(() => {
    if (submittedOnce) {
      setErrors(validate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, submittedOnce]);

  useEffect(() => {
    setTitle(initial.title);
    setBody(initial.body);
    setErrors({});
    setSubmittedOnce(false);
  }, [initial.title, initial.body]);

  useEffect(() => {
    if (serverError) {
      alertRef.current?.focus();
    }
  }, [serverError]);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2, height: 'calc(100% - 16px)', minHeight: 0 }}>
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ height: '100%' }}
        aria-label="게시글 작성 폼"
        aria-busy={isSubmitting || undefined}
      >
        <Stack spacing={2} py={2} sx={{ height: '100%', minHeight: 0 }}>
          {serverError && (
            <Alert severity="error" sx={{ flexShrink: 0 }} ref={alertRef} tabIndex={-1} role="alert">
              {serverError}
            </Alert>
          )}
          <TextField
            label="제목"
            name="title"
            value={title}
            onChange={handleChangeTitle}
            fullWidth
            autoFocus
            required
            error={submittedOnce && !!errors.title}
            helperText={submittedOnce ? errors.title : ' '}
            disabled={isSubmitting}
            sx={{ flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minHeight: '150px', display: 'flex' }}>
            <TextField
              label="내용"
              name="body"
              value={body}
              onChange={handleChangeBody}
              multiline
              minRows={6}
              fullWidth
              required
              error={submittedOnce && !!errors.body}
              helperText={submittedOnce ? errors.body : ' '}
              disabled={isSubmitting}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': { height: '100%', alignItems: 'stretch' },
                '& .MuiInputBase-inputMultiline': {
                  height: '100% !important',
                  overflow: 'auto',
                },
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !dirty}
            sx={{ alignSelf: 'flex-end', flexShrink: 0 }}
          >
            {isSubmitting ? '처리 중…' : submitText}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
