'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ImageWithSkeleton from './ImageWithSkeleton';
import { Box, IconButton, Stack, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CarouselImage } from '@/models/carousel';

interface Props {
  images: CarouselImage[];
  height?: number | string;
  objectFit?: 'cover' | 'contain';
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export default function ImageCarousel({
  images,
  height,
  objectFit = 'cover',
  autoPlay,
  interval = 3000,
  showArrows,
  showDots,
}: Props) {
  const theme = useTheme();
  const total = images.length;
  const extended = useMemo(() => {
    if (total <= 1) {
      return images;
    }
    return [images[total - 1], ...images, images[0]];
  }, [images, total]);

  const [position, setPosition] = useState(total > 1 ? 1 : 0); // extended.length-1
  const [withTransition, setWithTransition] = useState(true);

  const current = total > 1 ? (position - 1 + total) % total : 0;

  const lockRef = useRef(false);
  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => (lockRef.current = false), 400);
  }, []);

  const next = useCallback(() => {
    if (lockRef.current || total <= 1) {
      return;
    }
    setWithTransition(true);
    setPosition(prev => prev + 1);
    lock();
  }, [lock, total]);

  const prev = useCallback(() => {
    if (lockRef.current || total <= 1) {
      return;
    }
    setWithTransition(true);
    setPosition(prev => prev - 1);
    lock();
  }, [lock, total]);

  const goToSlide = useCallback(
    (index: number) => {
      if (lockRef.current || total <= 1) {
        return;
      }

      setWithTransition(true);
      setPosition(index + 1);
      lock();
    },
    [lock, total]
  );

  const onTransitionEnd = () => {
    if (total <= 1) {
      return;
    }
    if (position === 0) {
      setWithTransition(false);
      setPosition(total);
      setTimeout(() => setWithTransition(true), 100);
    } else if (position === total + 1) {
      setWithTransition(false);
      setPosition(1);
      setTimeout(() => setWithTransition(true), 100);
    }
  };

  useEffect(() => {
    if (!autoPlay || total <= 1) {
      return;
    }

    let id: number | null = null;

    const start = () => {
      if (id) {
        return;
      }

      const loop = () => {
        id = window.setTimeout(() => {
          if (!document.hidden && !lockRef.current) {
            next();
          }
          loop();
        }, interval);
      };
      loop();
    };
    const stop = () => {
      if (id) {
        clearTimeout(id);
        id = null;
      }
    };

    start();

    const onBlur = () => stop();
    const onFocus = () => start();
    const onHide = () => stop();
    const onShow = () => start();

    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onHide);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onShow);

    return () => {
      stop();
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onShow);
    };
  }, [autoPlay, total, interval, next]);

  return (
    <>
      <Box role="region" aria-label="이미지 캐러셀" sx={{ position: 'relative', overflow: 'hidden', height }}>
        <Box
          onTransitionEnd={onTransitionEnd}
          sx={{
            display: 'flex',
            height: '100%',
            width: `${extended.length * 100}%`,
            transform: `translateX(-${position * (100 / extended.length)}%)`,
            transition: withTransition ? 'transform 400ms ease' : 'none',
          }}
        >
          {extended.map((img, i) => (
            <Box
              key={`${img.src}-${i}`}
              sx={{
                flex: `0 0 ${100 / extended.length}%`,
                height: '100%',
                position: 'relative',
                bgcolor: 'background.default',
              }}
            >
              <ImageWithSkeleton src={img.src} alt={img.alt} objectFit={objectFit} />
            </Box>
          ))}
        </Box>

        {showArrows && total > 1 && (
          <>
            <IconButton
              aria-label="이전 슬라이드"
              onClick={prev}
              sx={{
                position: 'absolute',
                top: '50%',
                left: 8,
                transform: 'translateY(-50%)',
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton
              aria-label="다음 슬라이드"
              onClick={next}
              sx={{
                position: 'absolute',
                top: '50%',
                right: 8,
                transform: 'translateY(-50%)',
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>

      {showDots && total > 1 && (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{
            mt: 1.25,
            alignItems: 'center',
          }}
        >
          {images.map((image, i) => {
            const isActive = i === current;
            return (
              <Box
                key={`img-navi-dots-${i}`}
                component="button"
                onClick={() => goToSlide(i)}
                aria-label={`${i + 1} / ${total} 슬라이드로 이동`}
                aria-current={isActive ? 'true' : undefined}
                sx={{
                  all: 'unset',
                  cursor: 'pointer',
                  width: isActive ? 10 : 8,
                  height: isActive ? 10 : 8,
                  borderRadius: '50%',
                  bgcolor: isActive ? theme.palette.primary.main : theme.palette.secondary.light,
                  outlineOffset: 2,
                  transition: 'all 150ms',
                  '&:hover': { opacity: 0.9 },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              />
            );
          })}
        </Stack>
      )}
    </>
  );
}
