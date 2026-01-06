import { useSimulator } from '../context/SimulatorContext';
import { formatInstruction } from '../core/instructions';

export default function InstructionTable() {
  const { state } = useSimulator();
  const { instructions, cycle } = state;

  if (instructions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-slate-500">
        No instructions loaded. Enter a program and click "Load Program" to begin.
      </div>
    );
  }

  // Determine row status for coloring
  const getRowStatus = (instr: typeof instructions[0]) => {
    if (instr.writeAt !== null) return 'completed';
    if (instr.execStartAt !== null) return 'executing';
    if (instr.issuedAt !== null) return 'issued';
    return 'pending';
  };

  const statusColors = {
    pending: 'bg-slate-50',
    issued: 'bg-orange-50',
    executing: 'bg-yellow-50',
    completed: 'bg-green-50',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-slate-100 border-b">
        <h2 className="font-semibold text-slate-700">Instruction Status</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-2 text-left font-semibold text-slate-600">#</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Instruction</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-600">Issue</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-600">Exec Start</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-600">Exec End</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-600">Write</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {instructions.map((instr) => {
              const status = getRowStatus(instr);
              // Calculate exec end: when remaining cycles hits 0, it's exec start + latency - 1
              const execEnd = instr.execStartAt !== null && instr.writeAt !== null
                ? instr.writeAt - 1
                : null;

              return (
                <tr
                  key={instr.id}
                  className={`border-b transition-colors ${statusColors[status]}`}
                >
                  <td className="px-4 py-2 font-mono text-slate-500">{instr.id}</td>
                  <td className="px-4 py-2 font-mono font-medium">{formatInstruction(instr)}</td>
                  <td className="px-4 py-2 text-center font-mono">
                    {instr.issuedAt !== null ? (
                      <span className={instr.issuedAt === cycle ? 'text-blue-600 font-bold' : ''}>
                        {instr.issuedAt}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-mono">
                    {instr.execStartAt !== null ? (
                      <span className={instr.execStartAt === cycle ? 'text-blue-600 font-bold' : ''}>
                        {instr.execStartAt}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-mono">
                    {execEnd !== null ? (
                      <span className={execEnd === cycle ? 'text-blue-600 font-bold' : ''}>
                        {execEnd}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center font-mono">
                    {instr.writeAt !== null ? (
                      <span className={instr.writeAt === cycle ? 'text-green-600 font-bold' : ''}>
                        {instr.writeAt}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <StatusBadge status={status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-50 border-t flex gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-200"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-200"></div>
          <span>Issued</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-200"></div>
          <span>Executing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200"></div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-slate-200 text-slate-600',
    issued: 'bg-orange-200 text-orange-700',
    executing: 'bg-yellow-200 text-yellow-700',
    completed: 'bg-green-200 text-green-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
