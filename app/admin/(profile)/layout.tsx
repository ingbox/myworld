import Accordion from "@/components/cy/profile/Accordion";
import LeftWrapper from "@/components/layout/container/main/LeftWrapper";
import RightWrapper from "@/components/layout/container/main/RightWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full max-md:flex-col">
      <LeftWrapper>
        <div className="w-full h-140 bg-white rounded-[10px] border-2 border-gray-300 shadow-md p-5 max-md:h-auto">
          <div className="mb-2">
            <p className="text-[14px] text-[#459ebe] font-bold tracking-wide">
              PROFILE
            </p>
          </div>
          <hr className="border-dashed border-gray-200 mt-1" />
          <Accordion
            title="내 소개"
            image="/images/profile/intro.svg"
            items={["소개", "키워드", "히스토리", "42문답"]}
            depths={[
              ["intro", "my"],
              ["intro", "keyword"],
              ["intro", "history"],
              ["intro", "42"],
              ["intro", "general"],
            ]}
            hrefPrefix="/admin/profile"
          />
          <Accordion
            title="내 관심"
            image="/images/profile/friends.svg"
            items={["나의 일촌"]}
            depths={[["favor", "friend"]]}
            hrefPrefix="/admin/profile"
          />
        </div>
      </LeftWrapper>
      <RightWrapper>{children}</RightWrapper>
    </div>
  );
}
