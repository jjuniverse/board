'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchInput from './SearchInput';
import { Box, Button, FormControl, MenuItem, Select, Stack, useMediaQuery, useTheme } from '@mui/material';
import { pushModal } from '@/store/modalSlice';
import { useAppDispatch } from '@/store/typedHooks';
import { BOARD, BoardKey } from '@/constants/board';
import { DATA_ATTR, SELECTOR } from '@/constants/ui';

type Target = 'title' | 'body';

interface Props {
  boardKey: BoardKey;
  placeholder?: string;
}

export default function SearchBar({ boardKey, placeholder = '검색어를 입력해주세요' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [target, setTarget] = useState<Target>((searchParams.get('in') as Target) ?? 'title');
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');

  useEffect(() => setTarget((searchParams.get('in') as Target) ?? 'title'), [searchParams]);
  useEffect(() => setKeyword(searchParams.get('q') ?? ''), [searchParams]);

  const hasActiveQuery = useMemo(() => {
    const q = searchParams.get('q');
    const inParam = searchParams.get('in') as Target;
    return Boolean(q) || Boolean(inParam);
  }, [searchParams]);

  const listPath = BOARD[boardKey].path;
  const boardName = BOARD[boardKey].name;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim().length) {
      return dispatch(
        pushModal('ALERT', {
          message: '검색어를 입력하세요.',
          size: 'small',
          options: {
            initialFocusSelector: SELECTOR.PRIMARY_FOCUS,
            latestFocusSelector: SELECTOR.restoreFocus('search-bar'),
          },
        })
      );
    }

    const params = new URLSearchParams(searchParams.toString());

    if (target) {
      params.set('in', target);
    } else {
      params.delete('in');
    }

    const q = keyword.trim();
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }

    params.set('page', '1');
    router.push(`${listPath}?${params.toString()}`);
  };

  const onReset = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('in');
    params.delete('q');
    params.set('page', '1');
    router.push(`${listPath}?${params.toString()}`);
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ my: 1 }} role="search" aria-label={`${boardName} 게시글 검색`}>
      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <FormControl sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 120 } }} size="small">
          <Select
            value={target}
            onChange={e => setTarget(e.target.value)}
            sx={{ textAlign: 'center' }}
            aria-label="검색 대상"
          >
            <MenuItem value={'title'} sx={{ justifyContent: 'center' }}>
              제목
            </MenuItem>
            <MenuItem value={'body'} sx={{ justifyContent: 'center' }}>
              내용
            </MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
          <SearchInput value={keyword} onChange={value => setKeyword(value)} placeholder={placeholder} />
        </Box>
        <Button
          type="submit"
          variant="contained"
          sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
          {...{ [DATA_ATTR.RESTORE_FOCUS]: 'search-bar' }}
        >
          검색
        </Button>
        <Button
          variant="contained"
          onClick={onReset}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
            visibility: hasActiveQuery ? 'visible' : 'hidden',
            display: isMobile && !hasActiveQuery ? 'none' : 'inherit',
          }}
          tabIndex={hasActiveQuery ? 0 : -1}
        >
          검색 취소
        </Button>
      </Stack>
    </Box>
  );
}
