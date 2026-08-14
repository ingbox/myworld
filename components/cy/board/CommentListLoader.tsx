import { auth } from "@/app/auth";
import { getBoardCommentList } from "@/lib/services/cy/board/comment/service";
import CommentList from "./CommentList";

export default async function CommentListLoader({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const boardId = Number(id);
    const [comments, session] = await Promise.all([
        getBoardCommentList(boardId),
        auth(),
    ]);

    return (
        <CommentList
            boardId={boardId}
            comments={comments}
            user={session?.user ?? null}
        />
    );
}
