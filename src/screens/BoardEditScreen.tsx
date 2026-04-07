'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ErrorState from '@/components/states/ErrorState';
import LoadingState from '@/components/states/LoadingState';
import PostForm from '@/components/PostForm';
import { Container } from '@mui/material';
import { useBoardDetail, useBoardUpdate } from '@/hooks/useBoard';
import { BOARD, BoardKey } from '@/constants/board';
import { extractErrorMessage } from '@/lib/http';
import { FormValue } from '@/models/board';

type Props = {
  boardKey: BoardKey;
};

export default function BoardEditScreen({ boardKey }: Props) {
  const { id } = useParams<{ id: string }>();
  const boardNumber = Number(id);
  const router = useRouter();
  const searchParams = useSearchParams();

  const allowClosed = searchParams.get('allowClosed') === '1';
  const { data, isLoading, isError, error } = useBoardDetail(boardNumber, allowClosed, {
    enabled: !Number.isNaN(boardNumber),
  });
  const updateMutation = useBoardUpdate(boardKey, boardNumber);

  if (Number.isNaN(boardNumber)) {
    return <ErrorState message="잘못된 경로입니다." />;
  }

  const handleSubmit = async (value: FormValue) => {
    const updated = await updateMutation.mutateAsync(value);
    router.replace(`${BOARD[boardKey].path}/${updated.number}`);
  };

  if (isLoading) {
    return <LoadingState label="게시글을 불러오는 중입니다." />;
  }
  if (isError || !data) {
    return <ErrorState message={extractErrorMessage(error, '게시글을 불러오지 못했습니다.')} />;
  }

  return (
    <Container maxWidth="lg">
      <PostForm
        initial={{ title: data.title ?? '', body: data.body ?? '' }}
        submitText="수정하기"
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        serverError={
          updateMutation.isError
            ? ((updateMutation.error as Error)?.message ?? '수정에 실패했습니다. 잠시 후 다시 시도해 주세요.')
            : undefined
        }
      />
    </Container>
  );
}
