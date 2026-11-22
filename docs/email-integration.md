# Email confirmation integration

The portal uses Resend's HTTP Email API for Vercel-friendly transactional email. The server sends a confirmation receipt and welcome letter after Lee Tec reports payment status `SUCCESS`.

Resend's send endpoint is `POST https://api.resend.com/emails` with a Bearer API key and a JSON body containing `from`, `to`, `subject`, `html`, and `text`. The response includes a provider email ID when accepted. Resend supports the `Idempotency-Key` header; keys are retained for 24 hours and prevent duplicate sends for the same request.

The application keeps `RESEND_API_KEY`, `EMAIL_FROM`, and optional `EMAIL_REPLY_TO` server-side in Vercel environment variables. It records the email send timestamp and provider ID in MongoDB, so repeated payment-status polling does not send duplicate messages.

Sources:

- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://vercel.com/kb/guide/sending-emails-from-an-application-on-vercel
