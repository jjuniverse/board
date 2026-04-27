import { Suspense } from 'react';
import BoardEditScreen from '@/screens/BoardEditScreen';

export default function CommunityEditPage() {
  return (
    <Suspense fallback={null}>
      <BoardEditScreen boardKey="COMMUNITY" />
    </Suspense>
  );
}
