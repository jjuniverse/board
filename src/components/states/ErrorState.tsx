'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Stack, Typography } from '@mui/material';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

interface Props {
  message?: string;
  onRetry?: () => void;
}
export default function ErrorState({ message = '문제가 발생했습니다.', onRetry }: Props) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      return onRetry();
    }
    try {
      router.refresh();
    } catch {
      window.location.reload();
    }
  };

  const label = onRetry ? '다시 시도' : '새로고침';
  return (
    <Box sx={{ display: 'grid', placeItems: 'center' }}>
      <Box textAlign="center">
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <ReportGmailerrorredIcon sx={{ color: 'text.secondary' }} aria-hidden />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Stack>
        {true && (
          <Button variant="contained" onClick={handleRetry} sx={{ mt: 1.5 }}>
            {label}
          </Button>
        )}
      </Box>
    </Box>
  );
}
