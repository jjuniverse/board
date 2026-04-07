'use client';

import Link from 'next/link';
import { useBoard } from '@/hooks/useBoard';
import { Box, Button, List, ListItem, ListItemButton, Paper, Skeleton, Stack, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import { BOARD, BoardKey } from '@/constants/board';
import { formatDateShort } from '@/utils/format';

interface Props {
  board: BoardKey;
  title: string;
}

const BoardIcon: Record<BoardKey, React.ReactNode> = {
  QNA: (
    <HelpCenterIcon
      sx={{
        verticalAlign: 'middle',
        mb: '2px',
        mr: '1px',
      }}
      aria-hidden
    />
  ),
  COMMUNITY: (
    <ArticleIcon
      sx={{
        verticalAlign: 'middle',
        mb: '2px',
        mr: '1px',
      }}
      aria-hidden
    />
  ),
};

export default function BoardPreviewCard({ board, title }: Props) {
  const boardPath = BOARD[board].path;
  const { data, isLoading, isError, refetch } = useBoard(board, 1, 5);

  const items = data?.items ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  const headingId = `${board.toLowerCase()}-preview-title`;

  

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography id={headingId} variant="h6" fontWeight={700}>
          {BoardIcon[board]}
          {title}
        </Typography>
        <Typography
          component={Link}
          href={boardPath}
          aria-label={`${title} 더보기`}
          variant="body2"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            transition: 'color .15s ease',
            '&:hover': {
              color: 'primary.dark',
              textDecoration: 'underline',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          더보기
        </Typography>
      </Stack>
      <Box sx={{ minHeight: 200 }}>
        {isError && (
          <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <Box textAlign="center">
              <Typography variant="body2" color="error">
                목록을 불러오지 못했습니다.
              </Typography>
              <Button variant="outlined" color="error" sx={{ mt: 1, padding: '5px 15px' }} onClick={() => refetch()}>
                다시 시도
              </Button>
            </Box>
          </Box>
        )}

        {isEmpty && (
          <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <Typography variant="body2">등록된 게시글이 없습니다.</Typography>
          </Box>
        )}

        <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
          {isLoading
            ? Array.from(new Array(5)).map((_, i) => (
                <ListItem key={i} disableGutters divider>
                  <Skeleton variant="text" width="70%" />
                </ListItem>
              ))
            : items.map(item => (
                <ListItem key={`${board}-preview-${item.id}`} disableGutters divider sx={{ p: 0.5 }}>
                  <ListItemButton component={Link} href={`${boardPath}/${item.number}`} sx={{ px: 0 }}>
                    <Typography
                      noWrap
                      variant="body2"
                      title={item.title}
                      sx={{ flex: 1, width: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexShrink: 0, minWidth: '11ch', textAlign: 'right' }}
                    >
                      {formatDateShort(item.created_at)}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
        </List>
      </Box>
    </Paper>
  );
}
