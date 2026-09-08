'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavigation() {
    const pathname = usePathname();

    const navigation = [
        {
            name: '홈',
            href: '/admin/home',
        },
        {
            name: '프로필',
            href: '/admin/profile',
        },
        {
            name: '다이어리',
            href: '/admin/diary',
        },
        {
            name: '쥬크박스',
            href: '/admin/jukebox',
        },
        {
            name: '사진첩',
            href: '/admin/photo',
        },
        {
            name: '게시판',
            href: '/admin/board',
        },
        // {
        //     name: '동영상',
        //     href: '/admin/video',
        // },
        {
            name: '방명록',
            href: '/admin/visitor',
        },
        {
            name: '채팅',
            href: '/admin/chat',
        },
    ]

    return (
        <div className="absolute top-25 right-0.5 flex flex-col gap-0.75">
            {navigation.map((item) => {
                const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                    <Link href={item.href} key={item.href}>
                        <div
                            className={
                                `w-14.5 h-8 rounded-r-sm border border-[#787c84] text-center text-[13px] leading-8 
                                ${isActive ? "bg-white text-black relative" : "bg-[#ff6b6b] text-white"}`
                            }
                            style={{
                                borderLeft: "none",
                            }}
                        >
                            {item.name}
                            {isActive && (
                                <span
                                    className="absolute -left-0.5 top-0 h-full w-0.5 bg-white"
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

