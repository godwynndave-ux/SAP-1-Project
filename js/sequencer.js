import { MNEMONIC } from "./isa.js";

/* ============ 2. Controller-sequencer ============
   Ring counter T1..T6. Fetch (T1-T3) is shared by all instructions; execute (T4-T6)
   depends on the opcode in IR. E* = drive W-bus, L* = load from W-bus,
   CP = count PC, SU = subtract, HLT = stop the clock. */
export const SIGNALS = ["CP","EP","LM","CE","LI","EI","LA","EA","SU","EU","LB","LO","HLT"];
export const FETCH = {1:["EP","LM"], 2:["CP"], 3:["CE","LI"]};
export const EXEC = {
  LDA:[["EI","LM"], ["CE","LA"], []],
  ADD:[["EI","LM"], ["CE","LB"], ["EU","LA"]],
  SUB:[["EI","LM"], ["CE","LB"], ["SU","EU","LA"]],
  OUT:[["EA","LO"], [], []],
  HLT:[["HLT"], [], []]
};
export const controlWord = (t, ir) => t < 4 ? FETCH[t] : (EXEC[MNEMONIC[ir >> 4]] || [[], [], []])[t - 4];

