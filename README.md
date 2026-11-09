# LocalLink frontend

React frontend for the LocalLink community services directory. Residents can browse local providers, view profiles, and submit enquiries. Providers can manage listings and enquiries.

## Requirements

- Node.js and npm

## Run locally

Clone the [LocalLink backend](https://github.com/lindokuhlezulu42/LocalLinkRepo-backend) alongside this project and start it first. Then, from this repository:

```powershell
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). During development, Vite forwards `/api` requests to the backend at `http://localhost:8080`.

Run `npm run lint` to lint the source and `npm run build` to create a production build.
