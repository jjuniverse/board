import { CSSProperties } from 'react';
import { formatDate } from '@/utils/format';

export interface Column {
  id: 'number' | 'title' | 'user' | 'created_at';
  label: string;
  width?: CSSProperties['width'];
  minWidth?: CSSProperties['width'];
  headerAlign?: 'left' | 'center' | 'right';
  bodyAlign?: 'left' | 'center' | 'right';
  format?: (value: string) => string;
}

export const columns: readonly Column[] = [
  { id: 'number', label: '번호', width: 72, headerAlign: 'center' },
  {
    id: 'title',
    label: '제목',
    minWidth: '40ch',
    headerAlign: 'center',
    bodyAlign: 'left',
  },
  { id: 'user', label: '작성자', width: '20ch', headerAlign: 'center' },
  {
    id: 'created_at',
    label: '작성일',
    width: '22ch',
    headerAlign: 'center',
    format: (value: string) => formatDate(value),
  },
];
