import Accordion from "@/components/cy/profile/Accordion";
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
                            <div>
                                <span className="text-gray-600 pl-[20px] pb-1 block">JUKE BOX</span>
                                <hr className="border-dashed border-gray-200 mt-1" />
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