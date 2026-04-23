import { Chip } from '@mui/material';

import { SubmissionPriority, SubmissionStatus } from '@/lib/types';

const STATUS_COLOR: Record<SubmissionStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> =
  {
    new: 'info',
    in_review: 'warning',
    closed: 'success',
    lost: 'error',
  };

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  closed: 'Closed',
  lost: 'Lost',
};

const PRIORITY_COLOR: Record<SubmissionPriority, 'default' | 'error' | 'warning'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

const PRIORITY_LABEL: Record<SubmissionPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function StatusChip({ status }: { status: SubmissionStatus }) {
  return (
    <Chip
      label={STATUS_LABEL[status]}
      size="small"
      variant="outlined"
      color={STATUS_COLOR[status]}
    />
  );
}

export function PriorityChip({ priority }: { priority: SubmissionPriority }) {
  return (
    <Chip
      label={PRIORITY_LABEL[priority]}
      size="small"
      variant="outlined"
      color={PRIORITY_COLOR[priority]}
    />
  );
}
