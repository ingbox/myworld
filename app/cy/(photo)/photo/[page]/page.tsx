import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/read-only-editor";

import { getPhotoList, getPhotoTypeList } from "@/lib/services/cy/photo/service";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

// 1. 부모 컴포넌트: 런타임 데이터를 직접 풀지(await) 않고 자식들에게 Promise째로 넘깁니다.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ page?: number }>;
  searchParams: Promise<{ type?: number }>;
}) {
  return (
    <div className="flex w-full max-md:flex-col">
      {/* 왼쪽 카테고리 영역 */}
      <LeftWrapper>
        <Suspense fallback={<div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 animate-pulse p-5 max-md:h-auto" />}>
          <PhotoCategoryContent searchParams={searchParams} />
        </Suspense>
      </LeftWrapper>

      {/* 오른쪽 사진 리스트 영역 */}
      <RightWrapper>
        <Suspense fallback={<div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 animate-pulse" />}>
          <PhotoListContent params={params} searchParams={searchParams} />
        </Suspense>
      </RightWrapper>
    </div>
  );
}

// 2. 왼쪽 카테고리 전용 알맹이 컴포넌트
async function PhotoCategoryContent({
  searchParams,
}: {
  searchParams: Promise<{ type?: number }>;
}) {
  const searchParam = await searchParams;
  const type = searchParam.type ?? 0;
  
  // 카테고리 목록만 가져옴
  const typeList = await getPhotoTypeList();

  return (
    <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 p-5 max-md:h-auto">
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
      <hr className="border border-gray-200" />
      <div className="mt-1">
        {typeList.map((list: any) => (
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
  );
}

// 3. 오른쪽 사진 리스트 + 페이지네이션 알맹이 컴포넌트
async function PhotoListContent({
  params,
  searchParams,
}: {
  params: Promise<{ page?: number }>;
  searchParams: Promise<{ type?: number }>;
}) {
  const param = await params;
  const searchParam = await searchParams;

  const page = param.page ? param.page : 1;
  const type = searchParam.type ?? 0;
  
  const photoList = await getPhotoList(Number(page), type);

  const limitPage = 10;
  const totalPage = Math.ceil(photoList.totalCount / limitPage);
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
    <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300">
      <div className="h-135 px-7 py-5 overflow-scroll">
        {photoList.photos.map((list: any) => (
          <div key={list.id}>
            <hr className="border-[#c7e9f1]" />
            <div className="bg-[#F8F8F8] w-full h-7 font-bold flex justify-center items-center mb-1 text-[13px]">
              {list.title}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
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

              {currentPageList.map((p, idx) => (
                <Link href={`/cy/photo/${p}${type !== undefined ? `?type=${type}` : ''}`} key={p}>
                  <span
                    className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold ${idx === currentPageList.length - 1 ? 'border-r border-gray-300' : ''
                      } ${p === currentPage ? 'text-orange-500' : 'text-gray-500'}`}
                  >
                    {p}
                  </span>
                </Link>
              ))}

              {endPage < totalPage && (
                <Link href={`/cy/photo/${endPage + 1}${type !== undefined ? `?type=${type}` : ''}`}>
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
  );
}