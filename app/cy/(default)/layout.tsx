import Image from "next/image";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";
import { getProfileImage } from "@/src/lib/api/shared/home/profile/service";
import { getEmoji, getStatusMessage } from "@/src/lib/api/cy/home/profile/service";

export default async function Layout({ children }: { children: React.ReactNode }) {

    const profileImage = await getProfileImage('ingbox01@gmail.com');
    const statusMessage = await getStatusMessage();
    const emoji = await getEmoji();

    return (
        <div className="flex w-full max-md:flex-col">
            <LeftWrapper>
                {/* 프로필 */}
                <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5
                max-md:flex max-md:h-auto max-md:gap-2 max-md:p-2
                ">
                    {/* 프사 */}
                    <div className="relative w-61.75 h-50 border-2 border-gray-300 mb-2
                    max-md:w-[30%] max-md:h-auto 
                    ">
                        <Image src={profileImage} style={{ objectFit: "cover" }} fill alt="" />
                    </div>

                    {/* TODAY IS.. */}
                    <div className="max-md:flex max-md:flex-col max-md:flex-1">
                        <div className="w-full h-6.5 border-2 border-gray-200 rounded-sm shadow-xs px-2 mb-2 max-md:mb-1">
                            <span className="font-ginto font-bold text-[10px] text-[#459ebe] leading-6 tracking-wide">TODAY IS..</span>
                            <span className="text-sm text-blue-400 max-sm:text-xs"> {emoji?.emoji}</span>
                        </div>

                        {/* 상태 메시지 */}
                        <div className="h-37.5 max-md:h-auto max-md:mb-1">
                            <p className="whitespace-pre-wrap text-sm text-blue-400 max-sm:text-xs">{statusMessage?.content}</p>
                        </div>

                        <div className="mt-auto">
                            <p className="text-[10px]">▸ HISTORY</p>
                            <hr />
                            <p className="font-bold text-[#4a60ab] mt-2 max-sm:text-sm max-md:mt-0">임지섭</p>
                            <p className="text-sm text-[#f4a562] max-sm:text-xs">ingbox01@gmail.com</p>
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