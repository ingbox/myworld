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

  console.log(jukeboxList)

  const handlePlay = () => {
    const selectedTracks = jukeboxList.filter((t: any) => selected.has(t.id));
    if (selectedTracks.length === 0) return;
    addToQueue(selectedTracks);
  };

  return (
    <div className="p-4 space-y-3">
      <button
        onClick={handlePlay}
        className="px-3 py-[2px] text-gray-600 bg-[#fcfcfc] rounded-xs border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf]">
        듣기
      </button>
      {/* 리스트 */}
      <table className="table-fixed text-left w-full mt-2 border-t border-gray-400">
        <thead className="bg-[#f2f2f2]">
          <tr key={"head"}>
            <th className="font-light text-gray-600 w-10 px-2">
              <Image src="/images/jukebox/checkbox.svg" width={15} height={15} alt="" />
            </th>
            <th className="font-light text-gray-600 w-7 text-center">번호</th>
            <th className="w-8"></th>
            <th className="font-light text-gray-600 ">곡명</th>
            <th className="font-light text-gray-600">아티스트</th>
          </tr>
        </thead>
        <tbody>
          {jukeboxList.map((track: any) => (
            <tr className="text-[#3e4b64] leading-[1.1]
                          [background-image:linear-gradient(to_right,#cfcfcf_50%,transparent_0)]
                          [background-size:3px_1px] [background-repeat:repeat-x] [background-position:bottom]
                         
                          ">
              <td className="py-1 px-2">
                <input
                  type="checkbox"
                  checked={selected.has(track.id)}
                  onChange={() => toggleSelect(track.id)}
                />
              </td>
              <td className="py-1 text-xs text-center">{track.id}</td>
              <td></td>
              <td className="py-1">{track.title}</td>
              <td className="py-1">{track.artist}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 듣기 버튼 */}
      <button
        onClick={handlePlay}
        className="px-3 py-[2px] text-gray-600 rounded-xs bg-[#f8f8f8] border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf]">
        듣기
      </button>



      <div className="px-7">
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
                  <Link href={`/cy/visitor?page=${page}`} key={page}>
                    <span
                      className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold ${idx === currentPageList.length - 1 ? 'border-r border-gray-300' : ''
                        } ${page === currentPage ? 'text-orange-500' : 'text-gray-500'}`}
                    >
                      {page}
                    </span>
                  </Link>
                ))}

                {pageInfo.endPage < pageInfo.totalPage && (
                  <Link href={`/cy/visitor?page=${pageInfo.endPage + 1}`}>
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