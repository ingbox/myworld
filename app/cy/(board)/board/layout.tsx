import { auth } from "@/app/auth";

import { getVisitCount } from "@/app/actions/common/visit";
import { getBoardTypeList } from "@/app/actions/common/board";

import TypeList from "@/components/cy/board/TypeList";

export default async function Layout({ children }: { children: React.ReactNode }) {

    const session = await auth();
    const user = session?.user;

    const typeList = await getBoardTypeList();

    // 카테고리 가져오기
    const visitCount = await getVisitCount();

    return (
        <>
            <div
                className="w-[320px] bg-[#a8d2e0] pt-[15px] pb-[15px] pl-[15px] overflow-hidden"
                style={{
                    borderTopRightRadius: '15px 6px',
                    borderTopLeftRadius: '6px',
                    borderBottomRightRadius: '15px 6px',
                    borderBottomLeftRadius: '6px',
                }}
            >
                <div
                    className="w-full h-full border-t-2 border-l-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pl-[5px]" style={{
                        borderTopRightRadius: '15px 6px',
                        borderTopLeftRadius: '15px',
                        borderBottomRightRadius: '15px 6px',
                        borderBottomLeftRadius: '15px',
                    }}
                >
                    <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pl-[5px] pr-[2px]"
                        style={{
                            borderTopRightRadius: '15px 6px',
                            borderTopLeftRadius: '10px',
                            borderBottomRightRadius: '15px 6px',
                            borderBottomLeftRadius: '10px',
                        }}
                    >
                        <div className="flex justify-center items-end h-[40px] text-gray-600">
                            <div className="flex items-start gap-1 mb-1">

                                <span className="text-[10px] leading-[13px]">TODAY</span>
                                <span className="text-sm leading-[11px]">{visitCount?.today_count}</span>

                                <span className="text-md leading-[13px]">|</span>

                                <span className="text-[10px] leading-[13px]">TOTAL</span>
                                <span className="text-sm leading-[11px]">{visitCount?.total_count}</span>

                            </div>
                        </div>

                       
                        <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">
                            {/* 게시판 목록 */}
                            <TypeList typeList={typeList} />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="w-[720px] bg-[#a8d2e0] pt-[15px] pb-[15px] pr-[15px] overflow-hidden"
                style={{
                    borderTopLeftRadius: '15px 6px',
                    borderTopRightRadius: '6px',
                    borderBottomLeftRadius: '15px 6px',
                    borderBottomRightRadius: '6px',
                }}
            >
                <div
                    className="w-full h-full border-t-2 border-r-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pr-[5px]"
                    style={{
                        borderTopRightRadius: '15px',
                        borderTopLeftRadius: '15px 6px',
                        borderBottomRightRadius: '15px',
                        borderBottomLeftRadius: '15px 6px',
                    }}>
                    <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pr-[5px] pl-[2px]"
                        style={{
                            borderTopRightRadius: '10px',
                            borderTopLeftRadius: '15px 6px',
                            borderBottomRightRadius: '10px',
                            borderBottomLeftRadius: '15px 6px',
                        }}>
                        <div className="h-[40px] pt-3 px-2">
                            <p className="text-lg text-[#4a60ab] font-ginto font-bold">이름님의 미니홈피</p>
                        </div>
                        <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md">
                            {children}
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}