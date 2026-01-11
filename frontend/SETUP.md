# Live Polling System - Frontend Setup

The frontend should be accessed from the `vite-project` directory.

## Setup Instructions

Navigate to the frontend directory:
```bash
cd frontend/vite-project
npm install
```

Then run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).

## Environment Configuration

Create a `.env` file in `frontend/vite-project/` with the following variables:

```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

For production deployment, update these URLs to point to your deployed backend server.

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.
