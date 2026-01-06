import { useSimulator } from '../context/SimulatorContext';
import type { ReservationStation, FunctionalUnitType } from '../types';

export default function ReservationStations() {
  const { state } = useSimulator();
  const { reservationStations } = state;

  // Group stations by type
  const fpAddStations = reservationStations.filter(rs => rs.type === 'FP_ADD');
  const fpMultStations = reservationStations.filter(rs => rs.type === 'FP_MULT');
  const intAddStations = reservationStations.filter(rs => rs.type === 'INT_ADD');
  const intMultStations = reservationStations.filter(rs => rs.type === 'INT_MULT');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-slate-100 border-b">
        <h2 className="font-semibold text-slate-700">Reservation Stations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <StationGroup title="FP Adders" stations={fpAddStations} color="blue" />
        <StationGroup title="FP Multipliers" stations={fpMultStations} color="purple" />
        <StationGroup title="Integer Adders" stations={intAddStations} color="teal" />
        <StationGroup title="Integer Multipliers" stations={intMultStations} color="amber" />
      </div>
    </div>
  );
}

interface StationGroupProps {
  title: string;
  stations: ReservationStation[];
  color: 'blue' | 'purple' | 'teal' | 'amber';
}

function StationGroup({ title, stations, color }: StationGroupProps) {
  const headerColors = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    teal: 'bg-teal-100 text-teal-800',
    amber: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`px-3 py-2 ${headerColors[color]} font-medium text-sm`}>
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-2 py-1.5 text-left font-semibold text-slate-600">Name</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Busy</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Op</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Vj</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Vk</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Qj</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Qk</th>
              <th className="px-2 py-1.5 text-center font-semibold text-slate-600">Dest</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((rs) => (
              <StationRow key={rs.name} station={rs} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StationRow({ station }: { station: ReservationStation }) {
  const getRowColor = () => {
    if (!station.busy) return 'bg-white';
    if (station.isExecuting) {
      return station.remainingCycles === 0 ? 'bg-blue-50' : 'bg-yellow-50';
    }
    if (station.qj !== null || station.qk !== null) return 'bg-orange-50';
    return 'bg-green-50';
  };

  const formatValue = (v: number | null): string => {
    if (v === null) return '-';
    return Number.isInteger(v) ? v.toString() : v.toFixed(2);
  };

  return (
    <tr className={`border-b ${getRowColor()} transition-colors`}>
      <td className="px-2 py-1.5 font-mono font-medium">{station.name}</td>
      <td className="px-2 py-1.5 text-center">
        {station.busy ? (
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
        ) : (
          <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center font-mono">
        {station.op || <span className="text-slate-300">-</span>}
      </td>
      <td className="px-2 py-1.5 text-center font-mono">
        {station.busy ? (
          station.vj !== null ? (
            formatValue(station.vj)
          ) : (
            <span className="text-slate-300">-</span>
          )
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center font-mono">
        {station.busy ? (
          station.vk !== null ? (
            formatValue(station.vk)
          ) : (
            <span className="text-slate-300">-</span>
          )
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center font-mono">
        {station.qj ? (
          <span className="text-orange-600 font-medium">{station.qj}</span>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center font-mono">
        {station.qk ? (
          <span className="text-orange-600 font-medium">{station.qk}</span>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center font-mono">
        {station.dest || <span className="text-slate-300">-</span>}
      </td>
    </tr>
  );
}
