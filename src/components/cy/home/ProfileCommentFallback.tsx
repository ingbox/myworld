import Image from "next/image";

export default function ProfileCommentFallback() {
    return (
        <>
            <form className="h-[50px] bg-gray-100 mt-2 flex items-center border border-gray-200 gap-1 px-2">
                <span className="text-[13px] text-[#459ebe] font-bold tracking-wide">
                    Friends say
                </span>

                <Image
                    src="/images/cy/home/sun.svg"
                    width={16}
                    height={16}
                    alt=""
                />

                <input
                    disabled
                    placeholder="일촌과 나누고 싶은 이야기를 남겨보세요~!"
                    className="inline-block w-[450px] h-[26px] bg-white border border-gray-300 px-1 text-gray-400"
                />

                <button
                    type="button"
                    disabled
                    className="w-[40px] h-[26px] bg-white border border-gray-300 shadow text-gray-400"
                >
                    확인
                </button>
            </form>

            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                    <div className="w-full py-1">
                        <span className="text-[15px] text-gray-300">
                            불러오는 중...
                        </span>
                    </div>
                    <hr />
                </div>
            ))}
        </>
    );
}