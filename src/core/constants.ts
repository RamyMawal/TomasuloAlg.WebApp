import type { HardwareConfig, RegisterFile } from '../types';

// Default hardware configuration
export const DEFAULT_CONFIG: HardwareConfig = {
  fpAddStations: 3,
  fpMultStations: 2,
  intAddStations: 2,
  intMultStations: 2,
  latencies: {
    fpAdd: 2,
    fpSub: 2,
    fpMult: 10,
    fpDiv: 40,
    intAdd: 1,
    intSub: 1,
    intMult: 4,
    intDiv: 20,
  },
};

// Default floating-point register values
export const DEFAULT_FP_REGISTERS: RegisterFile = {
  F0: 0.0,
  F2: 2.0,
  F4: 4.0,
  F6: 6.0,
  F8: 8.0,
  F10: 10.0,
  F12: 12.0,
  F14: 14.0,
  F16: 16.0,
  F18: 18.0,
  F20: 20.0,
  F22: 22.0,
  F24: 24.0,
  F26: 26.0,
  F28: 28.0,
  F30: 30.0,
};

// Default integer register values
export const DEFAULT_INT_REGISTERS: RegisterFile = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,
};

// Example programs for demonstration
export const EXAMPLE_PROGRAMS = {
  basic: `MUL.D F0, F2, F4
ADD.D F6, F0, F8
SUB.D F8, F10, F14
DIV.D F10, F0, F6
ADD.D F6, F8, F2`,

  raw_hazard: `ADD.D F2, F0, F4
MUL.D F6, F2, F8
ADD.D F10, F6, F12`,

  waw_hazard: `MUL.D F0, F2, F4
ADD.D F0, F6, F8`,

  integer_ops: `ADD R1, R2, R3
MUL R4, R1, R5
SUB R6, R4, R7`,

  mixed: `MUL.D F0, F2, F4
ADD R1, R2, R3
ADD.D F6, F0, F8
MUL R4, R1, R5`,
};
