import type { Metadata } from "next";
import DownloadPage from "@/components/features/download/DownloadPage";

export const metadata: Metadata = {
  title: "Download Vero — Windows & Android",
  description:
    "Download Vero Browser for Windows (.exe) and the Android APK. Verified watching and mini-games.",
};

export default function DownloadRoutePage() {
  return <DownloadPage />;
}
