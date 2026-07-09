import Image from "next/image";
import Link from "next/link";
import { getBoardTypeList } from "@/app/actions/common/board";

export default async function TypeList(searchParams: { type?: number; }) {

    const searchParam = await searchParams;
    const type = searchParam.type ?? 0;

    const typeList = await getBoardTypeList();

    return (
        <>
            <div className="mb-4">
                <p className="text-[14px] text-[#459ebe] font-bold tracking-wide">FREE BOARD</p>
            </div>
            <div className="flex gap-2 mb-1 text-[15px]">
                <div>
                    <Image src="/images/photo/file.png" width={16} height={14} alt="" />
                </div>
                <Link href={`/cy/photo/1`} className={`text-[15px] ${type == 0 ? 'font-bold' : ''}`}>전체보기</Link>
            </div>

            <hr className="border border-gray-200" />

            <div className="mt-1">
                {
                    typeList.map((list: any) => (
                        <div key={list.id} className="flex gap-2 mb-1">
                            <div className="inline-block">
                                <Image src="/images/photo/file.png" width={16} height={14} alt="" />
                            </div>
                            <Link
                                href={`/cy/photo/1?type=${list.id}`}
                                className={`text-[15px] ${type == list.id ? 'font-bold' : ''}`}
                            >
                                {list.name}
                            </Link>
                        </div>
                    ))}
            </div>
        </>
    );
}