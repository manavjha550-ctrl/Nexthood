# NEXTHOOD STUDIO — Deployment Checklist

## Before deployment
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `.env` is not committed
- [ ] Neon production DATABASE_URL is correct
- [ ] Razorpay credentials are server-side environment variables
- [ ] Razorpay remains TEST MODE for initial deployment

## Render
- [ ] Import repository / use `render.yaml`
- [ ] Node web service
- [ ] Build: `npm install && npm run build`
- [ ] Start: `npm start`
- [ ] Health check: `/api/health`
- [ ] Add `DATABASE_URL`
- [ ] Add `RAZORPAY_KEY_ID`
- [ ] Add `RAZORPAY_KEY_SECRET`
- [ ] Add `RAZORPAY_WEBHOOK_SECRET`
- [ ] Confirm service binds to `0.0.0.0` and uses Render's `PORT`

## Smoke test after deployment
- [ ] Homepage loads
- [ ] All 6 products load and images render
- [ ] Shop / collections work
- [ ] Product detail works
- [ ] Cart works
- [ ] Checkout validation works
- [ ] Razorpay TEST checkout opens
- [ ] Customer login/signup works
- [ ] Customer orders are accessible only to their owner
- [ ] Admin routes are protected
- [ ] Admin product/order/CMS pages load
- [ ] `/api/health` returns `{ "status": "ok" }`

## Final live-payment step
- [ ] Only after all smoke tests pass
- [ ] Configure live Razorpay credentials intentionally
- [ ] Configure the production Razorpay webhook URL/secret
- [ ] Perform a controlled live-payment verification
