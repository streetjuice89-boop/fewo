# VoyageNest

**RENT. RELAX. EXPLORE.**

Professionelle Ferienwohnungs-Vermietungsplattform mit eigenem Markendesign.

## Projektstruktur

```
fewo/
├── apps/
│   ├── web/          # Next.js Kundenportal (DE & EN)
│   ├── admin/        # Next.js Admin Panel
│   └── api/          # NestJS Backend API
├── packages/
│   ├── ui/           # Shared UI-Komponenten
│   ├── config/       # Shared Konfigurationen
│   └── types/        # Shared TypeScript Types
└── docker/           # Docker Konfigurationen
```

## Voraussetzungen

- Node.js >= 20.0.0
- pnpm >= 9.1.0

## Installation

```bash
# pnpm installieren (falls nicht vorhanden)
npm install -g pnpm

# Dependencies installieren
pnpm install

# Datenbank initialisieren
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Entwicklung

```bash
# Alle Apps starten
pnpm dev

# Einzelne Apps starten
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter api dev
```

## Build

```bash
# Production Build
pnpm build
```

## Docker

```bash
# Mit Docker Compose starten
docker-compose up -d
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: NestJS, Prisma, SQLite
- **Auth**: JWT mit Passport.js
- **Realtime**: Socket.io
- **Build**: Turborepo, pnpm

## Features

- Mehrsprachigkeit (DE/EN)
- Autonomer Buchungsprozess
- Livechat mit FAQ-Bot
- Admin Panel mit KPIs
- Airbnb-Inserate Integration
- DSGVO-konform

## Lizenz

Proprietär - Alle Rechte vorbehalten
