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
            name: '갤러리',
            href: '/admin/gallery',
        },
        {
            name: '게시판',
            href: '/admin/board',
        },
        {
            name: '동영상',
            href: '/admin/video',
        },
        {
            name: '방명록',
            href: '/admin/visitor',
        },
    ]

    return (
        <div className="absolute top-[100px] right-[2px] flex flex-col gap-[3px]">
            {navigation.map((item) => {
                const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                    <Link href={item.href} key={item.href}>
                        <div
                            className={
                                `w-[58px] h-[32px] rounded-r-sm border-1 border-[#787c84] text-center text-[13px] leading-[32px] 
                                ${isActive ? "bg-white text-black relative" : "bg-[#ff6b6b] text-white"}`
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

