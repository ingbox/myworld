import Image from "next/image";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";
import { getProfileImage } from "@/src/lib/api/shared/home/profile/service";

export default async function Layout({ children }: { children: React.ReactNode }) {

    const profileImage = await getProfileImage('ingbox01@gmail.com');

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
                            <Image className="inline ml-2" src="/images/shared/home/happy.png" width={13} height={13} alt="" />
                        </div>

                        {/* 상태 메시지 */}
                        <div className="h-37.5 max-md:h-auto max-md:mb-1">
                            <p className="text-sm text-blue-400 max-sm:text-xs">안녕하세요!</p>
                            <p className="text-sm text-blue-400 max-sm:text-xs">여기는 임지섭님의 미니홈피 입니다</p>
                            <p className="text-sm text-blue-400 max-sm:text-xs">만나서 반갑습니다 ♡.(*⌒⌒*)~♡</p>
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