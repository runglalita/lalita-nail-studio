/* ==========================================================================
   Lalita Nail Studio — admin panel
   ดู/จัดการรายการจองและข้อความติดต่อ (ผ่าน token ที่ตั้งใน env ADMIN_TOKEN)
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const storageKey = "lalita_admin_token";

  const loginView = $("#loginView");
  const dashView = $("#dashView");
  const tokenInput = $("#tokenInput");
  const btnLogout = $("#btnLogout");
  const btnRefresh = $("#btnRefresh");
  const flash = $("#flash");

  const getToken = () => localStorage.getItem(storageKey) || "";
  const setToken = (t) => localStorage.setItem(storageKey, t);
  const clearToken = () => localStorage.removeItem(storageKey);

  function showFlash(msg, ok) {
    flash.textContent = msg;
    flash.className = "flash show " + (ok ? "ok" : "err");
    clearTimeout(showFlash._t);
    showFlash._t = setTimeout(() => flash.classList.remove("show"), 6000);
  }

  async function api(path, opts = {}) {
    const headers = Object.assign(
      { Authorization: "Bearer " + getToken() },
      opts.headers || {}
    );
    const resp = await fetch(path, Object.assign({ headers }, opts));
    if (resp.status === 401) {
      unauth();
      throw new Error("unauthorized");
    }
    return resp;
  }

  function unauth() {
    clearToken();
    dashView.hidden = true;
    loginView.hidden = false;
    btnLogout.hidden = true;
  }

  function esc(v) {
    const d = document.createElement("div");
    d.textContent = v == null ? "" : String(v);
    return d.innerHTML;
  }

  const statusLabels = { new: "ใหม่", confirmed: "ยืนยันแล้ว", done: "เสร็จสิ้น", cancelled: "ยกเลิก" };

  function badge(status) {
    return `<span class="badge b-${status}">${esc(statusLabels[status] || status)}</span>`;
  }

  async function load() {
    const token = getToken();
    if (!token) {
      loginView.hidden = false;
      dashView.hidden = true;
      btnLogout.hidden = true;
      return;
    }
    try {
      const [bResp, cResp] = await Promise.all([
        api("/api/bookings"),
        api("/api/contacts"),
      ]);
      if (!bResp.ok || !cResp.ok) return; // 401 handled inside api()
      const bookings = (await bResp.json()).rows || [];
      const contacts = (await cResp.json()).rows || [];

      loginView.hidden = true;
      dashView.hidden = false;
      btnLogout.hidden = false;

      renderStats(bookings, contacts);
      renderBookings(bookings);
      renderContacts(contacts);
    } catch (err) {
      if (err.message !== "unauthorized") showFlash("โหลดข้อมูลล้มเหลว: " + err.message, false);
    }
  }

  function renderStats(bookings, contacts) {
    const stats = [
      ["จองทั้งหมด", bookings.length],
      ["รอการยืนยัน", bookings.filter((b) => b.status === "new").length],
      ["ยืนยันแล้ว", bookings.filter((b) => b.status === "confirmed").length],
      ["ข้อความติดต่อ", contacts.length],
    ];
    document.getElementById("statsRow").innerHTML = stats
      .map(([k, v]) => `<div class="admin-stat"><span>${esc(k)}</span><strong>${v}</strong></div>`)
      .join("");
  }

  function renderBookings(rows) {
    const tbody = document.getElementById("bookingsBody");
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty">ยังไม่มีรายการจอง</td></tr>`;
      return;
    }
    tbody.innerHTML = rows
      .map(
        (b) => `<tr>
          <td>${b.id}</td>
          <td><strong>${esc(b.name)}</strong></td>
          <td>${esc(b.phone)}</td>
          <td>${esc(b.service)}</td>
          <td>${b.people}</td>
          <td>${esc(b.date)}</td>
          <td>${esc(b.time)} น.</td>
          <td>${esc(b.notes || "-")}</td>
          <td><select class="status" data-id="${b.id}" data-status="${esc(b.status)}">
            ${Object.entries(statusLabels)
              .map(([v, l]) => `<option value="${v}" ${v === b.status ? "selected" : ""}>${esc(l)}</option>`)
              .join("")}
          </select> ${badge(b.status)}</td>
          <td>${esc(b.created_at)}</td>
        </tr>`
      )
      .join("");
  }

  function renderContacts(rows) {
    const tbody = document.getElementById("contactsBody");
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">ยังไม่มีข้อความ</td></tr>`;
      return;
    }
    tbody.innerHTML = rows
      .map(
        (c) => `<tr>
          <td>${c.id}</td>
          <td><strong>${esc(c.name)}</strong></td>
          <td>${esc(c.phone || "-")}</td>
          <td>${esc(c.email || "-")}</td>
          <td>${esc(c.message)}</td>
          <td>${esc(c.created_at)}</td>
        </tr>`
      )
      .join("");
  }

  /* ------------------------------- events ------------------------------- */
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) return;
    setToken(token);
    tokenInput.value = "";
    await load();
    if (getToken() && dashView.hidden) {
      setToken("");
      showFlash("รหัสไม่ถูกต้อง กรุณาลองใหม่", false);
    }
  });

  document.addEventListener("change", async (e) => {
    const sel = e.target.closest("select.status");
    if (!sel) return;
    const prev = sel.dataset.status;
    const next = sel.value;
    try {
      const resp = await api("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(sel.dataset.id), status: next }),
      });
      if (!resp.ok) throw new Error("update failed");
      sel.dataset.status = next;
      sel.nextElementSibling.outerHTML = badge(next);
      showFlash("อัปเดตสถานะเรียบร้อย", true);
      load();
    } catch (err) {
      sel.value = prev;
      showFlash("อัปเดตสถานะไม่สำเร็จ", false);
    }
  });

  btnRefresh.addEventListener("click", () => {
    load();
    showFlash("โหลดข้อมูลใหม่แล้ว", true);
  });

  btnLogout.addEventListener("click", () => {
    clearToken();
    unauth();
    tokenInput.focus();
  });

  load();
})();