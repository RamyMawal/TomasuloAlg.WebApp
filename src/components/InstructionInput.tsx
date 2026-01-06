import { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { EXAMPLE_PROGRAMS } from '../core/constants';

export default function InstructionInput() {
  const { loadProgram, state } = useSimulator();
  const { isSimulationStarted, instructions } = state;
  const [programText, setProgramText] = useState(EXAMPLE_PROGRAMS.basic);

  const handleLoadProgram = () => {
    loadProgram(programText);
  };

  const handleExampleSelect = (key: keyof typeof EXAMPLE_PROGRAMS) => {
    setProgramText(EXAMPLE_PROGRAMS[key]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="font-semibold text-slate-700 mb-3">Instructions</h2>

      {/* Example programs dropdown */}
      <div className="mb-3">
        <label className="text-sm text-slate-600 block mb-1">Load Example:</label>
        <select
          onChange={(e) => handleExampleSelect(e.target.value as keyof typeof EXAMPLE_PROGRAMS)}
          className="w-full px-3 py-1.5 border rounded-md text-sm"
          disabled={isSimulationStarted}
        >
          <option value="basic">Basic (RAW + WAW hazards)</option>
          <option value="raw_hazard">RAW Hazard Example</option>
          <option value="waw_hazard">WAW Hazard Example</option>
          <option value="integer_ops">Integer Operations</option>
          <option value="mixed">Mixed FP + Integer</option>
        </select>
      </div>

      {/* Instruction input textarea */}
      <div className="mb-3">
        <label className="text-sm text-slate-600 block mb-1">Program:</label>
        <textarea
          value={programText}
          onChange={(e) => setProgramText(e.target.value)}
          disabled={isSimulationStarted}
          rows={6}
          placeholder="Enter instructions (e.g., ADD.D F0, F2, F4)"
          className="w-full px-3 py-2 border rounded-md font-mono text-sm disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {/* Syntax help */}
      <div className="text-xs text-slate-500 mb-3 bg-slate-50 rounded p-2">
        <p className="font-medium mb-1">Supported instructions:</p>
        <p>FP: ADD.D, SUB.D, MUL.D, DIV.D</p>
        <p>Int: ADD, SUB, MUL, DIV</p>
        <p className="mt-1">Format: OP DEST, SRC1, SRC2</p>
        <p>FP registers: F0-F30 (even)</p>
        <p>Int registers: R0-R15</p>
      </div>

      {/* Load button */}
      <button
        onClick={handleLoadProgram}
        disabled={isSimulationStarted}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          isSimulationStarted
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-slate-700 hover:bg-slate-800 text-white'
        }`}
      >
        Load Program
      </button>

      {/* Loaded instructions count */}
      {instructions.length > 0 && (
        <p className="mt-2 text-sm text-slate-600">
          {instructions.length} instruction{instructions.length !== 1 ? 's' : ''} loaded
        </p>
      )}
    </div>
  );
}
