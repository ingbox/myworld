import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "임지섭의 미니홈피",
  description: "안녕하세요! 여기는 임지섭의 미니홈피 입니다. 만나서 반갑습니다 ♡.(*⌒⌒*)~♡",
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "임지섭의 미니홈피",
    description: "안녕하세요! 여기는 임지섭의 미니홈피 입니다. 만나서 반갑습니다 ♡.(*⌒⌒*)~♡",
    images: "/og-image.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
          {children}
      </body>
    </html>
  );
}
