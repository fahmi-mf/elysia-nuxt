# Elysia + Nuxt Monorepo (Managed by Nx)

A modern, high-performance Full Stack monorepo template designed for scalability and developer experience.

## 🚀 Tech Stack

- **Monorepo Manager:** [Nx](https://nx.dev) (Caching, Task Orchestration)
- **Package Manager:** [pnpm](https://pnpm.io)
- **Backend:** [ElysiaJS](https://elysiajs.com) (running on Bun)
- **Frontend:** [Nuxt 4](https://nuxt.com) + [Nuxt UI](https://ui.nuxt.com)
- **Database:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)
- **Authentication:** [Better Auth](https://www.better-auth.com) (v1.4+)

---

## 🔐 Authentication Features

This project implements a complete, production-ready authentication system using **Better Auth** with the following plugins and features enabled:

- **Email & Password**: Traditional sign-up/sign-in flow.
- **OAuth Social Login**: Google & GitHub integration.
- **Multi-Session Management**: Support for multiple active accounts in the same browser with instant switching.
- **Two-Factor Authentication (2FA)**: TOTP (Authenticator App) & Backup Codes with Trusted Device support.
- **Passkeys (WebAuthn)**: Biometric login (Fingerprint/FaceID) support.
- **Email Verification**: Secure verification flow for new accounts.
- **Password Reset**: Secure forgot password flow via email.
- **Account Deletion**: "Danger Zone" to permanently delete accounts (with email confirmation for OAuth users).
- **OpenAPI**: Auto-generated API documentation for auth routes.
- **Username Support**: Login with email or username.

---

## 🛠️ Prerequisites

- **Node.js**: v20 or higher.
- **Bun**: Latest version (required for Elysia backend).
- **pnpm**: `npm install -g pnpm`
- **PostgreSQL**: A running instance (local or cloud).

---

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TheViberCoder/elysia-nuxt.git
   cd elysia-nuxt
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables:**
   Copy the example file to create your local configuration.

   ```bash
   cp .env.example .env
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   > **Note:** Update `.env` with your real Database URL (`DATABASE_URL`), OAuth credentials (`GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`), and SMTP settings for email sending.

---

## 🗄️ Database Setup

This project uses Drizzle ORM. We have automated scripts to sync Better Auth schemas with your database.

1. **Generate Auth Schema & Migrations:**
   This command generates the Better Auth schema, moves it to the correct folder, and creates the SQL migration files.

   ```bash
   nx run backend:db:generate
   ```

2. **Apply Migrations:**
   Push the changes to your PostgreSQL database.

   ```bash
   nx run backend:db:migrate
   ```

3. **(Optional) Generate Auth Secret:**
   If you need a new secret for `BETTER_AUTH_SECRET`:

   ```bash
   nx run backend:auth:secret
   ```

---

## ⚡ Development

Start the development server. Nx will run both the **Backend** (port 4243) and **Frontend** (port 4242) in parallel.

```bash
pnpm dev
```

*Or using Nx directly:*

```bash
nx run-many -t dev
```

---

## 🏗️ Build for Production

To build all applications optimized for production:

```bash
pnpm build
```

The output will be available in:

- Frontend: `apps/frontend/.output`
- Backend: `apps/backend/dist`

---

## ✅ TODO

- [ ] Add Roles & Permissions
- [ ] Add Organization | Teams support