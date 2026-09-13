/* ==========================================================================
   Lalita Nail Studio — main script
   Vanilla JS only. No dependencies.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------ *
   * Header scroll state
   * ------------------------------------------------------------------ */
  const header = $(".header");
  const onScrollHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  if (header) {
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Mobile navigation (hamburger drawer)
   * ------------------------------------------------------------------ */
  const navToggle = $(".nav-toggle");
  const nav = $(".nav");
  const navOverlay = $("#nav-overlay");

  const closeNav = () => {
    if (nav) nav.classList.remove("is-open");
    if (navOverlay) navOverlay.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-locked");
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navOverlay && navOverlay.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-locked", isOpen);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });
    navOverlay && navOverlay.addEventListener("click", closeNav);

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1023) closeNav();
    });
  }

  /* ------------------------------------------------------------------ *
   * Reveal-on-scroll animation
   * ------------------------------------------------------------------ */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ------------------------------------------------------------------ *
   * Back to top
   * ------------------------------------------------------------------ */
  const backTop = $(".back-top");
  if (backTop) {
    window.addEventListener(
      "scroll",
      () => backTop.classList.toggle("is-visible", window.scrollY > 600),
      { passive: true }
    );
    backTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ------------------------------------------------------------------ *
   * Gallery filter
   * ------------------------------------------------------------------ */
  const filterBtns = $$(".filter-btn");
  const galleryItems = $$(".gallery-grid .gallery-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter || "all";
      galleryItems.forEach((item) => {
        item.classList.toggle(
          "is-hidden",
          f !== "all" && item.dataset.category !== f
        );
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Lightbox
   * ------------------------------------------------------------------ */
  const lightbox = $("#lightbox");
  if (lightbox) {
    const lbImg = $("#lightboxImg", lightbox);
    const lbCaption = $("#lightboxCaption", lightbox);
    const lbClose = $(".lightbox__close", lightbox);
    const lbPrev = $(".lightbox__prev", lightbox);
    const lbNext = $(".lightbox__next", lightbox);

    let index = 0;

    const render = () => {
      const items = $$(".gallery-grid .gallery-item").filter(
        (it) => !it.classList.contains("is-hidden")
      );
      if (!items.length) return;
      index = Math.min(Math.max(index, 0), items.length - 1);
      const item = items[index];
      const img = item.querySelector("img");
      const svg = item.querySelector("svg");

      lbImg.innerHTML = "";
      if (img) {
        const clone = img.cloneNode();
        clone.removeAttribute("loading");
        lbImg.appendChild(clone);
      } else if (svg) {
        lbImg.appendChild(svg.cloneNode(true));
      }

      const title = item.dataset.caption || "";
      const cat = item.dataset.category || "";
      lbCaption.innerHTML = `<strong>${title}</strong><span>${cat}</span>`;
    };

    const open = (el) => {
      const items = $$(".gallery-grid .gallery-item");
      index = items.indexOf(el);
      render();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-locked");
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-locked");
    };

    const step = (dir) => {
      const items = $$(".gallery-grid .gallery-item").filter(
        (it) => !it.classList.contains("is-hidden")
      );
      if (!items.length) return;
      index = (index + dir + items.length) % items.length;
      render();
    };

    $$(".gallery-item").forEach((el) =>
      el.addEventListener("click", () => open(el))
    );

    lbClose && lbClose.addEventListener("click", close);
    lbPrev && lbPrev.addEventListener("click", () => step(-1));
    lbNext && lbNext.addEventListener("click", () => step(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ------------------------------------------------------------------ *
   * Form helpers
   * ------------------------------------------------------------------ */
  const setError = (input, msg, show) => {
    const group = input.closest(".form-group");
    if (!group) return;
    const err = group.querySelector(".error-msg");
    if (!show || !msg) {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      if (err) {
        err.textContent = "";
        err.classList.remove("is-visible");
      }
      return;
    }
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    if (err) {
      err.textContent = msg;
      err.classList.add("is-visible");
    }
  };

  const showStatus = (id, scrollIntoView = true) => {
    const status = document.getElementById(id);
    if (!status) return;
    status.classList.add("is-visible");
    if (scrollIntoView) {
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    status.setAttribute("role", "status");
  };

  const phoneValid = (v) => {
    const digits = v.replace(/[^\d]/g, "");
    return /^0/.test(digits) && (digits.length === 9 || digits.length === 10);
  };

  const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  /* ------------------------------------------------------------------ *
   * Booking form
   * ------------------------------------------------------------------ */
  const bookingForm = $("#bookingForm");
  if (bookingForm) {
    const name = $("#bk-name");
    const phone = $("#bk-phone");
    const date = $("#bk-date");
    const time = $("#bk-time");
    const service = $("#bk-service");
    const people = $("#bk-people");
    const notes = $("#bk-notes");
    const slip = $("#bk-slip");

    // Preselect service from URL ?service=...
    const params = new URLSearchParams(window.location.search);
    const qService = params.get("service");
    if (qService && service) {
      const matched = Array.from(service.options).some(
        (opt) => opt.value === qService
      );
      if (matched) service.value = qService;
    }

    const notPast = () => {
      if (!date || !date.value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(date.value + "T00:00:00");
      return chosen >= today;
    };

    const validateBooking = () => {
      let ok = true;

      if (!name.value.trim()) {
        setError(name, "กรุณากรอกชื่อของคุณ", true);
        ok = false;
      } else {
        setError(name, "", false);
      }

      if (!phone.value.trim()) {
        setError(phone, "กรุณากรอกเบอร์โทรศัพท์", true);
        ok = false;
      } else if (!phoneValid(phone.value)) {
        setError(phone, "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 082-949-0410", true);
        ok = false;
      } else {
        setError(phone, "", false);
      }

      if (!date.value) {
        setError(date, "กรุณาเลือกวันที่ต้องการจอง", true);
        ok = false;
      } else if (!notPast()) {
        setError(date, "กรุณาเลือกวันที่ไม่อยู่ในอดีต", true);
        ok = false;
      } else {
        setError(date, "", false);
      }

      if (!time.value) {
        setError(time, "กรุณาเลือกเวลาที่ต้องการ", true);
        ok = false;
      } else {
        setError(time, "", false);
      }

      if (!service.value) {
        setError(service, "กรุณาเลือกบริการ", true);
        ok = false;
      } else {
        setError(service, "", false);
      }

      const n = parseInt(people.value, 10);
      if (!people.value || Number.isNaN(n) || n < 1) {
        setError(people, "กรุณาระบุจำนวนคนอย่างน้อย 1 คน", true);
        ok = false;
      } else {
        setError(people, "", false);
      }

      if (slip && !slip.files.length) {
        setError(slip, "กรุณาอัปโหลดสลิปโอนมัดจำค่า 50 บาท", true);
        ok = false;
      } else {
        setError(slip, "", false);
      }

      return ok;
    };

    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.getElementById("formStatus")?.classList.remove("is-visible");

      if (!validateBooking()) {
        const firstBad = bookingForm.querySelector(".is-invalid");
        firstBad && firstBad.focus();
        return;
      }

      const setFormBusy = (busy) => {
        const btn = bookingForm.querySelector("button[type='submit']");
        if (btn) {
          btn.disabled = busy;
          btn.textContent = busy ? "กำลังส่งข้อมูล..." : "ยืนยันการจอง";
        }
      };

      const n = parseInt(people.value, 10);

      setFormBusy(true);
      try {
        const fd = new FormData();
        fd.append("name", name.value.trim());
        fd.append("phone", phone.value.trim());
        fd.append("people", n);
        fd.append("service", service.value);
        fd.append("date", date.value);
        fd.append("time", time.value);
        fd.append("notes", notes ? notes.value.trim() : "");
        if (slip && slip.files[0]) fd.append("slip", slip.files[0]);

        const resp = await fetch("/api/booking", {
          method: "POST",
          body: fd, // fetch ตั้ง Content-Type พร้อม boundary ให้เอง
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.ok) {
          throw new Error(data.error || "ส่งข้อมูลไม่สำเร็จ");
        }

        const fmtDate = new Date(date.value + "T00:00:00").toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const sumList = document.getElementById("bookSummary");
        if (sumList) {
          sumList.textContent = "";
          const items = [
            ["ชื่อ", name.value.trim()],
            ["เบอร์โทร", phone.value.trim()],
            ["บริการ", `${service.value} × ${n}`],
            ["วันที่", `${fmtDate} เวลา ${time.value} น.`],
            ["มัดจำ", "โอนแล้ว 50 บาท"],
          ];
          if (notes && notes.value.trim()) items.push(["หมายเหตุ", notes.value.trim()]);
          items.forEach(([k, v]) => {
            const li = document.createElement("li");
            const strong = document.createElement("strong");
            strong.textContent = k + ":";
            const span = document.createElement("span");
            span.textContent = " " + v;
            li.appendChild(strong);
            li.appendChild(span);
            sumList.appendChild(li);
          });
        }
        bookingForm.reset();
        if (service) service.value = "";
        const status = document.getElementById("formStatus");
        if (status) {
          status.querySelector("strong").textContent = "จองคิวเรียบร้อยแล้ว";
          status.querySelector("p").textContent = "รอช่างตรวจสอบสลิปมัดจำและยืนยันคิว (รอแจ้งทาง LINE/โทร)";
        }
        showStatus("formStatus");
      } catch (err) {
        const status = document.getElementById("formStatus");
        if (status) {
          status.querySelector("strong").textContent = "ส่งข้อมูลไม่สำเร็จ";
          status.querySelector("p").textContent = err.message + " — กรุณาลองใหม่ หรือแจ้งผ่าน LINE @lalitanail";
          showStatus("formStatus", false);
        } else {
          alert(err.message);
        }
      } finally {
        setFormBusy(false);
      }
      bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Set min date = today
    if (date) {
      const today = new Date().toISOString().split("T")[0];
      date.min = today;
    }

    // Clear error as user types
    [name, phone, time, service, people, date, notes].forEach((f) => {
      f &&
        f.addEventListener("input", () => setError(f, "", false));
    });
    slip && slip.addEventListener("change", () => setError(slip, "", false));
  }

  /* ------------------------------------------------------------------ *
   * Contact form
   * ------------------------------------------------------------------ */
  const contactForm = $("#contactForm");
  if (contactForm) {
    const cName = $("#ct-name");
    const cEmail = $("#ct-email");
    const cPhone = $("#ct-phone");
    const cMsg = $("#ct-message");

    const validateContact = () => {
      let ok = true;

      if (!cName.value.trim()) {
        setError(cName, "กรุณากรอกชื่อของคุณ", true);
        ok = false;
      } else {
        setError(cName, "", false);
      }

      if (cEmail.value.trim() && !emailValid(cEmail.value)) {
        setError(cEmail, "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@email.com", true);
        ok = false;
      } else {
        setError(cEmail, "", false);
      }

      if (cPhone.value.trim() && !phoneValid(cPhone.value)) {
        setError(cPhone, "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 082-949-0410", true);
        ok = false;
      } else {
        setError(cPhone, "", false);
      }

      if (!cMsg.value.trim()) {
        setError(cMsg, "กรุณากรอกข้อความที่ต้องการสอบถาม", true);
        ok = false;
      } else {
        setError(cMsg, "", false);
      }

      return ok;
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.getElementById("contactStatus")?.classList.remove("is-visible");

      if (!validateContact()) {
        const firstBad = contactForm.querySelector(".is-invalid");
        firstBad && firstBad.focus();
        return;
      }

      const setBusy = (busy) => {
        const btn = contactForm.querySelector("button[type='submit']");
        if (btn) {
          btn.disabled = busy;
          btn.textContent = busy ? "กำลังส่งข้อมูล..." : "ส่งข้อความ";
        }
      };

      setBusy(true);
      try {
        const resp = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cName.value.trim(),
            phone: cPhone.value.trim(),
            email: cEmail.value.trim(),
            message: cMsg.value.trim(),
          }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.ok) {
          throw new Error(data.error || "ส่งข้อมูลไม่สำเร็จ");
        }
        contactForm.reset();
        const status = document.getElementById("contactStatus");
        if (status) {
          status.querySelector("strong").textContent = "ส่งข้อความเรียบร้อยแล้ว";
          status.querySelector("p").textContent = "ขอบคุณที่ติดต่อมา ทีมงานจะรีบตอบกลับโดยเร็วที่สุดค่ะ";
        }
        showStatus("contactStatus");
      } catch (err) {
        const status = document.getElementById("contactStatus");
        if (status) {
          status.querySelector("strong").textContent = "ส่งข้อมูลไม่สำเร็จ";
          status.querySelector("p").textContent = err.message + " — กรุณาลองใหม่ หรือแจ้งผ่าน LINE @lalitanail";
          showStatus("contactStatus", false);
        } else {
          alert(err.message);
        }
      } finally {
        setBusy(false);
      }
      contactForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    [cName, cEmail, cPhone, cMsg].forEach((f) => {
      f && f.addEventListener("input", () => setError(f, "", false));
    });
  }

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();