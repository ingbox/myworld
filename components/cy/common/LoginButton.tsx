"use client"

import { GoogleSignIn, GoogleSignOut } from "@/app/actions/cy/auth";
import { useSession } from "next-auth/react";

export default function LoginButton() {
    const { data: session, status } = useSession();

    if (session?.user) {
        return (
            <form className="flex flex-1" action={GoogleSignOut}>
                <button className="flex-1 w-full h-4.5 text-gray-700 text-xs bg-[#fed452] border border-[#b3a75f] rounded-xs">
                    로그아웃
                </button>
            </form>
        );
    } else {
        return (
            <form className="flex flex-1" action={GoogleSignIn}> 
                <button className="flex-1 w-full h-4.5 text-gray-700 text-xs bg-[#fed452] border border-[#b3a75f] rounded-xs">
                    로그인
                </button>
            </form>
        );
    }
}