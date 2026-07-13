import { getBoardTypeList } from "@/lib/services/common/board/service";

import TypeList from "@/components/cy/board/TypeList";
import { Suspense } from "react";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {

    const typeList = await getBoardTypeList();

    return (
        <>
            <LeftWrapper>
                <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">
                    {/* 게시판 목록 */}
                    <Suspense>
                        <TypeList typeList={typeList} />
                    </Suspense>
                </div>
            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </>
    )
}