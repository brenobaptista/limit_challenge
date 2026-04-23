'use client';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { PriorityChip, StatusChip } from '@/components/SubmissionChips';
import { formatDateTime } from '@/lib/date';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardHeader title={<Typography variant="subtitle1">{title}</Typography>} />
      <Divider />
      <CardContent>
        <Stack divider={<Divider />} spacing={2}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function Item({ primary, secondary }: { primary: React.ReactNode; secondary: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="body2" fontWeight={500}>
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
  const detail = detailQuery.data;

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

        {detail && (
          <>
            <Section title={`Submission #${detail.id}`}>
              <Item
                primary={detail.summary}
                secondary={
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <StatusChip status={detail.status} />
                    <PriorityChip priority={detail.priority} />
                  </Stack>
                }
              />
              <Item
                primary={`Created ${formatDateTime(detail.createdAt)}`}
                secondary={`Updated ${formatDateTime(detail.updatedAt)}`}
              />
            </Section>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ '& > *': { flex: 1 } }}
            >
              <Section title="Broker">
                <Item primary={detail.broker.name} secondary={detail.broker.primaryContactEmail} />
              </Section>

              <Section title="Company">
                <Item
                  primary={detail.company.legalName}
                  secondary={
                    <>
                      {detail.company.industry}
                      <br />
                      {detail.company.headquartersCity}
                    </>
                  }
                />
              </Section>

              <Section title="Owner">
                <Item primary={detail.owner.fullName} secondary={detail.owner.email} />
              </Section>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ '& > *': { flex: 1 } }}
            >
              <Section title="Contacts">
                {detail.contacts.map((contact) => (
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

              <Section title="Documents">
                {detail.documents.map((document) => (
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
            </Stack>

            <Section title="Notes">
              {detail.notes.map((note) => (
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
