// Operation types supported by the simulator
export type OpType =
  | 'ADD.D'
  | 'SUB.D'
  | 'MUL.D'
  | 'DIV.D'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV';

// Functional unit types
export type FunctionalUnitType = 'FP_ADD' | 'FP_MULT' | 'INT_ADD' | 'INT_MULT';

// Map operations to their functional unit type
export const opToFunctionalUnit: Record<OpType, FunctionalUnitType> = {
  'ADD.D': 'FP_ADD',
  'SUB.D': 'FP_ADD',
  'MUL.D': 'FP_MULT',
  'DIV.D': 'FP_MULT',
  'ADD': 'INT_ADD',
  'SUB': 'INT_ADD',
  'MUL': 'INT_MULT',
  'DIV': 'INT_MULT',
};

// Instruction representation
export interface Instruction {
  id: number;
  op: OpType;
  dest: string;       // Destination register (e.g., "F4" or "R1")
  src1: string;       // Source register 1 (e.g., "F2")
  src2: string;       // Source register 2 (e.g., "F6")
  // Timing tracking
  issuedAt: number | null;
  execStartAt: number | null;
  execEndAt: number | null;
  writeAt: number | null;
}

// Reservation Station
export interface ReservationStation {
  name: string;             // e.g., "Add1", "Mult2"
  type: FunctionalUnitType;
  busy: boolean;
  op: OpType | null;
  vj: number | null;        // Value of source operand 1
  vk: number | null;        // Value of source operand 2
  qj: string | null;        // RS producing src1 (null if value ready)
  qk: string | null;        // RS producing src2 (null if value ready)
  dest: string;             // Destination register
  instrId: number | null;   // ID of instruction using this RS
  remainingCycles: number;  // Cycles remaining for execution
  isExecuting: boolean;     // Whether currently executing
}

// Register status table (tracks which RS will write to each register)
export interface RegisterStatus {
  [register: string]: string | null;  // RS name or null if available
}

// Register file (actual values)
export interface RegisterFile {
  [register: string]: number;
}

// Hardware configuration
export interface HardwareConfig {
  fpAddStations: number;
  fpMultStations: number;
  intAddStations: number;
  intMultStations: number;
  latencies: {
    fpAdd: number;
    fpSub: number;
    fpMult: number;
    fpDiv: number;
    intAdd: number;
    intSub: number;
    intMult: number;
    intDiv: number;
  };
}

// Annotation for a cycle event
export interface Annotation {
  cycle: number;
  message: string;
  type: 'issue' | 'execute' | 'write' | 'hazard' | 'info';
}

// Complete simulator state
export interface SimulatorState {
  // Configuration
  config: HardwareConfig;

  // Simulation state
  cycle: number;
  instructions: Instruction[];
  reservationStations: ReservationStation[];
  fpRegisterFile: RegisterFile;
  intRegisterFile: RegisterFile;
  fpRegisterStatus: RegisterStatus;
  intRegisterStatus: RegisterStatus;

  // UI state
  annotations: Annotation[];
  isSimulationStarted: boolean;
  isSimulationComplete: boolean;
  instructionPointer: number;  // Next instruction to issue

  // Auto-play state
  isPlaying: boolean;
  playSpeed: number;  // milliseconds between cycles
}

// Action types for reducer
export type SimulatorAction =
  | { type: 'CONFIGURE'; payload: Partial<HardwareConfig> }
  | { type: 'LOAD_PROGRAM'; payload: Instruction[] }
  | { type: 'STEP' }
  | { type: 'RESET' }
  | { type: 'SET_FP_REGISTER'; payload: { register: string; value: number } }
  | { type: 'SET_INT_REGISTER'; payload: { register: string; value: number } }
  | { type: 'START_SIMULATION' }
  | { type: 'REBUILD_RESERVATION_STATIONS' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_SPEED'; payload: number };
