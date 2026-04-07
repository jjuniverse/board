'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import theme from '@/styles/theme';
import { Tab } from '@mui/material';

type Props = { label: string; href: string; value: string };

export default function LinkTab({ label, href, value }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');
  return (
    <Tab
      component={Link}
      href={href}
      label={label}
      value={value}
      aria-current={isActive ? 'page' : undefined}
      sx={{
        padding: '20px 24px',
        fontSize: theme.typography.pxToRem(16),
        '&.Mui-selected': {
          color: 'primary.main',
          fontWeight: 700,
        },
      }}
    />
  );
}
