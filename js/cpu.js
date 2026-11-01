import { controlWord } from "./sequencer.js";

/* ============ 3. CPU model (no DOM access) ============ */
export const newCPU = (ram, code) => ({ram, code, pc:0, mar:0, ir:0, a:0, b:0, out:0, t:1, lastT:0, halted:false, sig:[], bus:null, src:null, dst:[]});
// Adder/subtractor: A - B is computed as A + (NOT B) + 1 (2's complement), 8-bit wrap-around.
export const alu = (c, sub) => (sub ? c.a + ((~c.b) & 0xFF) + 1 : c.a + c.b) & 0xFF;

// One clock pulse = one T-state.
export function clockPulse(c) {
  if (c.halted) return;
  const sig = controlWord(c.t, c.ir), on = s => sig.includes(s);
  // (a) the single enabled unit drives the W-bus
  let bus = null, src = null;
  if (on("EP")) { bus = c.pc; src = "PC"; }
  else if (on("EI")) { bus = c.ir & 0xF; src = "IR"; }
  else if (on("CE")) { bus = c.ram[c.mar]; src = "RAM"; }
  else if (on("EA")) { bus = c.a; src = "A"; }
  else if (on("EU")) { bus = alu(c, on("SU")); src = "ALU"; }
  // (b) load-enabled units latch the bus value on the clock edge
  const dst = [];
  if (on("LM")) { c.mar = bus & 0xF; dst.push("MAR"); }
  if (on("LI")) { c.ir = bus; dst.push("IR"); }
  if (on("LA")) { c.a = bus; dst.push("A"); }
  if (on("LB")) { c.b = bus; dst.push("B"); }
  if (on("LO")) { c.out = bus; dst.push("OUT"); }
  if (on("CP")) c.pc = (c.pc + 1) & 0xF;   // PC increments after every fetch
  if (on("HLT")) c.halted = true;
  Object.assign(c, {sig, bus, src, dst, lastT:c.t, t:c.t % 6 + 1});
}

