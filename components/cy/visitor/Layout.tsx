import Form from 'next/form';
import Image from 'next/image';
import { auth } from '@/app/auth';

import { getVisitorList } from '@/lib/services/cy/visitor/service';
import { createVisitor, createVisitorComment } from '@/lib/services/cy/visitor/action';

import Link from 'next/link';
import Visitor from '@/components/cy/visitor/Visitor';
import Comment from '@/components/cy/visitor/Comment';
import GoogleButton from '@/components/layout/auth/GoogleButton';

interface Props {
    searchParams: Promise<{ page?: string }>;
}

export default async function Layout({ searchParams }: Props) {

    const session = await auth();
    const user = session?.user;

    const params = await searchParams;
    const page = params.page ?? "1";

    // 방명록 목록 가져오기
    const visitorList = await getVisitorList({ page: Number(page), userEmail: user?.email || '', userRole: user?.role });

    const limitPage = 10;
    const totalPage = Math.ceil(visitorList.totalCount / limitPage);
    const currentPage = Number(page);

    // 게시글 넘버링: 내림차순, 한 페이지에 10개씩, totalCount에서 현재 페이지와 인덱스 기반으로 계산
    const getPostNumber = (index: number) => {
        return visitorList.totalCount - ((currentPage - 1) * limitPage + index);
    };
    // 현재 페이지가 속한 그룹의 시작/끝 계산
    const pageGroupSize = 5; // 한 번에 보여줄 페이지네이션 버튼 개수
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const startPage = currentGroup * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPage);

    // 실제 페이지네이션에 보여줄 페이지 리스트
    const currentPageList = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <div className='h-full overflow-auto relative'>
            <>
                <>
                    {
                        user ?
                            <div className="px-7 py-5 max-md:px-2 max-md:py-2">
                                <div className='flex gap-2 bg-gray-50 border-y-2 border-gray-200 pt-4 pb-2 px-4'>
                                    <div className="relative w-30 h-30 max-md:w-15 max-md:h-15 bg-white flex items-center justify-center overflow-hidden rounded">
                                        <Image
                                            src={user?.image || '/images/cy/noimage.jpg'}
                                            alt="preview"
                                            fill
                                            className="object-contain w-full h-full"
                                            unoptimized
                                        />
                                    </div>
                                    <Form className="flex-1 flex flex-col" action={createVisitor}>
                                        <textarea
                                            className="w-full h-30 text-[15px] text-gray-600 bg-white border border-gray-300 p-1 max-md:h-15"
                                            name="content"
                                            minLength={1}
                                            maxLength={1000}
                                            required
                                        />
                                        <input type="hidden" name="user_name" value={user?.name || ''} />
                                        <input type="hidden" name="user_email" value={user?.email || ''} />
                                        <input type="hidden" name="profile_image" value={user?.image || ''} />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                className="text-sm w-10 h-6 border border-gray-400 text-gray-500 bg-white rounded-sm"
                                                type="submit"
                                            >
                                                확인
                                            </button>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                            :
                            <div className="px-7 py-5">
                                <GoogleButton />
                            </div>
                    }
                </>

                {/* 방명록 */}
                <div className="px-7 max-md:px-2" >
                    {
                        visitorList.visitors.map((visitor: any, index: number) => (
                            <div className='w-full min-h-45 border-t border-gray-200 mb-8' key={visitor.id}>

                                {/* 방명록 번호, 이름, 날짜, 수정, 삭제, 비밀, 댓글 */}
                                <Visitor user={user} visitor={visitor} getPostNumber={getPostNumber(index)} />
                                {
                                    visitor.comments.length > 0 &&
                                    <div className={`bg-gray-50 pt-2 px-4 ${visitor.user_email === user?.email || user?.role === "ADMIN" ? '' : 'pb-2'}`}>
                                        {
                                            visitor.comments.map((comment: any) => (
                                                <div key={comment.id} className="w-full">
                                                    <span className="break-all text-sm text-gray-500 font-ginto leading-6 align-middle">
                                                        {comment.user_name} : {comment.content}
                                                        <span className="text-[11px] text-gray-400 font-ginto align-middle"> ({comment.created_at_formatted})</span>
                                                        {/* 댓글 삭제 버튼 */}
                                                        <Comment user={user} comment={comment} />

                                                    </span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                }


                                {/* 대댓글 작성 폼 */}
                                {
                                    user ?
                                        <Form className="bg-gray-50 py-2 px-4" action={createVisitorComment}>
                                            <input type="hidden" name="user_name" value={user?.name || ''} />
                                            <input type="hidden" name="user_email" value={user?.email || ''} />
                                            <input type="hidden" name="visitor_id" value={visitor.id} />
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
                                        :
                                        <></>
                                }


                            </div>
                        ))}
                </div>

                <div className="px-7">
                    <div className="flex justify-center items-center py-6">
                        <nav className="inline-flex" aria-label="Pagination">
                            {startPage > 1 && (
                                <Link href={`/cy/visitor?page=${startPage - 1}`}>
                                    <button>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="#4a60ab" viewBox="0 0 20 20" className="size-5 mr-1">
                                            <polygon points="13,5 6,10 13,15" fill="#9ca3af" />
                                        </svg>
                                    </button>
                                </Link>
                            )}

                            {currentPageList.map((page, idx) => (
                                <Link href={`/cy/visitor?page=${page}`} key={page}>
                                    <span
                                        className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold ${idx === currentPageList.length - 1 ? 'border-r border-gray-300' : ''
                                            } ${page === currentPage ? 'text-orange-500' : 'text-gray-500'}`}
                                    >
                                        {page}
                                    </span>
                                </Link>
                            ))}

                            {endPage < totalPage && (
                                <Link href={`/cy/visitor?page=${endPage + 1}`}>
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

            </>
        </div>
    )
}