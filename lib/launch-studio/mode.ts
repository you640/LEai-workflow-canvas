export const EXECUTION_MODE = "live" as const;

export function isLiveMode(): boolean {
  return EXECUTION_MODE === "live";
}

