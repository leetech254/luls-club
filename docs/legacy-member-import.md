# Legacy registered-member import

The admin dashboard now has an **Import legacy list** action under Registered members. It inserts the supplied historical list into MongoDB using an idempotent upsert, so using the action again does not create duplicates.

Imported records are marked `approved` and `paid` because the supplied list represents members who have already paid the registration fee. No M-Pesa receipt number is fabricated, and no M-Pesa prompt or welcome email is sent by the import. The payment method is recorded as `M-Pesa · legacy import` and the payment reference is an internal legacy-import reference.

The supplied incomplete phone entry for Stephen Ooko is intentionally not included. The duplicate Susan record sharing `+254 714 122907` is imported once as Susan Wambui. The remaining 32 complete, unique records receive generated registration numbers from `LULS/LEGACY/0001/26` through `LULS/LEGACY/0032/26`.

Admins can add another registered member directly from the same form without initiating payment, edit any saved member, update contact details, correct payment status, and add an optional email or receipt later.
