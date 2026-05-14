'use client';

import dynamic from 'next/dynamic';
import type { PageId } from '@/components/home-shell';

const HomeShell = dynamic(
  () => import('@/components/home-shell').then((mod) => mod.HomeShell),
  { ssr: false }
);

interface HomeShellClientProps {
  currentPage: PageId;
}

export function HomeShellClient({ currentPage }: HomeShellClientProps) {
  return <HomeShell currentPage={currentPage} />;
}
