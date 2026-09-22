import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full max-md:flex-col">
      <div className="max-sm:hidden">
        <LeftWrapper>
          <div className="w-full h-full bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5 max-h-140 overflow-hidden
    max-md:flex max-sm:flex-col max-md:h-auto max-md:gap-2 max-md:p-2">
          </div>
        </LeftWrapper>
      </div>

      <RightWrapper>
        {children}
      </RightWrapper>
    </div>
  );
}
