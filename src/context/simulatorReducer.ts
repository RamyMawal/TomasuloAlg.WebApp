import type { SimulatorState, SimulatorAction, HardwareConfig, Annotation } from '../types';
import { DEFAULT_CONFIG, DEFAULT_FP_REGISTERS, DEFAULT_INT_REGISTERS } from '../core/constants';
import { createReservationStations, executeCycle, initializeRegisterStatus } from '../core/tomasulo';

// Create initial state
export function createInitialState(config: HardwareConfig = DEFAULT_CONFIG): SimulatorState {
  return {
    config,
    cycle: 0,
    instructions: [],
    reservationStations: createReservationStations(config),
    fpRegisterFile: { ...DEFAULT_FP_REGISTERS },
    intRegisterFile: { ...DEFAULT_INT_REGISTERS },
    fpRegisterStatus: initializeRegisterStatus(DEFAULT_FP_REGISTERS),
    intRegisterStatus: initializeRegisterStatus(DEFAULT_INT_REGISTERS),
    annotations: [],
    isSimulationStarted: false,
    isSimulationComplete: false,
    instructionPointer: 0,
    isPlaying: false,
    playSpeed: 500,  // Default 500ms between cycles
  };
}

// Reducer function
export function simulatorReducer(
  state: SimulatorState,
  action: SimulatorAction
): SimulatorState {
  switch (action.type) {
    case 'CONFIGURE': {
      const newConfig = { ...state.config, ...action.payload };
      // If latencies are being updated, merge them properly
      if (action.payload.latencies) {
        newConfig.latencies = { ...state.config.latencies, ...action.payload.latencies };
      }
      return {
        ...state,
        config: newConfig,
        // Don't rebuild stations automatically - use REBUILD_RESERVATION_STATIONS
      };
    }

    case 'REBUILD_RESERVATION_STATIONS': {
      return {
        ...state,
        reservationStations: createReservationStations(state.config),
      };
    }

    case 'LOAD_PROGRAM': {
      return {
        ...state,
        instructions: action.payload,
        isSimulationStarted: false,
        isSimulationComplete: false,
        instructionPointer: 0,
        cycle: 0,
        annotations: [],
        reservationStations: createReservationStations(state.config),
        fpRegisterStatus: initializeRegisterStatus(state.fpRegisterFile),
        intRegisterStatus: initializeRegisterStatus(state.intRegisterFile),
      };
    }

    case 'START_SIMULATION': {
      if (state.instructions.length === 0) {
        return state;
      }
      return {
        ...state,
        isSimulationStarted: true,
        cycle: 0,
        annotations: [{
          cycle: 0,
          message: 'Simulation started',
          type: 'info' as const,
        }],
      };
    }

    case 'STEP': {
      if (!state.isSimulationStarted || state.isSimulationComplete) {
        return state;
      }

      const newCycle = state.cycle + 1;
      const result = executeCycle(
        newCycle,
        state.instructions,
        state.reservationStations,
        state.fpRegisterFile,
        state.intRegisterFile,
        state.fpRegisterStatus,
        state.intRegisterStatus,
        state.instructionPointer,
        state.config
      );

      const newAnnotations: Annotation[] = [
        ...state.annotations,
        ...result.annotations,
      ];

      if (result.isComplete) {
        newAnnotations.push({
          cycle: newCycle,
          message: 'Simulation complete - all instructions finished',
          type: 'info' as const,
        });
      }

      return {
        ...state,
        cycle: newCycle,
        instructions: result.instructions,
        reservationStations: result.reservationStations,
        fpRegisterFile: result.fpRegisterFile,
        intRegisterFile: result.intRegisterFile,
        fpRegisterStatus: result.fpRegisterStatus,
        intRegisterStatus: result.intRegisterStatus,
        instructionPointer: result.instructionPointer,
        annotations: newAnnotations,
        isSimulationComplete: result.isComplete,
        isPlaying: result.isComplete ? false : state.isPlaying,  // Stop playing when complete
      };
    }

    case 'RESET': {
      const freshState = createInitialState(state.config);
      return {
        ...freshState,
        // Keep the loaded instructions but reset their timing
        instructions: state.instructions.map(i => ({
          ...i,
          issuedAt: null,
          execStartAt: null,
          execEndAt: null,
          writeAt: null,
        })),
      };
    }

    case 'SET_FP_REGISTER': {
      return {
        ...state,
        fpRegisterFile: {
          ...state.fpRegisterFile,
          [action.payload.register]: action.payload.value,
        },
      };
    }

    case 'SET_INT_REGISTER': {
      return {
        ...state,
        intRegisterFile: {
          ...state.intRegisterFile,
          [action.payload.register]: action.payload.value,
        },
      };
    }

    case 'PLAY': {
      if (!state.isSimulationStarted || state.isSimulationComplete) {
        return state;
      }
      return {
        ...state,
        isPlaying: true,
      };
    }

    case 'PAUSE': {
      return {
        ...state,
        isPlaying: false,
      };
    }

    case 'SET_SPEED': {
      return {
        ...state,
        playSpeed: action.payload,
      };
    }

    default:
      return state;
  }
}
