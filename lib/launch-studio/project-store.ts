import type { LaunchBriefInput } from "@/types/workflow";

const STORAGE_KEY = "launch_studio_project_config_v1";

export function loadProjectConfig(): LaunchBriefInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LaunchBriefInput;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProjectConfig(config: LaunchBriefInput): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

