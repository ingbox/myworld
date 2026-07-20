export default function QueueSkeleton() {
  return (
    <div className="min-w-0 w-full p-4 space-y-3 animate-pulse">
      <button className="px-3 py-[2px] text-transparent bg-[#fcfcfc] rounded-xs border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf]">
        듣기
      </button>

      <div className="mt-2 w-full overflow-x-auto">
        <table className="w-full min-w-[280px] table-fixed text-left border-t border-gray-400">
          <colgroup>
            <col className="w-9" />
            <col className="w-8" />
            <col />
            <col className="" />
          </colgroup>
          <thead className="bg-[#f2f2f2]">
            <tr>
              <th className="px-2 py-1 font-light text-gray-600">
                <div className="mx-auto h-[15px] w-[15px] rounded-xs bg-gray-300" />
              </th>
              <th className="py-1 text-center text-xs font-light text-gray-400">번호</th>
              <th className="py-1 text-xs font-light text-gray-400">곡명</th>
              <th className="py-1 text-xs font-light text-gray-400">아티스트</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr
                key={i}
                className="bg-[linear-gradient(to_right,#cfcfcf_50%,transparent_0)] bg-size-[3px_1px] bg-repeat-x bg-bottom leading-[1.1]"
              >
                <td className="px-2 py-1">
                  <div className="mx-auto h-3 w-3 rounded-xs bg-gray-200" />
                </td>
                <td className="py-1 text-center">
                  <div className="mx-auto h-3 w-4 rounded-xs bg-gray-200" />
                </td>
                <td className="min-w-0 py-1 pr-2">
                  <div className="h-3 w-full max-w-40 rounded-xs bg-gray-200 sm:max-w-none" />
                </td>
                <td className="min-w-0 py-1 pr-2 max-sm:hidden">
                  <div className="h-3 w-full max-w-32 rounded-xs bg-gray-200 sm:max-w-none" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="px-3 py-[2px] text-transparent bg-[#f8f8f8] rounded-xs border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf]">
        듣기
      </button>

      <div className="px-2 sm:px-7">
        <div className="flex items-center justify-center py-6">
          <nav className="inline-flex" aria-label="Pagination">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className={`mx-0.5 h-5 min-w-5 rounded-xs border-l border-gray-300 bg-gray-200 px-2 font-semibold text-transparent ${
                  idx === 4 ? 'border-r border-gray-300' : ''
                }`}
              >
                &nbsp;
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
