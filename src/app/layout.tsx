import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TodayFlow",
  description: "오늘 할 일을 달력 기반으로 관리하는 투두 앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
