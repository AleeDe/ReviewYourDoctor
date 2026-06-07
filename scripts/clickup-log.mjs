#!/usr/bin/env node
/**
 * Append the latest git commit (or a custom message) as a comment on the
 * ClickUp "Support - Day-to-day changes" task, so the changelog stays current
 * without re-reading the whole project.
 *
 * Usage:
 *   CLICKUP_API_KEY=pk_xxx node scripts/clickup-log.mjs            # logs latest commit
 *   CLICKUP_API_KEY=pk_xxx node scripts/clickup-log.mjs "note..."  # logs a custom line
 *
 * Optional env:
 *   CLICKUP_TASK_ID   default 86exvq7wv  (the Support task)
 *
 * The API key is read from the environment and is never hard-coded or committed.
 */
import { execSync } from "node:child_process";

const KEY = process.env.CLICKUP_API_KEY;
const TASK = process.env.CLICKUP_TASK_ID || "86exvq7wv";

if (!KEY) {
  console.error("Missing CLICKUP_API_KEY. Run: CLICKUP_API_KEY=pk_xxx node scripts/clickup-log.mjs");
  process.exit(1);
}

const custom = process.argv.slice(2).join(" ").trim();
const line =
  custom ||
  execSync('git log -1 --pretty=format:"%ad | %h | %s" --date=short').toString().trim();

const res = await fetch(`https://api.clickup.com/api/v2/task/${TASK}/comment`, {
  method: "POST",
  headers: { Authorization: KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ comment_text: line, notify_all: false }),
});

if (!res.ok) {
  console.error("ClickUp error", res.status, await res.text());
  process.exit(1);
}
console.log("Logged to ClickUp:", line);
