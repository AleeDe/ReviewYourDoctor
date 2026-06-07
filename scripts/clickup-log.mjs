#!/usr/bin/env node
/**
 * Keep the ClickUp "Support - Day-to-day changes" task current:
 *  1. Regenerates the task DESCRIPTION with the full git commit history
 *     (newest on top) - so the body always shows every commit.
 *  2. Posts the latest commit (or a custom note) as a COMMENT (activity feed).
 *
 * Usage:
 *   CLICKUP_API_KEY=pk_xxx node scripts/clickup-log.mjs            # log latest commit
 *   CLICKUP_API_KEY=pk_xxx node scripts/clickup-log.mjs "note..."  # add a custom note
 *
 * The API key is read from the environment and is never committed.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const KEY = process.env.CLICKUP_API_KEY;
const cfg = existsSync("clickup.config.json")
  ? JSON.parse(readFileSync("clickup.config.json", "utf8"))
  : {};
const TASK = process.env.CLICKUP_TASK_ID || cfg.changelogTaskId || "86exvq7wv";

if (!KEY) {
  console.error("Missing CLICKUP_API_KEY. Run: CLICKUP_API_KEY=pk_xxx node scripts/clickup-log.mjs");
  process.exit(1);
}
const H = { Authorization: KEY, "Content-Type": "application/json" };

const custom = process.argv.slice(2).join(" ").trim();
const latest = execSync('git log -1 --pretty=format:"%ad | %h | %s" --date=short')
  .toString()
  .trim();
const fullLog = execSync('git log --pretty=format:"- %ad | `%h` | %s" --date=short')
  .toString()
  .trim();

const description = `# Day-to-day changes log

Auto-generated from git history (newest on top). Full project details: see the
**Review Your Doctor - Knowledge Base** Doc in this list.
Repo: https://github.com/AleeDe/ReviewYourDoctor  ·  Live: https://reviewyourdoctor.shiftdeploy.com

## Commits
${fullLog}

## Pending / next
- ICO registration number -> add to /privacy and badge
- UK solicitor review of /privacy, /terms, DPA before scale
- Close gap-analysis items: CI/CD, automated tests, error monitoring, retention cron
`;

// 1. Refresh the task description with the full commit list.
const upd = await fetch(`https://api.clickup.com/api/v2/task/${TASK}`, {
  method: "PUT",
  headers: H,
  body: JSON.stringify({ markdown_content: description }),
});
if (!upd.ok) {
  console.error("Description update failed", upd.status, await upd.text());
  process.exit(1);
}

// 2. Post a comment for the activity feed.
const line = custom || latest;
const cmt = await fetch(`https://api.clickup.com/api/v2/task/${TASK}/comment`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({ comment_text: line, notify_all: false }),
});
if (!cmt.ok) {
  console.error("Comment failed", cmt.status, await cmt.text());
  process.exit(1);
}
console.log("ClickUp changelog updated. Latest:", line);
