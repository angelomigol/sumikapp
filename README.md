This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

````bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```<!-- SUMIKAPP LOGO -->

![]()

# SumikAPP

<!-- SUMIKAPP DESCRIPTION -->

## What's Included

### Core Architecture

- 🏗️ Next.js 15 + Turborepo monorepo setup
- 🎨 Shadcn UI components with TailwindCSS v4
- 🔐 Supabase authentication & basic DB
- ✨ Full TypeScript + ESLint v9 + Prettier configuration

### Key Features

<!-- KEY FEATURES -->

### Technologies

This starter kit provides core foundations:

🛠️ **Technology Stack**:

<!-- TECH STACK -->

## Getting Started

### Prerequisites

- Node.js 18.x or later (preferably the latest LTS version)
- Docker
- PNPM

Please make sure you have a Docker daemon running on your machine. This is required for the Supabase CLI to work.

### Installation

#### 1. Clone this repository

<!-- REPO LINK -->

```bash
git clone
````

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Start Supabase

Please make sure you have a Docker daemon running on your machine.

Then run the following command to start Supabase:

```bash
pnpm run supabase:web:start
```

Once the Supabase server is running, please access the Supabase Dashboard using the port in the output of the previous command. Normally, you find it at [http://localhost:54323](http://localhost:54323).

You will also find all the Supabase services printed in the terminal after the command is executed.

##### Stopping Supabase

To stop the Supabase server, run the following command:

```bash
pnpm run supabase:web:stop
```

##### Resetting Supabase

To reset the Supabase server, run the following command:

```bash
pnpm run supabase:web:reset
```

##### More Supabase Commands

For more Supabase commands, see the [Supabase CLI documentation](https://supabase.com/docs/guides/cli).

```
# Create new migration
pnpm --filter web supabase migration new <name>

# Link to Supabase project
pnpm --filter web supabase link

# Push migrations
pnpm --filter web supabase db push
```

#### 4. Start the Next.js application

```bash
pnpm run dev
```

The application will be available at http://localhost:3000.

#### 5. Code Health (linting, formatting, etc.)

To format your code, run the following command:

```bash
pnpm run format:fix
```

To lint your code, run the following command:

```bash
pnpm run lint
```

To validate your TypeScript code, run the following command:

```bash
pnpm run typecheck
```

Turborepo will cache the results of these commands, so you can run them as many times as you want without any performance impact.

### Environment Variables

You can configure the application by setting environment variables in the `.env.local` file.

Here are the available variables:

| Variable Name                    | Description                                         | Default Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | The URL of the application                          | `http://localhost:3000`                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `NEXT_PUBLIC_PRODUCT_NAME`       | The name of the product                             | `SumikAPP`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `NEXT_PUBLIC_SITE_TITLE`         | The title of the product                            | `SumikAPP - OJT Management System`                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `NEXT_PUBLIC_SITE_DESCRIPTION`   | The description of the product                      | `SumikAPP is an innovative, enterprise-grade OJT (On-the-Job Training) Management System tailored specifically for the IT students and faculty of NU-Dasmarinas. SumikApp eliminates traditional paper-based OJT documentation, digitizes the internship process end-to-end, and enhances coordination between students, OJT coordinators, and OJT supervisors. It also integrates machine learning to predict student employability based on their performance during OJT.` |
| `NEXT_PUBLIC_DEFAULT_THEME_MODE` | The default theme mode of the product               | `system`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `NEXT_PUBLIC_THEME_COLOR`        | The default theme color of the product              | `oklch(0.4365 0.1044 265)`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `NEXT_PUBLIC_THEME_COLOR_DARK`   | The default theme color of the product in dark mode | `oklch(0.4365 0.1044 265)`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Architecture

This application uses a monorepo architecture.

1. The `apps/web` directory is the Next.js application.
2. The `packages` directory contains all the packages used by the application.
3. The `packages/features` directory contains all the features of the application.
4. The `packages/ui` directory contains all the UI components.

### Database

The Supabase database is located in the `apps/web/supabase` directory. In this directory you will find the database schema, migrations, and seed data.

#### Creating a new migration

To create a new migration, run the following command:

```bash
pnpm --filter web supabase migration new --name <migration-name>
```

This command will create a new migration file in the `apps/web/supabase/migrations` directory.

#### Applying a migration

Once you have created a migration, you can apply it to the database by running the following command:

```bash
pnpm run supabase:web:reset
```

This command will apply the migration to the database and update the schema. It will also reset the database using the provided seed data.

#### Linking the Supabase database

Linking the local Supabase database to the Supabase project is done by running the following command:

```bash
pnpm --filter web supabase db link
```

This command will link the local Supabase database to the Supabase project.

#### Pushing the migration to the Supabase project

After you have made changes to the migration, you can push the migration to the Supabase project by running the following command:

```bash
pnpm --filter web supabase db push
```

This command will push the migration to the Supabase project. You can now apply the migration to the Supabase database.

## Going to Production

#### 1. Create a Supabase project

To deploy your application to production, you will need to create a Supabase project.

#### 2. Push the migration to the Supabase project

After you have made changes to the migration, you can push the migration to the Supabase project by running the following command:

```bash
pnpm --filter web supabase db push
```

This command will push the migration to the Supabase project.

#### 3. Set the Supabase Callback URL

When working with a remote Supabase project, you will need to set the Supabase Callback URL.

Please set the callback URL in the Supabase project settings to the following URL:

`<url>/auth/callback`

Where `<url>` is the URL of your application.

#### 4. Deploy to Vercel or any other hosting provider

You can deploy your application to any hosting provider that supports Next.js.

#### 5. Deploy to Cloudflare

The configuration should work as is, but you need to set the runtime to `edge` in the root layout file (`apps/web/app/layout.tsx`).

```tsx
export const runtime = "edge";
```

Remember to enable Node.js compatibility in the Cloudflare dashboard.

<!-- ## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details. -->

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
