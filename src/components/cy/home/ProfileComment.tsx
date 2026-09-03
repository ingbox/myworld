import Image from "next/image";
import Form from 'next/form';
import { getProfileComment } from "@/src/lib/api/cy/home/comment/service";
import { createProfileComment } from "@/src/lib/api/cy/home/comment/action";
import { auth } from "@/app/auth";
import DeleteProfileCommentButton from "./DeleteProfileCommentButton";

export default async function ProfileComment() {
    const session = await auth();
    const user = session?.user;

    const profileCommentList = await getProfileComment();

    return (
        <>
            {
                user &&
                <Form className="h-[50px] bg-gray-100 mt-2 flex items-center border border-gray-200 gap-1 px-2" action={createProfileComment}>
                    <input type="hidden" name="user_name" value={user?.name || ''} />
                    <input type="hidden" name="user_email" value={user?.email || ''} />
                    <span className="text-[13px] text-[#459ebe] font-bold tracking-wide">Friends say</span>
                    <Image src="/images/cy/home/sun.svg" className="inline-block" width={16} height={16} alt="" />
                    <input type="text" name="content" className="text-sm inline-block w-[450px] h-[26px] bg-white border border-gray-300 px-1
                    max-md:w-full"
                        placeholder="일촌과 나누고 싶은 이야기를 남겨보세요~!" />
                    <button type="submit" className="min-w-[40px] h-[26px] bg-white border border-gray-300 shadow text-sm">확인</button>
                </Form>
            }
            {
                profileCommentList.comments.length > 0 &&
                profileCommentList.comments.map((comment: any) => (
                    <div key={comment.id} >
                        <div className="w-full py-1">
                            <span className="break-all text-[15px] text-gray-500 font-ginto leading-6 align-middle">
                                · {comment.content} ({comment.user_name})
                                <span className="text-gray-400 font-ginto align-middle text-sm"> {comment.created_at_formatted}</span>
                                {/* 댓글 삭제 버튼 */}
                                {/* <Comment user={user} comment={comment} /> */}
                            </span>
                            <DeleteProfileCommentButton
                                user={user}
                                commentId={comment.id}
                                commentUserEmail={comment.user_email}
                            />
                        </div>
                        <hr />
                    </div>
                ))
            }
        </>
    );
}