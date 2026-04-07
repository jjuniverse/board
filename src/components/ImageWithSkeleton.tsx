'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

interface Props {
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain';
}

export default function ImageWithSkeleton({ src, alt = '', objectFit = 'cover' }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStatus('loading');
    const el = imgRef.current;
    if (!el) {
      return;
    }

    const onLoad = () => {
      if ('decode' in el) {
        (el as HTMLImageElement)
          .decode()
          .catch(() => {})
          .finally(() => {
            setTimeout(() => setStatus('loaded'), 100);
          });
      } else {
        setTimeout(() => setStatus('loaded'), 100);
      }
    };
    const onError = () => setStatus('error');

    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);

    if (el.complete && el.naturalWidth > 0) {
      onLoad();
    }

    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
  }, [src, reloadKey]);

  return (
    <Box sx={{ position: 'relative', width: 1, height: 1 }} aria-busy={status !== 'loaded'}>
      {status !== 'loaded' && (
        <Skeleton
          variant="rectangular"
          sx={{ position: 'absolute', inset: 0 }}
          width="100%"
          height="100%"
          aria-hidden
        />
      )}
      {status === 'error' && (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ position: 'absolute', inset: 0, zIndex: 1 }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <BrokenImageIcon aria-hidden />
          <Typography variant="caption" color="text.secondary">
            이미지를 불러올 수 없어요
          </Typography>
          <Button
            size="small"
            onClick={() => {
              setReloadKey(n => n + 1);
              setStatus('loading');
            }}
          >
            다시 시도
          </Button>
        </Stack>
      )}
      <Box
        key={`${src}-${reloadKey}`}
        component="img"
        ref={imgRef}
        src={reloadKey ? `${src}${src.includes('?') ? '&' : '?'}rk=${reloadKey}` : src}
        alt={alt}
        draggable={false}
        sx={{
          width: 1,
          height: 1,
          objectFit,
          display: 'block',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />
    </Box>
  );
}
