import { useSimulator } from '../context/SimulatorContext';

export default function RegisterFile() {
  const { state } = useSimulator();
  const { fpRegisterFile, intRegisterFile, fpRegisterStatus, intRegisterStatus } = state;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-slate-100 border-b">
        <h2 className="font-semibold text-slate-700">Register Files</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* FP Registers */}
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Floating Point Registers</h3>
          <div className="grid grid-cols-4 gap-1 text-xs">
            {Object.entries(fpRegisterFile).map(([reg, value]) => (
              <RegisterCell
                key={reg}
                register={reg}
                value={value}
                producer={fpRegisterStatus[reg]}
              />
            ))}
          </div>
        </div>

        {/* Integer Registers */}
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Integer Registers</h3>
          <div className="grid grid-cols-4 gap-1 text-xs">
            {Object.entries(intRegisterFile).map(([reg, value]) => (
              <RegisterCell
                key={reg}
                register={reg}
                value={value}
                producer={intRegisterStatus[reg]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-50 border-t text-xs text-slate-600">
        <span className="text-orange-600 font-medium">[RSname]</span> = Waiting for result from RS
      </div>
    </div>
  );
}

interface RegisterCellProps {
  register: string;
  value: number;
  producer: string | null;
}

function RegisterCell({ register, value, producer }: RegisterCellProps) {
  const hasProducer = producer !== null;

  return (
    <div
      className={`px-2 py-1 rounded border ${
        hasProducer ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-mono font-medium text-slate-700">{register}</span>
        <span className="font-mono text-slate-500">
          {Number.isInteger(value) ? value : value.toFixed(1)}
        </span>
      </div>
      {hasProducer && (
        <div className="text-orange-600 font-mono text-[10px] mt-0.5">
          [{producer}]
        </div>
      )}
    </div>
  );
}
