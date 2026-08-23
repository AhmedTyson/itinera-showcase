# ✈ Itinera API Documentation

Welcome to the official developer resources and API specifications portal for the **Itinera** Showcase. This portal serves as a live, interactive map of all controllers, validation schemas, and webhook routes matching the production engine.

<div style="background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.22); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
  <strong>💡 Production Gateway:</strong> <code>https://itinari.up.railway.app/api</code><br/>
  <strong>🛠 Local Sandbox:</strong> <code>http://127.0.0.1:8000/api</code>
</div>

---

## 🔒 Authorization Overview

Every guarded endpoint in the Itinera engine requires a valid **JWT (JSON Web Token)** passed via the `Authorization` header as a Bearer credential:

```bash
Authorization: Bearer <your_jwt_token>
```

To fetch a token, use `/register` or `/login` endpoints in the **01. Authentication** folder.

---

## 🗂 Routing Directory

| Section / Folder | Description | Key Target |
| :--- | :--- | :--- |
| **01. Authentication** | JWT registration, login, and refresh tokens | Secure stateless sessions |
| **02. Curated Destinations** | Read travel catalogs with full-text search parameters | Core content access |
| **03. Booking Pipelines** | Search schedules, flights, and create package itineraries | Transactional pipelines |
| **04. External APIs & Webhooks** | Coordinate weather integrations and PayMob payment callbacks | Integrations & Security |

---

## 📡 Live Sandbox Usage

You can test requests directly inside this browser catalog using the **"Try It Out"** feature.
1. Authenticate via the `/login` route.
2. Copy the returned token.
3. Select **Auth** at the top right of the interactive panel and paste your token under **Bearer Auth**.
4. Run live queries against the sandbox!
