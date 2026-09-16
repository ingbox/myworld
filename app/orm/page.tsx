import { Suspense } from "react";
import Sidebar from "@/components/orm/Sidebar";
import CatGallery from "@/components/orm/CatGallery";
import CatCanvas from "@/components/orm/CatCanvas";
import CatCarousel from "@/components/orm/CatCarousel";
import {
  getCatList,
  getDrawingList,
  getRandomCat,
} from "@/src/lib/api/orm/service";

async function GallerySection() {
  const first = await getCatList();
  return <CatGallery initialCats={first.cats} initialTotal={first.totalCount} />;
}

async function CanvasSection() {
  const reference = await getRandomCat();
  return <CatCanvas initialCat={reference} />;
}

async function CarouselSection() {
  const { drawings, totalCount } = await getDrawingList();
  return <CatCarousel initialDrawings={drawings} initialTotal={totalCount} />;
}

export default function Page() {
  return (
    <div className="flex h-full bg-slate-950 text-slate-200">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto px-8 py-10">
          <h1 className="mb-3 text-4xl font-bold text-slate-100">
            Cat API <span className="text-violet-400">레퍼런스</span>
          </h1>
          <p className="leading-relaxed text-slate-400">
            Prisma 연습용 API 문서입니다. 고양이 사진 조회, 그림 업로드, 실시간 울음소리를
            테스트할 수 있습니다.
          </p>
          <div className="mt-4 flex gap-2">
            {["REST", "WebSocket", "Multipart"].map((tag) => (
              <span
                key={tag}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="mx-auto mb-16 h-64 animate-pulse rounded-xl bg-slate-800/60" />
          }
        >
          <GallerySection />
        </Suspense>

        <Suspense
          fallback={
            <div className="mx-auto mb-16 h-80 animate-pulse rounded-xl bg-slate-800/60" />
          }
        >
          <CanvasSection />
        </Suspense>

        <Suspense
          fallback={
            <div className="mx-auto mb-16 h-56 animate-pulse rounded-xl bg-slate-800/60" />
          }
        >
          <CarouselSection />
        </Suspense>
      </main>
    </div>
  );
}
