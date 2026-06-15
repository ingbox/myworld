import Link from "next/link";
import { getPhotoList } from "@/app/actions/cy/photo";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/read-only-editor";

export default async function Page({
  params,
  searchParams,
}: {
  params: { page?: number }; // [] 경로용
  searchParams: { type?: number; }; // ? 쿼리용
}) {

  const param = await params;
  const page = await param.page ? param.page : 1;

  const searchParam = await searchParams;
  const type = searchParam.type ?? 0;
  const photoList = await getPhotoList(Number(page), type);


  const limitPage = 10;
  const totalPage = Math.ceil(photoList.totalCount / limitPage);
  const currentPage = Number(page);
  // 현재 페이지가 속한 그룹의 시작/끝 계산
  const pageGroupSize = 5; // 한 번에 보여줄 페이지네이션 버튼 개수
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);

  const currentPageList = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
 
  return (
    <div className="h-[540px] px-7 py-5 overflow-scroll">
      {
        photoList.photos.map((list: any) => (
          <div key={list.id}>
            {/* 제목 */}
            <hr className="border-[#c7e9f1]" />
            <div className="bg-[#F8F8F8] w-full h-7 flex justify-center items-center mb-1">
              {list.title}
            </div>
            <div className="flex justify-between">
              <div>임지섭</div>
              <div className="flex gap-2">
                <div>{list.created_at_formatted}</div>
                <div className="cursor-pointer">스크랩</div>
              </div>
            </div>
            <ReadOnlyEditor content={list.content} />
          </div>
        ))}

      {/* 페이지네이션 */}
      <div className="px-7">
        <div className="flex justify-center items-center py-6">
          <nav className="inline-flex" aria-label="Pagination">
            {startPage > 1 && (
              <Link href={`/cy/photo/${startPage - 1}${type !== undefined ? `?type=${type}` : ''}`}>
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="#4a60ab" viewBox="0 0 20 20" className="size-5 mr-1">
                    <polygon points="13,5 6,10 13,15" fill="#9ca3af" />
                  </svg>
                </button>
              </Link>
            )}

            {currentPageList.map((page, idx) => (
              <Link href={`/cy/photo/${page}${type !== undefined ? `?type=${type}` : ''}`} key={page}>
                <span
                  className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold ${idx === currentPageList.length - 1 ? 'border-r border-gray-300' : ''
                    } ${page === currentPage ? 'text-orange-500' : 'text-gray-500'}`}
                >
                  {page}
                </span>
              </Link>
            ))}

            {endPage < totalPage && (
              <Link href={`/cy/visitor/${endPage + 1}${type !== undefined ? `?type=${type}` : ''}`}>
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