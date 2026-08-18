# NEXTHOOD STUDIO

Premium streetwear storefront + customer ordering + owner admin CMS.

## Current project scope

- Storefront homepage, shop, collections and product detail pages
- Official 6-product catalog and connected product imagery
- Cart and checkout
- Customer authentication and account/profile
- Customer orders, order details and order confirmation
- Razorpay TEST-mode checkout integration with server-side signature verification
- Owner/admin dashboard and store management CMS
- Products, categories, collections, coupons, customers, orders, analytics, activity and settings
- Neon/PostgreSQL + Drizzle persistence
- Server-side order ownership checks and payment idempotency protections
- Responsive premium NEXTHOOD visual system

## Local development

Prerequisites: Node.js 20+.

1. Copy `.env.example` to `.env`.
2. Fill the required environment variables with your existing development values.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by the terminal.

Do not commit `.env` or any secret values.

## Production deployment (Render)

This repository includes `render.yaml` for a Render Web Service.

Build command:

`npm install && npm run build`

Start command:

`npm start`

Health check:

`/api/health`

Required production environment variables:

- `NODE_ENV=production`
- `DATABASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Keep Razorpay in TEST MODE until the final live-payment verification is intentionally performed.

The deployment does not run database migrations automatically. Existing production schema/data should be verified before deployment. Do not reset or seed the production database.

## Validation

Run before deployment:

`npm run lint`

`npm run build`

Then run a production smoke test covering storefront, cart, checkout, authentication, admin, and the Razorpay TEST-mode entry point.
