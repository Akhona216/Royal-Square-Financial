import React from 'react';
import { CheckCircle2, Clock, CircleDot, AlertCircle } from 'lucide-react';
import { ClaimTimelineEvent, ClaimTimelineStage } from '../../types/index.js';

interface TimelineProps {
  events: ClaimTimelineEvent[];
  currentStage?: ClaimTimelineStage;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const ALL_STAGES: ClaimTimelineStage[] = [
  'Accident Reported',
  'Claim Submitted',
  'Claim Number Received',
  'Assessment',
  'Authorisation',
  'Repair',
  'Closed',
];

export const Timeline: React.FC<TimelineProps> = ({
  events = [],
  currentStage,
  className = '',
  orientation = 'horizontal',
}) => {
  // Map all stages with event information
  const stageData = ALL_STAGES.map((stage) => {
    const event = events.find((e) => e.stage === stage);
    let status: 'completed' | 'in_progress' | 'pending' = event?.status || 'pending';
    
    if (currentStage) {
      const targetIdx = ALL_STAGES.indexOf(currentStage);
      const stageIdx = ALL_STAGES.indexOf(stage);
      if (stageIdx < targetIdx) status = 'completed';
      else if (stageIdx === targetIdx && status === 'pending') status = 'in_progress';
    }

    return {
      stage,
      date: event?.date,
      status,
      notes: event?.notes,
    };
  });

  if (orientation === 'vertical') {
    return (
      <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9D9D9] ${className}`}>
        {stageData.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';

          return (
            <div key={item.stage} className="relative group">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ring-4 ring-white ${
                  isCompleted
                    ? 'bg-[#C62828] text-white'
                    : isInProgress
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-[#F2F2F2] border border-[#D9D9D9] text-[#6B6B6B]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isInProgress ? (
                  <CircleDot className="w-3.5 h-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="ml-2">
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm font-semibold ${isInProgress ? 'text-[#C62828]' : isCompleted ? 'text-[#111111]' : 'text-[#6B6B6B]'}`}>
                    {item.stage}
                  </h5>
                  {item.date && (
                    <span className="text-[11px] text-[#6B6B6B]">
                      {new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                {item.notes && <p className="text-xs text-[#6B6B6B] mt-0.5">{item.notes}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`w-full overflow-x-auto pb-2 ${className}`}>
      <div className="flex items-center min-w-[650px] justify-between relative">
        {/* Progress connector line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#D9D9D9] -z-0" />

        {stageData.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';

          return (
            <div key={item.stage} className="relative z-10 flex flex-col items-center text-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-all ${
                  isCompleted
                    ? 'bg-[#C62828] text-white shadow-sm'
                    : isInProgress
                    ? 'bg-amber-500 text-white shadow-sm ring-amber-100'
                    : 'bg-[#F2F2F2] border border-[#D9D9D9] text-[#6B6B6B]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isInProgress ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium max-w-[90px] leading-tight ${
                  isInProgress ? 'text-[#C62828] font-bold' : isCompleted ? 'text-[#111111]' : 'text-[#6B6B6B]'
                }`}
              >
                {item.stage}
              </span>
              {item.date && (
                <span className="text-[10px] text-[#6B6B6B] mt-0.5">
                  {new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
