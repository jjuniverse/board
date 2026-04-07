'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useBoardDelete, useBoardDetail } from '@/hooks/useBoard';
import { pushModal } from '@/store/modalSlice';
import { useAppDispatch } from '@/store/typedHooks';
import ErrorState from '@/components/states/ErrorState';
import { Avatar, Box, Button, Container, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { formatDate } from '@/utils/format';
import { extractErrorMessage } from '@/lib/http';
import { BOARD, BoardKey } from '@/constants/board';
import { DATA_ATTR, SELECTOR } from '@/constants/ui';

type Props = {
  boardKey: BoardKey;
};

export default function BoardDetailScreen({ boardKey }: Props) {
  const { id } = useParams<{ id: string }>();
  const boardNumber = Number(id);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const deleteMutation = useBoardDelete(boardKey, boardNumber);

  const allowClosed = searchParams.get('allowClosed') === '1';
  const { data, isLoading, isError, error, refetch } = useBoardDetail(boardNumber, allowClosed, {
    enabled: !deleteMutation.isSuccess && !deleteMutation.isPending,
  });

  const listPath = BOARD[boardKey].path;

  if (Number.isNaN(boardNumber)) {
    return <ErrorState message="잘못된 경로입니다." />;
  }
  if (isError || (!isLoading && !data)) {
    return <ErrorState message={extractErrorMessage(error, '게시글을 불러오지 못했습니다.')} onRetry={refetch} />;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      router.replace(listPath);
    } catch (e) {
      dispatch(
        pushModal('ALERT', {
          title: '삭제 실패',
          message: '삭제하는데 실패했습니다.',
          size: 'small',
          options: {
            initialFocusSelector: SELECTOR.PRIMARY_FOCUS,
            latestFocusSelector: SELECTOR.restoreFocus('board-detail'),
          },
        })
      );

      console.log(e);
      throw e;
    }
  };

  const handleClickDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).blur();
    dispatch(
      pushModal('CONFIRM', {
        title: '삭제하시겠습니까?',
        message: (
          <>
            <Typography>
              이 작업은 GitHub 이슈를 <strong>삭제하지 않고 “닫기”</strong>로 처리됩니다. 계속 진행할까요?
            </Typography>
          </>
        ),
        cancelText: '취소',
        confirmText: deleteMutation.isPending ? '삭제 중…' : '삭제',
        onConfirm: handleDelete,
        options: {
          latestFocusSelector: SELECTOR.restoreFocus('board-detail'),
        },
        confirmLoading: true,
      })
    );
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Paper elevation={2} sx={{ p: 3, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {isLoading && !data ? (
          <DetailSkeleton />
        ) : data ? (
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            {/* 제목 */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
              <Typography variant="h5" fontWeight={'bold'} flex={1}>
                {data.title}
              </Typography>
            </Stack>

            {/* 작성자, 날짜 */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ flexShrink: 0 }}>
              <Avatar src={data.user?.avatar_url} alt={data.user?.login} sx={{ width: 28, height: 28 }} />
              <Typography variant="body2">{data.user?.login}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '24px !important' }}>
                {formatDate(data.created_at)}
              </Typography>
              {data.updated_at && data.updated_at !== data.created_at && (
                <Typography variant="body2" color="text.secondary">
                  (수정 {formatDate(data.updated_at)})
                </Typography>
              )}
            </Stack>

            <Divider flexItem />

            {/* 본문 */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                pr: 1,
              }}
            >
              {data.body || ''}
            </Box>

            <Divider flexItem />

            {/* 액션 */}
            <Stack direction="row" sx={{ flexShrink: 0 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => router.push(`${listPath}/${boardNumber}/edit`)}
                  disabled={deleteMutation.isPending}
                >
                  수정
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleClickDelete}
                  disabled={deleteMutation.isPending}
                  {...{ [DATA_ATTR.RESTORE_FOCUS]: 'board-detail' }}
                >
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </Button>
              </Stack>
              <Stack direction="row" justifyContent="flex-end" flex={1}>
                <Button variant="outlined" onClick={() => router.push(listPath)} disabled={deleteMutation.isPending}>
                  목록
                </Button>
              </Stack>
            </Stack>
          </Stack>
        ) : null}
      </Paper>
    </Container>
  );
}

function DetailSkeleton() {
  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        <Skeleton variant="text" sx={{ width: { xs: '80%', sm: '60%' }, height: { xs: 28, sm: 36 } }} />
      </Stack>
      <Stack
        direction={{ xs: 'row', sm: 'row' }}
        flexWrap="wrap"
        columnGap={2}
        rowGap={1}
        alignItems="center"
        sx={{ flexShrink: 0 }}
      >
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="text" sx={{ width: { xs: 96, sm: 120 } }} />
        <Skeleton variant="text" sx={{ width: { xs: 140, sm: 90 }, ml: { xs: 0, sm: 3 } }} />
        <Skeleton variant="text" sx={{ width: { xs: 160, sm: 100 } }} />
      </Stack>
      <Divider flexItem />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Skeleton variant="rectangular" sx={{ height: { xs: 160, sm: 220 }, borderRadius: 1 }} animation="wave" />
        <Skeleton variant="text" sx={{ width: { xs: '90%', sm: '85%' }, mt: 2 }} />
        <Skeleton variant="text" sx={{ width: { xs: '75%', sm: '70%' } }} />
        <Skeleton variant="text" sx={{ width: { xs: '65%', sm: '60%' } }} />
      </Box>
      <Divider flexItem />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'stretch', sm: 'space-between' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 1, sm: 0 }}
        sx={{ flexShrink: 0 }}
      >
        <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Skeleton variant="rounded" sx={{ width: { xs: '50%', sm: 72 } }} height={36} />
          <Skeleton variant="rounded" sx={{ width: { xs: '50%', sm: 72 } }} height={36} />
        </Stack>
        <Skeleton variant="rounded" sx={{ width: { xs: '100%', sm: 72 } }} height={36} />
      </Stack>
    </Stack>
  );
}
