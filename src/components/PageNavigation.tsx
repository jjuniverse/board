'use client';

import { useMemo } from 'react';
import { Button, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { PageNavigationProps } from '@/models/pageNavigation';

export default function PageNavigation({
  page,
  totalCount,
  pageSize = 10,
  blockSize = 10,
  onChange,
  disabled = false,
  sx,
}: PageNavigationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const { startIdx, endIdx } = useMemo(() => {
    const start = Math.floor((page - 1) / blockSize) * blockSize + 1;
    const end = Math.min(start + blockSize - 1, totalPages);
    return { startIdx: start, endIdx: end };
  }, [page, blockSize, totalPages]);

  const goToPage = (page: number) => {
    onChange(page);
  };

  const isPrevPage = page > 1;
  const isNextPage = page < totalPages;
  const isPrevBlock = startIdx > 1;
  const isNextBlock = endIdx < totalPages;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      justifyContent="center"
      sx={sx}
      role="navigation"
      aria-label="페이지 네비게이션"
    >
      <Tooltip title="이전 10페이지">
        <span>
          <Button
            onClick={() => goToPage(startIdx - blockSize)}
            disabled={disabled || !isPrevBlock}
            variant="outlined"
            size="small"
            aria-label="이전 10페이지로 이동"
          >
            <KeyboardDoubleArrowLeftIcon aria-hidden />
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="이전 페이지">
        <span>
          <Button
            onClick={() => goToPage(page - 1)}
            disabled={disabled || !isPrevPage}
            variant="outlined"
            size="small"
            aria-label="이전 페이지로 이동"
          >
            <KeyboardArrowLeftIcon aria-hidden />
          </Button>
        </span>
      </Tooltip>

      {isMobile ? (
        <Typography
          variant="body2"
          sx={{ px: 1.5, minWidth: 72, textAlign: 'center' }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {page} / {totalPages}
        </Typography>
      ) : (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {Array.from({ length: endIdx - startIdx + 1 }, (_, i) => startIdx + i).map(idx => {
            const selected = idx === page;
            return (
              <Button
                key={`page-${idx}`}
                variant={selected ? 'contained' : 'text'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => goToPage(idx)}
                disabled={disabled}
                size="small"
                aria-current={selected ? 'page' : undefined}
                aria-label={`${idx}페이지로 이동`}
                sx={{
                  p: 1.5,
                  minWidth: 0,
                  height: '28px',
                  minHeight: 0,
                  border: '1px solid',
                  borderColor: 'transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {idx}
              </Button>
            );
          })}
        </Stack>
      )}

      <Tooltip title="다음 페이지">
        <span>
          <Button
            onClick={() => goToPage(page + 1)}
            disabled={disabled || !isNextPage}
            variant="outlined"
            size="small"
            aria-label="다음 페이지로 이동"
          >
            <KeyboardArrowRightIcon aria-hidden />
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="다음 10페이지">
        <span>
          <Button
            onClick={() => goToPage(startIdx + blockSize)}
            disabled={disabled || !isNextBlock}
            variant="outlined"
            size="small"
            aria-label="다음 10페이지로 이동"
          >
            <KeyboardDoubleArrowRightIcon aria-hidden />
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
