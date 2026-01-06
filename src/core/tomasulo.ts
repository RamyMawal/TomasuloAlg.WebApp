import type {
  Instruction,
  ReservationStation,
  RegisterFile,
  RegisterStatus,
  HardwareConfig,
  Annotation,
  OpType,
  FunctionalUnitType,
} from '../types';
import { opToFunctionalUnit } from '../types';
import { isFpOperation } from './instructions';

// Get the latency for an operation
export function getLatency(op: OpType, config: HardwareConfig): number {
  switch (op) {
    case 'ADD.D': return config.latencies.fpAdd;
    case 'SUB.D': return config.latencies.fpSub;
    case 'MUL.D': return config.latencies.fpMult;
    case 'DIV.D': return config.latencies.fpDiv;
    case 'ADD': return config.latencies.intAdd;
    case 'SUB': return config.latencies.intSub;
    case 'MUL': return config.latencies.intMult;
    case 'DIV': return config.latencies.intDiv;
    default: return 1;
  }
}

// Create reservation stations based on config
export function createReservationStations(config: HardwareConfig): ReservationStation[] {
  const stations: ReservationStation[] = [];

  // FP Adders
  for (let i = 1; i <= config.fpAddStations; i++) {
    stations.push(createEmptyStation(`Add${i}`, 'FP_ADD'));
  }

  // FP Multipliers
  for (let i = 1; i <= config.fpMultStations; i++) {
    stations.push(createEmptyStation(`Mult${i}`, 'FP_MULT'));
  }

  // Integer Adders
  for (let i = 1; i <= config.intAddStations; i++) {
    stations.push(createEmptyStation(`IntAdd${i}`, 'INT_ADD'));
  }

  // Integer Multipliers
  for (let i = 1; i <= config.intMultStations; i++) {
    stations.push(createEmptyStation(`IntMult${i}`, 'INT_MULT'));
  }

  return stations;
}

function createEmptyStation(name: string, type: FunctionalUnitType): ReservationStation {
  return {
    name,
    type,
    busy: false,
    op: null,
    vj: null,
    vk: null,
    qj: null,
    qk: null,
    dest: '',
    instrId: null,
    remainingCycles: 0,
    isExecuting: false,
  };
}

// Find an available reservation station for an operation
function findAvailableStation(
  stations: ReservationStation[],
  op: OpType
): ReservationStation | null {
  const unitType = opToFunctionalUnit[op];
  return stations.find(rs => rs.type === unitType && !rs.busy) || null;
}

// Execute one cycle of the Tomasulo algorithm
export function executeCycle(
  cycle: number,
  instructions: Instruction[],
  reservationStations: ReservationStation[],
  fpRegisterFile: RegisterFile,
  intRegisterFile: RegisterFile,
  fpRegisterStatus: RegisterStatus,
  intRegisterStatus: RegisterStatus,
  instructionPointer: number,
  config: HardwareConfig
): {
  instructions: Instruction[];
  reservationStations: ReservationStation[];
  fpRegisterFile: RegisterFile;
  intRegisterFile: RegisterFile;
  fpRegisterStatus: RegisterStatus;
  intRegisterStatus: RegisterStatus;
  instructionPointer: number;
  annotations: Annotation[];
  isComplete: boolean;
} {
  // Deep clone all mutable state
  const newInstructions = instructions.map(i => ({ ...i }));
  const newStations = reservationStations.map(rs => ({ ...rs }));
  const newFpRegFile = { ...fpRegisterFile };
  const newIntRegFile = { ...intRegisterFile };
  const newFpRegStatus = { ...fpRegisterStatus };
  const newIntRegStatus = { ...intRegisterStatus };
  let newIP = instructionPointer;
  const annotations: Annotation[] = [];

  // Phase 1: Write Result - broadcast completed results on CDB
  const writePhaseResult = writeResultPhase(
    cycle,
    newInstructions,
    newStations,
    newFpRegFile,
    newIntRegFile,
    newFpRegStatus,
    newIntRegStatus,
    annotations
  );

  // Phase 2: Execute - advance executing instructions
  executePhase(cycle, newInstructions, newStations, annotations);

  // Phase 3: Issue - issue next instruction if possible
  const issueResult = issuePhase(
    cycle,
    newInstructions,
    newStations,
    newFpRegFile,
    newIntRegFile,
    newFpRegStatus,
    newIntRegStatus,
    newIP,
    config,
    annotations
  );
  newIP = issueResult.instructionPointer;

  // Check if simulation is complete
  const isComplete = checkSimulationComplete(newInstructions, newStations);

  return {
    instructions: newInstructions,
    reservationStations: newStations,
    fpRegisterFile: newFpRegFile,
    intRegisterFile: newIntRegFile,
    fpRegisterStatus: newFpRegStatus,
    intRegisterStatus: newIntRegStatus,
    instructionPointer: newIP,
    annotations,
    isComplete,
  };
}

// Phase 1: Write Result
function writeResultPhase(
  cycle: number,
  instructions: Instruction[],
  stations: ReservationStation[],
  fpRegFile: RegisterFile,
  intRegFile: RegisterFile,
  fpRegStatus: RegisterStatus,
  intRegStatus: RegisterStatus,
  annotations: Annotation[]
): void {
  // Find stations that have completed execution (remainingCycles === 0 and isExecuting)
  for (const rs of stations) {
    if (rs.busy && rs.isExecuting && rs.remainingCycles === 0) {
      // Calculate the result
      const result = computeResult(rs.op!, rs.vj!, rs.vk!);
      const isFp = isFpOperation(rs.op!);
      const regFile = isFp ? fpRegFile : intRegFile;
      const regStatus = isFp ? fpRegStatus : intRegStatus;

      // Write to register file if this RS still owns the destination
      if (regStatus[rs.dest] === rs.name) {
        regFile[rs.dest] = result;
        regStatus[rs.dest] = null;
      }

      // Broadcast to waiting reservation stations
      for (const waitingRS of stations) {
        if (waitingRS.busy && waitingRS.name !== rs.name) {
          if (waitingRS.qj === rs.name) {
            waitingRS.vj = result;
            waitingRS.qj = null;
          }
          if (waitingRS.qk === rs.name) {
            waitingRS.vk = result;
            waitingRS.qk = null;
          }
        }
      }

      // Update instruction timing
      const instr = instructions.find(i => i.id === rs.instrId);
      if (instr) {
        instr.writeAt = cycle;
      }

      annotations.push({
        cycle,
        message: `${rs.name} writes result ${result.toFixed(2)} to ${rs.dest}`,
        type: 'write',
      });

      // Clear the reservation station
      clearStation(rs);
    }
  }
}

// Phase 2: Execute
function executePhase(
  cycle: number,
  instructions: Instruction[],
  stations: ReservationStation[],
  annotations: Annotation[]
): void {
  for (const rs of stations) {
    if (!rs.busy) continue;

    // Check if already executing
    if (rs.isExecuting) {
      // Decrement remaining cycles
      if (rs.remainingCycles > 0) {
        rs.remainingCycles--;
      }
      continue;
    }

    // Check if operands are ready (both Qj and Qk are null)
    if (rs.qj === null && rs.qk === null) {
      // Start execution
      rs.isExecuting = true;
      rs.remainingCycles--; // Start counting down

      // Update instruction timing
      const instr = instructions.find(i => i.id === rs.instrId);
      if (instr && instr.execStartAt === null) {
        instr.execStartAt = cycle;
      }

      annotations.push({
        cycle,
        message: `${rs.name} starts executing ${rs.op} (${rs.remainingCycles + 1} cycles)`,
        type: 'execute',
      });
    } else {
      // Still waiting for operands
      const waiting: string[] = [];
      if (rs.qj) waiting.push(rs.qj);
      if (rs.qk) waiting.push(rs.qk);
      annotations.push({
        cycle,
        message: `${rs.name} waiting for: ${waiting.join(', ')}`,
        type: 'hazard',
      });
    }
  }
}

// Phase 3: Issue
function issuePhase(
  cycle: number,
  instructions: Instruction[],
  stations: ReservationStation[],
  fpRegFile: RegisterFile,
  intRegFile: RegisterFile,
  fpRegStatus: RegisterStatus,
  intRegStatus: RegisterStatus,
  instructionPointer: number,
  config: HardwareConfig,
  annotations: Annotation[]
): { instructionPointer: number } {
  // Check if there are more instructions to issue
  if (instructionPointer >= instructions.length) {
    return { instructionPointer };
  }

  const instr = instructions[instructionPointer];

  // Find an available reservation station
  const availableRS = findAvailableStation(stations, instr.op);
  if (!availableRS) {
    annotations.push({
      cycle,
      message: `Structural hazard: No ${opToFunctionalUnit[instr.op]} station available for ${instr.op}`,
      type: 'hazard',
    });
    return { instructionPointer };
  }

  const isFp = isFpOperation(instr.op);
  const regFile = isFp ? fpRegFile : intRegFile;
  const regStatus = isFp ? fpRegStatus : intRegStatus;

  // Issue the instruction to the reservation station
  availableRS.busy = true;
  availableRS.op = instr.op;
  availableRS.dest = instr.dest;
  availableRS.instrId = instr.id;
  availableRS.remainingCycles = getLatency(instr.op, config);
  availableRS.isExecuting = false;

  // Get source operand 1
  if (regStatus[instr.src1]) {
    // RAW hazard - value not yet available
    availableRS.qj = regStatus[instr.src1];
    availableRS.vj = null;
  } else {
    // Value is ready
    availableRS.qj = null;
    availableRS.vj = regFile[instr.src1] ?? 0;
  }

  // Get source operand 2
  if (regStatus[instr.src2]) {
    // RAW hazard - value not yet available
    availableRS.qk = regStatus[instr.src2];
    availableRS.vk = null;
  } else {
    // Value is ready
    availableRS.qk = null;
    availableRS.vk = regFile[instr.src2] ?? 0;
  }

  // Update register status (this RS will produce the destination value)
  regStatus[instr.dest] = availableRS.name;

  // Update instruction timing
  instr.issuedAt = cycle;

  annotations.push({
    cycle,
    message: `Issued ${instr.op} ${instr.dest}, ${instr.src1}, ${instr.src2} to ${availableRS.name}`,
    type: 'issue',
  });

  // Check for hazards and report
  if (availableRS.qj || availableRS.qk) {
    const hazardSources: string[] = [];
    if (availableRS.qj) hazardSources.push(`${instr.src1} from ${availableRS.qj}`);
    if (availableRS.qk) hazardSources.push(`${instr.src2} from ${availableRS.qk}`);
    annotations.push({
      cycle,
      message: `RAW hazard: waiting for ${hazardSources.join(', ')}`,
      type: 'hazard',
    });
  }

  return { instructionPointer: instructionPointer + 1 };
}

// Compute the result of an operation
function computeResult(op: OpType, v1: number, v2: number): number {
  switch (op) {
    case 'ADD.D':
    case 'ADD':
      return v1 + v2;
    case 'SUB.D':
    case 'SUB':
      return v1 - v2;
    case 'MUL.D':
    case 'MUL':
      return v1 * v2;
    case 'DIV.D':
    case 'DIV':
      return v2 !== 0 ? v1 / v2 : 0;
    default:
      return 0;
  }
}

// Clear a reservation station
function clearStation(rs: ReservationStation): void {
  rs.busy = false;
  rs.op = null;
  rs.vj = null;
  rs.vk = null;
  rs.qj = null;
  rs.qk = null;
  rs.dest = '';
  rs.instrId = null;
  rs.remainingCycles = 0;
  rs.isExecuting = false;
}

// Check if simulation is complete
function checkSimulationComplete(
  instructions: Instruction[],
  stations: ReservationStation[]
): boolean {
  // All instructions must have written their results
  const allWritten = instructions.every(i => i.writeAt !== null);

  // All stations must be empty
  const allStationsEmpty = stations.every(rs => !rs.busy);

  return allWritten && allStationsEmpty && instructions.length > 0;
}

// Initialize register status for all registers
export function initializeRegisterStatus(regFile: RegisterFile): RegisterStatus {
  const status: RegisterStatus = {};
  for (const reg of Object.keys(regFile)) {
    status[reg] = null;
  }
  return status;
}
