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
  hrefPrefix?: string;
};

export default function Accordion({
  title,
  image,
  items = [],
  depths = [],
  hrefPrefix = "/cy/profile",
}: AccordionProps) {
  const pathname = usePathname();

  const pathSegments = pathname ? pathname.split('/') : [];
  const [open, setOpen] = useState(
    !!(depths && depths.length > 0 && depths[0] && pathSegments.length > 3 && depths[0][0] === pathSegments[3])
  );

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
          <Image src="/images/shared/profile/arrow-down.png" alt="arrow" width={16} height={9} />
        </span>
      </button>
      {/* 2depth */}
      <div
        className={`overflow-hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 pl-6.25">
          {items.map((item, idx) => {
            const href = `${hrefPrefix}/${depths[idx][0]}/${depths[idx][1]}`;
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