"use client";

import { useEffect, useState } from "react";
import { LaunchStudioApp } from "@/components/workflow/LaunchStudioApp";
import { useI18n } from "@/lib/i18n/client";

export function LaunchStudioClientGate() {
  const [mounted, setMounted] = useState(false);
  const { translate } = useI18n();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="app-shell launch-studio-shell flex items-center justify-center bg-zinc-950 text-zinc-200">
        {translate("app.loading")}
      </div>
    );
  }

  return <LaunchStudioApp />;
}
