"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function PlayList({ jukeboxList }: { jukeboxList: any }) {

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };


    useEffect(() => {
        console.log(selected);
    }, [selected]);


    return (
        <div className="min-w-0 w-full p-4 space-y-3">

            <div className="mt-2 w-full overflow-x-auto overflow-y-auto max-h-125">
                <table className="w-full min-w-70 table-fixed text-left border-t border-gray-400">
                    <colgroup>
                        <col className="w-9" />
                        <col className="w-8 max-sm:hidden" />
                        <col />
                        <col className="" />
                    </colgroup>
                    <thead className="bg-[#f2f2f2]">
                        <tr key={"head"} className="text-sm">
                            <th className="px-1.5 font-light text-gray-600">
                                <Image src="/images/cy/jukebox/checkbox.png" width={17} height={17} alt="" />
                            </th>
                            <th className="text-center font-light text-gray-600 max-sm:hidden">번호</th>
                            <th className="font-light text-gray-600">곡명</th>
                            <th className="font-light text-gray-600">아티스트</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jukeboxList.map((track: any) => (
                            <tr
                                key={track.id}
                                className="text-[#3e4b64] leading-[1.1]
                            bg-[linear-gradient(to_right,#cfcfcf_50%,transparent_0)]
                            bg-size-[3px_1px] bg-repeat-x bg-bottom text-sm
                            ">
                                <td className="px-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={selected.has(track.id)}
                                        onChange={() => toggleSelect(track.id)}
                                    />
                                </td>
                                <td className="py-1 text-center text-xs max-sm:hidden">{track.id}</td>
                                <td className="min-w-0 truncate py-1 pr-2">{track.title}</td>
                                <td className="min-w-0 truncate py-1 pr-2">{track.artist}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    )
}