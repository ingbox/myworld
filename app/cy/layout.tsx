import Navigation from "@/components/layout/Navigation";
import { auth } from '@/app/auth';
import Jukebox from "@/components/layout/Jukebox";
import Image from "next/image";
import Link from "next/link";
import { getUserStats } from "../actions/common/home";
import ChatButton from "@/components/cy/common/ChatButton";

type StatKey = "erotic" | "famous" | "friendly" | "karma" | "kind";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const user = session?.user;

    const stats = await getUserStats();

    const statList: { key: StatKey; label: string; color: string }[] = [
        { key: "erotic", label: "에로틱", color: "#c6827f" },
        { key: "famous", label: "페이머스", color: "#92ae7e" },
        { key: "friendly", label: "프랜들리", color: "#81a2b5" },
        { key: "karma", label: "카르마", color: "#606163" },
        { key: "kind", label: "카인드", color: "#cdbe59" },
    ];

    return (
        <div className="bg-[#727272]">
            <div className="w-[1920px] h-screen"
                style={{
                    backgroundColor: '#727272',
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='20' y2='0' stroke='white' stroke-width='2' stroke-dasharray='2 2' stroke-opacity='0.15'/><line x1='0' y1='0' x2='0' y2='20' stroke='white' stroke-width='2' stroke-dasharray='2 2' stroke-opacity='0.15'/></svg>")`
                }}
            >
                <div className="w-7xl flex border-blue-500 mx-auto pt-10">

                    <div className="relative pr-8 flex">
                        {/* 프로필 컨텐츠 사이 클립 버튼 */}
                        <>
                            <div className="absolute top-[150px] left-[308px] w-[24px] h-[10px] border-2 border-[#c9c9c9] rounded-3xl bg-white shadow-sm"
                                style={{
                                    boxShadow: 'inset 11px 0 8px -8px rgba(0,0,0,0.4)'
                                }}
                            ></div>
                            <div className="absolute top-[185px] left-[308px] w-[24px] h-[10px] border-2 border-[#c9c9c9] rounded-3xl bg-white shadow-sm"
                                style={{
                                    boxShadow: 'inset 11px 0 8px -8px rgba(0,0,0,0.4)'
                                }}
                            ></div>
                            <div className="absolute bottom-[185px] left-[308px] w-[24px] h-[10px] border-2 border-[#c9c9c9] rounded-3xl bg-white shadow-sm"
                                style={{
                                    boxShadow: 'inset 11px 0 8px -8px rgba(0,0,0,0.4)'
                                }}
                            ></div>
                            <div className="absolute bottom-[150px] left-[308px] w-[24px] h-[10px] border-2 border-[#c9c9c9] rounded-3xl bg-white shadow-sm"
                                style={{
                                    boxShadow: 'inset 11px 0 8px -8px rgba(0,0,0,0.4)'
                                }}
                            ></div>
                        </>

                        {/* 네비게이션 버튼 */}
                        <Navigation user={user} />

                        {children}

                    </div>

                    <div className="w-[240px]">
                        <div className="h-6 font-ginto text-[11px] text-white leading-6 bg-[#676566] text-center tracking-wide rounded-md">
                            <Link href="/cy/home">GO BACK HOME</Link>
                        </div>
                        {/* 능력치 */}
                        <div className="bg-white px-4 py-4 relative">
                            <div className="mb-2">
                                {statList.map(({ key, label, color }) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="w-[44px] text-[12px] text-gray-600 tracking-tighter">
                                            {label}
                                        </span>
                                        <div
                                            className="relative w-20 h-[5px] bg-gray-200"
                                        >
                                            <div
                                                className="absolute top-0 left-0 h-[5px]"
                                                style={{
                                                    width: `${Number(stats[key]?.value)}%`,
                                                    backgroundColor: color,
                                                }}
                                            />
                                        </div>
                                        <div className="w-[12px] h-[12px] bg-gray-100 border border-gray-300 flex justify-center items-center">
                                            <Image src={Number(stats[key]?.diff) > 0 ? '/images/common/arrow-up.svg' : '/images/common/minus.svg'} width={10} height={10} alt="" />
                                        </div>

                                        <div className="min-w-[18px] text-[12px] text-gray-600">
                                            {Number(stats[key]?.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <hr className="border-gray-200" />

                            {/* 스크랩 즐겨찾기 */}
                            < div className="flex w-full bg-white" >
                                <span className="w-1/2 text-[12px] text-gray-600">스크랩</span>
                                <span className="w-1/2 text-[12px] text-gray-600">즐겨찾기</span>
                            </div>
                            <hr className="border-gray-200" />

                            {/* <div className="w-full bg-white">
                                <span className="w-1/2 text-[12px] text-gray-600">후원하기</span>
                            </div> */}

                            <div className="flex absolute w-full bottom-[-10px]">
                                <ChatButton user_email={user?.email}/>
                                <button className="w-[27%] text-gray-700 bg-[#fed452] text-xs border border-[#b3a75f] rounded-xs">로그인</button>
                            </div>
                        </div>

                        <Jukebox />

                    </div>


                </div>
            </div>
        </div>
    );
}