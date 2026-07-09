import { getBoardContent } from "@/app/actions/cy/board";
import ReadOnlyEditor from "@/components/tiptap-templates/simple/read-only-editor";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const content = await getBoardContent(Number(id));

  console.log("@@@@:", content);

  return (
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
  );
}