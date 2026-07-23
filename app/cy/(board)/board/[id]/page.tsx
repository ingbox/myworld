import TrackBoardView from "@/components/cy/board/TrackBoardView";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/read-only-editor";
import { getBoardContent } from "@/lib/services/cy/board/service";
import { Suspense } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-7">로딩 중...</div>}>
      <ContentWrapper params={params} />
    </Suspense>
  );
}

async function ContentWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getBoardContent(Number(id));

  return (
    <>
      <TrackBoardView id={Number(id)} />
      <div className="h-[540px] px-7 py-5 overflow-scroll">
        <div className="font-bold py-[6px]">
          {content.title}
        </div>
        <hr />
        <div className="flex justify-between leading-[1.1]
                            bg-[linear-gradient(to_right,#cfcfcf_50%,transparent_0)]
                            bg-size-[3px_1px] bg-repeat-x bg-bottom py-[6px]">
          <span>임지섭</span>
          <span className="text-xs">{content.created_at_formatted}</span>
        </div>

        <ReadOnlyEditor content={content.content} />
      </div>
    </>
  );
}