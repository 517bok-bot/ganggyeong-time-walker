// 같은 와이파이의 휴대폰이 접속할 주소를 알려주고, 서버가 켜지면 초대(QR) 화면을 엽니다.
import os from "node:os";
import { exec } from "node:child_process";
const port = process.env.PORT || 3000;
const ips = Object.values(os.networkInterfaces()).flat().filter((n) => n && n.family === "IPv4" && !n.internal).map((n) => n.address);
const ip = ips.find((a) => a.startsWith("192.168.") || a.startsWith("10.") || a.startsWith("172.")) || ips[0] || "localhost";
const url = `http://${ip}:${port}`;
console.log("\n========================================================");
console.log("  휴대폰 접속 주소:  " + url);
console.log("  초대 QR 화면:      " + url + "/share");
console.log("  (휴대폰과 이 컴퓨터가 같은 와이파이에 있어야 해요)");
console.log("========================================================\n");
const open = process.platform === "win32" ? `start "" "${url}/share"` : process.platform === "darwin" ? `open "${url}/share"` : `xdg-open "${url}/share"`;
const wait = async () => {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://localhost:${port}/`); if (r.ok) { exec(open); return; } } catch { /* 서버 준비 중 */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
};
wait();
