import Link from "next/link";

import { getRoomList } from "@/src/lib/api/admin/chat/service";

import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";



export default async function Layout({ children }: { children: React.ReactNode }) {

    const rooms = await getRoomList();

    return (
        <>
            <LeftWrapper>
                {/* 채팅방 리스트 */}
                <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">
                    <ul className="space-y-2">
                        {rooms?.result?.map((item: any) => (
                            <li key={item.id}>
                                <Link
                                    href={`/admin/chat/${item.id}`}
                                    className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 border border-gray-300"
                                >
                                    {item.user_email}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </>
    )
}