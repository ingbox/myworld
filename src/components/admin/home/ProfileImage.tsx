"use client";
import Image from "next/image";

export default function ProfileImage({ image }: { image: string }) {
  return (
    <div className="p-4 space-y-3">
      <Image src={image} style={{ objectFit: "cover" }} fill alt="" />
    </div>
  );
}