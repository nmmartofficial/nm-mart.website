# NM Mart Website

NM Mart is a modern React + Vite storefront for a local grocery and essentials business, with a premium storefront, product catalog, cart flow, WhatsApp ordering, and admin management tools.

## Features

- Product catalog with category filtering and search
- Cart and checkout flow
- WhatsApp order generation
- Customer loyalty / welfare flow
- Admin dashboard for inventory and store controls
- Supabase-ready integration for auth and data access

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- React Router
- Supabase
- shadcn/ui patterns

## Local setup

1. Install dependencies:
   npm install
2. Create a local environment file based on .env.example
3. Start the app:
   npm run dev
4. Build for production:
   npm run build

## Environment variables

Use only the public values from your Supabase project in a local .env file:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Do not add service role or secret keys to frontend code or browser-facing environment files.

For a template, see .env.example.
