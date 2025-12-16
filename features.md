# Doctor Management System (DMS) - Feature Documentation

This document provides a comprehensive A-Z list of features implemented in the Doctor Management System.

## 🏥 Patient Portal
Features accessible to public users and registered patients.

### Public Features
- **Dynamic Landing Page**:
  - **Customizable Hero Section**: Admin-controlled title, subtitle, and background image.
  - **Treatments Preview**: Animated grid showing available services with dynamic icons.
  - **Statistics**: Display of key clinic metrics (Doctors, Patients, Experience).
  - **Responsive Design**: Fully optimized for mobile and desktop.
- **Treatments Page**:
  - Full catalog of medical services.
  - Dynamic icon rendering (supports Lucide icons and emojis).
  - Consistent "Glassmorphism" design with hover effects.
- **Authentication**:
  - **Sign Up**: Register new patient account.
  - **Login**: Secure access for Patients, Doctors, Secretaries, and Admins.

### Patient Dashboard
- **Profile Management**: View personal details.
- **Appointment Booking**:
  - Select Department/Treatment.
  - Choose Doctor.
  - Interactive Calendar for date selection.
  - Time Slot picker based on doctor availability.
- **My Appointments**:
  - View Upcoming, Completed, and Cancelled appointments.
  - Status tracking (Pending, Confirmed, Done).
- **Financial Summary**:
  - Track **Total Paid** and **Total Unpaid** bills.
  - View real-time **Remaining Balance** (Wallet).
  - Detailed breakdown of costs per appointment.

---

## 👨‍⚕️ Doctor Dashboard
Dedicated workspace for medical professionals.

### Workspace
- **Dashboard Overview**:
  - **Waiting Room**: Real-time list of patients currently checked in/waiting.
  - **Quick Stats**: Appointments count, Patients seen.
- **Appointment Management**:
  - **Kanban/List View**: Filter by Today, Upcoming, History.
  - **Consultation Mode**:
    - **Mark as Completed**: Finish appointment.
    - **Add Medical Notes**: Record diagnosis and treatment details.
    - **Set Price**: Override or set final price for the visit.
    - **Bulk Actions**: Complete multiple appointments at once.
- **Calendar**:
  - Monthly/Weekly view of schedule.
  - Visual indicators for booked slots.
- **Patient Management**:
  - **Patient List**: Searchable database of assigned patients.
  - **Medical History**: View past appointments and notes for specific patients.
- **Profit Analytics**:
  - **Financial Charts**: Visual breakdown of earnings.
  - **Date Filters**: Analyze profit by Yesterday, Week, Month, or Year.
  - **Unpaid Tracking**: Monitor outstanding payments.
- **Schedule Management**:
  - **Off Days**: Block specific dates to prevent bookings.

---

## 👩‍💼 Secretary Dashboard
Administrative tools for front-desk staff.

### Front Desk Operations
- **Dashboard**:
  - **Quick Actions**: Shortcuts for common tasks.
  - **Daily Overview**: Summary of today's schedule.
- **Appointment Manager**:
  - **Booking**: Book appointments on behalf of patients.
  - **Status Updates**: Mark as Confirmed, Arrived (Check-in), Cancelled.
  - **Rescheduling**: Modify appointment dates/times.
- **Patient Management**:
  - **CRUD Operations**: Create, Read, Update, Delete patient records.
  - **Search**: Fast lookup by name or phone.
- **Billing & Payments**:
  - **Process Payment**: Mark appointments as Paid.
  - **Wallet Management**: Add funds to patient balance.
  - **Pay with Balance**: Deduct costs from patient's wallet.
  - **Invoice Generation**: (Implicit via payment records).

---

## 🛡️ Admin Dashboard
System-wide control and configuration.

### System Management
- **Dashboard**: High-level system metrics (Total Users, Revenue, System Health).
- **User Management**:
  - Manage all system users (Doctors, Secretaries, Admins).
  - Role assignment and status control.
- **Treatments Management**:
  - **Add/Edit Services**: Define Name, Description, Default Price.
  - **Icon Picker**: Select from standard medical icons for visual representation.
- **System Settings**:
  - **General**: Update Clinic Name, Address, Contact Info.
  - **Social Media**: Manage links to Facebook, Twitter, Instagram.
  - **Branding**:
    - Upload **Logo** (Image or Icon).
    - Set **Hero Details** (Title, Subtitle, Background Image).
    - Changes reflect instantly on the public site.
- **Audit Logs**:
  - **Comprehensive Tracking**: Log actions from All roles (e.g., "Doctor X completed appointment", "Secretary Y added balance").
  - **Search & Filter**: Find logs by Username, Role, Date Range, or Action type.
- **Reports**:
  - Generate system-wide financial and operational reports.

---

## ⚙️ Technical Features
Under-the-hood capabilities.

- **Security**:
  - **JWT Authentication**: Secure, stateless login sessions.
  - **Role-Based Access Control (RBAC)**: Strict API and Frontend route protection.
- **Audit System**:
  - Database-level tracking of critical actions (Who, What, When, IP Address).
- **Dynamic Frontend**:
  - **React + Tailwind CSS**: Modern, responsive UI.
  - **Framer Motion**: Smooth animations and transitions.
  - **Lucide Icons**: Consistent, scalable vector icons.
- **Robust Backend**:
  - **.NET Core API**: High-performance REST endpoints.
  - **Entity Framework Core**: Reliable database management.
