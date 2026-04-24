# Submission Tracker Take-home Challenge

This repository hosts the boilerplate for the Submission Tracker assignment. It includes a Django +
Django REST Framework backend and a Next.js frontend scaffold so candidates can focus on API
design, relational data modelling, and product-focused UI work.

## Challenge Overview

Operations managers need a workspace to review broker-submitted opportunities. Build a lightweight
tool that lets them browse incoming submissions, filter by business context, and inspect full
details per record. Deliver a polished frontend experience backed by clean APIs.

### Goals

- **Backend:** Model the domain, expose list and detail endpoints, and support realistic filtering.
- **Frontend (higher weight):** Craft an intuitive list and detail experience with filters that map
  to query parameters. Focus on UX clarity, organization, and maintainability.

## Data Model

Required entities (already defined in `submissions/models.py`):

- `Broker`: name, contact email
- `Company`: legal name, industry, headquarters city
- `TeamMember`: internal owner for a submission
- `Submission`: links to company, broker, owner with status, priority, and summary
- `Contact`: primary contacts for a submission
- `Document`: references to supporting files
- `Note`: threaded context for collaboration

Seed data (~25 submissions with dozens of related contacts, documents, and notes) is available via
`python manage.py seed_submissions`. Re-run with `--force` to rebuild the dataset.

## API Requirements

- `GET /api/submissions/`
  - Returns paginated submissions with company, broker, owner, counts of related documents/notes,
    and the latest note preview.
  - Supports filters via query params. `status` is wired up; extend filters for `brokerId` and
    `companySearch` (plus optional extras like `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`).
- `GET /api/submissions/<id>/`
  - Returns the full submission plus related contacts, documents, and notes.
- `GET /api/brokers/`
  - Returns brokers for the frontend dropdown.

Viewsets, serializers, and base filters are in place but intentionally minimal so you can refine
the query behavior and filtering logic.

## Frontend Workspace Overview

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. The list
and detail routes under `/submissions` are scaffolded so you can focus on API consumption and UX
polish.

### What is pre-built?

- Global providers supply Material UI theming and a shared React Query client.
- `/submissions` hosts the list view with filter inputs and hints about required query params.
- `/submissions/[id]` hosts the detail shell and links back to the list.
- Custom hooks in `lib/hooks` define how to fetch submissions and brokers. Each hook is disabled by
  default (`enabled: false`) so no network requests fire until you enable them.

### What you need to implement

- Wire the filter state to query parameters and React Query `queryFn`s.
- Render table/card layouts for the submission list along with loading, empty, and error states.
- Build the detail page sections for summary data, contacts, documents, and notes.
- Enable the queries and handle pagination or other UX you want to highlight.

## Project Structure

- `backend/`: Django project with REST API, seed command, and submission models.
- `frontend/`: Next.js app described above.
- `INTERVIEWER_NOTES.md`: Context for reviewers/interviewers.

## Environment Variables

- Frontend requests default to `http://localhost:8000/api`. Override this by creating
  `frontend/.env.local` and setting `NEXT_PUBLIC_API_BASE_URL`.

## Getting Started

### Backend

```bash
cd backend
python3.10 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions  # add --force to rebuild
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

To use a custom API base URL, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Visit `http://localhost:3000/submissions` to start building.

## Development Workflow

1. Start the Django server on port 8000 (`python manage.py runserver`).
2. Start the Next.js dev server on port 3000 (`npm run dev`).
3. Iterate on backend filters, serializers, and viewsets, then refresh the frontend to see updated
   data.
4. When ready, add README notes summarizing your approach, tradeoffs, and any stretch goals.

## Submission Instructions

- Provide a short README update summarizing approach, tradeoffs, and how to run the solution.
- Record and share a brief screen capture (max 2 minutes) demonstrating the frontend working end-to-end with the backend.
- Call out any stretch goals implemented.
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.

## My Notes

### Approach

**Backend:** Implemented required and optional filters. Fixed N+1 query problem and set up `nplusone` middleware. Turned off pagination on `/api/brokers/` because it's used for a dropdown filter, paginating it would hide options.

**Frontend:** A table with filter and pagination state in the URL so it survives a refresh. I went with a table over cards because the data is uniform and dense, so easier to scan a column than read individual cards. Detail page uses a list of cards to dump all missing data. Added some reusable components (SubmissionChips) and lib (date). Implement loading, empty and error states.

### Tradeoffs & Assumptions

- A document without url doesn't seem useful, so removed `blank=True` from `document.file_url`
- Assumed the user would use desktop for work, but implemented mobile using horizontal scroll on table.
- The broker endpoint used pagination but I removed it because if we had more than 10 brokers they would be hidden. Fine at this size, but with hundreds of brokers we would need to use a searchable input instead.
- Latest note column on table relies on hover. I assumed this data was important to the users, so squeezed it into the table.

### How to run tests

```bash
cd backend && source .venv/bin/activate && pytest
```

### Stretch Goals

- Fixed some stuff on the scaffold: use explicitly python3.10; set up ALLOWED_HOSTS and gitignore; remove 'use client' from hooks and unused useSubmissionQueryKey; updated "Getting Started" README section
- Set up `nplusone` middleware to catch N+1 query problem during development
- Implemented optional filters `createdFrom`, `createdTo`, `hasDocuments` and `hasNotes`
- Tested filters and N+1 regression
- Handle filter and page states in the URL so it's shareable and survives refresh
- I noticed the table flickers during pagination, so I fixed it using `placeholderData: keepPreviousData`
- I checked which fields could be empty and implemented blank state in the sections. I updated the seed so it's easier to see.
- Fix UnorderedObjectListWarning on backend terminal to fix inconsistent pagination
