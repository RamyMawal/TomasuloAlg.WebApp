import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { SimulatorState, SimulatorAction, Instruction, HardwareConfig } from '../types';
import { simulatorReducer, createInitialState } from './simulatorReducer';
import { parseProgram } from '../core/instructions';

// Context type
interface SimulatorContextType {
  state: SimulatorState;
  dispatch: Dispatch<SimulatorAction>;
  // Convenience actions
  loadProgram: (programText: string) => void;
  step: () => void;
  reset: () => void;
  startSimulation: () => void;
  updateConfig: (config: Partial<HardwareConfig>) => void;
  setFpRegister: (register: string, value: number) => void;
  setIntRegister: (register: string, value: number) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
}

// Create the context
const SimulatorContext = createContext<SimulatorContextType | null>(null);

// Provider component
export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulatorReducer, undefined, createInitialState);

  // Convenience action functions
  const loadProgram = (programText: string) => {
    const instructions: Instruction[] = parseProgram(programText);
    dispatch({ type: 'LOAD_PROGRAM', payload: instructions });
  };

  const step = () => {
    dispatch({ type: 'STEP' });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const startSimulation = () => {
    dispatch({ type: 'START_SIMULATION' });
  };

  const updateConfig = (config: Partial<HardwareConfig>) => {
    dispatch({ type: 'CONFIGURE', payload: config });
    dispatch({ type: 'REBUILD_RESERVATION_STATIONS' });
  };

  const setFpRegister = (register: string, value: number) => {
    dispatch({ type: 'SET_FP_REGISTER', payload: { register, value } });
  };

  const setIntRegister = (register: string, value: number) => {
    dispatch({ type: 'SET_INT_REGISTER', payload: { register, value } });
  };

  const play = () => {
    dispatch({ type: 'PLAY' });
  };

  const pause = () => {
    dispatch({ type: 'PAUSE' });
  };

  const setSpeed = (speed: number) => {
    dispatch({ type: 'SET_SPEED', payload: speed });
  };

  const value: SimulatorContextType = {
    state,
    dispatch,
    loadProgram,
    step,
    reset,
    startSimulation,
    updateConfig,
    setFpRegister,
    setIntRegister,
    play,
    pause,
    setSpeed,
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

// Hook to use the simulator context
export function useSimulator(): SimulatorContextType {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}
