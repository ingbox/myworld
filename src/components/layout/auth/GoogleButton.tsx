import { GoogleSignIn } from "@/app/actions/cy/auth";
import Image from 'next/image';

export default function GoogleButton() {

    return (
        <form
            action={GoogleSignIn}
        >
            <button type="submit" className="bg-white w-full text-white px-4 py-4 border border-gray-300 rounded-md flex items-center justify-center">
                <Image src="/images/shared/auth/google.png" alt="google" width={32} height={32} className="mr-2" />
                <span className="text-gray-600 font-bold">로그인하고 방명록 쓰기</span>
            </button>
        </form>
    );
}