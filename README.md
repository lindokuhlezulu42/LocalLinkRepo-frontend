# LocalLink frontend

React frontend for the LocalLink community services directory. Residents can browse local providers, view profiles, submit enquiries, request appointments, and review completed services. Providers can manage listings and enquiries, publish appointment availability, and respond to booking requests.

## Source structure

- `src/components/` — reusable interface components
- `src/pages/` — route-level pages
- `src/styles/` — layout, home, browse, profile, auth, dashboard, admin, utility, and responsive styles
- `src/App.css` — imports the stylesheets in cascade order
- `public/` — static images, icons, and other assets

## Requirements

- Node.js and npm
- The LocalLink backend running at `http://localhost:8080`

## Run locally

From the repository root, open a terminal in this folder:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). During development, Vite forwards `/api` requests to the backend at `http://localhost:8080`.

Run `npm run lint` to lint the source and `npm run build` to create a production build.
