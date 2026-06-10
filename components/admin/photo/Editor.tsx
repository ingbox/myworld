'use client';
import { createPhoto } from "@/app/actions/admin/photo";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { Editor } from "@tiptap/react";
import { useState } from "react";

export default function Page() {

    const [title, setTitle] = useState<string>("");
    const [editor, setEditor] = useState<Editor | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(editor?.getHTML());

        await createPhoto({title, content: editor?.getHTML() || ""});
    };

    return (
        <div>
            {/* Tiptap Editor */}
            <form onSubmit={handleSubmit}>
                <input className="w-full p-2 border border-gray-300 rounded-md" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                <SimpleEditor onEditorReady={setEditor} />
                <button type="submit">확인</button>
            </form>

        </div>
    );
}