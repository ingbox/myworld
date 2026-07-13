import { getVisitCount } from "@/lib/services/cy/common/visit/service";

export default async function LeftWrapper({ children }: { children: React.ReactNode }) {

    const visitCount = await getVisitCount();

    return (
        <div
            className="w-[320px] bg-[#a8d2e0] pt-[15px] pb-[15px] pl-[15px] overflow-hidden shrink-0
            max-md:w-full
            "
            style={{
                borderTopRightRadius: '15px 6px',
                borderTopLeftRadius: '6px',
                borderBottomRightRadius: '15px 6px',
                borderBottomLeftRadius: '6px',
            }}
        >

            <div
                className="w-full h-full border-t-2 border-l-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pl-[5px]"
                style={{
                    borderTopRightRadius: '15px 6px',
                    borderTopLeftRadius: '15px',
                    borderBottomRightRadius: '15px 6px',
                    borderBottomLeftRadius: '15px',
                }}
            >
                <div
                    className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pl-[5px] pr-[2px]"
                    style={{
                        borderTopRightRadius: '15px 6px',
                        borderTopLeftRadius: '10px',
                        borderBottomRightRadius: '15px 6px',
                        borderBottomLeftRadius: '10px',
                    }}
                >
                    {/* 방문자 수 (Today / Total) */}
                    <div className="flex justify-center items-end h-[40px] text-gray-600">
                        <div className="flex items-start gap-1 mb-1">
                            <span className="text-[10px] leading-[13px]">TODAY</span>
                            <span className="text-sm leading-[11px]">{visitCount?.today_count ?? 0}</span>
                            <span className="text-md leading-[13px]">|</span>
                            <span className="text-[10px] leading-[13px]">TOTAL</span>
                            <span className="text-sm leading-[11px]">{visitCount?.total_count ?? 0}</span>
                        </div>
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

