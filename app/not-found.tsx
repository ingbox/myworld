import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Image src="/images/error/404.png" width={262} height={187} alt="" />
        </div>
    )
}