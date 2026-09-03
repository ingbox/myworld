import FriendsLoader from "@/components/cy/common/FriendsLoader";
import Link from "next/link";
import { Suspense } from "react";

export default async function RightWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="w-180 bg-[#a8d2e0] pt-3.75 pb-3.75 pr-3.75 overflow-hidden
                 rounded-tl-[15px_6px] rounded-bl-[15px_6px] rounded-tr-md rounded-br-md
            max-md:w-full max-md:pl-3.75 max-md:pt-0.75
            max-md:rounded-tl-none max-md:rounded-tr-none max-md:rounded-bl-[15px] max-md:rounded-br-[15px]
            "
        >
            <div
                className="w-full h-full border-t-2 border-r-2 border-b-2 border-dashed border-[#c7e9f1] pt-1.25 pb-1.25 pr-1.25
                max-md:pl-1.25 max-md:border-l-2
                "
                style={{
                    borderTopRightRadius: '15px',
                    borderTopLeftRadius: '15px 6px',
                    borderBottomRightRadius: '15px',
                    borderBottomLeftRadius: '15px 6px',
                }}>
                <div className="w-full h-full bg-[#f1f1f1] pt-1.25 pb-1.25 pr-1.25 pl-0.5
                max-md:pl-1.25
                "
                    style={{
                        borderTopRightRadius: '10px',
                        borderTopLeftRadius: '15px 6px',
                        borderBottomRightRadius: '10px',
                        borderBottomLeftRadius: '15px 6px',
                    }}>
                    <div className="flex justify-between items-end h-10 pt-3 px-2 max-md:h-auto max-md:pt-0">
                        <p className="text-lg text-[#4a60ab] font-ginto font-bold max-sm:text-base">임지섭의 미니홈피</p>
                        <div className="flex flex-col">
                            <Suspense fallback={null}>
                                <div className="block max-md:hidden">
                                    <FriendsLoader />
                                </div>
                            </Suspense>
                            <Link href="https://www.gieok.my" className="text-[10px] text-gray-500 inline-block">https://www.gieok.my</Link>
                        </div>
                    </div>
                    <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 shadow-md max-md:h-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

