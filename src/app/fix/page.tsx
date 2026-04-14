"use client";

import { Suspense } from "react";
import { FixDecisionPage } from "@/components/FixDecisionPage";

export default function FixPage() {
  return (
    <Suspense>
      <FixDecisionPage />
    </Suspense>
  );
}
