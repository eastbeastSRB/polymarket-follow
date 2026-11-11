/**
 * The events of `coverage.jsonl`: where the record holds and where it does
 * not, each with its cause (COLLECTOR-PLAN §1.2 and §1.4 item 6). Times are
 * wall-clock ms; `lastFrameAt` is the last data frame before a gap.
 */
export type CoverageEvent =
  | { event: "process_start"; pid: number; lastHeartbeatAt: number | null }
  | { event: "process_stop"; pid: number; reason: string }
  | { event: "rest_pause"; state: "start" | "end" }
  | { event: "ws_open"; conn: string; channels: number }
  | {
      event: "ws_close";
      conn: string;
      code: number;
      reason: string;
      cause: "server close" | "watchdog";
      lastFrameAt: number | null;
    }
  | {
      event: "ws_resumed";
      conn: string;
      cause: string;
      lastFrameAt: number | null;
      firstFrameAt: number;
      gapMs: number | null;
    }
  | { event: "sub_refused"; conn: string; channel: string; error: string }
  | { event: "market_stall"; iid: number; lastFrameAt: number | null }
  | { event: "market_resume"; iid: number; gapMs: number | null }
  | { event: "boards_missed"; passDate: string; boards: string[] }
  | { event: "pass_missed"; pass: string; passDate: string }
  | { event: "test_switch"; name: string }
  | { event: "cut_line_dropped"; file: string; bytes: number }
  | { event: "compression_failed"; file: string; reason: string }
  | {
      event: "disk";
      disk: "database" | "recordings";
      path: string;
      state: "ok" | "warn" | "stop";
      freeGiB: number;
      stops: string;
    }
  | { event: "write_failed"; file: string; reason: string };
