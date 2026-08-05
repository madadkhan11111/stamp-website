/**
 * deploy-gitless.js — 100% Auto-Deploy to GitHub WITHOUT needing git.exe
 * --------------------------------------------------------------------
 * Uses GitHub's official REST API via plain HTTPS (fetch) to:
 *   1. Read the latest commit SHA on main
 *   2. Create a full tree containing every website file
 *   3. Create a new commit pointing to that tree
 *   4. Move the "main" branch ref to the new commit
 *
 * SETUP (one time):
 *   1. Go to  https://github.com/settings/tokens
 *   2. Generate new "Classic" token with repo scope (Full control of private repositories)
 *   3. Copy the token, then run in this folder:
 *
 *        setx GITHUB_TOKEN "ghp_xxxxxxxxxxxxxxxxxxxx"
 *
 *      OR set the token directly below:  const TOKEN = "ghp_xxx"
 *
 *   4. Run:  node deploy-gitless.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const OWNER = "madadkhan11111";
const REPO  = "stamp-website";
const BRANCH = "main";
const API = "https://api.github.com";

/* --------- Token: prefer env var, otherwise paste here ----------- */
const TOKEN = process.env.GITHUB_TOKEN || "";  // <-- paste token here as last resort
/* ----------------------------------------------------------------- */

const FILES_TO_SKIP = new Set([
  ".git", "node_modules", ".trae",
  "deploy.js", "deploy-gitless.js",
  "package.json", "package-lock.json",
]);

const BINARY_EXT = new Set([
  ".png",".jpg",".jpeg",".gif",".ico",".webp",".svg",
  ".pdf",".woff",".woff2",".ttf",".eot",".otf",
  ".zip",".exe",".msi",
]);

function walk(dir, root = dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (FILES_TO_SKIP.has(name)) continue;
    if (name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const rel  = path.relative(root, full).replace(/\\/g, "/");
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, root, out);
    else out.push({ rel, full, size: st.size });
  }
  return out;
}

function b64encode(bufOrStr) {
  if (typeof bufOrStr === "string") bufOrStr = Buffer.from(bufOrStr, "utf8");
  return bufOrStr.toString("base64");
}

async function gh(method, urlPath, body) {
  const opts = {
    method,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "stamp-website-deployer",
    },
  };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API + urlPath, opts);
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    console.error(`\n❌  GitHub API ${method} ${urlPath} -> HTTP ${res.status}`);
    console.error("   ", JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

function gitBlobSHA(bytes) {
  // Git blob hash = SHA1("blob <size>\0" + contents)
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return crypto.createHash("sha1").update(Buffer.concat([header, bytes])).digest("hex");
}

async function main() {
  console.log("=".repeat(60));
  console.log("  🚀  Online Stamp Doc · Gitless Auto-Deploy to GitHub");
  console.log("=".repeat(60));

  if (!TOKEN) {
    console.log("\n❌  GITHUB_TOKEN is not set.");
    console.log("\n👉  Do this once:");
    console.log("   1. Open:  https://github.com/settings/tokens");
    console.log("   2. Generate a CLASSIC token, check the 'repo' scope.");
    console.log("   3. In this folder run:");
    console.log('         setx GITHUB_TOKEN "ghp_YOUR_TOKEN_HERE"');
    console.log("   4. Close and re-open this terminal, then run:");
    console.log("         node deploy-gitless.js");
    process.exit(2);
  }

  // 1. Scan files
  const root = path.resolve(__dirname);
  const files = walk(root);
  console.log(`\n📦  Found ${files.length} files in project.`);
  files.forEach(f => console.log(`   · ${f.rel}  (${f.size.toLocaleString()} bytes)`));

  // 2. Get the latest commit on main via the ref
  console.log("\n🔎  Fetching latest commit on", BRANCH, "...");
  const ref = await gh("GET", `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const currentCommitSha = ref.object.sha;
  console.log("   Current commit:", currentCommitSha.substring(0, 10) + "...");
  const currentCommit = await gh("GET", `/repos/${OWNER}/${REPO}/git/commits/${currentCommitSha}`);
  const baseTreeSha = currentCommit.tree.sha;
  console.log("   Base tree SHA :", baseTreeSha.substring(0, 10) + "...");

  // 3. For each file, upload blob + build tree entries
  const treeEntries = [];
  for (const f of files) {
    const raw = fs.readFileSync(f.full);
    const sha = gitBlobSHA(raw);

    // Check if the blob already exists on GitHub (fast path).
    let known = false;
    try {
      await gh("GET", `/repos/${OWNER}/${REPO}/git/blobs/${sha}`);
      known = true;
    } catch (_) { /* not found — create it */ }

    if (!known) {
      const ext = path.extname(f.rel).toLowerCase();
      const enc = BINARY_EXT.has(ext) ? "base64" : "utf-8";
      const content = enc === "base64" ? b64encode(raw) : raw.toString("utf8");
      await gh("POST", `/repos/${OWNER}/${REPO}/git/blobs`, { content, encoding: enc });
      console.log(`   ⬆  uploaded blob  ${f.rel}`);
    } else {
      console.log(`   ✔  blob exists   ${f.rel}`);
    }

    treeEntries.push({
      path: f.rel,
      mode: "100644",
      type: "blob",
      sha,
    });
  }

  // 4. Create new Git tree based on current tree + our file overrides
  console.log("\n🌳  Creating new tree ...");
  const tree = await gh("POST", `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeEntries,
  });
  console.log("   New tree SHA:", tree.sha.substring(0, 10) + "...");

  // 5. Create commit
  const message = "🎨 UI Upgrade: Signature + Templates + Hexagon/Triangle + SEO + Grid Footer";
  const now = new Date();
  const iso = now.toISOString().replace("Z", "+00:00");
  const author = {
    name: "madadkhan11111",
    email: "madadkhan11111@users.noreply.github.com",
    date: iso,
  };

  console.log("✍️  Creating commit ...");
  const commit = await gh("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
    message,
    tree: tree.sha,
    parents: [currentCommitSha],
    author,
    committer: author,
  });
  console.log("   New commit SHA:", commit.sha.substring(0, 10) + "...");

  // 6. Move main branch pointer
  console.log("\n🔧  Moving", BRANCH, "ref to new commit ...");
  await gh("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: commit.sha,
    force: false,
  });

  // 7. Done!
  console.log("\n🎉  DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("   Live site (GitHub Pages):  https://onlinestampdoc.com/");
  console.log("   Repository:                 https://github.com/" + OWNER + "/" + REPO);
  console.log("   Commit:                     https://github.com/" + OWNER + "/" + REPO + "/commit/" + commit.sha);
  console.log("\n⏳  GitHub Pages will rebuild in 30–90 seconds.");
  console.log("    When it's done, press  Ctrl+Shift+R  to hard-refresh the live site.\n");
}

main().catch(err => {
  console.error("\n⚠️  Fatal error during deploy:", err.message);
  console.error(err.stack);
  process.exit(1);
});
