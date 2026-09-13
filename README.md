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

เปิดไฟล์ `index.html` ในเบราว์เซอร์โดยตรง หรือรัน static server:

```bash
npx serve .
```

แล้วเปิด `http://localhost:3000`

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