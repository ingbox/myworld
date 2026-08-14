import { auth } from "@/app/auth";
import { createBoardComment } from "@/lib/services/cy/board/comment/action"
import Form from "next/form"

export default async function CommentForm({ params }: { params: Promise<{ id: string }> }) {

    const session = await auth();
    const user = session?.user ?? null;
    const id = (await params).id;

    if (!user) {
        return <></>;
    }

    return (
        <Form className="mx-7 mb-2" action={createBoardComment}>
            <input type="hidden" name="board_id" value={id} />
            <input type="hidden" name="parent_id" value="" />
            <div className='flex gap-2'>
                <textarea
                    className="flex-1 h-10 text-[15px] text-gray-600 bg-white border border-gray-300 p-1"
                    name="content"
                    minLength={1}
                    maxLength={1000}
                    required
                />
                <button
                    className="text-sm w-10 h-10 border border-gray-400 text-gray-500 bg-white rounded-sm"
                    type="submit"
                >
                    확인
                </button>
            </div>
        </Form>
    )
}

