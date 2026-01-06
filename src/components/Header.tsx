import { useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';

export default function Header() {
  const { state, step, reset, startSimulation, play, pause, setSpeed } = useSimulator();
  const { cycle, isSimulationStarted, isSimulationComplete, instructions, isPlaying, playSpeed } = state;

  const canStart = instructions.length > 0 && !isSimulationStarted;
  const canStep = isSimulationStarted && !isSimulationComplete;
  const canPlay = isSimulationStarted && !isSimulationComplete;

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      step();
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, step]);

  // Speed presets (in ms)
  const speedPresets = [
    { label: '0.25x', value: 2000 },
    { label: '0.5x', value: 1000 },
    { label: '1x', value: 500 },
    { label: '2x', value: 250 },
    { label: '4x', value: 125 },
  ];

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tomasulo Algorithm Simulator</h1>
            <p className="text-slate-400 text-sm">
              Out-of-order instruction execution visualization
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Cycle counter */}
            <div className="bg-slate-700 px-4 py-2 rounded-lg">
              <span className="text-slate-400 text-sm">Cycle</span>
              <span className="ml-2 text-2xl font-mono font-bold text-cyan-400">
                {cycle}
              </span>
            </div>

            {/* Control buttons */}
            <div className="flex gap-2">
              {!isSimulationStarted ? (
                <button
                  onClick={startSimulation}
                  disabled={!canStart}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canStart
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Start
                </button>
              ) : (
                <>
                  {/* Play/Pause button */}
                  <button
                    onClick={handlePlayPause}
                    disabled={!canPlay}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      canPlay
                        ? isPlaying
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>

                  {/* Step button */}
                  <button
                    onClick={step}
                    disabled={!canStep || isPlaying}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      canStep && !isPlaying
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Step
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  pause();
                  reset();
                }}
                className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Speed control (visible when simulation started) */}
        {isSimulationStarted && !isSimulationComplete && (
          <div className="mt-3 flex items-center gap-4 bg-slate-700/50 rounded-lg px-4 py-2">
            <span className="text-slate-400 text-sm">Speed:</span>
            <div className="flex gap-1">
              {speedPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setSpeed(preset.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    playSpeed === preset.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={playSpeed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-slate-400 text-sm w-16 text-right">
                {playSpeed}ms
              </span>
            </div>
          </div>
        )}

        {/* Status message */}
        {isSimulationComplete && (
          <div className="mt-3 bg-green-600/20 border border-green-500 rounded-lg px-4 py-2 text-green-300">
            Simulation complete! All instructions have finished execution.
          </div>
        )}
      </div>
    </header>
  );
}
