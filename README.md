# RentNest

**Find & List Rental Properties with Ease**

RentNest is a backend REST API for a rental property marketplace. Landlords can list properties, manage availability, and approve or reject rental requests. Tenants can browse listings, submit rental requests, make payments, and leave reviews. Admins oversee the entire platform, managing users and moderating content.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Token)
- **Payment Gateways:** SSLCommerz, Stripe

---

## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Tenant** | Users looking for rental properties | Browse listings, submit rental requests, make payments, leave reviews, manage profile |
| **Landlord** | Property owners who list rentals | Create/manage listings, approve/reject requests, view tenant history |
| **Admin** | Platform moderators | Manage all users, oversee all listings & requests, manage categories |

> 💡 Users select their role during registration.

---

## Features

### Public
- Browse all available rental properties
- Search and filter by location, price range, and property type
- View detailed property listings
- View property categories

### Tenant
- Register and login
- Submit rental requests for properties
- Make payments via Stripe or SSLCommerz after a rental request is approved
- View rental request history and payment history
- Leave reviews after a completed rental

### Landlord
- Register and login
- Create, update, and delete property listings
- View all rental requests for their properties
- Approve or reject rental requests

### Admin
- View and manage all users (ban/unban)
- View all properties and rental requests platform-wide
- Create property categories

---

## Database Schema Overview

The schema was designed by first mapping out all features and endpoints, then building an ER diagram to define entities and relationships before writing code — this made schema design and implementation significantly faster and reduced structural rework later.

| Table | Description |
|-------|-------------|
| **Users** | Stores user info, credentials, role (`tenant`/`landlord`/`admin`), and account status |
| **Properties** | Rental listings linked to a landlord and a category |
| **Categories** | Property type categories (apartment, house, studio, etc.) |
| **RentalRequest** | Rental requests between tenants and landlords, with status tracking |
| **Payment** | Payment transactions linked to a rental request (provider, status, amount) |
| **Reviews** | Tenant reviews for properties |

---

## API Endpoints

### Base Routes
```typescript
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/landlord", landLordRoutes);
app.use("/api/rentals", rentalRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/payments", paymentRoutes);
```

### Authentication — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user (tenant/landlord) |
| POST | `/api/auth/login` | Public | Login and receive JWT token |
| GET | `/api/auth/me` | Tenant, Landlord, Admin | Get current authenticated user |
| GET | `/api/auth/refresh-token` | Public | Refresh access token |

### Categories — `/api/categories`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/categories` | Admin | Create a new property category |
| GET | `/api/categories` | Public | Get all categories |

### Properties (Public) — `/api/properties`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/properties` | Public | Get all properties with filters (location, price, type) |
| GET | `/api/properties/:id` | Public | Get property details |

### Landlord — `/api/landlord`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/landlord/properties` | Landlord | Create a new property listing |
| PUT | `/api/landlord/properties/:id` | Landlord | Update a property listing |
| DELETE | `/api/landlord/properties/:id` | Landlord | Delete a property listing |
| GET | `/api/landlord/properties/requests` | Landlord | Get all rental requests for landlord's properties |
| PATCH | `/api/landlord/properties/requests/:id` | Landlord | Approve or reject a rental request |

### Rental Requests — `/api/rentals`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/rentals` | Tenant | Submit a rental request |
| GET | `/api/rentals` | Tenant | Get current user's rental requests |
| GET | `/api/rentals/:id` | Tenant | Get rental request details |

### Payments — `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/create` | Tenant | Create a payment session for an approved rental |
| POST | `/api/payments/confirm` | Public (IPN/callback) | Verify SSLCommerz payment via IPN callback |
| GET | `/api/payments` | Tenant | Get user's payment history |
| GET | `/api/payments/:id` | Public | Get payment details |

### Reviews — `/api/reviews`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | Tenant | Create a review after a completed rental |

### Admin — `/api/admin`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | Admin | Get all users |
| PATCH | `/api/admin/users/:id` | Admin | Update user status (ban/unban) |
| GET | `/api/admin/properties` | Admin | Get all properties |
| GET | `/api/admin/rentals` | Admin | Get all rental requests |

---

## Rental Request Lifecycle

```
PENDING → APPROVED → PAYMENT → ACTIVE → COMPLETED
        → REJECTED
```

1. Tenant submits a rental request → `PENDING`
2. Landlord approves or rejects → `APPROVED` / `REJECTED`
3. On approval, tenant makes payment via Stripe/SSLCommerz
4. On successful payment verification → rental request becomes `ACTIVE`, property becomes `BOOKED`
5. After the rental period → `COMPLETED`, tenant can leave a review

---

## Authentication & Authorization

- JWT-based authentication; token required for all protected routes
- Role-based access control enforced via middleware: `auth(Role.TENANT | Role.LANDLORD | Role.ADMIN)`


---

## Payment Verification Flow (SSLCommerz)

Payment status is never trusted directly from client-side responses. Instead:

1. SSLCommerz sends a server-to-server IPN (Instant Payment Notification) callback to `POST /api/payments/confirm`
2. The backend calls SSLCommerz's **Validation API** with the `val_id` to confirm the transaction is genuinely valid
3. On a valid response, the following updates run inside a single **Prisma database transaction**:
   - Payment status → `COMPLETED`
   - Rental Request status → `ACTIVE`
   - Property status → `BOOKED`
4. If validation fails, Payment status is set to `FAILED`

Using a database transaction ensures all three updates succeed together, or none of them apply — preventing inconsistent data if any step fails mid-process.

---

## Technical Challenges

**1. Payment verification trigger point**
Determining exactly when and where to call the payment verification logic was initially unclear. After reviewing SSLCommerz's flow, it became clear that verification must happen from the server-to-server IPN callback rather than trusting the client-side redirect, since client responses can be manipulated.

**2. Multi-table consistency on payment success**
A successful payment requires updating three related tables (Payment, RentalRequest, Properties) together. This was solved using Prisma's `$transaction` API to guarantee atomicity — either all updates succeed, or the entire operation rolls back.

---

## Getting Started

```bash
# install dependencies
npm install

# set up environment variables
cp .env.example .env

# run database migrations
npx prisma migrate dev

# start development server
npm run dev
```

### Environment Variables

```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
SSL_COMMERZ_STORE_ID=
SSL_COMMERZ_STORE_PASSWORD=
STRIPE_SECRET_KEY=
```

---

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── categories/
│   ├── properties/
│   ├── landlord/
│   ├── rentalRequest/
│   ├── payment/
│   ├── reviews/
│   └── admin/
├── middleware/
│   └── auth.middleware.ts
└── app.ts
```