'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import ErrorState from '@/components/states/ErrorState';
import LoadingState from '@/components/states/LoadingState';
import PageNavigation from '@/components/PageNavigation';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { BOARD, BoardKey } from '@/constants/board';
import { Column, columns } from '@/constants/columns';
import { useBoard } from '@/hooks/useBoard';
import { extractErrorMessage } from '@/lib/http';
import { Board } from '@/models/board';

const FillRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TableRow>
    <TableCell colSpan={columns.length} align="center" sx={{ py: 8, borderBottom: 'none', color: 'text.secondary' }}>
      {children}
    </TableCell>
  </TableRow>
);

interface Props {
  board: BoardKey;
}
export default function BoardList({ board }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const page = Number(searchParams.get('page') ?? '1');
  const query = searchParams.get('q') ?? '';
  const target = (searchParams.get('in') ?? 'title') as 'title' | 'body';
  const perPage = 10;

  const { data, isLoading, isFetching, isError, error } = useBoard(board, page, perPage, query, target);

  const { path } = BOARD[board];

  const onPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  const list = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleClickRow = (boardNumber: number) => {
    router.push(`${path}/${boardNumber}`);
  };

  const renderCell = (column: Column, value: any) => {
    if (column.id === 'user' && value && typeof value === 'object') {
      const user = value as { login: string; avatar_url: string };
      return (
        <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
          <Avatar src={user.avatar_url} alt={user.login} sx={{ width: 24, height: 24 }} />
          <Typography variant="body2" noWrap>
            {user.login}
          </Typography>
        </Stack>
      );
    }
    if (column.format) {
      return column.format(String(value));
    }
    return String(value ?? '');
  };

  const mobileElement = (
    <Box sx={{ p: 1, minHeight: 0, width: '100%', overflow: 'auto' }}>
      {isLoading && !data ? (
        // 스켈레톤 카드
        Array.from({ length: 5 }).map((_, i) => (
          <Card key={`skeleton-${i}`} variant="outlined" sx={{ mb: 1 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Divider sx={{ my: 1 }} />
              <Skeleton variant="rectangular" height={14} sx={{ borderRadius: 0.5 }} />
            </CardContent>
          </Card>
        ))
      ) : isError ? (
        <Box sx={{ p: 2 }}>
          <ErrorState message="목록을 불러오지 못했습니다." />
        </Box>
      ) : isLoading || isFetching ? (
        <Box sx={{ p: 2 }}>
          <LoadingState label="목록을 불러오는 중입니다." />
        </Box>
      ) : list.length === 0 ? (
        <Box sx={{ p: 2, color: 'text.secondary' }}>
          {query ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
        </Box>
      ) : (
        // 정상 데이터 → 카드 렌더
        list.map((row: Board) => (
          <Card key={row.id} variant="outlined" sx={{ mb: 1 }} onClick={() => handleClickRow(row.number)}>
            <CardContent sx={{ py: 1.25 }}>
              <Stack spacing={0.75}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                  {(() => {
                    const titleCol = columns.find((c: Column) => c.id === 'title') ?? columns[0];
                    return renderCell(titleCol, row[titleCol.id]);
                  })()}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    color: 'text.secondary',
                    justifyContent: 'space-between',
                  }}
                >
                  {columns
                    .filter((c: Column) => c.id !== 'title')
                    .slice(0, 2)
                    .map((col: Column) => (
                      <Typography key={col.id} variant="caption" sx={{ maxWidth: '50%' }} noWrap>
                        {renderCell(col, row[col.id])}
                      </Typography>
                    ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  const desktopElement = (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: '600px' }}>
        <TableHead
          sx={{
            '& th': {
              bgcolor: '#E1E6EC',
              fontWeight: 'bold',
            },
          }}
        >
          <TableRow>
            {columns.map(column => (
              <TableCell
                key={column.id}
                align={column.headerAlign}
                sx={{
                  width: column.width ?? 'auto',
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* 초기 로딩: 스켈레톤 행 */}
          {isLoading && !data ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((col, j) => (
                  <TableCell key={`${i}-${j}`}>
                    <Skeleton variant="text" width={j === 0 ? '30%' : '70%'} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            // 에러
            <FillRow>
              <ErrorState message={extractErrorMessage(error, '목록을 불러오지 못했습니다.')} />
            </FillRow>
          ) : isLoading || isFetching ? (
            // 재요청/로딩 ex)검색
            <FillRow>
              <LoadingState label="목록을 불러오는 중입니다." />
            </FillRow>
          ) : list.length === 0 ? (
            // 빈 상태
            <FillRow>{query ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}</FillRow>
          ) : (
            // 정상 데이터
            list.map(row => (
              <TableRow hover tabIndex={-1} key={row.id}>
                {columns.map(column => {
                  const value = row[column.id];

                  let cellContent: React.ReactNode = null;

                  // 작성자 column
                  if (column.id === 'user' && value && typeof value === 'object') {
                    const user = value as { login: string; avatar_url: string };
                    cellContent = (
                      <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
                        <Avatar src={user.avatar_url} alt={user.login} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2" noWrap>
                          {value.login}
                        </Typography>
                      </Stack>
                    );
                    // 날짜 column
                  } else if (column.format) {
                    cellContent = column.format(value.toString());
                  } else {
                    cellContent = value as string;
                  }
                  return (
                    <TableCell
                      key={column.id}
                      align={column.bodyAlign || column.headerAlign || 'center'}
                      sx={{
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleClickRow(row.number)}
                    >
                      {cellContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Paper
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: '1fr auto',
      }}
    >
      {isMobile ? mobileElement : desktopElement}
      {list.length > 0 ? (
        <Stack alignItems="center" sx={{ my: 2 }}>
          <PageNavigation page={page} totalCount={totalCount} pageSize={perPage} blockSize={10} onChange={onPage} />
        </Stack>
      ) : null}
    </Paper>
  );
}
