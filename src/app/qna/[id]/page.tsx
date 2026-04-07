import { Suspense } from 'react';
import BoardDetailScreen from '@/screens/BoardDetailScreen';

export default function QnaDetailPage() {
  return (
    <Suspense fallback={null}>
      <BoardDetailScreen boardKey="QNA" />
    </Suspense>
  );
}
