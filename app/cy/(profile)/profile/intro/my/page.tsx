import Image from "next/image";

export default function Page() {
  return (
    <>
      <div className="w-full h-[350px] relative mb-4">
        <Image
          src="/images/profile/my/banff.JPG"
          fill
          objectFit="cover"
          sizes="(max-width: 768px) 100%, (max-width: 1200px) 100%, 100% "
          alt="" />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm">자신을 의심하는 마음의 끈을 싹둑 잘라보세요.</p>
        <p className="text-sm">자기 자신조차 해낼 수 있다고 믿지 못하는데, 그 누가 당신을 믿어줄까요?</p>
        <p className="text-xs text-[#4a60ab]">"Believe in yourself, even when no one else does.”</p>
      </div>
    </>

  );
}