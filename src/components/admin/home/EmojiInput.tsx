import { insertEmoji } from "@/src/lib/api/admin/home/action";
import Form from "next/form";

export default function EmojiInput() {
    return (
        <Form action={insertEmoji} className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold">이모지</span>
            <input type="text" className="w-10 h-6.5 border border-gray-300 rounded-md text-sm font-bold" maxLength={2} name="emoji"/>
            <button type="submit" className="w-10 h-6.5 bg-blue-500 text-white rounded-md text-sm font-bold">
               확인
            </button>
        </Form>
    )
}