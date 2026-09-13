// สร้าง QR PromptPay มาตรฐาน EMVCo สำหรับไทย (zero-dep ตัว payload,
// ตัว render ใช้แพ็กเกจ qrcode ที่เป็น devDependency เท่านั้น ไม่ใช้ตอน runtime)
//
// วิธีใช้:
//   node scripts/gen-promptpay-qr.mjs --phone 0812345678
//   node scripts/gen-promptpay-qr.mjs --phone 0812345678 --amount 50.00
//   node scripts/gen-promptpay-qr.mjs --id 1103700123456
//
// เขียนไฟล์ images/promptpay-qr.svg + พิมพ์ payload ให้ตรวจสอบ

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function crc16(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (tag, value) => {
  const len = Buffer.byteLength(value, "utf8");
  if (len > 99) throw new Error("ค่าใน TLV ยาวเกิน 99 ไบต์: tag " + tag);
  return `${tag}${String(len).padStart(2, "0")}${value}`;
};

function buildPayload({ id, amount }) {
  const PFF = "A000000677012006";
  if (!id) throw new Error("ต้องระบุ --phone หรือ --id");

  let promptpayId;
  if (/^0\d{9}$/.test(id)) promptpayId = "0066" + id.slice(1); // เบอร์ 10 หลัก
  else if (/^\d{13}$/.test(id)) promptpayId = "00" + id; // เลขบัตร 13 หลัก
  else throw new Error("PromptPay ID ต้องเป็นเบอร์ 10 หลัก (ขึ้นต้น 0) หรือเลข 13 หลัก");

  const ma = tlv("00", PFF) + tlv("01", promptpayId);
  const parts = [];
  parts.push(tlv("00", "01")); // Payload Format Indicator
  parts.push(tlv("01", "11")); // Point of Initiation Method: QR แบบใช้ซ้ำ
  parts.push(tlv("29", ma)); // Merchant Account Information (PromptPay)
  parts.push(tlv("52", "0000")); // Merchant Category Code (general)
  parts.push(tlv("53", "764")); // สกุลเงิน THB
  if (amount) parts.push(tlv("54", Number(amount).toFixed(2))); // ยอดเงิน
  parts.push(tlv("58", "TH"));
  parts.push(tlv("59", "LALITA NAIL STUDIO")); // ชื่อร้าน (≤25 ตัว)
  let body = parts.join("");
  body += "6304"; // CRC tag วางท้ายสุด
  return body + crc16(body);
}

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};

const phone = get("--phone");
const nid = get("--id");
const amount = get("--amount");

const payload = buildPayload({ id: phone || nid, amount });
console.log("EMV payload:", payload);
console.log("CRC:", payload.slice(-4));

const outPath = path.resolve(__dirname, "../images/promptpay-qr.svg");

try {
  const { default: QRCode } = await import("qrcode");
  const svg = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 640,
    color: { dark: "#2b1e1c", light: "#ffffff" },
  });
  fs.writeFileSync(outPath, svg);
  console.log("เขียน QR ไปที่", outPath);
} catch (e) {
  console.log("[คำเตือน] ยังไม่ได้ติดตั้ง qrcode ให้รัน: npm i qrcode --save-dev");
  console.log("(payload ข้างต้นนำไปใช้กับเครื่องมือ QR ใดก็ได้)");
}