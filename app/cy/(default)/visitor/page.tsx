import Layout from '@/components/cy/visitor/Layout';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {

  return (
    <Suspense>
      <Layout searchParams={searchParams} />
    </Suspense>
  );
}