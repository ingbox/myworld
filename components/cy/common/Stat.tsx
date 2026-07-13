import Image from 'next/image'
import { getUserStats } from '@/lib/services/common/stats/service';

type StatKey = "erotic" | "famous" | "friendly" | "karma" | "kind";

export default async function Stat() {

    const stats = await getUserStats();

    if (!stats) {
        return null;
    }

    const statList: { key: StatKey; label: string; color: string }[] = [
        { key: "erotic", label: "에로틱", color: "#c6827f" },
        { key: "famous", label: "페이머스", color: "#92ae7e" },
        { key: "friendly", label: "프랜들리", color: "#81a2b5" },
        { key: "karma", label: "카르마", color: "#606163" },
        { key: "kind", label: "카인드", color: "#cdbe59" },
    ];

    return (
        <div className="mb-2">
            {statList.map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-2">
                    <span className="w-[44px] text-[12px] text-gray-600 tracking-tighter">
                        {label}
                    </span>
                    <div
                        className="relative w-20 h-[5px] bg-gray-200"
                    >
                        <div
                            className="absolute top-0 left-0 h-[5px]"
                            style={{
                                width: `${Number(stats[key]?.value)}%`,
                                backgroundColor: color,
                            }}
                        />
                    </div>
                    <div className="w-[12px] h-[12px] bg-gray-100 border border-gray-300 flex justify-center items-center">
                        <Image src={Number(stats[key]?.diff) > 0 ? '/images/common/arrow-up.svg' : '/images/common/minus.svg'} width={10} height={10} alt="" />
                    </div>

                    <div className="min-w-[18px] text-[12px] text-gray-600">
                        {Number(stats[key]?.value)}
                    </div>
                </div>
            ))}
        </div>
    );
}