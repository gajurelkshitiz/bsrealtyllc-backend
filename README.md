# BS Realty LLC Backend

A Node.js backend for BS Realty LLC real estate application with role-based authentication.

## Features

- User registration and login with role-based access (Agent, Client, Admin)
- JWT authentication
- Password hashing with bcrypt
- Input validation with Joi
- MongoDB database

## Project Structure

```
bsrealtyllc-backend/
├── config/
│   └── db.js              # Database connection configuration
├── controllers/
│   ├── authController.js  # Authentication business logic
│   ├── contactController.js # Contact management business logic
│   └── appointmentController.js # Appointment booking business logic
├── models/
│   ├── User.js            # User model with authentication
│   ├── Contact.js         # Contact submission model
│   └── Appointment.js     # Appointment booking model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── contact.js         # Contact management routes
│   └── appointment.js     # Appointment booking routes
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── scripts/
│   ├── seed.js            # Admin user seeding script
│   ├── seedContacts.js    # Sample contact data seeding
│   └── seedAppointments.js # Sample appointment data seeding
├── server.js              # Main application entry point
├── package.json
├── .env                   # Environment variables
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/bsrealty
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

5. Seed the admin user:
   ```bash
   npm run seed
   ```
   This creates an admin user with email `admin@bsrealty.com` and password `admin123`.

6. Run the server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (agent or client)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires authentication)
### Contact Management

- `POST /api/contacts/submit` - Submit contact form (public)
- `GET /api/contacts` - Get all contacts with filtering (admin only)
  - Query parameters: `page`, `limit`, `status`, `isSpam`, `search`, `startDate`, `endDate`
- `GET /api/contacts/:id` - Get contact by ID (admin only)
- `PATCH /api/contacts/:id/status` - Update contact status (admin only)
  - Body: `{ "status": "read|responded|archived", "isSpam": true|false }`
- `DELETE /api/contacts/:id` - Delete contact (admin only)
- `GET /api/contacts/export/csv` - Export contacts to CSV (admin only)
  - Same filtering as GET /api/contacts
- `GET /api/contacts/stats/overview` - Get contact statistics (admin only)

### Appointment Management

- `POST /api/appointments/book` - Book appointment (public)
- `GET /api/appointments` - Get all appointments with filtering (admin only)
  - Query parameters: `page`, `limit`, `status`, `category`, `preference`, `search`, `startDate`, `endDate`
- `GET /api/appointments/:id` - Get appointment by ID (admin only)
- `PATCH /api/appointments/:id/status` - Update appointment status (admin only)
  - Body: `{ "status": "pending|confirmed|completed|cancelled" }`
- `DELETE /api/appointments/:id` - Delete appointment (admin only)
- `GET /api/appointments/export/csv` - Export appointments to CSV (admin only)
  - Same filtering as GET /api/appointments
- `GET /api/appointments/stats/overview` - Get appointment statistics (admin only)

### Health Check

- `GET /api/health` - Server health check

## User Roles

- **Agent:** Real estate agents
- **Client:** Property clients
- **Admin:** System administrators (pre-configured, no registration endpoint)

## Request/Response Examples

### Register
```json
POST /api/auth/register
{
  "email": "agent@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "agent"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "agent@example.com",
  "password": "password123",
  "role": "agent"
}
```

## License

ISC