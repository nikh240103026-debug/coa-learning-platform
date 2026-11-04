# COA Lab

A learning platform for Computer Organization & Architecture. Progress is stored in localStorage.

Environment variables (copy `.env.example` to `.env.local`):
- `GEMINI_API_KEY`: your Google Gemini API key, used only on the server.
- `GEMINI_MODEL`: the Gemini model name to call. The doubt solver returns an error until both are set.
- `AUTH_EMAIL`, `AUTH_PASSWORD`, `AUTH_SECRET`: the server-side credentials and signing secret for the single-user session authentication.

Install: npm i
Run: npm run dev
Content lives in `src/content/chapters/`. Fill any `videoUrl` with a YouTube or MP4 link to replace its placeholder.
