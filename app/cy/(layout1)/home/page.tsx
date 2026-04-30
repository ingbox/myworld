import Image from "next/image";

export default function Page() {
    return (
        <div className="h-full px-7 py-5 overflow-auto">
            {/* 상단 */}
            <div className="flex w-full mb-3 gap-2">
                {/* 최근 게시물 */}
                <div className="w-3/5 h-[100px]">
                    <div className="inline-block relative font-ginto font-semibold text-xs text-[#459ebe] tracking-wide">
                        <span>Updated news</span>
                        <span className="absolute font-ginto font-light text-[8px] text-gray-400 tracking-wide right-[-57px] top-[3px]">TODAY STORY</span>
                    </div>
                    <hr className="border-gray-300" />
                </div>
                {/* 페이지 현황 */}
                <div className="w-2/5 h-full">
                    {/* 쥬크박스 */}
                    <div>
                        <p className="font-ginto text-[11px] text-[#459ebe] font-light tracking-wider leading-6">💿 BGM ▶</p>
                    </div>

                    <table className="w-full table-fixed border-collapse bg-[#f8f8f8] text-[12px] text-[#697ea8] leading-5">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-1">투데이</td>
                                <td className="border border-gray-300 px-1">쥬크박스</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-1">사진첩</td>
                                <td className="border border-gray-300 px-1">갤러리</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-1">게시판</td>
                                <td className="border border-gray-300 px-1">방명록</td>
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
                <Image src="/images/miniroom.gif" width="616" height="300" alt="" />
            </div>

            {/* 하단 */}
            <div className="w-full h-[300px]">
                <div className="inline-block relative font-ginto font-semibold text-xs text-[#459ebe] tracking-wide">
                    <span>What friends say</span>
                    <span className="absolute font-diary text-[10px] text-gray-500 right-[-73px] top-[3px]">한마디로 표현해</span>
                    <span className="absolute font-diary text-[10px] text-gray-500 right-[-83px] top-[1px]">봐</span>
                    <span className="absolute font-dotum text-[15px] text-gray-500 right-[-91px] top-[-3px]">~</span>
                </div>
                <hr className="border-gray-300" />
            </div>
        </div >
    );
}