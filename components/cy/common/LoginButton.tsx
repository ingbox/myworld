"use client"

import { GoogleSignIn } from "@/app/actions/cy/auth";
import { useSession } from "next-auth/react";

export default function LoginButton() {
    const { data: session, status } = useSession();

    if (status === "loading" || session?.user) {
        // 로그인 중이거나 user가 있으면 아무 것도 렌더링하지 않음
        return null;
    }

    return (
        <>
        {session?.user ? (
            <></>
        ) : (
            <form className="flex-1" action={GoogleSignIn}> 
                <button className="flex-1 w-full text-gray-700 text-xs bg-[#fed452] border border-[#b3a75f] rounded-xs">
                    로그인
                </button>
            </form>
        )}
        </>
    );
}