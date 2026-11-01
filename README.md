# SAP-1 Architecture Simulator

A browser-based simulator of the SAP-1 (Simple-As-Possible 1) computer: 16×8 RAM, PC, MAR, IR, accumulator, B register, adder/subtractor, output register and a T1–T6 controller-sequencer, with a live W-bus view and 8 output LEDs.

## Project structure
```
sap1-simulator/
├── index.html            page markup
├── css/styles.css        layout, light/dark themes, register glow, LEDs
├── js/
│   ├── isa.js            opcodes, mnemonics, hex/binary helpers
│   ├── sequencer.js      ring counter (T1–T6) and control words
│   ├── cpu.js            CPU state, adder/subtractor, clockPulse() (no DOM access)
│   ├── assembler.js      program text → RAM image, default test program
│   ├── view.js           draws registers, RAM, W-bus, sequencer and LEDs
│   └── main.js           buttons, Run timer, clock-speed slider
├── .vscode/extensions.json   recommends the Live Server extension
├── package.json          optional `npm start` static server
└── README.md
```

## Setup (VS Code)
1. Unzip the project and open the `sap1-simulator` folder in VS Code (File → Open Folder).
2. Accept the prompt to install the recommended **Live Server** extension (`ritwickdey.LiveServer`), or install it from the Extensions view.
3. Right-click `index.html` → **Open with Live Server** (or click **Go Live** in the status bar). The simulator opens at `http://127.0.0.1:5500`.

There are no dependencies to install. The code uses ES modules, which browsers block on `file://` URLs, so double-clicking `index.html` shows a blank page: always serve the folder over http. Without Live Server, run `npm start` (Node.js 18+, serves `http://localhost:3000`) or `python -m http.server 8000`.

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

## Technology stack
Plain HTML5, CSS3 and ES2020 JavaScript modules.
- **No dependencies or build step**: nothing to install and no bundler to configure; Live Server reloads the page on save.
- **One module per hardware block**: `sequencer.js`, `cpu.js` and `assembler.js` map to the controller, datapath and loader, which keeps each file small and easy to explain.
- **DOM-free core**: `cpu.js` is plain state plus one transition function, so it can be unit-tested in Node or moved into React/TypeScript unchanged.
- **CSS variables and grid**: responsive layout with light and dark themes.
