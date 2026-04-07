'use client';

import { AppBar, Box, Tabs } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import LinkTab from './LinkTab';
import { BOARD } from '@/constants/board';

export default function HeaderTabs() {
  const pathname = usePathname();

  const value = useMemo(() => {
    if (pathname?.startsWith('/qna')) {
      return '/qna';
    }
    if (pathname?.startsWith('/community')) {
      return '/community';
    }
    return '/';
  }, [pathname]);

  return (
    <Box component="header">
      <Box component="nav" aria-label="주요 탭">
        <AppBar position="sticky" elevation={1} color="default">
          <Tabs value={value} centered sx={{ minHeight: 56, px: { xs: 1, sm: 2 } }}>
            <LinkTab label="홈" href="/" value="/" />
            <LinkTab label={BOARD.QNA.name} href={BOARD.QNA.path} value={BOARD.QNA.path} />
            <LinkTab label={BOARD.COMMUNITY.name} href={BOARD.COMMUNITY.path} value={BOARD.COMMUNITY.path} />
          </Tabs>
        </AppBar>
      </Box>
    </Box>
  );
}
