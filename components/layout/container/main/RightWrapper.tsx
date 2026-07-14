export default async function LeftWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="w-[720px] bg-[#a8d2e0] pt-[15px] pb-[15px] pr-[15px] overflow-hidden
                 rounded-tl-[15px_6px] rounded-bl-[15px_6px] rounded-tr-[6px] rounded-br-[6px]
            max-md:w-full max-md:pl-[15px] max-md:pt-[3px]
            max-md:rounded-tl-none max-md:rounded-tr-none max-md:rounded-bl-[15px] max-md:rounded-br-[15px]
            "
        >
            <div
                className="w-full h-full border-t-2 border-r-2 border-b-2 border-dashed border-[#c7e9f1] pt-[5px] pb-[5px] pr-[5px]
                max-md:pl-[5px] max-md:border-l-2
                "
                style={{
                    borderTopRightRadius: '15px',
                    borderTopLeftRadius: '15px 6px',
                    borderBottomRightRadius: '15px',
                    borderBottomLeftRadius: '15px 6px',
                }}>
                <div className="w-full h-full bg-[#f1f1f1] pt-[5px] pb-[5px] pr-[5px] pl-[2px]
                max-md:pl-[5px]
                "
                    style={{
                        borderTopRightRadius: '10px',
                        borderTopLeftRadius: '15px 6px',
                        borderBottomRightRadius: '10px',
                        borderBottomLeftRadius: '15px 6px',
                    }}>
                    <div className="h-[40px] pt-3 px-2 max-md:h-auto max-md:pt-0">
                        <p className="text-lg text-[#4a60ab] font-ginto font-bold">이름님의 미니홈피</p>
                    </div>
                    <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md max-md:h-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

