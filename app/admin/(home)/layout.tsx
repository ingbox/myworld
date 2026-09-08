import ProfileImage from "@/components/admin/home/ProfileImage";

import { getProfileImage } from "@/src/lib/api/shared/home/profile/service";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";
import EmojiInput from "@/components/admin/home/EmojiInput";
import StatusMessageTextarea from "@/components/admin/home/StatusMessageTextarea";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const profileImage = await getProfileImage('ingbox01@gmail.com');

    return (
        <div className="flex w-full max-md:flex-col">
            <LeftWrapper>
                <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5
                max-md:flex max-sm:flex-col max-md:h-auto max-md:gap-2 max-md:p-2">

                    {/* 프사 */}
                    <div className="relative w-61.75 h-50 border-2 border-gray-300 mb-2
                    max-md:w-[30%] max-md:h-auto ">
                        <ProfileImage image={profileImage} />
                    </div>
                    {/* TODAY IS.. */}
                    <div className="max-md:flex max-md:flex-col max-md:flex-1">
                        <EmojiInput />
                        <StatusMessageTextarea />
                    </div>
                </div>
            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </div>
    )
}