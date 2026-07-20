import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <div
                className="w-[320px] bg-[#a8d2e0] pt-[15px] pb-[15px] pl-[15px] overflow-hidden"
                style={{
                    borderTopRightRadius: '15px 6px',
                    borderTopLeftRadius: '6px',
                    borderBottomRightRadius: '15px 6px',
                    borderBottomLeftRadius: '6px',
                }}
            >
                <div
                    className="w-full h-full border-t-2 border-l-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pl-[5px]" style={{
                        borderTopRightRadius: '15px 6px',
                        borderTopLeftRadius: '15px',
                        borderBottomRightRadius: '15px 6px',
                        borderBottomLeftRadius: '15px',
                    }}
                >
                    <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pl-[5px] pr-[2px]"
                        style={{
                            borderTopRightRadius: '15px 6px',
                            borderTopLeftRadius: '10px',
                            borderBottomRightRadius: '15px 6px',
                            borderBottomLeftRadius: '10px',
                        }}
                    >
                        <div className="h-[40px]">

                        </div>

                        {/* 프로필 */}
                        <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">

                            {/* 프사 */}
                            <div className="relative w-[247px] h-[200px] border-2 border-gray-300 mb-2">
                                <Image src="/images/profile.jpg" style={{ objectFit: "cover" }} fill alt="" />
                            </div>

                            {/* TODAY IS.. */}
                            <div className="w-full h-[26px] border-2 border-gray-200 rounded-sm shadow-xs px-2 mb-2">
                                <span className="font-ginto font-bold text-[10px] text-[#459ebe] leading-6 tracking-wide">TODAY IS..</span>
                                <Image className="inline ml-2" src="/images/common/happy.png" width={13} height={13} alt="" />
                            </div>

                            {/* 상태 메시지 */}
                            <div>
                                <p className="text-sm text-blue-400">안녕하세요!</p>
                                <p className="text-sm text-blue-400">여기는 임지섭님의 미니홈피 입니다</p>
                                <p className="text-sm text-blue-400">만나서 반갑습니다 ♡.(*⌒⌒*)~♡</p>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <div
                className="w-[720px] bg-[#a8d2e0] pt-[15px] pb-[15px] pr-[15px] overflow-hidden"
                style={{
                    borderTopLeftRadius: '15px 6px',
                    borderTopRightRadius: '6px',
                    borderBottomLeftRadius: '15px 6px',
                    borderBottomRightRadius: '6px',
                }}
            >
                <div
                    className="w-full h-full border-t-2 border-r-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pr-[5px]"
                    style={{
                        borderTopRightRadius: '15px',
                        borderTopLeftRadius: '15px 6px',
                        borderBottomRightRadius: '15px',
                        borderBottomLeftRadius: '15px 6px',
                    }}>
                    <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pr-[5px] pl-[2px]"
                        style={{
                            borderTopRightRadius: '10px',
                            borderTopLeftRadius: '15px 6px',
                            borderBottomRightRadius: '10px',
                            borderBottomLeftRadius: '15px 6px',
                        }}>
                        <div className="h-[40px] pt-3 px-2">
                            <p className="text-lg text-[#4a60ab] font-ginto font-bold">이름님의 미니홈피</p>
                        </div>
                        <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md">
                            {children}
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}