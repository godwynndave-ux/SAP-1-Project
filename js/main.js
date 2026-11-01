/* ============ 6. Controls: wires the buttons to the CPU model and the view ============ */
import { newCPU, clockPulse } from "./cpu.js";
import { assemble, DEMO } from "./assembler.js";
import { $, render } from "./view.js";

let cpu, prog, timer = null;                       // current CPU state, last assembled program, Run interval
const draw = () => render(cpu, timer !== null);

function load() {                                  // assemble the editor text into RAM, then reset
  try { prog = assemble($("src").value); }
  catch (e) { $("msg").textContent = e.message; $("msg").className = "bad"; return; }
  $("msg").textContent = "Program loaded"; $("msg").className = "ok";
  reset();
}
function reset() { stop(); cpu = newCPU(prog.ram.slice(), prog.code); draw(); }
function step() { clockPulse(cpu); if (cpu.halted) stop(); draw(); }          // one T-state
function stepInstr() { do clockPulse(cpu); while (!cpu.halted && cpu.t !== 1); if (cpu.halted) stop(); draw(); }
function stop() { clearInterval(timer); timer = null; $("run").textContent = "▶ Run"; if (cpu) draw(); }
function run() { if (cpu.halted) return; stop(); timer = setInterval(step, 1000 / $("hz").value); $("run").textContent = "⏸ Pause"; draw(); }

$("step").onclick = () => { stop(); step(); };
$("stepi").onclick = () => { stop(); stepInstr(); };
$("run").onclick = () => timer ? stop() : run();
$("reset").onclick = reset;
$("load").onclick = load;
$("demo").onclick = () => { $("src").value = DEMO; load(); };
$("hz").oninput = () => { $("hzv").textContent = $("hz").value + " Hz"; if (timer) run(); };
$("src").value = DEMO;
load();
