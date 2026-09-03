import Link from "next/link";
import { Suspense } from "react";
import { getBoardList } from "@/src/lib/api/cy/board/service";

// 1. 부모 컴포넌트: searchParams를 직접 await하지 않고 자식에게 통째로 넘깁니다.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: number, page?: number }>;
}) {
  return (
    // 데이터가 로드되는 동안 깜빡임(화면 꺼짐)을 최소화하기 위해 fallback을 비워두거나 스켈레톤을 넣습니다.
    <Suspense fallback={null}>
      <BoardListContent searchParams={searchParams} />
    </Suspense>
  );
}

// 2. 실제 비동기 데이터 패칭과 테이블 UI를 담당하는 자식 컴포넌트
async function BoardListContent({
  searchParams,
}: {
  searchParams: Promise<{ type?: number, page?: number }>;
}) {
  // 💡 부모가 아닌, 오직 이 <Suspense> 내부에서만 런타임 데이터를 해제(await)합니다.
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams.page ? resolvedSearchParams.page : 1;
  const type = resolvedSearchParams.type ?? 0;

  const boardList = await getBoardList(Number(page), type);

  const limitPage = 10;
  const totalPage = Math.ceil(boardList.totalCount / limitPage);
  const currentPage = Number(page);

  const pageGroupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);

  const currentPageList = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="h-135 px-7 py-5 overflow-scroll">
      <table className="w-full border-collapse">
        <thead>
          <tr className="leading-[1.1] bg-[linear-gradient(to_right,#cfcfcf_50%,transparent_0)] bg-size-[3px_1px] bg-repeat-x bg-bottom text-sm bg-[#f2f2f2] max-md:hidden">
            <th className="w-16 py-0.75 font-normal">번호</th>
            <th className="font-normal">제목</th>
            <th className="w-24 font-normal">작성자</th>
            <th className="w-40 font-normal">작성일</th>
            <th className="w-20 font-normal">조회</th>
          </tr>
        </thead>
        <tbody>
          {boardList?.boards?.map((board: any, index: number) => (
            <tr
              key={board.id}
              className="leading-[1.1] bg-[linear-gradient(to_right,#cfcfcf_50%,transparent_0)] bg-size-[3px_1px] bg-repeat-x bg-bottom text-sm"
            >
              <td className="text-center py-1.5 max-md:hidden">
                {Number(boardList.totalCount) - ((currentPage - 1) * limitPage + index + 1) + 1}
              </td>
              <td className="py-1.5 max-md:hidden">
                <Link href={`/cy/board/${board.id}`}>
                  {board.title}
                </Link>
              </td>
              <td className="text-center py-1.5 max-md:hidden">임지섭</td>
              <td className="text-center py-1.5 max-md:hidden">{board.created_at_formatted}</td>
              <td className="text-center py-1.5 max-md:hidden">{board.view_count ?? 0}</td>
              <td className="md:hidden p-0" colSpan={5}>
                <Link href={`/cy/board/${board.id}`}>
                  <div className="flex flex-col w-full py-3">
                    <span className="font-semibold text-[15px] text-gray-800">{board.title}</span>
                    <div className="text-sm text-gray-500 flex justify-between mt-1">
                      <span>임지섭</span>
                      <span>{board.created_at_formatted}</span>
                      <span>{board.view_count ?? 0} 조회</span>
                    </div>
                  </div>
                </Link>
              </td>
            </tr>
       
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="px-7">
        <div className="flex justify-center items-center py-6">
          <nav className="inline-flex" aria-label="Pagination">
            {startPage > 1 && (
              <Link href={`/cy/board?page=${startPage - 1}${type !== undefined ? `&type=${type}` : ''}`}>
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#4a60ab" viewBox="0 0 20 20" className="size-5 mr-1">
                    <polygon points="13,5 6,10 13,15" fill="#9ca3af" />
                  </svg>
                </button>
              </Link>
            )}

            {currentPageList.map((page, idx) => (
              <Link href={`/cy/board?page=${page}${type !== undefined ? `&type=${type}` : ''}`} key={page}>
                <span
                  className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold ${idx === currentPageList.length - 1 ? 'border-r border-gray-300' : ''
                    } ${page === currentPage ? 'text-orange-500' : 'text-gray-500'}`}
                >
                  {page}
                </span>
              </Link>
            ))}

            {endPage < totalPage && (
              <Link href={`/cy/board?page=${endPage + 1}${type !== undefined ? `&type=${type}` : ''}`}>
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#4a60ab" viewBox="0 0 20 20" className="size-5">
                    <polygon points="7,5 14,10 7,15" fill="#9ca3af" />
                  </svg>
                </button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}