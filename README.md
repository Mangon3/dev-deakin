# SIT313 - HD1

**Student:** Vu Hoang Lam  
**Student ID:** 224136322

## Project Overview

This project is a DEV@Deakin platform built with a set of React components with a sign-up feature that sends a welcome email using Nodemailer, plus login and registration backed by Firestore. It is deployed to Vercel.

For the High Distinction task it is extended with a hiring layer, reached from the Jobs tab: members post paid jobs, other members submit proposals, the two parties negotiate in a private thread, and accepting a proposal opens a contract with milestones. It also adds Seek, an agentic assistant that answers questions about the platform and recommends open jobs.

## Tech Stack

### Frontend (`~/`)

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **State Management:** React `useState`
- **API Client:** Native `fetch()`
- **Auth & Database:** Firestore
- **Validation:** Zod
- **Password Hashing:** `bcryptjs`
- **Sessions:** signed JSON Web Tokens (`jose`)

### Backend (`~/app/api`)

- **Runtime:** Next.js Route Handlers (Node runtime)
- **Email:** Nodemailer
- **Validation:** Zod
- **Assistant:** Gemini API (`@google/genai`)
- **Hosting:** Vercel

### Legacy Backend (`~/server`)

The original standalone Express server from Task P5. Kept for reference but no longer used, since Vercel hosts serverless functions rather than long-running servers. See [Deployment](#deployment).

## How To Run

### 1. Prerequisites

Ensure Node.js and `npm` are installed on your machine.

### 2. Environment Config

The Next.js app reads the `.env` file in the project root. Copy `.env.example` to `.env` and fill in the values.

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here

PORT=5000
CLIENT_ORIGIN=http://localhost:3000,http://localhost:3001

JWT_SECRET=any_random_string_of_32_or_more_characters
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

The Firebase values come from your service account key (firebase console -> project settings -> service accounts -> generate new private key)

`EMAIL_PASS` must be a Gmail App Password, generated from your Google account's security settings with 2-Step Verification enabled.

`GEMINI_API_KEY` comes from [Google AI Studio](https://aistudio.google.com/apikey). Without it the assistant returns 503, and the demo at `/seek-demo` still runs.

### 3. Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the portfolio website

## Pages

| Route     | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `/`       | Home page. The `DEV@Deakin` logo in the navigation bar links back here.    |
| `/login`  | Logs an existing user in, then redirects to the home page.                 |
| `/signup` | Creates a new account, then redirects to `/login`.                         |
| `/post`   | New Post page. Choose Question or Article, the form adapts to the choice.  |
| `/browse` | Browse Posts page. Filter, hide, expand and reset the list of saved posts. |
| `/pricing` | Compares the Free and Paid plans, and upgrades a member to Paid. |
| `/jobs` | Jobs board. Search and filter the open jobs. |
| `/jobs/new` | Post a job. Signed in members only. |
| `/jobs/[id]` | Job detail and its proposals, limited to what the viewer may read. |
| `/threads/[id]` | Private negotiation thread for one proposal. |
| `/contracts/[id]` | Contract and its milestones. |
| `/dashboard` | Jobs posted, proposals sent, and active contracts. |
| `/seek-demo` | The assistant running without a model key. |

## API Endpoints

Every request is validated with Zod on the server, whatever the browser already checked.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Creates an account, hashing the password |
| `POST /api/auth/login` | Returns a signed session token |
| `POST /api/plan` | Upgrades the caller to the Paid plan |
| `GET`/`POST /api/posts` | Lists posts for the caller's plan, or saves one |
| `GET`/`POST /api/jobs` | Lists open jobs, or posts one |
| `GET /api/jobs/[id]` | A job, with the proposals the caller may read |
| `POST /api/proposals` | Submits a proposal, one per job |
| `GET`/`POST /api/proposals/[id]/messages` | The private thread for a proposal |
| `POST /api/proposals/[id]/accept` | Accepts a proposal and opens a contract |
| `GET /api/contracts/[id]` | A contract, readable by its two parties |
| `POST /api/contracts/[id]/milestones` | Marks a milestone delivered or approved |
| `GET /api/dashboard` | Everything belonging to the caller |
| `POST /api/seek` | The assistant, streamed as newline delimited JSON |

Requests that fail an access rule return `403` whether or not the resource exists, so ids cannot be probed.

### `POST /api/subscribe`

Accepts a JSON payload containing a subscriber's email address and sends an automated welcome email.

- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **`200 OK`** — email accepted by Gmail:
  ```json
  {
    "message": "Welcome email sent to user@example.com. Check your inbox!"
  }
  ```
- **`400 Bad Request`** — the email failed validation, or the body was not valid JSON:
  ```json
  {
    "error": "Please enter a valid email address.",
    "fields": { "email": "Please enter a valid email address." }
  }
  ```
- **`502 Bad Gateway`** — the email provider rejected or failed the send:
  ```json
  {
    "error": "We couldn't send the welcome email right now. Please try again."
  }
  ```

A request using any other HTTP method returns `405 Method Not Allowed`.

## Deployment

The platform is hosted on [Vercel](https://vercel.com).

### Deploying

Deploys are done from the terminal:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `EMAIL_USER` and `EMAIL_PASS` in the Vercel project's Environment Variables before deploying.
