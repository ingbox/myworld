'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type StatKey = 'erotic' | 'famous' | 'friendly' | 'karma' | 'kind';

type StatValue = {
    value: number;
    diff: number;
};

interface Props {
    stats: Record<string, StatValue>;
}

const statList: { key: StatKey; label: string; color: string }[] = [
    { key: 'erotic', label: '에로틱', color: '#c6827f' },
    { key: 'famous', label: '페이머스', color: '#92ae7e' },
    { key: 'friendly', label: '프랜들리', color: '#81a2b5' },
    { key: 'karma', label: '카르마', color: '#606163' },
    { key: 'kind', label: '카인드', color: '#cdbe59' },
];

export default function StatMob({ stats }: Props) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % statList.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const stat = statList[index];
    const value = Number(stats[stat.key]?.value);
    const diff = Number(stats[stat.key]?.diff);

    return (
        <div className="md:hidden flex items-center gap-2 justify-center">
            <span className="w-[44px] text-[12px] text-gray-600 tracking-tighter">
                {stat.label}
            </span>

            <div className="relative w-20 h-[5px] bg-gray-200">
                <div
                    className="absolute top-0 left-0 h-[5px]"
                    style={{
                        width: `${value}%`,
                        backgroundColor: stat.color,
                    }}
                />
            </div>

            <div className="w-[12px] h-[12px] bg-gray-100 border border-gray-300 flex items-center justify-center">
                <Image
                    src={diff > 0 ? '/images/cy/common/arrow-up.svg' : '/images/cy/common/minus.svg'}
                    width={10}
                    height={10}
                    alt=""
                />
            </div>

            <div className="min-w-[18px] text-[12px] text-gray-600">
                {value}
            </div>
        </div>
    );
}