import { Suspense } from 'react';
import BoardDetailScreen from '@/screens/BoardDetailScreen';

export default function CommunityDetailPage() {
  return (
    <Suspense fallback={null}>
      <BoardDetailScreen boardKey="COMMUNITY" />
    </Suspense>
  );
}
