import type { ReactNode } from "react";

import { Navbar } from "@/components/Navbar";

export default function IncidentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
