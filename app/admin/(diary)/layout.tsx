import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex w-full max-md:flex-col">
            <LeftWrapper>
                <div className="w-full h-[560px] bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5
                max-md:flex max-md:h-auto max-md:gap-2 max-md:p-2
                ">      
                </div>
            </LeftWrapper>

            <RightWrapper>
                {children}
            </RightWrapper>
        </div>
    )
}