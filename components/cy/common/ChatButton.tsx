'use client'

export default function ChatButton() {
    return (
        <button
            onClick={() => window.open('/chat', '_blank', 'width=420,height=700')}
            className="w-[58%] text-gray-700 text-xs bg-[#fed452] border border-[#b3a75f] px-2 rounded-xs"
        >
            채팅하기
        </button>
    );
}