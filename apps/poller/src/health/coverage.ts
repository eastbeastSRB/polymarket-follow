/**
 * The events of `coverage.jsonl`: where the record holds and where it does
 * not, each with its cause (COLLECTOR-PLAN §1.2 and §1.4 item 6).
 */
export type CoverageEvent =
  | { event: "process_start"; pid: number; lastHeartbeatAt: number | null }
  | { event: "process_stop"; pid: number; reason: string }
  | { event: "rest_pause"; state: "start" | "end" }
  | { event: "cut_line_dropped"; file: string; bytes: number }
  | { event: "compression_failed"; file: string; reason: string }
  | { event: "write_failed"; file: string; reason: string };
