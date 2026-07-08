import { Providers } from "@/components/cy/common/Providers";
import Image from "next/image";

export default async function Layout({ children }: { children: React.ReactNode }) {

    return (
        <Providers>
            <div className="rounded-t-lg bg-white overflow-hidden">
                {/* 툴바 */}
                <div className="flex items-center gap-3 px-2 h-14 bg-linear-to-b from-[#b3c7eb] to-transparent shadow-[0_8px_12px_-8px_rgba(0,0,0,0.1)] border-b border-b-[#d1d1d1]">
                    <Image src="/images/chat/first-icon.png" width={32} height={32} alt=""/>
                    <Image src="/images/chat/second-icon.png" width={32} height={32} alt=""/>
                    <Image src="/images/chat/third-icon.png" width={32} height={32} alt=""/>
                    <Image src="/images/chat/fourth-icon.png" width={32} height={32} alt=""/>
                    <Image src="/images/chat/fifth-icon.png" width={32} height={32} alt=""/>
                    <Image src="/images/chat/sixth-icon.png" width={32} height={32} alt=""/>
                    <Image src="/images/chat/seventh-icon.png" width={32} height={32} alt=""/>
                </div>
            {children}
            </div>
        </Providers>
    );
}