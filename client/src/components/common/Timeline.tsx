import React from 'react';
import { CheckCircle2, Clock, CircleDot, Wrench, ShieldCheck, FileCheck, CheckCheck } from 'lucide-react';
import { ClaimTimelineEvent, ClaimTimelineStage } from '../../types/index.js';

interface TimelineProps {
  events: ClaimTimelineEvent[];
  currentStage?: ClaimTimelineStage;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const CANONICAL_CLAIM_STAGES: ClaimTimelineStage[] = [
  'Submitted',
  'Received',
  'Assessed',
  'Authorised',
  'In Progress',
  'Completed',
  'Ready for Collection',
];

export function mapToCanonicalStage(stageName: string): ClaimTimelineStage {
  const s = (stageName || '').trim().toLowerCase();
  if (s.includes('submit') || s.includes('accident') || s.includes('report')) return 'Submitted';
  if (s.includes('receiv') || s.includes('number')) return 'Received';
  if (s.includes('assess')) return 'Assessed';
  if (s.includes('authoris') || s.includes('authoriz')) return 'Authorised';
  if (s.includes('progress') || s.includes('repair') || s.includes('panelbeat') || s.includes('paint')) return 'In Progress';
  if (s.includes('complet') || s.includes('done') || s.includes('quality') || s.includes('inspect')) return 'Completed';
  if (s.includes('ready') || s.includes('collect') || s.includes('handover') || s.includes('close') || s.includes('settle')) return 'Ready for Collection';
  return 'In Progress';
}

const STAGE_SUBTITLES: Record<ClaimTimelineStage, string> = {
  'Submitted': 'Claim lodged with insurer',
  'Received': 'Reference generated',
  'Assessed': 'Damage inspection completed',
  'Authorised': 'Repair quote approved',
  'In Progress': 'Panelbeating & assembly',
  'Completed': 'QC & paint cure done',
  'Ready for Collection': 'Available for pick-up',
  'Accident Reported': 'Claim lodged with insurer',
  'Claim Submitted': 'Claim lodged with insurer',
  'Claim Number Received': 'Reference generated',
  'Assessment': 'Damage inspection completed',
  'Authorisation': 'Repair quote approved',
  'Repair': 'Panelbeating & assembly',
  'Closed': 'Settlement finalized',
};

export const Timeline: React.FC<TimelineProps> = ({
  events = [],
  currentStage,
  className = '',
  orientation = 'horizontal',
}) => {
  const normalizedCurrent = currentStage ? mapToCanonicalStage(currentStage) : undefined;
  const currentIdx = normalizedCurrent ? CANONICAL_CLAIM_STAGES.indexOf(normalizedCurrent) : -1;

  // Map each canonical stage with relevant event details
  const stageData = CANONICAL_CLAIM_STAGES.map((stage, index) => {
    // Look for exact match or normalized match
    const event = events.find((e) => mapToCanonicalStage(e.stage) === stage);
    let status: 'completed' | 'in_progress' | 'pending' = event?.status || 'pending';

    if (currentIdx !== -1) {
      if (index < currentIdx) status = 'completed';
      else if (index === currentIdx) {
        status = status === 'completed' ? 'completed' : 'in_progress';
      } else {
        status = 'pending';
      }
    }

    return {
      stage,
      subtitle: STAGE_SUBTITLES[stage] || '',
      date: event?.date,
      status,
      notes: event?.notes,
    };
  });

  if (orientation === 'vertical') {
    return (
      <div className={`relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5E5] ${className}`}>
        {stageData.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';

          return (
            <div key={item.stage} className="relative group">
              <div
                className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ring-4 ring-white transition-all ${
                  isCompleted
                    ? 'bg-[#C62828] text-white'
                    : isInProgress
                    ? 'bg-amber-500 text-white shadow-md animate-pulse'
                    : 'bg-[#F2F2F2] border border-[#D9D9D9] text-[#6B6B6B]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isInProgress ? (
                  <CircleDot className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="ml-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5
                      className={`text-sm font-semibold ${
                        isInProgress ? 'text-[#C62828] font-bold' : isCompleted ? 'text-[#111111]' : 'text-[#6B6B6B]'
                      }`}
                    >
                      {item.stage}
                    </h5>
                    {isInProgress && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded">
                        Active Stage
                      </span>
                    )}
                  </div>
                  {item.date && (
                    <span className="text-[11px] text-[#6B6B6B] font-mono">
                      {new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{item.subtitle}</p>
                {item.notes && (
                  <div className="mt-1.5 p-2 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-xs text-[#333333]">
                    <span className="font-semibold text-[#111111]">Status update:</span> {item.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout (standard client claim overview)
  return (
    <div className={`w-full overflow-x-auto pb-4 ${className}`}>
      <div className="flex items-start min-w-[760px] justify-between relative px-2">
        {/* Progress connector line */}
        <div className="absolute top-4 left-10 right-10 h-0.5 bg-[#E5E5E5] -z-0" />

        {stageData.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';

          return (
            <div key={item.stage} className="relative z-10 flex flex-col items-center text-center flex-1 px-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-[#C62828] text-white ring-[#C62828]/20'
                    : isInProgress
                    ? 'bg-amber-500 text-white shadow-md ring-amber-200 animate-pulse'
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
                className={`text-xs mt-2.5 font-semibold max-w-[95px] leading-tight ${
                  isInProgress ? 'text-[#C62828] font-bold' : isCompleted ? 'text-[#111111]' : 'text-[#6B6B6B]'
                }`}
              >
                {item.stage}
              </span>

              <span className="text-[10px] text-[#888888] mt-0.5 line-clamp-1 max-w-[95px]">
                {item.subtitle}
              </span>

              {item.date ? (
                <span className="text-[10px] font-mono text-[#6B6B6B] mt-1 bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                  {new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                </span>
              ) : (
                <span className="text-[10px] text-[#A0A0A0] mt-1">Pending</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
