# Architecture : MY Want
Client
  |
Load Balancer (Nginx / ALB)
  |
Node.js Cluster (x3)
  |
PgBouncer
  |
PostgreSQL/MongoDB
  ├── Primary (Writes)
  ├── Replica 1 (Reads)
  └── Replica 2 (Reads)

---

- DB config → URI builder → connection → indexes with dummy env values.
1. feat(db): add MongoDB connection setup
2. feat(config): build MongoDB URI from env variables
3. refactor(db): introduce typed DBConfig and singleton DB manager
4. perf(db): disable autoIndex and handle connection events  
5. feat(db): add explicit index creation and graceful shutdown
### username: password @ cluster.hostsuffix/databasename?retryWrites=true&w=majority

- prvent Nosql injection 
 - mongo-sanitize
 - zod validation 

- send mail  -Nodemailer
- Rate limiting - express-rate-limit/Redis on Email/OTP/Ip -- Fixed Algo

# Rate Limiting – Node.js + Redis

## Overview
Rate limiting restricts how many requests a client can make in a given time window to prevent abuse and protect backend services.

**Applied at:** API Gateway  
**Tech:** Node.js, Redis

---



Client → API Gateway (Rate Limiter) → User Service

## Swagger
Client
  ↓
Swagger UI (/api-docs)
  ↓
OpenAPI JSON (generated at runtime)
  ↓
Zod Schemas (single source of truth)
  ↓
Express Routes
  ↓
Validation Middleware
  ↓
Controllers


## Banking System Added for Payment and Transaction processing


### Account Management
- Account Creation  ~~ Users 
-  TODO : Specific UserRole -Employee | Stakeholder having  account onlyu ==Future Scope

### Transaction Management

- Transaction Creation -Ledger system
from - Account
to - Account
amount - Amount
idem-potent - true/false -key
status - pending/success/failed

## Validation Missing on tokens and cookies


- Transaction History -Ledger system
from - Account
amount - Amount
tnx-type - credit/debit



```

src/
├── app.ts
├── server.ts
│
├── config/
│   ├── db.ts                     # Prisma client singleton
│   ├── redis.ts                  # Redis client singleton
│   ├── env.ts                    # all env vars typed + validated
│   ├── oauth.config.ts           # GitHub, Google, LinkedIn provider URLs
│   └── clients.config.ts         # registered SSO client apps
│
├── constants/
│   ├── auth.constants.ts         # token TTLs, cookie names, error codes
│   └── providers.constants.ts    # provider names enum
│
├── models/
│   └── user.model.ts             # Prisma schema / Mongoose model
│
├── routes/
│   ├── user.routes.ts            # JWT — register/login/logout
│   ├── oauth.routes.ts           # OAuth2 — /auth/:provider/callback
│   └── oidc.routes.ts            # SSO — /oidc/authorize /oidc/token
│
├── controllers/
│   ├── user.controller.ts        # JWT controller
│   ├── oauth.controller.ts       # OAuth2 + OIDC social login
│   └── oidc.controller.ts        # SSO authorize/token/userinfo
│
├── services/
│   ├── auth.service.ts           # JWT issue/verify + bcrypt
│   ├── oauth.service.ts          # code exchange + profile fetch
│   ├── sso.session.service.ts    # Redis SSO session CRUD
│   └── session.service.ts        # single session version (Redis+DB)
│
├── middlewares/
│   ├── isAuthenticated.ts        # JWT verify + sessionVersion check
│   ├── ssoSession.middleware.ts  # read SSO cookie from Redis
│   ├── authorizedUser.ts         # role check
│   ├── tryCatch.ts               # async error wrapper
│   └── csrf.ts                   # CSRF token verify
│
├── helpers/
│   ├── token.helper.ts           # sign/decode/verify JWT wrappers
│   ├── cookie.helper.ts          # set/clear cookie helpers
│   └── state.helper.ts           # OAuth state store (in-memory Map)
│
└── validators/
    └── user.validator.ts         # zod schemas

    ```
