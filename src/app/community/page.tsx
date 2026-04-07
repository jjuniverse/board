import { Suspense } from 'react';
import BoardListScreen from '@/screens/BoardListScreen';

export const dynamic = 'force-dynamic';

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <BoardListScreen boardKey="COMMUNITY" />
    </Suspense>
  );
}
