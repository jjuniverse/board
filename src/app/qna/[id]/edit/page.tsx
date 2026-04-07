import { Suspense } from 'react';
import BoardEditScreen from '@/screens/BoardEditScreen';

export default function QnaEditPage() {
  return (
    <Suspense fallback={null}>
      <BoardEditScreen boardKey="QNA" />
    </Suspense>
  );
}
