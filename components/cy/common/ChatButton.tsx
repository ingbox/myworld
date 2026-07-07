"use client"

import { createRoom } from "@/app/actions/chat";

export default function ChatButton({user_email}: {user_email?: string}) {

    const handleClick = async() => {
        if(!user_email) {
            alert("로그인 후에 이용 가능합니다.")
            return
        }
        const response = await createRoom(user_email);

        // console.log("@@@@@@@@@@@@@@@@ response: @@@@@@@@@@@@@", response);

        // if(response) {
            window.open(`/chat/e2303af3-893a-4dc5-8630-e1d42828b43b`, "_blank", "width=420,height=700");
        // }
        
    }
      
      return (
        <button
          onClick={() => handleClick()}
          className="w-[58%] text-gray-700 text-xs bg-[#fed452] border border-[#b3a75f] px-2 rounded-xs"
        >
          채팅하기
        </button>
      );
}