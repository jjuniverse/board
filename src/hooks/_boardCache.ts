import { QueryClient } from '@tanstack/react-query';
import { BoardKey } from '@/constants/board';
import { Board } from '@/models/board';

type ListShape = { items: Board[]; totalCount: number };
type KeyVars = { board: BoardKey; page?: number; perPage?: number; q?: string };

const parseKeyVars = (key: unknown): KeyVars | null => {
  if (!Array.isArray(key) || key[0] !== 'board') {
    return null;
  }
  const vars = (key[1] ?? {}) as KeyVars;
  return vars?.board ? vars : null;
};

export function updateBoardListCaches(
  qc: QueryClient,
  targetBoard: BoardKey,
  updater: (prev: ListShape, vars: KeyVars) => ListShape | void
) {
  qc.getQueriesData<ListShape>({ queryKey: ['board'] }).forEach(([key, prev]) => {
    if (!prev) {
      return;
    }
    const vars = parseKeyVars(key);
    if (!vars || vars.board !== targetBoard) {
      return;
    }

    const next = updater(prev, vars);
    if (next) {
      qc.setQueryData(key, next);
    }
  });
}

export function matchesSearch(item: Board, q?: string) {
  const raw = q ?? '';
  const word = raw.split('::::::')[1]?.trim().toLowerCase() ?? '';
  if (!word) {
    return true;
  }
  const hay = `${item.title ?? ''}\n${item.body ?? ''}`.toLowerCase();
  return hay.includes(word);
}
