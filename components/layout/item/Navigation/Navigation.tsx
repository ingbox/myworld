'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
    const pathname = usePathname();

    const navigation = [
        {
            name: '홈',
            href: '/cy/home',
        },
        {
            name: '프로필',
            href: '/cy/profile',
        },
        {
            name: '다이어리',
            href: '/cy/diary',
        },
        {
            name: '쥬크박스',
            href: '/cy/jukebox',
        },
        {
            name: '사진첩',
            href: '/cy/photo/1',
        },
        {
            name: '게시판',
            href: '/cy/board',
        },
        // {
        //     name: '동영상',
        //     href: '/cy/video',
        // },
        {
            name: '방명록',
            href: '/cy/visitor',
        },
    ]

    return (
        <div className="absolute top-[100px] right-[2px] flex flex-col gap-[3px]
        max-md:fixed max-md:top-[160px]
        ">
            {navigation.map((item) => {
                const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                    <Link href={item.href} key={item.href}>
                        <div
                            className={
                                `w-[58px] h-[32px] rounded-r-sm border border-[#787c84] text-center text-[13px] leading-[32px] 
                                ${isActive ? "bg-white text-black relative" : "bg-[#2a8dac] text-white"}`
                            }
                            style={{
                                borderLeft: "none",
                            }}
                        >
                            {item.name}
                            {isActive && (
                                <span
                                    className="absolute left-[-2px] top-0 h-full w-[2px] bg-white"
                                    style={{ content: "''" }}
                                />
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

