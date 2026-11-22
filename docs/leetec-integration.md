# Lee Tec M-Pesa integration

The LULS registration flow uses Lee Tec server-side with `LEETEC_API_KEY` and `LEETEC_BASE_URL` kept in Vercel environment variables.

- STK Push: `POST /api/v1/stkpush`
- Required request fields: `phoneNumber`, positive whole-KES `amount`, `accountReference`, and unique `requestId`
- Authentication: `Authorization: Bearer <API_KEY>`
- Status: `GET /api/v1/transactions/status?requestId=<REQUEST_ID>`
- A payment is treated as paid only when Lee Tec returns `SUCCESS`.
- LULS stores the request ID, payment state, amount, currency, and receipt reference needed for admin reconciliation.

Source: https://leetec.online/api-reference
