import FriendsLoader from "@/components/cy/common/FriendsLoader";
import { getVisitCount } from "@/lib/services/cy/common/visit/service";
import { Suspense } from "react";

export default async function LeftWrapper({ children }: { children: React.ReactNode }) {

    const visitCount = await getVisitCount();

    return (
        <div
            className="w-[320px] bg-[#a8d2e0] pt-3.75 pb-3.75 pl-3.75 overflow-hidden shrink-0
            max-md:w-full max-md:pr-3.75 max-md:pd-[3px]
            rounded-tl-md rounded-bl-md rounded-tr-[15px_6px] rounded-br-[15px_6px]
            max-md:rounded-tl-[15px] max-md:rounded-tr-[15px] max-md:rounded-bl-none max-md:rounded-br-none
            "
        >
            <div
                className="w-full h-full border-t-2 border-l-2 border-b-2 border-dashed border-[#c7e9f1] pt-1.25 pb-1.25 pl-1.25
                max-md:pr-1.25 max-md:border-r-2
                "
                style={{
                    borderTopRightRadius: '15px 6px',
                    borderTopLeftRadius: '15px',
                    borderBottomRightRadius: '15px 6px',
                    borderBottomLeftRadius: '15px',
                }}
            >
                <div
                    className="w-full h-full bg-[#f1f1f1] pt-1.25 pb-1.25 pl-1.25 pr-0.5
                    max-md:pr-1.25   
                    "
                    style={{
                        borderTopRightRadius: '15px 6px',
                        borderTopLeftRadius: '10px',
                        borderBottomRightRadius: '15px 6px',
                        borderBottomLeftRadius: '10px',
                    }}
                >
                    {/* 방문자 수 (Today / Total) */}
                    <div className="relative flex justify-center items-end h-10 text-gray-600
                    max-md:h-auto
                    ">
                        <div className="flex items-start gap-1 mb-1">
                            <span className="text-[10px] leading-3.25">TODAY</span>
                            <span className="text-sm leading-2.75">{visitCount?.today_count ?? 0}</span>
                            <span className="text-md leading-3.25">|</span>
                            <span className="text-[10px] leading-3.25">TOTAL</span>
                            <span className="text-sm leading-2.75">{visitCount?.total_count ?? 0}</span>
                        </div>

                        <Suspense fallback={null}>
                            <div className="absolute right-1 mb-px hidden max-md:block">
                                <FriendsLoader />
                            </div>
                        </Suspense>
                    </div>

                    {/* 프로필 이미지나 소개글 등이 들어올 자리 */}
                    <div className="w-full max-md:flex">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

