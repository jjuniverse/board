'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { BOARD } from '@/constants/board';

export default function CurrentPath() {
  const pathname = usePathname();

  const current = Object.values(BOARD).find(i => pathname.includes(i.path));
  if (!current) {
    return null;
  }

  const isSectionRoot = pathname === current.path;

  return (
    <Box>
      <Typography
        component={Link}
        href={current.path}
        variant="h5"
        fontWeight={700}
        aria-current={isSectionRoot ? 'page' : undefined}
        sx={{
          display: 'inline-block',
          cursor: 'pointer',
          color: 'text.primary',
          textDecoration: 'none',
          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
        }}
      >
        {current.name}
      </Typography>
    </Box>
  );
}
