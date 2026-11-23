# Email confirmation integration

The portal uses Resend's HTTP Email API for Vercel-friendly transactional email. The server sends a registration confirmation and welcome letter after Lee Tec reports payment status `SUCCESS`, and a separate Thomson Falls retreat booking confirmation after the KES 200 retreat payment succeeds.

Resend's send endpoint is `POST https://api.resend.com/emails` with a Bearer API key and a JSON body containing `from`, `to`, `subject`, `html`, and `text`. The response includes a provider email ID when accepted. Resend supports the `Idempotency-Key` header; keys are retained for 24 hours and prevent duplicate sends for the same request.

The application keeps `RESEND_API_KEY`, `EMAIL_FROM`, and optional `EMAIL_REPLY_TO` server-side in Vercel environment variables. It records the email send timestamp, delivery status, and provider ID in the database, so repeated payment-status polling does not send duplicate messages. Retreat notifications use a database claim lock in addition to Resend's idempotency key, which prevents two simultaneous polling requests from sending duplicate confirmations. Members must have an email address on their member record; if email is not configured or the address is missing, payment remains successful and the notification status is recorded as failed or not configured.

Sources:

- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://vercel.com/kb/guide/sending-emails-from-an-application-on-vercel
