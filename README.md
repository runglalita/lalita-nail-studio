# Lalita Nail Studio — เว็บไซต์ร้านทำเล็บ

เว็บไซต์หลายหน้าสำหรับร้านทำเล็บ "Lalita Nail Studio" ภาษาไทย สไตล์ **Minimal Luxury / Elegant / Feminine**
โทนสีชมพูอ่อน – Nude – ครีม – น้ำตาลอ่อน – ทองอ่อน

> สโลแกน: **สวยครบ จบทุกสไตล์ ในแบบที่เป็นคุณ**

## โครงสร้างโปรเจกต์

```
todolist4/
├── index.html        # หน้าแรก (Hero, บริการเด่น, ผลงาน, ราคา, รีวิว, CTA)
├── services.html     # หน้าบริการ
├── gallery.html      # แกลเลอรีผลงาน + ตัวกรองสไตล์ + Lightbox
├── pricing.html      # ตารางราคา
├── about.html        # เกี่ยวกับร้าน
├── contact.html      # ติดต่อ, แผนที่, ฟอร์มส่งข้อความ
├── booking.html      # แบบฟอร์มจองคิวพร้อม Validation
├── css/
│   └── style.css     # Design system ทั้งหมด (responsive + animations)
├── js/
│   └── script.js     # ฟังก์ชันทั้งหมด (vanilla JS ไม่มี dependency)
├── images/
│   ├── hero.svg, about.svg, favicon.svg
│   └── gallery-01.svg … gallery-10.svg
└── README.md
```

## เทคโนโลยี

- **HTML5** + **CSS3** + **JavaScript (vanilla)** — ไม่ใช้เฟรมเวิร์กและไม่มี external dependency
- Google Fonts: `Prompt` (หัวข้อ), `Sarabun` (เนื้อหา), `Playfair Display` (ตราสินค้า)
- ไอคอนทั้งหมดเป็น inline SVG ไม่ใช้ icon library

## ฟังก์ชันการทำงาน

- Sticky header พร้อม hamburger menu บน mobile (≤ 1023px)
- โปสการ์ด reveal-on-scroll (IntersectionObserver), hover effect ทุกการ์ด
- ปุ่มลอย: โทร / LINE / Instagram / กลับขึ้นบน
- แกลเลอรี: ตัวกรอง All · Minimal · Korean · French · Glitter · Luxury + Lightbox (เลื่อนซ้าย-ขวา, ปุ่ม ESC)
- ฟอร์มจองคิว: validation ชื่อ, เบอร์โทร (ไทย 0XXXXXXXXX), วันที่ต้องไม่เป็นอดีต, เวลา 10:00–19:00, ต้องเลือกบริการ, จำนวน 1–10 พร้อมสรุปข้อมูลก่อนส่ง
- ฟอร์มติดต่อ: ชื่อและข้อความบังคับ, อีเมล/โทรศัพท์เป็นตัวเลือก (ตรวจรูปแบบเมื่อกรอก)
- ดึงบริการจาก URL ให้อัตโนมัติ เช่น `booking.html?service=%E0%B8%97%E0%B8%B2%E0%B8%AA%E0%B8%B5%E0%B9%80%E0%B8%88%E0%B8%A5` (ค่า `service` ต้องตรงกับ `value` ของ `<option>` ในแบบฟอร์ม เช่น `ทาสีเจล`, `ต่อเล็บ`, `ถอดสีเจล`)
- ป้ายเมนูปัจจุบัน, สรุปจำนวนคน/ผิวหน้าแบบต่าง ๆ (จำนวนจริงสมมติ)
- Responsive breakpoints: 1920 / 1440 / 1024 / 768 / 480 / 375 px
- SEO: `<title>`, meta description/keywords, Open Graph, canonical, semantic HTML, alt text, ARIA labels

## วิธีเปิดเว็บไซต์

### แบบมีระบบจองจริง (backend)

ต้องใช้ Node.js ≥ 22.5 (เพราะใช้ `node:sqlite` ในตัว ไม่มี dependency):

```bash
npm start
```

แล้วเปิด `http://localhost:3000` — เว็บ + API + ฐานข้อมูลอยู่ใน service เดียวกัน

### แบบ static เฉย ๆ (หน้าจอ demo ไม่เก็บข้อมูล)

```bash
npx serve .
```

แล้วเปิด `http://localhost:3000` — ฟอร์มจองจะแสดงเป็น demo อย่างเดียว

## ระบบจอง (Backend)

Node.js server ไฟล์เดียว (`server.js`) ไม่มี dependency เก็บข้อมูลใน SQLite (`data/booking.sqlite`)

### API

| Method | Path | ใช้สำหรับ |
| --- | --- | --- |
| `POST` | `/api/booking` | รับข้อมูลจองคิว (ชื่อ, เบอร์ไทย, วันที่ ≥ วันนี้, เวลา 10:00–19:00, บริการ, จำนวน 1–10) |
| `POST` | `/api/contact` | รับข้อความจากฟอร์มติดต่อ |
| `GET` | `/api/bookings?token=...` | ดูรายการจอง (ต้องมี `ADMIN_TOKEN`) |
| `GET` | `/api/contacts?token=...` | ดูรายการข้อความ (ต้องมี `ADMIN_TOKEN`) |
| `PATCH` | `/api/bookings` | เปลี่ยนสถานะจอง (`new` / `confirmed` / `done` / `cancelled`) |

### ตัวแปร environment

| ตัวแปร | ความหมาย |
| --- | --- |
| `PORT` | พอร์ต (ค่าเริ่มต้น 3000) |
| `DB_PATH` | ตำแหน่งไฟล์ฐานข้อมูล |
| `ADMIN_TOKEN` | รหัสดูรายการจองทาง `/api/bookings?token=...` (**เปลี่ยนจากค่า default `admin123` ก่อนเปิดใช้จริง!**) |
| `LINE_NOTIFY_TOKEN` | ถ้าใส่ token จาก https://notify-bot.line.me ระบบจะส่งแจ้งเตือนอัตโนมัติเมื่อมีจอง/ข้อความใหม่ |

### Deploy ฟรีบน Render

1. push repo ขึ้น GitHub (ทำแล้ว)
2. เข้า https://app.render.com → **New → Web Service** → เลือก repo `lalita-nail-studio`
3. ตั้งค่า:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: เพิ่ม `ADMIN_TOKEN` (ตั้งรหัสส่วนตัว), เพิ่ม `LINE_NOTIFY_TOKEN` ถ้าต้องการ
4. Deploy เสร็จจะได้ URL เช่น `https://lalita-nail-studio.onrender.com` — ใช้ลิงก์นี้แชร์ให้ลูกค้าจองได้เลย

หรือใช้ **Blueprint** โดย commit ไฟล์ `render.yaml` ไว้แล้ว → ที่ Render เลือก New → Blueprint → เลือก repo นี้

> หมายเหตุ: Render แบบ free จะ **พักเครื่อง** เมื่อไม่มีคนเข้าเว็บ ~15 นาที (เข้าแรกช้า ~30 วินาที) และข้อมูลใน SQLite จะอยู่ได้ตราบที่ service ยังไม่ถูก rebuild — ถ้าจะใช้จริงจริง ควรย้ายไป Postgres (แนะนำให้เปลี่ยน `DB_PATH` เป็นการเชื่อมฐานข้อมูลภายนอก หรือใช้ Render Postgres แยก)

## วิธีแก้ไขข้อมูลร้าน

| ข้อมูล | ตำแหน่งที่แก้ |
| --- | --- |
| เบอร์โทร / ช่องทางติดต่อ | footer และหน้า contact/ticket ทุกหน้า (ค้นหา `099-999-9999`, `@lalitanail`) |
| ราคา | `pricing.html` และการ์ดราคาใน `index.html` |
| รายการบริการ | `services.html` และ select ใน `booking.html` (ค่า `value` ของ option ใช้อ้างอิงใน `?service=`) |
| ข้อมูลร้าน / รีวิว | `about.html`, `index.html` |
| เวลาทำการ | footer ทุกหน้า และหน้า contact |

## วิธีใส่รูปผลงานจริง

แทนที่ไฟล์ในโฟลเดอร์ `images/` ได้เลย:

- `gallery-01.svg` … `gallery-10.svg` → รองรับทั้ง `.svg`, `.jpg`, `.png` (แก้ `<img src>` ใน `gallery.html` / `index.html`)
- `hero.svg` → รูป Hero หน้าแรก
- `about.svg` → รูปภาพหน้ากี่ร้าน
- อย่าลืมตั้ง `width`/`height` และ `alt` ภาษาไทยเพื่อ SEO กับ performance

## หมายเหตุ

รูปภาพทั้งหมดใน `images/` ตอนนี้เป็น **SVG placeholder** (ภาพกราฟิกเล็บแบบนามธรรม) ให้เปลี่ยนเป็นรูปถ่ายจริงก่อนเปิดใช้งานจริง
ตำแหน่งร้าน ที่อยู่ และจำนวนสถิติ (ลูกค้า, ผลงาน ฯลฯ) เป็นข้อมูลสมมติ

© 2026 Lalita Nail Studio. All Rights Reserved.