import { useRef, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import type { Annotation } from '../types';

export default function AnnotationPanel() {
  const { state } = useSimulator();
  const { annotations, cycle } = state;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new annotations are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [annotations.length]);

  // Group annotations by cycle for display
  const annotationsByCycle = annotations.reduce((acc, ann) => {
    if (!acc[ann.cycle]) {
      acc[ann.cycle] = [];
    }
    acc[ann.cycle].push(ann);
    return acc;
  }, {} as Record<number, Annotation[]>);

  const cycles = Object.keys(annotationsByCycle)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 bg-slate-100 border-b flex-shrink-0">
        <h2 className="font-semibold text-slate-700">Event Log</h2>
      </div>

      <div
        ref={scrollRef}
        className="p-4 overflow-y-auto flex-grow"
        style={{ maxHeight: '300px' }}
      >
        {annotations.length === 0 ? (
          <p className="text-slate-400 text-sm text-center">
            Events will appear here as the simulation runs.
          </p>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycleNum) => (
              <CycleAnnotations
                key={cycleNum}
                cycle={cycleNum}
                annotations={annotationsByCycle[cycleNum]}
                isCurrent={cycleNum === cycle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CycleAnnotationsProps {
  cycle: number;
  annotations: Annotation[];
  isCurrent: boolean;
}

function CycleAnnotations({ cycle, annotations, isCurrent }: CycleAnnotationsProps) {
  return (
    <div className={`rounded-lg ${isCurrent ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-slate-50'}`}>
      <div className={`px-3 py-1.5 border-b ${isCurrent ? 'border-blue-200' : 'border-slate-200'}`}>
        <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-700' : 'text-slate-600'}`}>
          Cycle {cycle}
        </span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {annotations.map((ann, idx) => (
          <AnnotationItem key={idx} annotation={ann} />
        ))}
      </div>
    </div>
  );
}

function AnnotationItem({ annotation }: { annotation: Annotation }) {
  const typeStyles = {
    issue: 'text-blue-600',
    execute: 'text-yellow-600',
    write: 'text-green-600',
    hazard: 'text-orange-600',
    info: 'text-slate-600',
  };

  const typeIcons = {
    issue: '→',
    execute: '⚙',
    write: '✓',
    hazard: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`text-xs flex items-start gap-2 ${typeStyles[annotation.type]}`}>
      <span className="flex-shrink-0">{typeIcons[annotation.type]}</span>
      <span>{annotation.message}</span>
    </div>
  );
}
