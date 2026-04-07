import { SxProps } from '@mui/material';

export interface PageNavigationProps {
  page: number; // current page
  totalCount: number; // total
  pageSize?: number; // 페이지당 출력될 개수
  blockSize?: number; // 한번에 보여줄 페이지 번호 개수
  onChange: (page: number) => void;
  disabled?: boolean; //이동 버튼
  sx?: SxProps;
}
