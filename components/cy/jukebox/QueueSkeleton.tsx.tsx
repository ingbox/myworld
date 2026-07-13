import Image from "next/image";

export default function QueueSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {/* 상단 듣기 버튼 */}
      <button className="px-3 py-[2px] text-transparent bg-[#fcfcfc] rounded-xs border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf]">
        듣기
      </button>

      {/* 테이블 */}
      <table className="table-fixed text-left w-full mt-2 border-t border-gray-400">
        <thead className="bg-[#f2f2f2]">
          <tr>
            <th className="font-light text-gray-600 w-10 px-2 py-1">
              <div className="w-[15px] h-[15px] bg-gray-300 rounded-xs" />
            </th>
            <th className="font-light text-gray-400 w-7 text-center text-xs">번호</th>
            <th className="w-8"></th>
            <th className="font-light text-gray-400 text-xs">곡명</th>
            <th className="font-light text-gray-400 text-xs">아티스트</th>
          </tr>
        </thead>
        <tbody>
          {/* 실제 데이터와 완전히 같은 높이(leading-[1.1])와 도트 라인 처리 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <tr 
              key={i} 
              className="leading-[1.1] bg-[linear-gradient(to_right,#cfcfcf_50%,transparent_0)] bg-size-[3px_1px] bg-repeat-x bg-bottom"
            >
              <td className="py-1 px-2">
                <div className="w-3 h-3 bg-gray-200 rounded-xs" />
              </td>
              <td className="py-1 text-center">
                <div className="w-4 h-3 bg-gray-200 rounded-xs mx-auto" />
              </td>
              <td></td>
              {/* 텍스트가 들어갈 자리에 알맞은 크기의 회색 바(Bar) 배치 */}
              <td className="py-1 pr-12">
                <div className="w-full h-3 bg-gray-200 rounded-xs" />
              </td>
              <td className="py-1 pr-20">
                <div className="w-full h-3 bg-gray-200 rounded-xs" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 하단 듣기 버튼 */}
      <button className="px-3 py-[2px] text-transparent bg-[#f8f8f8] rounded-xs border border-[#9a9a9a] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#bfbfbf]">
        듣기
      </button>

      {/* 페이지네이션 (숫자 폰트 스타일 및 간격 일치) */}
      <div className="px-7">
        <div className="flex justify-center items-center py-6">
          <nav className="inline-flex" aria-label="Pagination">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className={`h-5 px-2 mr-0 border-l border-gray-300 font-semibold text-transparent bg-gray-200 rounded-xs mx-0.5 ${
                  idx === 4 ? 'border-r border-gray-300' : ''
                }`}
                style={{ width: '24px' }} // 대략적인 숫자 너비 유지
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