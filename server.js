/* ==========================================================================
   Lalita Nail Studio — backend (zero dependency)
   - เสิร์ฟไฟล์ static (HTML/CSS/JS/รูป) แบบเดียวกับเว็บ
   - API:  POST /api/booking  POST /api/contact  GET /api/bookings  GET /api/contacts
   - เก็บข้อมูลใน SQLite ผ่าน node:sqlite (Node >= 22.5)
   - แจ้งเตือน LINE Notify อัตโนมัติเมื่อมีจองใหม่ (ถ้าตั้ง LINE_NOTIFY_TOKEN)
   ========================================================================== */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_PATH = path.resolve(process.env.DB_PATH || path.join(ROOT, "data", "booking.sqlite"));
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin123";
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN || "";
const MAX_BODY = 64 * 1024;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

/* ------------------------------- database ------------------------------- */
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    people INTEGER NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'new',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function nowTh() {
  return new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
}

function insertBooking(b) {
  const stmt = db.prepare(
    `INSERT INTO bookings (name, phone, people, service, date, time, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const r = stmt.run(b.name, b.phone, b.people, b.service, b.date, b.time, b.notes || "", nowTh());
  return Number(r.lastInsertRowid);
}

function insertContact(c) {
  const stmt = db.prepare(
    `INSERT INTO contacts (name, phone, email, message, created_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  const r = stmt.run(c.name, c.phone || "", c.email || "", c.message, nowTh());
  return Number(r.lastInsertRowid);
}

/* ------------------------------ LINE Notify ------------------------------ */
async function notifyLine(message) {
  if (!LINE_NOTIFY_TOKEN) return;
  try {
    await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + LINE_NOTIFY_TOKEN,
      },
      body: new URLSearchParams({ message }),
    });
  } catch (err) {
    console.error("LINE notify failed:", err.message);
  }
}

/* ------------------------------ validation ------------------------------ */
const phoneValid = (v) => {
  const digits = String(v || "").replace(/[^\d]/g, "");
  return /^0/.test(digits) && (digits.length === 9 || digits.length === 10);
};
const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const dateValid = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(v + "T00:00:00") >= today;
};

function respond(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY) {
        reject(new Error("body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/* -------------------------------- routes -------------------------------- */
async function handleApi(req, res, url) {
  if (url.pathname === "/api/booking" && req.method === "POST") {
    let body;
    try {
      body = JSON.parse((await readBody(req)) || "{}");
    } catch {
      return respond(res, 400, { ok: false, error: "ข้อมูลไม่ถูกต้อง" });
    }
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const people = Number(body.people);
    const service = String(body.service || "").trim();
    const date = String(body.date || "").trim();
    const time = String(body.time || "").trim();
    const notes = String(body.notes || "").trim().slice(0, 500);

    if (name.length < 2) return respond(res, 400, { ok: false, error: "กรุณากรอกชื่อของคุณ" });
    if (!phoneValid(phone)) return respond(res, 400, { ok: false, error: "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 099-999-9999" });
    if (!Number.isInteger(people) || people < 1 || people > 10) return respond(res, 400, { ok: false, error: "จำนวนคนต้องอยู่ระหว่าง 1 - 10" });
    if (!service) return respond(res, 400, { ok: false, error: "กรุณาเลือกบริการ" });
    if (!dateValid(date)) return respond(res, 400, { ok: false, error: "กรุณาเลือกวันที่ที่ถูกต้อง (ไม่เป็นอดีต)" });
    if (!/^\d{2}:\d{2}$/.test(time)) return respond(res, 400, { ok: false, error: "กรุณาเลือกเวลา" });

    const id = insertBooking({ name, phone, people, service, date, time, notes });
    await notifyLine(
      `💅 จองคิวใหม่ (Lalita Nail Studio)\nชื่อ: ${name}\nเบอร์: ${phone}\nบริการ: ${service}\nจำนวน: ${people} คน\nวันที่: ${date} เวลา ${time} น.\nหมายเหตุ: ${notes || "-"}`
    );
    return respond(res, 201, { ok: true, id });
  }

  if (url.pathname === "/api/contact" && req.method === "POST") {
    let body;
    try {
      body = JSON.parse((await readBody(req)) || "{}");
    } catch {
      return respond(res, 400, { ok: false, error: "ข้อมูลไม่ถูกต้อง" });
    }
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim().slice(0, 2000);

    if (name.length < 2) return respond(res, 400, { ok: false, error: "กรุณากรอกชื่อของคุณ" });
    if (phone && !phoneValid(phone)) return respond(res, 400, { ok: false, error: "กรุณากรอกเบอร์โทรให้ถูกต้อง" });
    if (email && !emailValid(email)) return respond(res, 400, { ok: false, error: "กรุณากรอกอีเมลให้ถูกต้อง" });
    if (!message) return respond(res, 400, { ok: false, error: "กรุณากรอกข้อความ" });

    const id = insertContact({ name, phone, email, message });
    await notifyLine(
      `✉️ ข้อความใหม่จากเว็บ\nชื่อ: ${name}\nโทร: ${phone || "-"} อีเมล: ${email || "-"}\nข้อความ: ${message}`
    );
    return respond(res, 201, { ok: true, id });
  }

  const token =
    url.searchParams.get("token") ||
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ""));
  if (token !== ADMIN_TOKEN) {
    return respond(res, 401, { ok: false, error: "unauthorized" });
  }

  if (url.pathname === "/api/bookings" && req.method === "GET") {
    const rows = db.prepare("SELECT * FROM bookings ORDER BY id DESC LIMIT 200").all();
    return respond(res, 200, { ok: true, rows });
  }
  if (url.pathname === "/api/contacts" && req.method === "GET") {
    const rows = db.prepare("SELECT * FROM contacts ORDER BY id DESC LIMIT 200").all();
    return respond(res, 200, { ok: true, rows });
  }
  if (url.pathname === "/api/bookings" && req.method === "PATCH") {
    let body;
    try {
      body = JSON.parse((await readBody(req)) || "{}");
    } catch {
      return respond(res, 400, { ok: false, error: "ข้อมูลไม่ถูกต้อง" });
    }
    const id = Number(body.id);
    const status = String(body.status || "").trim();
    if (!Number.isInteger(id) || !["new", "confirmed", "done", "cancelled"].includes(status)) {
      return respond(res, 400, { ok: false, error: "ข้อมูลไม่ถูกต้อง" });
    }
    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);
    return respond(res, 200, { ok: true });
  }

  return respond(res, 404, { ok: false, error: "not found" });
}

/* ------------------------------- static files ---------------------------- */
function serveFile(req, res, urlPath) {
  let p = decodeURIComponent(urlPath);
  if (p === "/" || p === "") p = "/index.html";

  const file = path.join(ROOT, p);
  const safe = file.startsWith(ROOT) && !file.startsWith(path.join(ROOT, "data") + path.sep) && p !== "/server.js" && p !== "/package.json";

  if (!safe) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found — หน้าเว็บที่ขอไม่มีอยู่");
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(file).pipe(res);
  });
}

/* --------------------------------- server -------------------------------- */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch((err) => {
      console.error(err);
      respond(res, 500, { ok: false, error: "server error" });
    });
  } else {
    serveFile(req, res, url.pathname);
  }
});

server.listen(PORT, () => {
  console.log(`Lalita Nail Studio server running on http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
  console.log(`Admin token: ${ADMIN_TOKEN}${LINE_NOTIFY_TOKEN ? " | LINE notify: ON" : ""}`);
});