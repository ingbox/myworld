import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <LeftWrapper>
                {/* 프로필 */}
                <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5">
                    <div>
                        <span className="text-gray-600 pl-[20px] pb-1 block">JUKE BOX</span>
                        <hr className="border-dashed border-gray-200 mt-1" />
                    </div>
                </div>
            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </>
    )
}