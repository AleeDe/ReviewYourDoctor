#!/usr/bin/env node
/**
 * Push the local project docs (docs/project/*.md) up to ClickUp:
 *  - updates each matching Doc PAGE content
 *  - updates each matching SUBTASK description (under "Project Confidential - Documentation")
 *
 * Match is by name: a file `01_Project_Charter.md` maps to page/subtask "01 Project Charter".
 *
 * Usage:  CLICKUP_API_KEY=pk_xxx node scripts/clickup-sync.mjs
 * Config: clickup.config.json (IDs). The API key is read from env, never committed.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const KEY = process.env.CLICKUP_API_KEY;
if (!KEY) {
  console.error("Missing CLICKUP_API_KEY. Run: CLICKUP_API_KEY=pk_xxx node scripts/clickup-sync.mjs");
  process.exit(1);
}
const cfg = JSON.parse(readFileSync("clickup.config.json", "utf8"));
const H = { Authorization: KEY, "Content-Type": "application/json" };
const DIR = "docs/project";

if (!existsSync(DIR)) {
  console.error(`No ${DIR}/ folder found locally (it's gitignored). Nothing to sync.`);
  process.exit(1);
}

const fileToName = (f) => f.replace(/\.md$/, "").replaceAll("_", " ");

async function jget(url) {
  const r = await fetch(url, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

// 1. Doc pages: name -> id
const pages = await jget(
  `https://api.clickup.com/api/v3/workspaces/${cfg.workspaceId}/docs/${cfg.docId}/pages?max_page_depth=-1`,
);
const pageByName = new Map(pages.map((p) => [p.name, p.id]));

// 2. Subtasks of the docs parent: name -> id
const listTasks = await jget(
  `https://api.clickup.com/api/v2/list/${cfg.listId}/task?subtasks=true&include_closed=true`,
);
const subByName = new Map(
  (listTasks.tasks || [])
    .filter((t) => t.parent === cfg.docsParentTaskId)
    .map((t) => [t.name, t.id]),
);

let pageOk = 0, subOk = 0, missing = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const name = fileToName(file);
  const md = readFileSync(join(DIR, file), "utf8");

  const pageId = pageByName.get(name);
  if (pageId) {
    const r = await fetch(
      `https://api.clickup.com/api/v3/workspaces/${cfg.workspaceId}/docs/${cfg.docId}/pages/${pageId}`,
      { method: "PUT", headers: H,
        body: JSON.stringify({ content: md, content_format: "text/md", content_edit_mode: "replace" }) },
    );
    if (r.ok) pageOk++;
    else console.error("page fail", name, r.status, await r.text());
  } else missing.push(name + " (page)");

  const subId = subByName.get(name);
  if (subId) {
    const r = await fetch(`https://api.clickup.com/api/v2/task/${subId}`, {
      method: "PUT", headers: H, body: JSON.stringify({ markdown_content: md }),
    });
    if (r.ok) subOk++;
    else console.error("subtask fail", name, r.status, await r.text());
  } else missing.push(name + " (subtask)");
}

console.log(`Synced: ${pageOk} doc pages, ${subOk} subtasks.`);
if (missing.length) console.log("No ClickUp match for:", missing.join(", "));
