import { getJukeboxList } from "@/app/actions/cy/jukebox";
import Queue from "@/components/cy/jukebox/Queue";

export default async function Page(props: { searchParams: { page: string } }) {

  const param = await props.searchParams;
  const page = param.page ? param.page : '1';
  
  const tempJukebox = await getJukeboxList(Number(page));
  const jukeboxList = tempJukebox.jukebox;

  const limitPage = 10;
  const totalPage = Math.ceil(jukeboxList.totalCount / limitPage);
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
    <div>
      <Queue pageInfo={{startPage: startPage, endPage: endPage, totalPage: totalPage}} jukeboxList={jukeboxList} currentPageList={currentPageList} currentPage={currentPage}/>
    </div>
  );
}