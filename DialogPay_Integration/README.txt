DIALOGPAY PAYMENT INTEGRATION — FILE PLACEMENT GUIDE
======================================================

BACKEND FILES (D:\MultiModel\Platform\):
  dialogpay.py         → app\providers\payment\dialogpay.py     NEW FILE
  payments_router.py   → app\routers\payments.py                REPLACE
  payments_schema.py   → app\schemas\payments.py                REPLACE

FRONTEND FILES (D:\MultiModel\frontend\src\):
  payments_api.js   → src\api\payments.js          REPLACE
  TopUp.jsx         → src\pages\TopUp.jsx           REPLACE
  Subscription.jsx  → src\pages\Subscription.jsx   REPLACE
  PaymentSuccess.jsx → src\pages\PaymentSuccess.jsx NEW FILE
  PaymentFailed.jsx  → src\pages\PaymentFailed.jsx  NEW FILE
  App.jsx           → src\App.jsx                   REPLACE

CONFIG CHANGES (read config_addition.txt):
  1. Add DialogPay fields to app\config.py Settings class
  2. Add credentials to .env file (use your real values)

CREATE DIRECTORY:
  D:\MultiModel\Platform\app\providers\payment\
  Create __init__.py inside it (empty file)

PAYMENT FLOW:
  User clicks "Buy now" or "Subscribe"
     ↓
  Frontend calls POST /payments/initiate
     ↓
  Backend creates pending transaction, calls DialogPay API
     ↓
  Backend returns checkout_url
     ↓
  Frontend redirects to DialogPay (window.location.href = checkout_url)
     ↓
  User pays with JazzCash / Easypaisa / Card on DialogPay's hosted page
     ↓
  DialogPay calls POST /payments/webhook/dialogpay (backend)
     ↓
  Backend verifies HMAC, credits points or activates subscription
     ↓
  DialogPay redirects user to /payment/success?order_id=...&hash=...
     ↓
  Frontend verifies payment, shows success screen

WEBHOOK URL TO REGISTER IN DIALOGPAY DASHBOARD:
  During development:  Use ngrok → ngrok http 8000
  Then set: https://abc123.ngrok.io/payments/webhook/dialogpay
  Production:          https://your-domain.com/payments/webhook/dialogpay

NO MIGRATION NEEDED — PaymentTransaction and Invoice models
already exist from Phase 10 of your backend build.
