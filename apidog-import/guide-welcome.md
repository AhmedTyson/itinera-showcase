# ✈ Itinera API Documentation

Welcome to the official API specifications and developer resources portal for **Itinera**. This portal serves as a live, interactive map of all controllers, validation schemas, and webhook routes matching the production engine.

<div style="background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.2); padding: 18px; border-radius: 8px; margin-bottom: 24px;">
  <strong>💡 Production Gateway:</strong> <code>https://itinari.up.railway.app/api</code><br/>
  <strong>🛠 Local Sandbox:</strong> <code>http://127.0.0.1:8000/api</code>
</div>

---

## 🔒 Authorization Overview

Guarded endpoints in the Itinera engine require a valid **JWT (JSON Web Token)** passed via the `Authorization` header as a Bearer credential:

```bash
Authorization: Bearer <your_jwt_token>
```

To fetch a token, send a payload to `/register` or `/login` endpoints in the **01. Authentication** directory.

---

## 🗂 Routing Directory (100% Mapped Catalog)

The complete spec exposes 3,150+ lines of OpenAPI mappings organized into these major functional groups:

| Directory | Scope | Primary Endpoints |
| :--- | :--- | :--- |
| **01. Authentication** | Account creation, state verification, OAuth redirects, and token refreshment. | `/register`, `/login`, `/me`, `/refresh`, `/auth/google` |
| **02. Admin Console** | Privileged user management (indexing, creating, blocking, and activating users). | `/admin/users`, `/admin/users/{user}/block` |
| **03. Catalog Explorer** | Public queries for travel components. Full-text search and filtering constraints. | `/destinations`, `/hotels`, `/flights`, `/restaurants`, `/attractions` |
| **04. Booking Pipelines** | Authenticated reservation creation and flight/itinerary mapping. | `/trips`, `/trips/create`, `/destinations/{destination}/book` |
| **05. Integrations & Webhooks** | PayMob checkout session token requests, secure HMAC callback listeners, and live weather queries. | `/paymob/payment-key`, `/paymob/webhookEndpoint`, `/weather` |
| **06. V1 Compatibility** | Deprecated or legacy route aliases pointing to active v1 controllers. | `/v1/countries`, `/v1/hotels`, `/v1/destinations` |

---

## 📡 Live Sandbox Usage

You can test requests directly inside this browser catalog using the **"Try It Out"** feature.
1. Authenticate via the `/login` route using valid credentials.
2. Copy the returned `token` from the response body.
3. Select **Auth** at the top right of the interactive panel and paste your token under **Bearer Auth**.
4. Run live queries against the sandbox!
