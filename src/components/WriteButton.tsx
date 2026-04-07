'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

interface Props {
  href: string;
  label?: string;
}

export default function WriteButton({ href, label = '글쓰기' }: Props) {
  return (
    <Button
      startIcon={<AddOutlinedIcon />}
      variant="contained"
      component={Link}
      href={href}
      aria-label="글쓰기"
      sx={{
        width: { xs: '100%', sm: 'auto' },
        flexShrink: 0,
      }}
    >
      {label}
    </Button>
  );
}
