'use client';

import SearchTipsModalContent from './SearchTipsModalContent';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useAppDispatch } from '@/store/typedHooks';
import { pushModal } from '@/store/modalSlice';
import { DATA_ATTR, SELECTOR } from '@/constants/ui';

export default function SearchInput({
  value,
  onChange,
  placeholder = '검색어를 입력해주세요',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const dispatch = useAppDispatch();

  const handleClickSearchInfo = () => {
    dispatch(
      pushModal('ALERT', {
        title: '검색 팁',
        message: <SearchTipsModalContent />,
        okText: '확인',
        options: {
          initialFocusSelector: SELECTOR.PRIMARY_FOCUS,
          latestFocusSelector: SELECTOR.restoreFocus('search-input'),
        },
      })
    );
  };

  return (
    <>
      <TextField
        fullWidth
        size="small"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        slotProps={{
          input: {
            'aria-label': '검색어',
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip
                  title="검색은 단어 기준으로 동작합니다. 더 보기: 클릭!"
                  arrow
                  enterTouchDelay={0}
                  leaveTouchDelay={3000}
                >
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="검색 도움말 열기"
                    aria-haspopup="dialog"
                    onClick={handleClickSearchInfo}
                    {...{ [DATA_ATTR.RESTORE_FOCUS]: 'search-input' }}
                  >
                    <InfoOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
}
