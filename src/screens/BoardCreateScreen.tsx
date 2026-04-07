'use client';

import { useRouter } from 'next/navigation';
import { useBoardCreate } from '@/hooks/useBoard';
import PostForm from '@/components/PostForm';
import { BOARD, BoardKey } from '@/constants/board';
import { Container } from '@mui/material';
import { FormValue } from '@/models/board';

type Props = {
  boardKey: BoardKey;
};

export default function BoardCreateScreen({ boardKey }: Props) {
  const router = useRouter();

  const createMutation = useBoardCreate(boardKey);

  const handleSubmit = async (value: FormValue) => {
    const created = await createMutation.mutateAsync(value);
    router.replace(`${BOARD[boardKey].path}/${created.number}`);
  };

  return (
    <Container maxWidth="lg">
      <PostForm
        submitText="등록하기"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        serverError={
          createMutation.isError
            ? ((createMutation.error as Error)?.message ?? '작성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
            : undefined
        }
      />
    </Container>
  );
}
