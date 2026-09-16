import { Inter, JetBrains_Mono } from "next/font/google";

export const metadata = {
  title: "CatAPI - prisma practice",
  description: "CatAPI - prisma practice",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} ${jetbrains.className} h-full`}>
      {children}
    </div>
  );
}
