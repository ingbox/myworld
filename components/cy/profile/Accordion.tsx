"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AccordionProps = {
  title: string;
  image: string;
  items: string[];
  depths: string[][];
};

export default function Accordion({ title, image ,items = [], depths = [] }: AccordionProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      {/* 1depth */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-3 text-sm text-left font-semibold text-gray-800"
      >
        <div className="flex items-center gap-2">
            <Image src={image} alt="image" width={16} height={16} />
            <span className="text-gray-600">{title}</span>
        </div>
        <span className={`${open ? "rotate-180" : ""}`}>
          <Image src="/images/arrow-down.png" alt="arrow" width={16} height={9} />
        </span>
      </button>
      {/* 2depth */}
      <div
        className={`overflow-hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 pl-[25px]">
          {items.map((item, idx) => {
            const href = `/cy/profile/${depths[idx][0]}/${depths[idx][1]}`;
            const active = pathname === href;
            return (
              <Link
                key={idx}
                href={href}
                className={`text-sm cursor-pointer ${
                  active
                    ? "font-semibold text-blue-900"
                    : "text-gray-600"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
}