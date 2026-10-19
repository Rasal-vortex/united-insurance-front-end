# United Insurance CRM MVP

The frontend uses Next.js App Router, React, and JavaScript. The prototype API remains in the Express server and shares its process with Next.js.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To create a production build, run `npm run build`, then `npm start`.

The existing screens are in `src/screens`; the shared shell and dialogs are in `src/components`. `src/App.jsx` currently routes between those screens. Next.js loads the client app through `src/app/[[...path]]/page.jsx`. Frontend API calls are in `src/services` and `src/lib/api-client.js`; they use `NEXT_PUBLIC_API_BASE_URL` to connect to the backend.

Set `NEXT_PUBLIC_API_BASE_URL` only when the API is hosted separately. When frontend and API share the server, leave it unset.
