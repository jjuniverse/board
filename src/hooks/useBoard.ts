import { keepPreviousData, QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJson, HttpError } from '@/lib/http';
import { BOARD, type BoardKey } from '@/constants/board';
import type { Board } from '@/models/board';
import { matchesSearch, updateBoardListCaches } from './_boardCache';

type SearchResult<T> = { items: T[]; totalCount: number };

/* 목록 */
export function useBoard(board: BoardKey, page = 1, perPage = 10, q = '', target: 'title' | 'body' = 'title') {
  const { label } = BOARD[board];
  const qs = new URLSearchParams({
    label,
    page: String(page),
    per_page: String(perPage),
    q,
    target,
  });

  return useQuery<SearchResult<Board>, HttpError>({
    queryKey: ['board', { board, page, perPage, q, target }],
    queryFn: () => fetchJson<SearchResult<Board>>(`/api/board?${qs.toString()}`),
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

/* 상세 */
export function useBoardDetail(boardNumber: number, allowClosed = false, options?: { enabled?: boolean }) {
  const suffix = allowClosed ? '?allowClosed=1' : '';

  return useQuery<Board, HttpError>({
    queryKey: ['issue', boardNumber, { allowClosed }],
    queryFn: () => fetchJson<Board>(`/api/board/${boardNumber}${suffix}`),
    staleTime: 30_000,
    enabled: Number.isFinite(boardNumber) && (options?.enabled ?? true),
  });
}

/* 생성 */
export function useBoardCreate(board: BoardKey) {
  const queryClient = useQueryClient();
  const { label } = BOARD[board];

  return useMutation<Board, HttpError, { title: string; body: string }>({
    mutationFn: (payload: { title: string; body: string }) => {
      return fetchJson<Board>('/api/board', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          labels: [label],
        }),
      });
    },
    onSuccess: created => {
      queryClient.setQueriesData({ queryKey: ['issue', created.number] }, created);

      // Github API 지연으로 인한 캐시 사용
      updateBoardListCaches(queryClient, board, (prev, vars) => {
        const page = vars.page ?? 1;
        if (page !== 1) {
          return prev;
        }
        if (!matchesSearch(created, vars.q)) {
          return prev;
        }

        const perPage = vars.perPage ?? (prev.items.length || 10);
        const items = [created, ...prev.items.filter(i => i.number !== created.number)].slice(0, perPage);
        return { items, totalCount: (prev.totalCount ?? 0) + 1 };
      });

      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['board'] }), 12000);
    },
  });
}

/* 수정 */
export function useBoardUpdate(board: BoardKey, boardNumber: number) {
  const queryClient = useQueryClient();

  return useMutation<Board, HttpError, { title: string; body: string }>({
    mutationFn: (payload: { title: string; body: string }) =>
      fetchJson<Board>(`/api/board/${boardNumber}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: updated => {
      queryClient.setQueriesData({ queryKey: ['issue', boardNumber] }, updated);

      // 리스트들 갱신(검색어 불일치하면 빠질 수도 있음)
      updateBoardListCaches(queryClient, board, (prev, vars) => {
        const items = prev.items.slice();
        const idx = items.findIndex(i => i.number === updated.number);

        if (matchesSearch(updated, vars.q)) {
          if (idx >= 0) {
            items[idx] = updated;
          } else if ((vars.page ?? 1) === 1) {
            items.unshift(updated);
          }
        } else {
          if (idx >= 0) {
            items.splice(idx, 1);
          }
        }
        return { ...prev, items };
      });

      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['board'] }), 12000);
    },
  });
}

/* 삭제 */
type DeleteCtx = {
  prevDetail?: Board;
  prevLists?: Array<[QueryKey, SearchResult<Board> | undefined]>;
};

export function useBoardDelete(board: BoardKey, boardNumber: number) {
  const queryClient = useQueryClient();

  return useMutation<{ ok: true }, HttpError, void, DeleteCtx>({
    mutationFn: () =>
      fetchJson<{ ok: true }>(`/api/board/${boardNumber}`, {
        method: 'DELETE',
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['issue', boardNumber] });
      await queryClient.cancelQueries({ queryKey: ['board'] });

      const prevDetail = queryClient.getQueryData<Board>(['issue', boardNumber]);
      const prevLists = queryClient.getQueriesData<SearchResult<Board>>({ queryKey: ['board'] });

      prevLists.forEach(([key, prev]) => {
        if (!prev || !Array.isArray(prev.items)) {
          return;
        }
        const nextItems = prev.items.filter(i => i.number !== boardNumber);
        const removed = prev.items.length - nextItems.length;
        queryClient.setQueryData(key, {
          ...prev,
          items: nextItems,
          totalCount: Math.max(0, (prev.totalCount ?? 0) - removed),
        });
      });

      // 상세는 바로 remove하면 재요청 트리거될 수 있어 set만
      queryClient.setQueriesData({ queryKey: ['issue', boardNumber] }, (p: any) => (p ? { ...p, state: 'closed' } : p));

      return { prevDetail, prevLists };
    },
    // 실패 시 롤백
    onError: (_err, _v, ctx) => {
      if (!ctx) {
        return;
      }
      if (ctx.prevDetail) {
        queryClient.setQueryData(['issue', boardNumber], ctx.prevDetail);
      }
      ctx.prevLists?.forEach(([key, prev]) => queryClient.setQueryData(key, prev));
    },
    // 성공 시 보수적 동기화
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['board'] }), 12000);
    },
  });
}
