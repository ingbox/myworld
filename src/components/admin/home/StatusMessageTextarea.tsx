import { insertStatusMessage } from "@/src/lib/api/admin/home/action";
import Form from "next/form";

export default function StatusMessageTextarea() {
    return (
        <Form action={insertStatusMessage} className="flex flex-col gap-2">
            <textarea
                name="content"
                className="h-37.5 w-full resize-none text-sm text-blue-400 border border-gray-300 rounded-md p-1 max-sm:text-xs"
                placeholder="상태 메시지를 입력하세요"
            />
            <button
                type="submit"
                className="h-6.5 w-10 self-end rounded-md bg-blue-500 text-sm font-bold text-white"
            >
                확인
            </button>
        </Form>
    );
}
