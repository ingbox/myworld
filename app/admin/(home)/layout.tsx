import Image from "next/image";
import ProfileImage from "@/components/admin/home/ProfileImage";

import { getProfileImage } from "@/src/lib/api/shared/home/profile/service";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const profileImage = await getProfileImage('ingbox01@gmail.com');

    return (
        <>
            <LeftWrapper>
                <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">

                    {/* 프사 */}
                    <div className="relative w-61.75 h-50 border-2 border-gray-300 mb-2">
                        <ProfileImage image={profileImage} />
                    </div>
                    {/* TODAY IS.. */}
                    <div className="w-full h-6.5 border-2 border-gray-200 rounded-sm shadow-xs px-2 mb-2">
                        <span className="font-ginto font-bold text-[10px] text-[#459ebe] leading-6 tracking-wide">TODAY IS..</span>
                        <Image className="inline ml-2" src="/images/shared/home/happy.png" width={13} height={13} alt="" />
                    </div>

                    {/* 상태 메시지 */}
                    <div>
                        <p className="text-sm text-blue-400">안녕하세요!</p>
                        <p className="text-sm text-blue-400">여기는 임지섭님의 미니홈피 입니다</p>
                        <p className="text-sm text-blue-400">만나서 반갑습니다 ♡.(*⌒⌒*)~♡</p>
                    </div>
                </div>
            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </>
    )
}