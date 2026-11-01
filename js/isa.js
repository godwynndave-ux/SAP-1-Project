/* ============ 1. ISA tables ============ */
export const OPCODES = {LDA:0x0, ADD:0x1, SUB:0x2, OUT:0xE, HLT:0xF};
export const MNEMONIC = Object.fromEntries(Object.entries(OPCODES).map(([m, o]) => [o, m]));
export const HAS_OPERAND = new Set(["LDA", "ADD", "SUB"]);
export const hex = (v, w = 2) => v.toString(16).toUpperCase().padStart(w, "0");
export const bin = (v, w = 8) => v.toString(2).padStart(w, "0");

