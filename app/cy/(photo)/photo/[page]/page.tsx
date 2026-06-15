import Image from "next/image";
import Link from "next/link";
import { getPhotoList } from "@/app/actions/cy/photo";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/read-only-editor";
import { getTypeList } from "@/app/actions/common/photo";

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
  // 카테고리 가져오기
  const typeList = await getTypeList();


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
    <>
      <div
        className="w-[320px] bg-[#a8d2e0] pt-[15px] pb-[15px] pl-[15px] overflow-hidden"
        style={{
          borderTopRightRadius: '15px 6px',
          borderTopLeftRadius: '6px',
          borderBottomRightRadius: '15px 6px',
          borderBottomLeftRadius: '6px',
        }}
      >
        <div
          className="w-full h-full border-t-2 border-l-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pl-[5px]" style={{
            borderTopRightRadius: '15px 6px',
            borderTopLeftRadius: '15px',
            borderBottomRightRadius: '15px 6px',
            borderBottomLeftRadius: '15px',
          }}
        >
          <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pl-[5px] pr-[2px]"
            style={{
              borderTopRightRadius: '15px 6px',
              borderTopLeftRadius: '10px',
              borderBottomRightRadius: '15px 6px',
              borderBottomLeftRadius: '10px',
            }}
          >
            <div className="h-[40px]">

            </div>

            {/* 프로필 */}
            <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">
              <div className="mb-4">
                <p className="font-ginto font-light text-[8px] text-gray-400 tracking-wide">SAVE MY MEMORY</p>
                <p className="text-[14px] text-[#459ebe] font-bold tracking-wide">PHOTO ALBUM</p>
              </div>
              <div className="flex gap-2 mb-1 text-[15px]">
                <div>
                  <Image src="/images/photo/file.png" width={16} height={14} alt="" />
                </div>
                <Link href={`/cy/photo/1`} className={`text-[15px] ${type == 0 ? 'font-bold' : ''}`}>전체보기</Link>
              </div>
              <hr className="border-1 border-gray-200" />
              <div className="mt-1">
                {
                  typeList.map((list: any) => (
                    <div key={list.id} className="flex gap-2 mb-1">
                      <div className="inline-block">
                        <Image src="/images/photo/file.png" width={16} height={14} alt="" />
                      </div>
                      <Link
                        href={`/cy/photo/1?type=${list.id}`}
                        className={`text-[15px] ${type == list.id ? 'font-bold' : ''}`}
                      >
                        {list.name}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-[720px] bg-[#a8d2e0] pt-[15px] pb-[15px] pr-[15px] overflow-hidden"
        style={{
          borderTopLeftRadius: '15px 6px',
          borderTopRightRadius: '6px',
          borderBottomLeftRadius: '15px 6px',
          borderBottomRightRadius: '6px',
        }}
      >
        <div
          className="w-full h-full border-t-2 border-r-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pr-[5px]"
          style={{
            borderTopRightRadius: '15px',
            borderTopLeftRadius: '15px 6px',
            borderBottomRightRadius: '15px',
            borderBottomLeftRadius: '15px 6px',
          }}>
          <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pr-[5px] pl-[2px]"
            style={{
              borderTopRightRadius: '10px',
              borderTopLeftRadius: '15px 6px',
              borderBottomRightRadius: '10px',
              borderBottomLeftRadius: '15px 6px',
            }}>
            <div className="h-[40px] pt-3 px-2">
              <p className="text-lg text-[#4a60ab] font-ginto font-bold">이름님의 미니홈피</p>
            </div>
            <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md">
              <div className="h-[540px] px-7 py-5 overflow-scroll">
                {
                  photoList.photos.map((list: any) => (
                    <div key={list.id}>
                      {/* 제목 */}
                      <hr className="border-[#c7e9f1]" />
                      <div className="bg-[#F8F8F8] w-full h-7 font-bold flex justify-center items-center mb-1">
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

            </div>

          </div>
        </div>
      </div>

    </>
  );
}