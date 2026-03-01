"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminVideosRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center text-zinc-600 text-sm">
      Redirecting to admin panel…
    </div>
  );
}
