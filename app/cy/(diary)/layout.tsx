import Image from "next/image";
import Link from "next/link";

import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex w-full max-md:flex-col">
            <LeftWrapper>
                <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 p-5 max-md:h-auto">
                    <div className="mb-2">
                        <p className="text-[14px] text-[#459ebe] font-bold tracking-wide">DIARY</p>
                    </div>
                    <hr className="border border-gray-200" />
                    <div className="mt-1">
                        <div className="flex gap-2 mb-1 mt-3">
                            <div className="inline-block">
                                <Image src="/images/cy/common/file.png" width={16} height={14} alt="" />
                            </div>
                            <Link
                                href={`/cy/diary`}
                                className={`text-[15px] font-bold`}
                            >
                                다이어리
                            </Link>
                        </div>
                    </div>
                </div>

            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </div>
    )
}