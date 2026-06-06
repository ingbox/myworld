import { auth } from '@/app/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

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

                            {children}

                        </div>
                    </div>
                </div>
            </div>
    );
}