"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/stores/usePlayerStore";

export default function Queue({ pageInfo, jukeboxList, currentPage, currentPageList }: { pageInfo: any, jukeboxList: any, currentPage: number, currentPageList: any }) {
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handlePlay = () => {
    const selectedTracks = jukeboxList.filter((t: any) => selected.has(t.id));
    if (selectedTracks.length === 0) return;
    addToQueue(selectedTracks);
  };

  return (
    <div className="min-w-0 w-full p-4 space-y-3">
      <button
        onClick={handlePlay}
        className="px-3 py-[2px] text-gray-600 bg-[#fcfcfc] rounded-xs border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf] text-sm">
        듣기
      </button>

      <div className="mt-2 w-full overflow-x-auto">
        <table className="w-full min-w-[280px] table-fixed text-left border-t border-gray-400">
          <colgroup>
            <col className="w-9" />
            <col className="w-8 max-sm:hidden" />
            <col />
            <col className="" />
          </colgroup>
          <thead className="bg-[#f2f2f2]">
            <tr key={"head"} className="text-sm">
              <th className="px-2 font-light text-gray-600">
                <Image src="/images/jukebox/checkbox.svg" width={15} height={15} alt="" />
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

      <button
        onClick={handlePlay}
        className="px-3 py-[2px] text-gray-600 rounded-xs bg-[#f8f8f8] border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf] text-sm">
        듣기
      </button>

      <div className="px-2 sm:px-7">
          <div className="flex justify-center items-center py-6">
              <nav className="inline-flex" aria-label="Pagination">
                {pageInfo.startPage > 1 && (
                  <Link href={`/cy/jukebox?page=${pageInfo.startPage - 1}`}>
                    <button>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#4a60ab" viewBox="0 0 20 20" className="size-5 mr-1">
                        <polygon points="13,5 6,10 13,15" fill="#9ca3af" />
                      </svg>
                    </button>
                  </Link>
                )}

                {currentPageList.map((page: number, idx: number) => (
                  <Link href={`/cy/jukebox?page=${page}`} key={page}>
                    <span
                      className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold ${idx === currentPageList.length - 1 ? 'border-r border-gray-300' : ''
                        } ${page === currentPage ? 'text-orange-500' : 'text-gray-500'}`}
                    >
                      {page}
                    </span>
                  </Link>
                ))}

                {pageInfo.endPage < pageInfo.totalPage && (
                  <Link href={`/cy/jukebox?page=${pageInfo.endPage + 1}`}>
                    <button>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="#4a60ab" viewBox="0 0 20 20" className="size-5">
                        <polygon points="7,5 14,10 7,15" fill="#9ca3af" />
                      </svg>
                    </button>
                  </Link>
                )}
              </nav>
            </div>
          </div>

      </div>
  );
}