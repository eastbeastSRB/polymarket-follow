import { monitorEventLoopDelay } from "node:perf_hooks";

/** CPU, memory and event-loop delay of this process since it started measuring. */
export function startProcessStats(): () => {
  cpuPercentOfOneCore: number;
  rssMb: number;
  maxRssMb: number;
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  arrayBuffersMb: number;
  loopDelayMaxMs: number;
  loopDelayP99Ms: number;
} {
  const startedAt = performance.now();
  const startCpu = process.cpuUsage();
  const loop = monitorEventLoopDelay({ resolution: 20 });
  loop.enable();
  let maxRss = process.memoryUsage().rss;
  const sampler = setInterval(() => {
    maxRss = Math.max(maxRss, process.memoryUsage().rss);
  }, 10_000);
  sampler.unref();
  const mb = (bytes: number) => Math.round((bytes / 1_048_576) * 10) / 10;
  return () => {
    const cpu = process.cpuUsage(startCpu);
    const elapsedUs = (performance.now() - startedAt) * 1_000;
    const memory = process.memoryUsage();
    maxRss = Math.max(maxRss, memory.rss);
    return {
      cpuPercentOfOneCore:
        Math.round(((cpu.user + cpu.system) / elapsedUs) * 1_000) / 10,
      rssMb: mb(memory.rss),
      maxRssMb: mb(maxRss),
      heapUsedMb: mb(memory.heapUsed),
      heapTotalMb: mb(memory.heapTotal),
      externalMb: mb(memory.external),
      arrayBuffersMb: mb(memory.arrayBuffers),
      loopDelayMaxMs: Math.round(loop.max / 1e5) / 10,
      loopDelayP99Ms: Math.round(loop.percentile(99) / 1e5) / 10,
    };
  };
}
