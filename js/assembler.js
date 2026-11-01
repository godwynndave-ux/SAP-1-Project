import { OPCODES, HAS_OPERAND } from "./isa.js";

/* ============ 4. Assembler / loader ============ */
export const DEMO = `; 25H + 05H - 23H  (verification test)
LDA 9
ADD A
SUB B
OUT
HLT
9: 25   ; data: ADDR: value
A: 05
B: 23`;

export function assemble(text) {
  const ram = Array(16).fill(0), code = new Set();
  let next = 0;
  text.split("\n").forEach((raw, i) => {
    const line = raw.split(";")[0].trim();
    if (!line) return;
    const fail = m => { throw new Error(`Line ${i + 1}: ${m}`); };
    const d = line.match(/^([0-9a-f])h?\s*:\s*(\S+)$/i);          // data line, e.g. "9: 25"
    if (d) {
      const s = d[2];
      const v = /^[01]{8}$/.test(s) ? parseInt(s, 2) : /^[0-9a-f]{1,2}h?$/i.test(s) ? parseInt(s, 16) : NaN;
      if (isNaN(v)) fail("data must be hex (00-FF) or 8 bits");
      ram[parseInt(d[1], 16)] = v;
      return;
    }
    const [op, arg, extra] = line.toUpperCase().split(/\s+/);      // instruction line
    if (!(op in OPCODES)) fail(`unknown mnemonic ${op}`);
    if (next > 15) fail("program does not fit in 16 locations");
    const needs = HAS_OPERAND.has(op);
    if (needs && !/^[0-9A-F]H?$/.test(arg || "")) fail(`${op} needs a hex address 0-F`);
    if ((!needs && arg) || extra) fail("too many operands");
    ram[next] = (OPCODES[op] << 4) | (needs ? parseInt(arg, 16) : 0xF);   // OUT/HLT use F as low nibble
    code.add(next++);
  });
  return {ram, code};
}

