import type { NodeStatus } from "@/types/workflow";

export const NODE_STATUS: Record<string, NodeStatus> = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  WARNING: "warning",
  FAILED: "failed",
};
