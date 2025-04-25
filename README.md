# EcoRewards - Incentivized Waste Collection Platform

A web-based application that rewards users for contributing burnable waste. The system includes three main user roles: Admin, Household (User), and Waste Collector.

## Features

- Role-based authentication system
- Admin dashboard for system management
- User dashboard for waste submission and rewards tracking
- Collector dashboard for pickup management
- Automated reward calculation system
- Waste collection scheduling
- Feedback system

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL

## Project Structure

```
EcoRewards/
├── frontend/         # Frontend files (HTML, CSS, JS)
├── backend/          # Backend PHP files
└── database/         # SQL scripts and database configuration
```

## Setup Instructions

1. Clone the repository
2. Import the database schema from `database/schema.sql`
3. Configure database connection in `backend/config.php`
4. Deploy the application to a web server with PHP and MySQL support

## User Roles

1. **Admin**
   - Manage users and collectors
   - Set reward rates
   - View analytics
   - Assign pickup schedules

2. **Household (User)**
   - Submit waste entries
   - View rewards
   - Submit feedback
   - View pickup schedules

3. **Collector**
   - View assigned pickups
   - Update collection status
   - View collection history

## Database Schema

The application uses the following tables:
- Users
- Waste_Entries
- Rewards
- Pickup_Schedules
- Feedback 