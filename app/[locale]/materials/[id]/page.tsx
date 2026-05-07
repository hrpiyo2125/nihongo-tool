import type { Metadata } from "next";
import MaterialDetailClient from "./MaterialDetailClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MaterialDetailPage() {
  return <MaterialDetailClient />;
}
