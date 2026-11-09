// QR 서명 비밀키를 한 번 만들어 .qr-secret 에 보관합니다 (인쇄한 장소 QR이 계속 유효하도록 같은 값을 재사용)
import fs from "node:fs";
import crypto from "node:crypto";
const f = new URL("../.qr-secret", import.meta.url);
if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(24).toString("hex"));
process.stdout.write(fs.readFileSync(f, "utf8").trim());
