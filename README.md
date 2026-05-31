# 💰 Finance Tracker

Personal finance tracker built with **Next.js 16**, **Prisma**, **PostgreSQL (Neon)**, and **NextAuth.js**.

Track expenses, manage budgets, visualize financial health with beautiful charts.

## ✨ Features

- ✅ **Dashboard** — Saldo total, grafik trend 30 hari, pie chart per kategori
- ✅ **Transactions** — CRUD, search, filter by date/kategori/wallet/type, recurring
- ✅ **Wallets** — Multiple wallets (cash, bank, e-wallet), saldo total
- ✅ **Categories** — Kategori income/expense dengan icon & warna
- ✅ **Budgets** — Budget per kategori per bulan, progress bar
- ✅ **Reports** — Ringkasan bulanan, trend chart, export CSV
- ✅ **Auth** — Email/password (NextAuth.js credentials)
- ✅ **Dark Mode** — Toggle light/dark theme
- ✅ **Responsive** — Mobile-friendly dengan sidebar collapsible

## 🛠 Tech Stack

| Tech | Desc |
|------|------|
| **Next.js 16** | App Router, Server Components |
| **TypeScript** | Strict mode |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui + Base UI** | Component library |
| **Prisma** | ORM + generated client |
| **PostgreSQL (Neon)** | Database |
| **NextAuth.js v5** | Authentication |
| **Recharts** | Charts & graphs |
| **Vercel** | Deployment |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (recommended: [Neon](https://neon.tech))

### 1. Clone & Install

```bash
git clone https://github.com/Reinvy/finance-tracker.git
cd finance-tracker
npm install
```

### 2. Setup Environment

Copy `.env` and fill in your values:

```bash
# Database (get from Neon dashboard)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/finance-tracker?sslmode=require"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

### 3. Database Setup

```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

## 🌐 Deployment

### Vercel (Auto-deploy from GitHub)

1. Push to GitHub:
   ```bash
   git push origin main
   ```

2. Import repo di [vercel.com/new](https://vercel.com/new)

3. Isi environment variables:
   - `DATABASE_URL` — dari Neon dashboard
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://your-app.vercel.app`

4. Deploy! 🚀

### Manual Deploy

```bash
npx vercel --prod
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Register
│   ├── (dashboard)/     # Dashboard pages (protected)
│   │   ├── dashboard/   # Overview with charts
│   │   ├── transactions/ # CRUD transactions
│   │   ├── wallets/     # Wallet management
│   │   ├── categories/  # Category management
│   │   ├── budgets/     # Budget planning
│   │   ├── reports/     # Monthly reports
│   │   └── settings/    # User settings
│   ├── api/             # API routes (REST)
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Navbar & Sidebar
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma client
│   └── utils.ts         # Helpers
└── types/               # TypeScript types
```

## 📄 License

MIT
