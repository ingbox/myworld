import Link from "next/link";

export default function NavigationFallback() {
    const navigation = [
        "홈",
        "프로필",
        "다이어리",
        "쥬크박스",
        "사진첩",
        "게시판",
        "방명록",
    ];

    return (
        <div className="absolute top-[100px] right-[2px] flex flex-col gap-[3px]">
            {navigation.map((name) => (
                <div
                    key={name}
                    className="
                        w-[58px]
                        h-[32px]
                        rounded-r-sm
                        border
                        border-[#787c84]
                        border-l-0
                        bg-[#2a8dac]
                        text-white
                        text-center
                        text-[13px]
                        leading-[32px]
                    "
                >
                    {name}
                </div>
            ))}
        </div>
    );
}