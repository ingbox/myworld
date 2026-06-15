import { getPhotoList } from "@/app/actions/cy/photo";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/read-only-editor";

export default async function Page({ params }: { params: { page: number } }) {

  const param = await params;
  const page = await param.page ? param.page : 1;
  const photoList = await getPhotoList(Number(page));
 
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
    <div className="h-[560px] px-7 py-5 overflow-scroll">
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
    </div>
  );
}