# Itinari — Production-Grade Apidog Developer Portal & Mock API

## Role

You are a senior API architect, technical writer, developer-experience engineer, and Apidog specialist.

You are working on the **Itinari** project, a travel platform with approximately **214 API endpoints**.

Your goal is to transform the existing API specification and project knowledge into a **professional, public-facing API Developer Portal and API Reference using Apidog**, inspired by the structure and experience of the EpicHub Apidog documentation:

- https://epichub.apidog.io/
- https://epichub.apidog.io/%EF%B8%8F-epichub-documentation-2172110m0

Do NOT blindly copy EpicHub's content, branding, architecture, or wording.

Use EpicHub only as a reference for:

- Information architecture
- Documentation organization
- Developer experience
- Landing-page structure
- API reference presentation
- Sidebar organization
- Try It experience
- Technical documentation depth

The final result must represent **Itinari's actual architecture, APIs, business logic, and technology stack**.

---

# PRIMARY OBJECTIVE

Build a professional Itinari API documentation system where a developer can:

1. Open the public documentation.
2. Understand what Itinari is.
3. Understand the architecture and technology stack.
4. Read getting-started instructions.
5. Understand authentication.
6. Browse approximately 214 API endpoints.
7. See realistic request bodies.
8. See realistic response examples.
9. Use "Try It".
10. Send requests against a safe Mock/Cloud Mock environment.
11. Receive deterministic and realistic mock responses.
12. Understand success and error responses.
13. Navigate reusable schemas.
14. Understand pagination, validation, authorization, rate limits, and common API conventions.

The public documentation MUST NOT require users to hit the production backend merely to explore the API.

---

# CRITICAL PRINCIPLE

Do NOT manually execute all ~214 endpoints just to collect responses.

Treat this as an **automation and documentation architecture problem**, not a manual API testing task.

Use the following strategy where appropriate:

- OpenAPI schemas
- Request examples
- Response examples
- Automatic example generation
- Apidog Mock
- Cloud Mock
- Mock Expectations
- Fixed mock responses for critical endpoints
- Smart/generated mock data for less critical endpoints

Use manual verification only where it provides meaningful value.

---

# SOURCE OF TRUTH

Before making any changes, inspect the repository and determine:

- Existing OpenAPI specification
- Swagger configuration
- Laravel API routes
- Controllers
- Form Requests
- Resources / Transformers
- API response conventions
- Models
- Enums
- Authentication system
- Authorization rules
- Pagination implementation
- Error handling
- Existing API documentation
- Existing Apidog project if accessible
- Existing Postman collections if present
- Existing API examples
- Existing seeders/factories
- Existing frontend API usage

Never invent API behavior if it can be determined from the repository.

When documentation and implementation disagree:

1. Identify the conflict.
2. Determine which is authoritative.
3. Document the discrepancy.
4. Do not silently change application behavior merely to make documentation look correct.

---

# NON-NEGOTIABLE SAFETY RULES

Before modifying anything:

1. Inspect the repository.
2. Understand the existing API architecture.
3. Identify the current OpenAPI source.
4. Identify how the ~214 endpoints are grouped.
5. Identify authentication requirements.
6. Identify sensitive endpoints.
7. Identify production-only operations.
8. Identify endpoints that MUST NOT be executed against production from public documentation.

Never expose:

- Real API credentials
- Production tokens
- Payment credentials
- Private keys
- Secrets
- Real customer data
- Internal infrastructure credentials
- Database credentials
- Private environment variables

All public mock data MUST be synthetic.

---

# PHASE 0 — DISCOVERY & BASELINE

## Objective

Understand the current state before changing anything.

Inspect:

- Repository structure
- API routes
- Controllers
- Requests
- Resources
- Models
- Enums
- Authentication
- Authorization
- API response format
- OpenAPI / Swagger
- Existing documentation
- Existing seeders/factories
- Existing API clients
- Existing Apidog configuration if available

Produce a baseline report containing:

### API Inventory

For every endpoint, identify:

- HTTP method
- URI
- Module
- Authentication requirement
- Authorization requirement
- Request body
- Query parameters
- Path parameters
- Response status codes
- Response schema
- Existing examples
- Mock readiness
- Documentation readiness

Do NOT implement anything yet.

---

# PHASE 1 — API SPECIFICATION AUDIT

## Objective

Make the API specification strong enough to support high-quality documentation and mocking.

Audit all approximately 214 endpoints.

Check for:

- Missing summaries
- Missing descriptions
- Missing tags
- Incorrect HTTP methods
- Incorrect paths
- Missing parameters
- Missing request schemas
- Missing response schemas
- Missing status codes
- Missing authentication definitions
- Missing authorization documentation
- Inconsistent naming
- Inconsistent response envelopes
- Inconsistent pagination
- Inconsistent validation errors
- Inconsistent error formats
- Duplicate schemas
- Non-reusable schemas
- Incorrect examples
- Missing examples

Create an endpoint quality classification:

### Gold

Critical public endpoints requiring polished examples and deterministic mocks.

### Standard

Normal endpoints that can use generated examples/mock data.

### Internal

Admin/internal endpoints that require documentation but may use simpler mock behavior.

Do not modify application logic during this phase unless explicitly required.

---

# PHASE 2 — INFORMATION ARCHITECTURE

## Objective

Design the Itinari documentation structure inspired by EpicHub's organization but based on Itinari's actual domain.

Design the public documentation hierarchy.

Suggested structure:

## Introduction

- Itinari Overview
- What is Itinari?
- API Overview
- Base URLs
- API Versioning
- Quick Start

## Getting Started

- Authentication
- Authorization
- Making Your First Request
- Request Headers
- Response Format
- Pagination
- Filtering
- Sorting
- Validation
- Error Handling
- Rate Limits

## API Reference

Organize according to actual Itinari modules, for example:

- Authentication
- Users
- Trips
- Destinations
- Search
- Bookings
- Reviews
- Payments
- Subscriptions
- AI
- Notifications
- Agencies
- Analytics
- Admin
- Other actual modules discovered during Phase 0

Do NOT blindly use this list if the repository indicates a different architecture.

## Schemas

Create a reusable schema section containing actual project schemas.

---

# PHASE 3 — REQUEST EXAMPLES

## Objective

Ensure developers can immediately understand and execute requests.

For important endpoints, create realistic request examples.

Examples must:

- Use valid values
- Match the actual schema
- Use consistent IDs
- Use realistic dates
- Use realistic business data
- Respect enum values
- Respect validation constraints
- Respect authorization requirements

Avoid meaningless examples such as:

```json
{
  "name": "string",
  "id": 0
}
```

Prefer realistic synthetic data.

Example:

```json
{
  "trip_id": 101,
  "date": "2026-09-15",
  "passengers": 2
}
```

For endpoints without request bodies, ensure path/query parameters are meaningful.

---

# PHASE 4 — RESPONSE EXAMPLES

## Objective

Create useful response examples without manually executing all 214 endpoints.

Use a layered strategy.

### Level 1 — Automatic Generation

For simple/standard endpoints:

Generate examples from accurate OpenAPI schemas.

### Level 2 — Curated Examples

For important endpoints:

Create realistic deterministic examples.

Examples include:

- Authentication
- Trips
- Search
- Bookings
- Payments
- Subscriptions
- AI
- User profile
- Critical admin/analytics endpoints

### Level 3 — Error Examples

For appropriate endpoints include:

- 400
- 401
- 403
- 404
- 409
- 422
- 429
- 500

Only include status codes that are actually meaningful for the endpoint.

Do not invent unsupported behavior.

---

# PHASE 5 — CONSISTENT MOCK DATA MODEL

## Objective

Make the mock API feel like one coherent application instead of 214 unrelated random endpoints.

Create a synthetic Itinari mock dataset.

Potential entities:

- Users
- Agencies
- Destinations
- Trips
- Bookings
- Reviews
- Subscriptions
- Payments
- Notifications
- AI generations
- Analytics

Use stable IDs.

For example:

Trip 101 should remain Trip 101 across related mock responses.

If:

```text
GET /trips/101
```

returns Trip 101,

then:

```text
POST /bookings
{
  "trip_id": 101
}
```

should produce a booking referencing Trip 101.

The mock data must be internally consistent.

---

# PHASE 6 — APIDOG MOCK STRATEGY

## Objective

Configure the best mock strategy for the documentation.

Use:

### Response Examples

For deterministic documented responses.

### Mock Expectations

For critical endpoints where exact responses are required.

### Smart Mock / Generated Mock

For standard endpoints where deterministic business-specific data is not necessary.

### Cloud Mock

For public documentation Try It functionality.

The target architecture is:

```text
Public Documentation
        |
        v
      Try It
        |
        v
   Cloud Mock
        |
   +----+----+
   |         |
Fixed      Generated
Mocks       Mocks
   |         |
Critical   Standard
APIs       APIs
```

The public documentation must NOT accidentally execute destructive production operations.

---

# PHASE 7 — TRY IT EXPERIENCE

## Objective

Make the Try It experience work smoothly.

For every public/documented endpoint verify:

- Request method
- URL
- Parameters
- Headers
- Request body
- Authentication behavior
- Mock environment
- Response display

The ideal developer experience is:

```text
Open endpoint
    ↓
Request example already populated
    ↓
Click Try It
    ↓
Click Send
    ↓
Cloud Mock
    ↓
Realistic response
```

Avoid requiring developers to guess values.

---

# PHASE 8 — DOCUMENTATION CONTENT

## Objective

Create high-quality technical documentation around the API.

Create:

### Executive Overview

Explain:

- What Itinari is
- Who the API is for
- Main capabilities

### Architecture

Explain:

- Frontend
- Backend
- API layer
- Database
- Authentication
- External services
- AI integration
- Deployment architecture

Only describe architecture verified from the repository.

### Technology Stack

Document the actual stack.

### Security

Document:

- Authentication
- Authorization
- JWT/session mechanism
- Validation
- Rate limiting if implemented
- Sensitive data handling
- Security middleware
- CORS
- Other verified controls

Do not claim a security feature exists unless verified.

### Business Features

Explain actual Itinari features.

### API Conventions

Explain:

- Response envelopes
- Status codes
- Pagination
- Filtering
- Sorting
- Validation
- Errors
- Authentication

### Integration Guides

Create practical guides such as:

- Authentication Flow
- Get Trips
- Search Trips
- Create Booking
- Handle Booking Status
- AI Trip Generation
- Subscription Usage
- Error Handling

Only create guides for verified functionality.

---

# PHASE 9 — LANDING PAGE / DEVELOPER PORTAL

## Objective

Create a professional landing page inspired by EpicHub.

The page should communicate:

## ITINARI

AI-Powered Travel Platform

Include:

- Hero section
- Project overview
- Key metrics
- Architecture overview
- Core capabilities
- Technology stack
- Security overview
- API capabilities
- Quick start CTA
- API Documentation CTA
- Demo/Developer CTA

Potential visual hierarchy:

```text
ITINARI

AI-Powered Travel Platform

Build intelligent travel experiences
with the Itinari API.

[ Get Started ] [ API Reference ]

--------------------------------

214+ API Endpoints
Multiple Modules
Secure API
AI-Powered Travel

--------------------------------

Architecture

--------------------------------

Core Features

--------------------------------

Technology Stack

--------------------------------

API Documentation

[ Explore API ]

--------------------------------

Security

--------------------------------

Demo Flow
```

Do not fabricate metrics.

Use verified numbers from the project.

---

# PHASE 10 — VISUAL / UX POLISH

## Objective

Make the documentation look professional enough for:

- Graduation project presentation
- Portfolio
- Technical review
- Developer onboarding
- Demo

Ensure:

- Consistent branding
- Clear navigation
- Logical sidebar
- Good endpoint naming
- Good descriptions
- Readable code blocks
- Clear request/response examples
- Consistent terminology
- Useful cross-linking
- Mobile usability
- Dark/light mode where appropriate
- Professional landing page

Do not over-design the API reference itself.

Prioritize usability.

---

# PHASE 11 — VALIDATION & QUALITY ASSURANCE

## Objective

Validate the final documentation without manually executing all 214 APIs against production.

Perform automated/static checks where possible.

Validate:

- Every endpoint exists
- Every documented endpoint maps to a real endpoint
- No undocumented critical endpoint
- Request schema correctness
- Response schema correctness
- Example validity
- Enum validity
- Authentication definitions
- Mock configuration
- Broken links
- Broken references
- Duplicate schemas
- Inconsistent response structures
- Missing descriptions
- Missing examples
- Incorrect status codes

Then perform manual smoke testing on a representative sample:

### Authentication

2–3 endpoints

### Public API

3–5 endpoints

### CRUD

3–5 endpoints

### Booking

2–3 endpoints

### AI

2–3 endpoints

### Admin

2–3 endpoints

### Error cases

Several representative endpoints

The goal is confidence, not manually testing all 214 endpoints.

---

# PHASE 12 — PUBLISH

## Objective

Publish the final Itinari Developer Portal.

Configure:

- Published documentation
- Cloud Mock environment
- Public Try It
- Branding
- Navigation
- Favicon
- Logo
- Custom domain if available
- API version
- Documentation version

Recommended final structure:

```text
ITINARI
│
├── Developer Portal
│
├── Getting Started
│
├── Authentication
│
├── Guides
│
├── API Reference
│   ├── Authentication
│   ├── Users
│   ├── Trips
│   ├── Destinations
│   ├── Search
│   ├── Bookings
│   ├── Reviews
│   ├── Payments
│   ├── Subscriptions
│   ├── AI
│   ├── Notifications
│   ├── Agencies
│   ├── Analytics
│   └── Admin
│
├── Schemas
│
└── Changelog
```

Adjust the structure according to the actual repository.

---

# PHASE 13 — FINAL AUDIT

Before declaring the project complete, produce a final report containing:

## API Coverage

- Total endpoints discovered
- Total documented
- Total with request examples
- Total with response examples
- Total mocked
- Total using fixed mocks
- Total using generated mocks
- Total manually smoke-tested

## Documentation Coverage

- Landing page
- Getting started
- Authentication
- API reference
- Guides
- Schemas
- Errors
- Security
- Architecture

## Mock Coverage

- Cloud Mock enabled
- Critical endpoint fixed mocks
- Standard endpoint generated mocks
- Error mock coverage
- Mock consistency

## Outstanding Issues

List anything that cannot be safely or accurately automated.

---

# IMPLEMENTATION RULES

## Rule 1

Do not start implementing before completing discovery.

## Rule 2

Do not manually test 214 endpoints.

## Rule 3

Do not invent API behavior.

## Rule 4

Do not invent response fields.

## Rule 5

Do not expose real credentials.

## Rule 6

Do not connect public Try It to destructive production operations.

## Rule 7

Prefer automation over repetitive manual work.

## Rule 8

Prefer reusable schemas over duplicated schemas.

## Rule 9

Prefer deterministic examples for critical endpoints.

## Rule 10

Keep generated mock data realistic and internally consistent.

## Rule 11

If an Apidog feature is unavailable or differs from expectations, verify the current Apidog documentation before proposing a workaround.

## Rule 12

Do not claim completion unless the relevant phase has been validated.

---

# EXECUTION MODE

Work in phases.

After completing each phase:

1. Summarize what was discovered.
2. Summarize what was changed.
3. List files changed.
4. List unresolved issues.
5. Report validation results.
6. State whether the next phase is safe to begin.

Do not skip phases.

Do not silently perform major work from future phases.

At the end, produce a final:

# ITINARI API DEVELOPER PORTAL AUDIT

including:

- Architecture
- API coverage
- Documentation coverage
- Mock coverage
- Example coverage
- Security considerations
- Remaining gaps
- Recommended future improvements

The final system should provide a polished experience comparable in information architecture and developer experience to the referenced EpicHub Apidog portal, while remaining completely faithful to Itinari's actual implementation.