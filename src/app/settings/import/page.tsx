import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JsonImporter } from "@/components/import/JsonImporter";

export default function ImportPage() {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="py-2">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าตั้งค่า</span>
        </Link>
      </div>

      <JsonImporter />
    </div>
  );
}
