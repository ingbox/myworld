'use client'
import { saveUserStats } from "@/app/actions/admin/home";
import Link from "next/link";

import { useState } from "react";

type StatKey = "erotic" | "famous" | "friendly" | "karma" | "kind";

export default function UserStats({ initStats }: any) {

    const [stats, setStats] = useState<Record<StatKey, number>>({
        erotic: initStats["erotic"].value ?? 0,
        famous: initStats["famous"].value ?? 0,
        friendly: initStats["friendly"].value ?? 0,
        karma: initStats["karma"].value ?? 0,
        kind: initStats["kind"].value ?? 0,
    });

    const [dragging, setDragging] = useState<StatKey | null>(null);

    // 값 계산
    const handleChange = (key: StatKey, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.round((x / rect.width) * 100);
        setStats(prev => ({
            ...prev,
            [key]: Math.max(0, Math.min(100, percent)),
        }));
    };

    // 저장 버튼
    const handleSave = async () => {
        await saveUserStats(stats);
    };

    const statList: { key: StatKey; label: string; color: string }[] = [
        { key: "erotic", label: "에로틱", color: "#c6827f" },
        { key: "famous", label: "페이머스", color: "#92ae7e" },
        { key: "friendly", label: "프랜들리", color: "#81a2b5" },
        { key: "karma", label: "카르마", color: "#606163" },
        { key: "kind", label: "카인드", color: "#cdbe59" },
    ];

    return (
        <div className="w-[240px]">
            <div className="h-6 font-ginto text-[11px] text-white leading-6 bg-[#676566] text-center tracking-wide rounded-md">
                <Link href="/cy/home">GO BACK HOME</Link>
            </div>
            {/* 능력치 */}
            <div className="bg-white px-4 py-4">
                <div className="mb-2">
                    {statList.map(({ key, label, color }) => (
                        <div key={key} className="flex items-center gap-4">
                            <span className="w-[44px] text-[12px] text-gray-600 tracking-[-0.05em]">
                                {label}
                            </span>
                            <div
                                className="relative w-20 h-[5px] bg-gray-200 cursor-pointer"
                                onMouseDown={(e) => {
                                    setDragging(key);
                                    handleChange(key, e);
                                }}
                                onMouseMove={(e) => {
                                    if (dragging === key) handleChange(key, e);
                                }}
                                onMouseUp={() => setDragging(null)}
                                onMouseLeave={() => setDragging(null)}
                            >
                                <div
                                    className="absolute top-0 left-0 h-[5px]"
                                    style={{
                                        width: `${stats[key]}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>

                            <div className="min-w-[18px] text-[12px] text-gray-600">
                                {stats[key]}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    className="w-full h-8 border border-gray-300 text-gray-500 text-sm rounded"
                >
                    저장하기
                </button>
            </div>
        </div>
    );
}