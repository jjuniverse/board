'use client';

import { Suspense } from 'react';
import SearchBar from '@/components/search/SearchBar';
import WriteButton from '@/components/WriteButton';
import { Box, Container, Stack } from '@mui/material';
import { BOARD, BoardKey } from '@/constants/board';
import BoardList from '@/sections/BoardList';

type Props = {
  boardKey: BoardKey;
};

export default function BoardListScreen({ boardKey }: Props) {
  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto  1fr',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        gap={{ xs: 1.5, sm: 0 }}
      >
        <Suspense fallback={null}>
          <SearchBar boardKey={boardKey} />
        </Suspense>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <WriteButton href={`${BOARD[boardKey].path}/new`} />
        </Box>
      </Stack>
      <Box sx={{ minHeight: 0, overflow: 'auto' }}>
        <BoardList board={boardKey} />
      </Box>
    </Container>
  );
}
