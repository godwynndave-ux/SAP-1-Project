# SAP-1 Architecture Simulator

A browser-based simulator of the SAP-1 (Simple-As-Possible 1) computer: 16×8 RAM, PC, MAR, IR, accumulator, B register, adder/subtractor, output register and a T1–T6 controller-sequencer, drawn as live graphical panels with a W-bus and 8 output LEDs.

## Setup
There is nothing to install: the app is one file with no dependencies and no build step.

1. Open `sap1-simulator.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. Optional local server: `python -m http.server 8000` (or `npx serve .`), then visit `http://localhost:8000/sap1-simulator.html`.

## Using the simulator
- **Load program**: one instruction per line, plus data lines written `ADDR: value` (hex, or 8 bits). `;` starts a comment. Press **Load into RAM**; **Test case** restores the verification program.
- **Step (one T-state)** fires a single clock pulse. **Step instruction** finishes the current instruction. **Run** executes until `HLT` (press again to pause). **Reset** clears every register and the ring counter and restores the loaded program. The **Clock** slider sets 1–20 Hz.
- Amber panels drive the W-bus, green panels load from it. The bus bar shows the 8 bus bits and the transfer (for example `RAM → A`).

## Instruction set
| Mnemonic | Opcode | Action |
|---|---|---|
| LDA a | 0000 | A ← RAM[a] |
| ADD a | 0001 | B ← RAM[a]; A ← A + B |
| SUB a | 0010 | B ← RAM[a]; A ← A + NOT B + 1 (2’s complement) |
| OUT | 1110 | Output ← A |
| HLT | 1111 | Stop the clock |

A machine word is the opcode (upper nibble) plus the operand (lower nibble). OUT and HLT use `F` as the lower nibble.

## Timing (controller-sequencer)
- Fetch: T1 `EP, LM` · T2 `CP` · T3 `CE, LI`
- LDA: T4 `EI, LM` · T5 `CE, LA`
- ADD: T4 `EI, LM` · T5 `CE, LB` · T6 `EU, LA`
- SUB: same as ADD, with `SU, EU, LA` at T6
- OUT: T4 `EA, LO`
- HLT: T4 `HLT`

## Verification test
`LDA 9`, `ADD A`, `SUB B`, `OUT`, `HLT` with `9H = 25H`, `AH = 05H`, `BH = 23H` puts `07H` (`0000 0111`) on the LEDs.

## Code layout (inside `sap1-simulator.html`)
1. ISA tables · 2. Controller-sequencer control words · 3. CPU model (`clockPulse`, no DOM access) · 4. Assembler · 5. View (`render`) · 6. Controls.

## Technology stack
Plain HTML5, CSS3 and ES2020 JavaScript in a single file.
- **No dependencies or build step**: nothing to install, works offline, and is easy to submit or host on any static site.
- **Small DOM**: one `render()` redraws all state from the CPU object, so a framework adds no value here.
- **CSS variables and grid**: responsive layout with light and dark themes.
- **Portable core**: the CPU model is plain state plus one transition function, so it can be unit-tested or moved into React/TypeScript unchanged.
