import { Suspense } from "react";
import Navigation from "@/components/layout/item/Navigation/Navigation"
import Jukebox from "@/components/jukebox/Jukebox";
import Link from "next/link";
// import { GoogleSignIn } from "@/app/actions/cy/auth";

import Clip from "@/components/layout/item/Clip";

import Stat from "@/components/cy/common/Stat";
import NavigationFallback from "@/components/layout/item/Navigation/FallbackNavigation";
import ChatButton from "@/components/cy/common/ChatButton";
import LoginButton from "@/components/cy/common/LoginButton";
import { SessionProvider } from "next-auth/react";

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-w-335 min-h-screen
        max-md:min-w-0
        "
            style={{
                backgroundColor: '#727272',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='20' y2='0' stroke='white' stroke-width='2' stroke-dasharray='2 2' stroke-opacity='0.15'/><line x1='0' y1='0' x2='0' y2='20' stroke='white' stroke-width='2' stroke-dasharray='2 2' stroke-opacity='0.15'/></svg>")`
            }}
        >

            <div className="max-w-7xl flex border-blue-500 mx-auto pt-10
            max-md:flex-col max-md:pt-1
            ">

                <div className="relative pr-8 flex">
                    {/* 프로필 컨텐츠 사이 클립 버튼 */}
                    <Clip />
                    {/* 네비게이션 버튼 */}
                    <Suspense fallback={<NavigationFallback />}>
                        <Navigation />
                    </Suspense>
                    {children}

                </div>

                <div className="w-60 max-md:w-full max-md:flex max-sm:flex-col max-md:order-first max-md:mb-3 max-sm:mb-0 max-md:gap-1 max-sm:gap-2">
                    <div>
                        <div className="h-6 font-ginto text-[11px] text-white leading-6 bg-[#676566] text-center tracking-wide rounded-md">
                            <Link href="/cy/home">GO BACK HOME</Link>
                        </div>
                        {/* 능력치 */}
                        <div className="bg-white px-4 py-4 relative max-md:px-2 max-md:py-2">
                            <Stat />
                            <hr className="border-gray-200 max-md:hidden" />

                            {/* 스크랩 즐겨찾기 */}
                            < div className="flex w-full bg-white max-md:hidden" >
                                <span className="w-1/2 text-[12px] text-gray-600">스크랩</span>
                                <span className="w-1/2 text-[12px] text-gray-600">즐겨찾기</span>
                            </div>
                            <hr className="border-gray-200 max-md:hidden" />

                            <div className="flex w-full absolute left-0 -bottom-2.5 max-h-4.5 justify-center items-center px-4">
                                <SessionProvider>
                                  <div className="flex w-full items-center">
                                        <ChatButton />
                                        <LoginButton />
                                  </div>
                                </SessionProvider>
                            </div>
                        </div>
                    </div>

                    <Jukebox />

                </div>
            </div>
        </div>
    );
}