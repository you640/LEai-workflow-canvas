"use client";

import { useEffect, useState } from "react";
import { LaunchStudioApp } from "@/components/workflow/LaunchStudioApp";

export function LaunchStudioClientGate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="app-shell flex h-[100dvh] items-center justify-center bg-zinc-950 text-zinc-200">
        Launch Studio is loading...
      </div>
    );
  }

  return <LaunchStudioApp />;
}
