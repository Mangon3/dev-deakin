# SIT313 - D1

**Student:** Vu Hoang Lam  
**Student ID:** 224136322

## Project Overview

This project is a DEV@Deakin platform built with a set of React components with a sign-up feature that sends a welcome email using Nodemailer, plus login and registration backed by Firestore. It is deployed to Vercel.

## Tech Stack

### Frontend (`~/`)

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **State Management:** React `useState`
- **API Client:** Native `fetch()`
- **Auth & Database:** Firestore
- **Server Mutations:** Next.js Server Actions
- **Validation:** Zod
- **Password Hashing:** `bcryptjs`

### Backend (`~/app/api`)

- **Runtime:** Next.js Route Handlers (Node runtime)
- **Email:** Nodemailer
- **Validation:** Zod
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
```

The Firebase values come from your service account key (firebase console -> project settings -> service accounts -> generate new private key)

`EMAIL_PASS` must be a Gmail App Password, generated from your Google account's security settings with 2-Step Verification enabled.

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

## API Endpoints

Every request is validated with Zod before it reaches the email API.

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
