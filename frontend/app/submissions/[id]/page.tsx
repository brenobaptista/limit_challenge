'use client';

import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Link as MuiLink,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { PriorityChip, StatusChip } from '@/components/SubmissionChips';
import { formatDateTime } from '@/lib/date';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

function Section({
  title,
  children,
  columns = 1,
}: {
  title: string;
  children: React.ReactNode;
  columns?: number;
}) {
  return (
    <Card variant="outlined">
      <CardHeader title={<Typography variant="subtitle1">{title}</Typography>} />
      <Divider />
      <CardContent>
        {columns > 1 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, 1fr)` },
              gap: 3,
            }}
          >
            {children}
          </Box>
        ) : (
          <Stack spacing={3}>{children}</Stack>
        )}
      </CardContent>
    </Card>
  );
}

function Item({ primary, secondary }: { primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={500} component="div">
        {primary}
      </Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary" display="block">
          {secondary}
        </Typography>
      )}
    </Box>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const detailQuery = useSubmissionDetail(submissionId);
  const { data, isLoading, isError } = detailQuery;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <div>
            <Typography variant="h4">Submission detail</Typography>
            <Typography color="text.secondary">
              Use this page to present the full submission payload along with contacts, documents,
              and notes.
            </Typography>
          </div>
          <MuiLink component={Link} href="/submissions" underline="none">
            Back to list
          </MuiLink>
        </Box>

        {isLoading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}
        {isError && <Alert severity="error">Failed to load submission.</Alert>}
        {data && (
          <>
            <Section title={`Submission #${data.id}`}>
              <Item
                primary={
                  <Box display="flex" justifyContent="space-between" gap={1}>
                    <span>{data.summary}</span>
                    <Stack direction="row" spacing={1}>
                      <StatusChip status={data.status} />
                      <PriorityChip priority={data.priority} />
                    </Stack>
                  </Box>
                }
              />
              <Item
                primary={`Created ${formatDateTime(data.createdAt)}`}
                secondary={`Updated ${formatDateTime(data.updatedAt)}`}
              />
            </Section>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ '& > *': { flex: 1 } }}
            >
              <Section title="Broker">
                <Item primary={data.broker.name} secondary={data.broker.primaryContactEmail} />
              </Section>

              <Section title="Company">
                <Item
                  primary={data.company.legalName}
                  secondary={
                    <>
                      {data.company.industry}
                      <br />
                      {data.company.headquartersCity}
                    </>
                  }
                />
              </Section>

              <Section title="Owner">
                <Item primary={data.owner.fullName} secondary={data.owner.email} />
              </Section>
            </Stack>

            <Section title="Contacts" columns={2}>
              {data.contacts.map((contact) => (
                <Item
                  key={contact.id}
                  primary={contact.name}
                  secondary={
                    <>
                      {[contact.role, contact.email, contact.phone]
                        .filter(Boolean)
                        .flatMap((item, i) => (i === 0 ? [item] : [<br key={i} />, item]))}
                    </>
                  }
                />
              ))}
            </Section>

            <Section title="Documents" columns={2}>
              {data.documents.map((document) => (
                <Item
                  key={document.id}
                  primary={
                    <MuiLink
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener"
                      underline="hover"
                    >
                      {document.title}
                    </MuiLink>
                  }
                  secondary={
                    <>
                      {document.docType}
                      <br />
                      {formatDateTime(document.uploadedAt)}
                    </>
                  }
                />
              ))}
            </Section>

            <Section title="Notes">
              {data.notes.map((note) => (
                <Item
                  key={note.id}
                  primary={note.body}
                  secondary={
                    <>
                      {note.authorName}
                      <br />
                      {formatDateTime(note.createdAt)}
                    </>
                  }
                />
              ))}
            </Section>
          </>
        )}
      </Stack>
    </Container>
  );
}
