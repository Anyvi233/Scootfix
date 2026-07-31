"use client";

import dynamic from "next/dynamic";

// ssr:false MUST live in a Client Component — not allowed in Server Components
const HomePageClient = dynamic(
  () => import("./_components/HomePageClient"),
  { ssr: false }
);

export default function HomeClientWrapper() {
  return <HomePageClient />;
}
