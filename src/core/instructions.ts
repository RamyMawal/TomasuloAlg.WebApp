import type { Instruction, OpType } from '../types';

// Valid operation types
const VALID_OPS: OpType[] = [
  'ADD.D', 'SUB.D', 'MUL.D', 'DIV.D',
  'ADD', 'SUB', 'MUL', 'DIV'
];

// Parse a single instruction string
export function parseInstruction(line: string, id: number): Instruction | null {
  // Remove comments and trim
  const cleanLine = line.split(';')[0].trim();
  if (!cleanLine) return null;

  // Match pattern: OP DEST, SRC1, SRC2
  // Handles both comma-separated and space-separated formats
  const match = cleanLine.match(/^(\S+)\s+(\S+),?\s+(\S+),?\s+(\S+)$/i);
  if (!match) return null;

  const [, opStr, dest, src1, src2] = match;
  const op = opStr.toUpperCase() as OpType;

  // Validate operation
  if (!VALID_OPS.includes(op)) return null;

  // Clean register names (remove trailing commas)
  const cleanDest = dest.replace(/,/g, '').toUpperCase();
  const cleanSrc1 = src1.replace(/,/g, '').toUpperCase();
  const cleanSrc2 = src2.replace(/,/g, '').toUpperCase();

  // Validate register names
  if (!isValidRegister(op, cleanDest)) return null;
  if (!isValidRegister(op, cleanSrc1)) return null;
  if (!isValidRegister(op, cleanSrc2)) return null;

  return {
    id,
    op,
    dest: cleanDest,
    src1: cleanSrc1,
    src2: cleanSrc2,
    issuedAt: null,
    execStartAt: null,
    execEndAt: null,
    writeAt: null,
  };
}

// Check if register is valid for the operation type
function isValidRegister(op: OpType, reg: string): boolean {
  const isFpOp = op.includes('.D');
  const isFpReg = reg.startsWith('F');
  const isIntReg = reg.startsWith('R');

  if (isFpOp) {
    return isFpReg && /^F\d+$/.test(reg);
  } else {
    return isIntReg && /^R\d+$/.test(reg);
  }
}

// Parse a program (multiple lines of instructions)
export function parseProgram(programText: string): Instruction[] {
  const lines = programText.split('\n');
  const instructions: Instruction[] = [];
  let id = 1;

  for (const line of lines) {
    const instruction = parseInstruction(line, id);
    if (instruction) {
      instructions.push(instruction);
      id++;
    }
  }

  return instructions;
}

// Format an instruction for display
export function formatInstruction(instr: Instruction): string {
  return `${instr.op} ${instr.dest}, ${instr.src1}, ${instr.src2}`;
}

// Check if an operation is floating-point
export function isFpOperation(op: OpType): boolean {
  return op.includes('.D');
}

// Check if an operation is a multiply/divide (uses mult functional unit)
export function isMultOperation(op: OpType): boolean {
  return op.includes('MUL') || op.includes('DIV');
}
