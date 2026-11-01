import { hex, bin, MNEMONIC, HAS_OPERAND } from "./isa.js";
import { SIGNALS } from "./sequencer.js";
import { alu } from "./cpu.js";

/* ============ 5. View ============ */
export const $ = id => document.getElementById(id);
export const REGS = [["PC",4], ["MAR",4], ["IR",8], ["A",8], ["ALU",8], ["B",8], ["OUT",8]];
$("regs").innerHTML = REGS.map(([n]) => `<div class="reg" id="r${n}"><h3>${n}</h3><div class="bin"></div><div class="hx"></div></div>`).join("");
$("cells").innerHTML = "<i></i>".repeat(8);

export const dis = (c, a) => {
  const v = c.ram[a];
  if (!c.code.has(a)) return v ? "data" : "";
  const m = MNEMONIC[v >> 4];
  return HAS_OPERAND.has(m) ? `${m} ${hex(v & 15, 1)}H` : (m || "?");
};

export function status(c, running) {
  $("status").textContent = c.halted ? "HALTED" : running ? "RUNNING" : "READY";
  $("phase").textContent = c.lastT ? `T${c.lastT}: ${c.lastT < 4 ? "fetch" : "execute " + (MNEMONIC[c.ir >> 4] || "?")}, next T${c.t}` : "Press Step or Run";
}

export function render(c, running) {
  const sub = c.sig.includes("SU");
  const val = {PC:c.pc, MAR:c.mar, IR:c.ir, A:c.a, ALU:alu(c, sub), B:c.b, OUT:c.out};
  REGS.forEach(([n, w]) => {
    const el = $("r" + n), v = val[n];
    el.querySelector(".bin").innerHTML = bin(v, w).match(/.{4}/g).map((x, i) => n == "IR" && !i ? `<span class="op">${x}</span>` : x).join(" ");
    el.querySelector(".hx").textContent = hex(v, w / 4) + "H" + (n == "IR" ? " · " + (MNEMONIC[v >> 4] || "?") : "");
    el.classList.toggle("src", c.src == n);
    el.classList.toggle("dst", c.dst.includes(n));
  });
  $("rALU").querySelector("h3").textContent = "ALU Σ (" + (sub ? "A − B" : "A + B") + ")";
  // W-bus: lit bits, animation while a transfer happens, and a source → destination label
  [...$("cells").children].forEach((e, i) => e.className = c.bus !== null && (c.bus >> (7 - i)) & 1 ? "on" : "");
  $("cells").classList.toggle("active", c.bus !== null);
  $("buslbl").textContent = c.bus === null ? "W-bus idle" : `${c.src} → ${c.dst.join(", ") || "none"}: ${bin(c.bus)} (${hex(c.bus)}H)`;
  // RAM viewer: arrow = PC, blue row = MAR address, amber row = being read
  $("ram").innerHTML = "<tr><th></th><th>Addr</th><th>Binary</th><th>Hex</th><th>Content</th></tr>" + c.ram.map((v, a) =>
    `<tr class="${c.lastT && a == c.mar ? (c.src == "RAM" ? "src" : "act") : ""}"><td>${a == c.pc ? "▶" : ""}</td><td>${hex(a, 1)}H</td><td>${bin(v >> 4, 4)} ${bin(v & 15, 4)}</td><td>${hex(v)}H</td><td>${dis(c, a)}</td></tr>`).join("");
  $("ring").innerHTML = [1,2,3,4,5,6].map(t => `<b class="${c.lastT == t ? "on" : ""}">T${t}</b>`).join("");
  $("sigs").innerHTML = SIGNALS.map(s => `<b class="${c.sig.includes(s) ? "on" : ""}">${s}</b>`).join("");
  $("leds").innerHTML = [...bin(c.out)].map(b => `<i class="${b == "1" ? "on" : ""}"></i>`).join("");
  $("outv").textContent = `${bin(c.out).replace(/(.{4})(.{4})/, "$1 $2")} = ${hex(c.out)}H = ${c.out} decimal`;
  status(c, running);
}

