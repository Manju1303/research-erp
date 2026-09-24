# Inzovate — Research Publication Management ERP

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-teal?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

Enterprise-grade **Research Publication Management ERP** designed for organizations providing end-to-end scholarly manuscript formulation and external journal publication coordination services.

---

## 🎯 System Scope & Business Model

Unlike platforms managing a single journal, **Inzovate ERP** centralizes the complete lifecycle assisting researchers, faculty, and academic institutions:

```
Client Requirement Collection
         ↓
Research Topic Allocation
         ↓
Research Paper Development (Multi-version drafts)
         ↓
Internal Quality Control (Mandatory 10-Point QC Gate)
         ↓
Client / Author Approval Workflow
         ↓
Journal Intelligence Matching (Scopus, WoS, UGC, etc.)
         ↓
Journal Submission Coordination
         ↓
Editorial & Peer Review Tracking
         ↓
Revision Management (Reviewer remarks & Author responses)
         ↓
Official Acceptance Notification
         ↓
Publication Release, DOI Issuance & Certification
         ↓
Project Closure & Financial Reconciliation
```

---

## 🏗️ Monorepo Architecture

```
inzovate/
├── docker-compose.yml              # PostgreSQL 16, Redis 7, pgAdmin 4
├── turbo.json                      # Turborepo build pipeline
├── package.json                    # Monorepo root workspace
├── packages/
│   └── shared/                     # Shared enums, types, DTOs & state machines
│       ├── src/
│       │   ├── enums/              # 17 ProjectStatus, TaskStatus, SubmissionStatus, etc.
│       │   ├── state-machines/     # Status transition rules & role authorization configs
│       │   ├── types/              # Standard ApiResponse & Pagination contracts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   ├── backend/                    # NestJS 10 Enterprise Application
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Relational models with UUIDs, timestamptz & soft deletes
│   │   │   └── seed.ts             # Idempotent seed for 9 roles, permissions, & Super Admin
│   │   ├── src/
│   │   │   ├── config/             # Environment, JWT, Database & Redis configurations
│   │   │   ├── database/           # Prisma service & transaction abstractions
│   │   │   ├── storage/            # Swappable storage provider (Local Disk / AWS S3)
│   │   │   ├── common/             # RBAC guards, Audit interceptors, Exception filters
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # JWT access & refresh tokens, bcrypt, rate limiting
│   │   │   │   ├── users/          # User CRUD, role assignments, status toggles
│   │   │   │   ├── clients/        # Researcher profiles, ORCID IDs, privacy sanitization
│   │   │   │   ├── projects/       # 17-stage state machine, project code generator
│   │   │   │   ├── tasks/          # Modular task allocation, completion percentage
│   │   │   │   ├── manuscripts/    # Non-destructive version tree, QC checklist updates
│   │   │   │   ├── documents/      # Multi-tier access control (INTERNAL, CLIENT, PUBLIC)
│   │   │   │   ├── journals/       # Journal Intelligence DB & AI Recommendation matcher
│   │   │   │   ├── submissions/    # External journal submissions with QC gating
│   │   │   │   ├── publications/   # DOI registry, citations, and certificate distribution
│   │   │   │   ├── finance/        # Invoices, milestone disbursements, and payments
│   │   │   │   ├── communications/ # Multi-channel threaded correspondence
│   │   │   │   ├── reports/        # Employee workload scorecards & CSV export
│   │   │   │   ├── audit/          # Immutable system audit trail logs
│   │   │   │   └── dashboard/      # Role-tailored metrics & pipeline analytics
│   │   │   ├── app.module.ts
│   │   │   └── main.ts             # Helmet, CORS, Swagger OpenAPI, validation pipes
│   │   └── package.json
│   └── frontend/                   # Next.js 14 App Router with Custom Design System
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css     # Ultra-premium dark-mode styling & glassmorphic tokens
│       │   │   ├── layout.tsx      # Root layout with Sidebar, Navbar, and AuthProvider
│       │   │   ├── page.tsx        # Executive Dashboard
│       │   │   ├── projects/       # Project Directory & Workspace Timeline
│       │   │   ├── manuscripts/    # Manuscript Studio (Live markdown editor & outline)
│       │   │   ├── qc/             # Quality Control Workbench (10-point checklist)
│       │   │   ├── journals/       # Journal Intelligence DB & Matching Engine
│       │   │   ├── submissions/    # External Submission & Peer Review Tracker
│       │   │   ├── publications/   # Published Papers & DOI Registry
│       │   │   ├── tasks/          # Kanban Workflow Board (4 status columns)
│       │   │   ├── clients/        # Institutional Researchers & ORCID Directory
│       │   │   ├── finance/        # Finance & Billing Management Console
│       │   │   ├── communications/ # Multi-channel Communication Center
│       │   │   ├── reports/        # Performance Analytics & CSV Export
│       │   │   └── audit/          # Cryptographic System Audit Trail Viewer
│       │   ├── components/         # Navbar, Sidebar, StatCard, StatusBadge, TimelineView
│       │   └── lib/                # API Client & 9-Role Persona Context
│       └── package.json
```

---

## 👥 9 Granular Role-Based Personas (RBAC)

The system enforces strict permission boundaries across 9 distinct personas:

1. **Super Administrator**: Complete system governance, user provisioning, and role assignment.
2. **Operations Manager**: Organization-wide project oversight, pipeline throughput, and deadline management.
3. **Research Manager**: Topic validation, methodology direction, and manuscript allocations.
4. **Research Staff / Developer**: Manuscript authorship, experimental benchmarking, and assigned task execution.
5. **Quality Analyst (QC)**: Technical checklist verification, plagiarism screening ($<10\%$), and formatting compliance.
6. **Publication Executive**: Journal selection, portal submission coordination, and peer-review correspondence.
7. **Client / Author**: Requirement submission, draft review, manuscript approval, and certificate access. *(Confidential internal staff notes and journal communication are strictly hidden)*.
8. **Finance / Accounts**: Quotations, invoices, advance payments, APC disbursement, and receipts.
9. **Executive Management**: Business intelligence, turnaround analytics, and revenue reports.

---

## 🛡️ Mandatory 10-Point Internal QC Gate

Before any manuscript is dispatched to external journal editors, it must pass the 10-point inspection in the QC console:

| # | Inspection Item | Verification Criteria |
|---|---|---|
| 1 | **Title & Subtitle** | Concise, scientifically accurate, avoid over-generalization. |
| 2 | **Abstract & Keywords** | Word count $\le 250$ words, canonical indexing keywords included. |
| 3 | **Research Problem & Gap** | Problem statement explicitly defined with identified literature gap. |
| 4 | **Methodology & Rigor** | Mathematical models, algorithmic formulations, reproducible steps. |
| 5 | **Experimental Datasets** | Data provenance, benchmark cohorts, statistical validation. |
| 6 | **Citations & References** | $\ge 80\%$ peer-reviewed citations with active DOIs. |
| 7 | **Journal Layout Guidelines**| Columns, margins, table formatting, figure resolution (300+ DPI). |
| 8 | **Plagiarism Screening** | iThenticate / Turnitin similarity verified $< 10\%$ overall ($< 1\%$ per single source). |
| 9 | **Author Declarations** | Conflict of interest, data availability, ethical clearances. |
| 10 | **Author & ORCID Creds** | Institutional email verification and active ORCID identifiers. |

---

## 🚀 Quickstart & Deployment

### Prerequisites
- Node.js $\ge 20$
- Docker & Docker Desktop

### 1. Launch Database & Cache
```bash
docker compose up -d
```
*Starts PostgreSQL 16 on port `5432`, Redis 7 on port `6379`, and pgAdmin 4 on port `5050`.*

### 2. Backend Setup
```bash
cd apps/backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
*Backend runs on `http://localhost:4000/api/v1` with Swagger docs at `http://localhost:4000/api/docs`.*

### 3. Frontend Setup
```bash
cd apps/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`. Use the sidebar persona switcher to evaluate all 9 roles.*

---

## 📄 License
This project is licensed under the MIT License.
