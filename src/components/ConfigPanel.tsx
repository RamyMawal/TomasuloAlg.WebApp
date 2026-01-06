import { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';

export default function ConfigPanel() {
  const { state, updateConfig } = useSimulator();
  const { config, isSimulationStarted } = state;
  const [isExpanded, setIsExpanded] = useState(true);

  const handleStationChange = (
    key: 'fpAddStations' | 'fpMultStations' | 'intAddStations' | 'intMultStations',
    value: number
  ) => {
    if (isSimulationStarted) return;
    updateConfig({ [key]: Math.max(1, Math.min(10, value)) });
  };

  const handleLatencyChange = (
    key: keyof typeof config.latencies,
    value: number
  ) => {
    if (isSimulationStarted) return;
    updateConfig({
      latencies: {
        ...config.latencies,
        [key]: Math.max(1, Math.min(100, value)),
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-100 font-semibold text-left flex justify-between items-center hover:bg-slate-200 transition-colors"
      >
        <span>Hardware Configuration</span>
        <span className="text-slate-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {isSimulationStarted && (
            <p className="text-amber-600 text-sm bg-amber-50 rounded px-3 py-2">
              Reset to modify configuration
            </p>
          )}

          {/* Reservation Stations */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Reservation Stations</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">FP Adders</label>
                <input
                  type="number"
                  value={config.fpAddStations}
                  onChange={(e) => handleStationChange('fpAddStations', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={10}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">FP Multipliers</label>
                <input
                  type="number"
                  value={config.fpMultStations}
                  onChange={(e) => handleStationChange('fpMultStations', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={10}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Int Adders</label>
                <input
                  type="number"
                  value={config.intAddStations}
                  onChange={(e) => handleStationChange('intAddStations', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={10}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Int Multipliers</label>
                <input
                  type="number"
                  value={config.intMultStations}
                  onChange={(e) => handleStationChange('intMultStations', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={10}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Latencies */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Operation Latencies (cycles)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">FP Add</label>
                <input
                  type="number"
                  value={config.latencies.fpAdd}
                  onChange={(e) => handleLatencyChange('fpAdd', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">FP Sub</label>
                <input
                  type="number"
                  value={config.latencies.fpSub}
                  onChange={(e) => handleLatencyChange('fpSub', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">FP Mult</label>
                <input
                  type="number"
                  value={config.latencies.fpMult}
                  onChange={(e) => handleLatencyChange('fpMult', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">FP Div</label>
                <input
                  type="number"
                  value={config.latencies.fpDiv}
                  onChange={(e) => handleLatencyChange('fpDiv', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Int Add</label>
                <input
                  type="number"
                  value={config.latencies.intAdd}
                  onChange={(e) => handleLatencyChange('intAdd', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Int Sub</label>
                <input
                  type="number"
                  value={config.latencies.intSub}
                  onChange={(e) => handleLatencyChange('intSub', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Int Mult</label>
                <input
                  type="number"
                  value={config.latencies.intMult}
                  onChange={(e) => handleLatencyChange('intMult', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Int Div</label>
                <input
                  type="number"
                  value={config.latencies.intDiv}
                  onChange={(e) => handleLatencyChange('intDiv', parseInt(e.target.value) || 1)}
                  disabled={isSimulationStarted}
                  min={1}
                  max={100}
                  className="w-full mt-1 px-3 py-1.5 border rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
