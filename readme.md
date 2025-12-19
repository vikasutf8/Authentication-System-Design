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
