/** A worker thread of COPY-H's pass (pass.ts): each task is one raw file into its part; the answer says how it went. */
import { parentPort } from "node:worker_threads";
import { answerOf, type Task } from "./pass.js";

const port = parentPort!;
port.on("message", (task: Task) => port.postMessage(answerOf(task)));
