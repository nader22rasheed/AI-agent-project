# AI-agent-project

Full-stack bilingual (English/Arabic) project estimation wizard using **React + Vite + TypeScript** (client) and **Express + TypeScript + Prisma + SQLite** (server).

It collects Function Point (FP) and Use Case Point (UCP) inputs, calculates effort/cost, lets users freeze a final estimate snapshot, and generates an **Arabic RTL PDF** report.

## Monorepo structure

- `client/` React UI with i18next bilingual interface and chat-like step flow.
- `server/` Express API, FP/UCP calculation engine, SQLite persistence, freeze workflow, and Puppeteer PDF generation.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp server/.env.example server/.env
npm run prisma:migrate
```

## Run (client + server)

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

## Build and test

```bash
npm run build
npm run test
```

## API

- `POST /api/sessions` create session
- `GET /api/sessions/:id` get session data
- `PUT /api/sessions/:id` update collected input data
- `POST /api/sessions/:id/calculate` compute FP/UCP + effort/cost
- `POST /api/sessions/:id/freeze` freeze final snapshot
- `GET /api/sessions/:id/report.pdf` download Arabic PDF report

## Calculation formulas

### Function Point (IFPUG)

- EI: 3/4/6, EO: 4/5/7, EQ: 3/4/6, ILF: 7/10/15, EIF: 5/7/10 (low/avg/high)
- `UFP = sum(count * weight)`
- `DI = sum(14 GSC ratings)`
- `VAF = 0.65 + 0.01 * DI`
- `AFP = UFP * VAF`

### Use Case Points (Karner)

- Actors weights: simple=1, avg=2, complex=3 => `UAW`
- Use cases weights: simple=5, avg=10, complex=15 => `UUCW`
- `UUCP = UAW + UUCW`
- `TCF = 0.6 + 0.01 * sum(rating_i * weight_i)`
- `EF = 1.4 + (-0.03) * sum(rating_i * weight_i)`
- `UCP = UUCP * TCF * EF`

### Effort and cost

- `EffortHours_FP = AFP * hoursPerFP`
- `EffortHours_UCP = UCP * hoursPerUCP`
- `CostHourly_FP = EffortHours_FP * hourlyRate`
- `CostHourly_UCP = EffortHours_UCP * hourlyRate`
- `PersonMonths_FP = EffortHours_FP / hoursPerPersonMonth`
- `PersonMonths_UCP = EffortHours_UCP / hoursPerPersonMonth`
- `CostPersonMonth_FP = PersonMonths_FP * personMonthCost`
- `CostPersonMonth_UCP = PersonMonths_UCP * personMonthCost`

## Sample environment

`server/.env.example`

```env
PORT=4000
DATABASE_URL="file:./dev.db"
```
