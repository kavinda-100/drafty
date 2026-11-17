# Drafty

Drafty is a Next.js application with email and password authentication powered by Better Auth and PostgreSQL. Prisma manages the database schema.

## Prerequisites

- Node.js 24 or later.
- pnpm 12.2.1, as specified in `package.json`.
- A PostgreSQL database, running locally or hosted remotely, and a connection URL for a user with permission to create and update tables.

## Set up the project

1. Install dependencies from the project root:

   ```bash
   pnpm install
   ```

   The install command generates the Prisma client. If pnpm asks you to approve dependency build scripts, review the prompt and project `pnpm-workspace.yaml` configuration.

2. Create an empty PostgreSQL database named `drafty`, or use an existing development database. For example, if your local PostgreSQL user can create databases:

   ```bash
   createdb drafty
   ```

3. Create a `.env` file in the project root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/drafty"
   BETTER_AUTH_SECRET="replace-with-a-unique-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

   | Variable | Description |
   | --- | --- |
   | `DATABASE_URL` | PostgreSQL connection URL, including the database name and any required SSL parameters. Replace `USER` and `PASSWORD` with your database credentials. URL-encode special characters in the credentials. |
   | `BETTER_AUTH_SECRET` | Secret used by Better Auth. Generate a unique value with `openssl rand -base64 32`. |
   | `BETTER_AUTH_URL` | The application's base URL. Use `http://localhost:3000` locally and the actual application URL in production. |

   Keep `.env` private; it is excluded from Git. For a hosted database, use the provider's connection URL and SSL settings.

4. Push the Prisma schema to the development database and generate the client:

   ```bash
   pnpm db:push
   ```

   This changes the schema of the database specified by `DATABASE_URL`. Use a development database and review schema changes before applying them to any database containing data.

5. Optionally seed the development accounts:

   ```bash
   pnpm db:seed
   ```

## Run the app

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Register a new account or sign in with a seeded account. Registration signs the user in and redirects to the home page. Unauthenticated visitors are redirected to login.

To run a production build:

```bash
pnpm build
pnpm start
```

## Development test users

`pnpm db:seed` creates these accounts if their email addresses do not already exist:

| Email | Password |
| --- | --- |
| `bod@gmail.com` | `DraftyBod123!` |
| `jane@gmail.com` | `DraftyJane123!` |

The seed skips existing accounts and does not change their passwords. These credentials are public and are intended only for a development database.

## Tests and checks

After setting up and seeding the development database, run the Vitest integration tests:

```bash
pnpm test
```

For watch mode, use `pnpm test:watch`. The tests connect to the database in `DATABASE_URL`, create and remove a temporary user, and create and revoke sessions for the two seeded accounts. They require the seeded accounts to have the passwords listed above.

Run the linter with `pnpm lint`. If the generated Prisma client needs to be refreshed separately, run `pnpm db:generate`.

## Documents

After signing in, create a document from the dashboard and open it to write. Use the formatting toolbar for headings, bold, italic, underline, and lists. Content saves automatically after you pause typing; the editor shows whether it is saving, saved, or needs a retry. Rename a document using the title field and Rename button. Documents are private to their owner.

After pulling schema changes, run `pnpm db:push` against your development database before starting the app. Wait for the saved indicator before closing or leaving a document.

### Import a text file

From the documents dashboard, select **Import Document** and choose a non-empty UTF-8 `.txt` file no larger than 1 MB (1,048,576 bytes). Drafty creates a document named after the file and opens it for editing. Line breaks are imported as paragraphs; formatting, other file types, and files containing null characters are not supported. The original file is not stored. The filename before `.txt` must contain 1–200 characters.
