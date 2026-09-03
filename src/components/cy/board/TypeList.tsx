"use client"

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Type {
    id: number;
    name: string;
}

interface Props {
    typeList: Type[];
}

export default function TypeList({ typeList }: Props) {

    const searchParams = useSearchParams();
    const type = Number(searchParams.get("type") ?? 0);

    return (
        <>
            <div className="mb-4">
                <p className="font-ginto font-light text-[8px] text-gray-400 tracking-wide">FREE TALK</p>
                <p className="text-[14px] text-[#459ebe] font-bold tracking-wide">FREE BOARD</p>
            </div>
            <div className="flex gap-2 mb-1 text-[15px]">
                <div>
                    <Image src="/images/cy/common/file.png" width={16} height={14} alt="" />
                </div>
                <Link href={`/cy/board`} className={`text-[15px] ${type == 0 ? 'font-bold' : ''}`}>전체보기</Link>
            </div>

            <hr className="border border-gray-200" />

            <div className="mt-1">
                {
                    typeList.map((list: any) => (
                        <div key={list.id} className="flex gap-2 mb-1">
                            <div className="inline-block">
                                <Image src="/images/cy/common/file.png" width={16} height={14} alt="" />
                            </div>
                            <Link
                                href={`/cy/board?type=${list.id}`}
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