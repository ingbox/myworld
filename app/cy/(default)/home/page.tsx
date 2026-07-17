import { Suspense } from "react";
import { getContentCount, getUpdatedNews } from "@/lib/services/cy/home/content/service";
import ProfileComment from "@/components/cy/home/ProfileComment";
import Image from "next/image";
import Link from "next/link";
import ProfileCommentFallback from "@/components/cy/home/ProfileCommentFallback";
import MiniRoom from "@/components/cy/home/MiniRoom/MiniRoom";


export default async function Page() {

    const contentCount = await getContentCount();
    const updatedNews = await getUpdatedNews();

    return (
        <div className="h-full px-7 py-5 overflow-auto max-md:px-2 max-md:py-2">
            {/* 상단 */}
            <div className="flex w-full mb-3 gap-2">
                {/* 최근 게시물 */}
                <div className="w-3/5 h-[100px]">
                    <div className="inline-block relative font-ginto font-semibold text-xs text-[#459ebe] tracking-wide">
                        <span>Updated news</span>
                        <span className="absolute font-ginto font-light text-[8px] text-gray-400 tracking-wide right-[-57px] top-[3px]">TODAY STORY</span>
                    </div>
                    <hr className="border-gray-300" />
                    {
                        updatedNews.map((item: any) => (
                            <Link
                                key={item.id + '_' + item.type}
                                href={
                                    item.type === 'photo'
                                        ? '/cy/photo'
                                        : item.type === 'board'
                                            ? `/cy/board/${item.id}`
                                            : '/cy/visitor'
                                }
                                className="flex items-center gap-1"
                            >
                                <div
                                    className={`text-xs text-white rounded px-[2px] shrink-0 ${item.type === 'photo'
                                            ? 'bg-[#a4717a]'
                                            : item.type === 'board'
                                                ? 'bg-[#6b9b6d]'
                                                : 'bg-[#7a95b3]'
                                        }`}
                                >
                                    {item.type === 'photo'
                                        ? '사진첩'
                                        : item.type === 'board'
                                            ? '게시판'
                                            : '방명록'}
                                </div>

                                <div className="min-w-[83px] truncate text-sm">
                                    {item.content}
                                </div>
                            </Link>
                        ))
                    }
                </div>
                {/* 페이지 현황 */}
                <div className="w-2/5 h-full">
                    {/* 쥬크박스 */}
                    <div className="h-[22px]">
                    </div>

                    <table className="w-full table-fixed border-collapse bg-[#f8f8f8] text-[12px] text-[#697ea8] leading-5 max-sm:text-[9px]">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-1">
                                    <Link href="/cy/jukebox" className="inline-block mr-1">쥬크박스 {contentCount.jukebox.today}/{contentCount.jukebox.total}</Link>
                                    {
                                        contentCount.jukebox.today > 0 ?
                                            <Image src="/images/cy/home/new.png" className="inline-block mb-[2px]" width={14} height={14} alt="" />
                                            :
                                            <></>
                                    }
                                </td>
                                <td className="border border-gray-300 px-1">
                                    <Link href="/cy/photo" className="inline-block mr-1">사진첩 {contentCount.photo.today}/{contentCount.photo.total}</Link>
                                    {
                                        contentCount.photo.today > 0 ?
                                            <Image src="/images/cy/home/new.png" className="inline-block mb-[2px]" width={14} height={14} alt="" />
                                            :
                                            <></>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-1">
                                    <Link href="/cy/board" className="inline-block mr-1">게시판 {contentCount.board.today}/{contentCount.board.total}</Link>
                                    {
                                        contentCount.board.today > 0 ?
                                            <Image src="/images/cy/home/new.png" className="inline-block mb-[2px]" width={14} height={14} alt="" />
                                            :
                                            <></>
                                    }
                                </td>
                                <td className="border border-gray-300 px-1">
                                    <Link href="/cy/visitor" className="inline-block mr-1">방명록 {contentCount.visitor.today}/{contentCount.visitor.total}</Link>
                                    {
                                        contentCount.visitor.today > 0 ?
                                            <Image src="/images/cy/home/new.png" className="inline-block mb-[2px]" width={14} height={14} alt="" />
                                            :
                                            <></>
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 중단 */}
            <div className="w-full mb-3">
                <div className="inline-block relative font-ginto font-semibold text-xs text-[#459ebe] tracking-wide">
                    <span>Mini Room</span>
                    <span className="absolute font-ginto font-light text-[8px] text-gray-400 tracking-wide right-[-80px] top-[3px]">EXPRESS YOURSELF</span>
                </div>
                <MiniRoom />
            </div>

            {/* 하단 */}
            <div className="w-full h-[300px] max-md:h-auto">
                <div className="inline-block relative font-ginto font-semibold text-xs text-[#459ebe] tracking-wide">
                    <span>What friends say</span>
                    <span className="absolute font-diary text-[10px] text-gray-500 right-[-73px] top-[3px]">한마디로 표현해</span>
                    <span className="absolute font-diary text-[10px] text-gray-500 right-[-83px] top-px">봐</span>
                    <span className="absolute font-dotum text-[15px] text-gray-500 right-[-91px] top-[-3px]">~</span>
                </div>
                <hr className="border-gray-300" />
                <Suspense fallback={<ProfileCommentFallback />}>
                    <ProfileComment />
                </Suspense>
            </div>
        </div >
    );
}