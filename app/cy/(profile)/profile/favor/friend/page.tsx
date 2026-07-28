import Form from "next/form";
import Image from "next/image";
import { getFriends } from "@/lib/services/cy/profile/favor/friends/service";
import { searchFriends } from "@/lib/services/cy/profile/favor/friends/action";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const { search = "" } = await searchParams;
    const friends = await getFriends(search);

    return (
        <>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <span className="text-xs font-light">임지섭님의 일촌은 </span>
                    <span className="text-3xl font-bold text-[#a27649]">{friends.length}</span>
                    <span className="text-xs font-light"> 명입니다.</span>
                </div>

                <Form action={searchFriends} className="relative">
                    <input name="search" className="text-sm w-full h-6 rounded-md border border-gray-300 px-1" type="text" placeholder="일촌 검색" defaultValue={search} />
                    <button type="submit">
                        <Image className="absolute top-1 right-1" src="/images/profile/search.svg" alt="search" width={16} height={16} />
                    </button>
                </Form>
            </div>

            <div className="grid grid-cols-5 grid-rows-3 h-100">
                {friends.map((friend) => (
                    <div key={friend.email} className="relative w-full h-full">
                        <Image src={friend.image_url} className="w-full h-full object-cover" fill alt="" />
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/50 text-white h-6 overflow-hidden">
                            <span className="text-sm truncate">{friend.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}