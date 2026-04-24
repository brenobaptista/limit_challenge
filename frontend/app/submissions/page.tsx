'use client';

import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Link as MuiLink,
  MenuItem,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { PriorityChip, StatusChip } from '@/components/SubmissionChips';
import { formatDate, toLocalDayEndISO, toLocalDayStartISO } from '@/lib/date';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const PAGE_SIZE = 10;
const ALL_COLS = 100;

export default function SubmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') ?? '') as SubmissionStatus | '';
  const brokerId = searchParams.get('brokerId') ?? '';
  const companyQuery = searchParams.get('companySearch') ?? '';
  const createdFrom = searchParams.get('createdFrom') ?? '';
  const createdTo = searchParams.get('createdTo') ?? '';
  const hasDocuments = searchParams.get('hasDocuments') === 'true';
  const hasNotes = searchParams.get('hasNotes') === 'true';
  const urlPage = Number(searchParams.get('page') ?? '1');

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
      createdFrom: createdFrom ? toLocalDayStartISO(createdFrom) : undefined,
      createdTo: createdTo ? toLocalDayEndISO(createdTo) : undefined,
      hasDocuments: hasDocuments || undefined,
      hasNotes: hasNotes || undefined,
      page: urlPage,
    }),
    [status, brokerId, companyQuery, createdFrom, createdTo, hasDocuments, hasNotes, urlPage],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const { data, isLoading, isError } = submissionsQuery;
  const brokerQuery = useBrokerOptions();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">
          Submissions
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Status"
                value={status}
                onChange={(event) => updateFilters({ status: event.target.value, page: undefined })}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Broker"
                value={brokerId}
                onChange={(event) =>
                  updateFilters({ brokerId: event.target.value, page: undefined })
                }
              >
                <MenuItem value="">All brokers</MenuItem>
                {brokerQuery.data?.map((broker) => (
                  <MenuItem key={broker.id} value={String(broker.id)}>
                    {broker.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Company search"
                value={companyQuery}
                onChange={(event) =>
                  updateFilters({ companySearch: event.target.value, page: undefined })
                }
              />
              <TextField
                type="date"
                label="Created from"
                value={createdFrom}
                onChange={(event) =>
                  updateFilters({ createdFrom: event.target.value, page: undefined })
                }
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { max: createdTo || undefined },
                }}
              />
              <TextField
                type="date"
                label="Created to"
                value={createdTo}
                onChange={(event) =>
                  updateFilters({ createdTo: event.target.value, page: undefined })
                }
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: createdFrom || undefined },
                }}
              />
              <Stack direction="row" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasDocuments}
                      onChange={(event) =>
                        updateFilters({
                          hasDocuments: event.target.checked ? 'true' : undefined,
                          page: undefined,
                        })
                      }
                    />
                  }
                  label="Has documents"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasNotes}
                      onChange={(event) =>
                        updateFilters({
                          hasNotes: event.target.checked ? 'true' : undefined,
                          page: undefined,
                        })
                      }
                    />
                  }
                  label="Has notes"
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <Box overflow="auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Broker</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Docs</TableCell>
                  <TableCell align="right">Notes</TableCell>
                  <TableCell>Latest note</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={ALL_COLS} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={ALL_COLS}>
                      <Alert severity="error">Failed to load submissions.</Alert>
                    </TableCell>
                  </TableRow>
                )}
                {data?.results.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={ALL_COLS}
                      align="center"
                      sx={{ py: 4, color: 'text.secondary' }}
                    >
                      No submissions found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.results.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.company.legalName}</TableCell>
                    <TableCell>{row.broker.name}</TableCell>
                    <TableCell>{row.owner.fullName}</TableCell>
                    <TableCell align="right">{row.documentCount}</TableCell>
                    <TableCell align="right">{row.noteCount}</TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      {row.latestNote && (
                        <Tooltip title={row.latestNote.bodyPreview} placement="top-start">
                          <Typography
                            variant="caption"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {row.latestNote.bodyPreview}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={row.priority} />
                    </TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell align="right">
                      <MuiLink
                        component={Link}
                        href={`/submissions/${row.id}`}
                        underline="hover"
                        variant="body2"
                      >
                        View
                      </MuiLink>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={data?.count ?? 0}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            page={urlPage - 1}
            onPageChange={(_, newPage) =>
              updateFilters({ page: newPage > 0 ? String(newPage + 1) : undefined })
            }
          />
        </Card>
      </Stack>
    </Container>
  );
}
