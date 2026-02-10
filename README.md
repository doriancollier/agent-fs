# Next.js 16 Boilerplate

A production-ready Next.js 16 boilerplate with modern tooling, type safety, and comprehensive developer experience.

## Features

- **Next.js 16** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS v4** with CSS-first configuration
- **Shadcn UI** component library (50+ components)
- **Prisma 7** ORM for PostgreSQL
- **TanStack Query** for server state management
- **React Hook Form** + **Zod** for form handling
- **Zustand** for client state management
- **Motion** for animations
- **next-themes** for dark mode

## Prerequisites

- Node.js 20.9+
- pnpm 8+
- PostgreSQL database (or Neon.tech account)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next-starter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URL.

4. **Generate Prisma client**
   ```bash
   pnpm prisma:generate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:push` | Push schema to database |
| `pnpm prisma:studio` | Open Prisma Studio |

## Authentication

This project uses BetterAuth with Email OTP for passwordless authentication.

### Setup

1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env`:
   ```bash
   BETTER_AUTH_SECRET="your-generated-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. Run database migrations:
   ```bash
   pnpm prisma db push
   ```

### Development

OTP codes are logged to the server console in development. Check the terminal running `pnpm dev` for codes.

See [developer-guides/09-authentication.md](./developer-guides/09-authentication.md) for detailed documentation.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite or PostgreSQL connection | Yes |
| `BETTER_AUTH_SECRET` | 32+ char secret for auth tokens | Yes |
| `BETTER_AUTH_URL` | Auth base URL | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Project Structure

```
src/
├── app/           # Next.js App Router
├── components/    # React components
│   └── ui/       # Shadcn components
├── generated/     # Auto-generated (Prisma)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── schemas/       # Zod validation schemas
└── stores/        # Zustand stores
```

## Developer Guides

- [01 - Project Structure](./developer-guides/01-project-structure.md)
- [02 - Environment Variables](./developer-guides/02-environment-variables.md)
- [03 - Database & Prisma](./developer-guides/03-database-prisma.md)
- [04 - Forms & Validation](./developer-guides/04-forms-validation.md)
- [05 - Data Fetching](./developer-guides/05-data-fetching.md)
- [06 - State Management](./developer-guides/06-state-management.md)
- [07 - Animations](./developer-guides/07-animations.md)
- [08 - Styling & Theming](./developer-guides/08-styling-theming.md)

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

Coming soon.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.8 | React framework |
| React | 19.2 | UI library |
| TypeScript | 5.9+ | Type safety |
| Tailwind CSS | 4.x | Styling |
| Prisma | 7.x | ORM |
| TanStack Query | 5.90+ | Data fetching |
| Zustand | 5.x | State management |
| Motion | 12.x | Animations |

## License

MIT
