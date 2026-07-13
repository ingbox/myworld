import { Suspense } from "react";
import { getJukeboxList } from "@/lib/services/cy/jukebox/service";
import Queue from "@/components/cy/jukebox/Queue";
import QueueSkeleton from "@/components/cy/jukebox/QueueSkeleton.tsx";

// 1. 부모 Page 컴포넌트에서 Next.js가 넣어주는 searchParams(Promise 형태)를 받습니다.
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<QueueSkeleton />}>
      <JukeboxContent searchParams={searchParams} />
    </Suspense>
  );
}

// 3. 자식 컴포넌트는 넘겨받은 Promise를 내부(<Suspense> 안쪽)에서 안전하게 await 합니다.
async function JukeboxContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const param = await searchParams;
  const page = Number(param.page ?? "1");

  const tempJukebox = await getJukeboxList(page);
  const jukeboxList = tempJukebox.jukebox;

  const limitPage = 10;
  const totalPage = Math.ceil(tempJukebox.totalCount / limitPage);
  const currentPage = page;

  const pageGroupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);

  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);

  const currentPageList = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <Queue
      pageInfo={{
        startPage,
        endPage,
        totalPage,
      }}
      jukeboxList={jukeboxList}
      currentPageList={currentPageList}
      currentPage={currentPage}
    />
  );
}