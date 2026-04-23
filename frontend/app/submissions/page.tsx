'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Link as MuiLink,
  MenuItem,
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
import { useMemo, useState } from 'react';

import { PriorityChip, StatusChip } from '@/components/SubmissionChips';
import { formatDate } from '@/lib/date';
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

export default function SubmissionsPage() {
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [brokerId, setBrokerId] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [page, setPage] = useState(0);

  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
      page: page + 1,
    }),
    [status, brokerId, companyQuery, page],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const submissions = submissionsQuery.data;
  const brokerQuery = useBrokerOptions();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Browse and filter submissions by status, broker, or company name.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as SubmissionStatus | '');
                  setPage(0);
                }}
                fullWidth
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
                onChange={(event) => {
                  setBrokerId(event.target.value);
                  setPage(0);
                }}
                fullWidth
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
                onChange={(event) => {
                  setCompanyQuery(event.target.value);
                  setPage(0);
                }}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <Box overflow="auto">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Broker</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Docs</TableCell>
                  <TableCell align="right">Notes</TableCell>
                  <TableCell>Latest note</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions?.results.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.broker.name}</TableCell>
                    <TableCell>{row.company.legalName}</TableCell>
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
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={row.priority} />
                    </TableCell>
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
            count={submissions?.count ?? 0}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
          />
        </Card>
      </Stack>
    </Container>
  );
}
