{/* 프로필 컨텐츠 사이 클립 버튼 */ }
export default function Clip() {
    return (
        <div className="max-md:hidden">
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
        </div>
    );
}

