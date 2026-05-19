import type { Metadata } from "next";
import { WebDo24hLandingClient } from "@/components/web-do-24h/WebDo24hLandingClient";

export const metadata: Metadata = {
  title: "Web do 24h — LE Studio",
  description:
    "Pilotná ponuka moderného webu pripraveného podľa rozsahu a dodaných podkladov. LE Studio pripraví štruktúru, texty a WordPress-ready výstup.",
};

export default function WebDo24hPage() {
  return <WebDo24hLandingClient />;
}
