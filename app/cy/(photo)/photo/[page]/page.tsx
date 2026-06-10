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
    <>
      {
      photoList.photos.map((list: any) => (
        <div key={list.id}>
          <ReadOnlyEditor content={list.content} />
        </div>
      ))}
    </>
  );
}