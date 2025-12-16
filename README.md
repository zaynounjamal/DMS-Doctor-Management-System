# DMS-DOTNETREACT (Clinic Management System)

A comprehensive Clinic Management System built with .NET 10 Web API and React/Vite.

## 🚀 Key Features

### 🏥 Clinical Management
- **Doctor Dashboard**:
    - **Waiting Room**: Real-time view of checked-in patients.
    - **Consultation Mode**: Dedicated interface for active patient visits.
    - **Financial Summary**: Wallet balance and payment tracking.
- **Treatment Icons**: Visual selection of treatments (e.g., Stethoscope, Heart) for better UI.

### 🎨 Customization & Branding
- **Dynamic Branding**: Admins can upload a custom Logo, set Hero Titles, and choose themes via the Admin Panel.
- **Public API**: Frontend dynamically fetches branding settings on load.

### 📧 Email System
- **Dynamic Templates**: Admin interface to create and edit email templates (Welcome, Reminders) with HTML support.
- **Automated Formatting**: Placeholders like `{{FullName}}` are auto-replaced.
- **Signup Integration**: Automatic Welcome Email sending upon user registration.
- **Simulation Mode**: built-in console logging for development without SMTP.

### 🔒 Security & Auditing
- **Enhanced Audit Logs**: Detailed tracking of actions (Login, Payment, Appointment Booking) across all roles (Admin, Doctor, Secretary, Patient).
- **Search & Filter**: Dedicated Admin page to search logs by user, role, or date range.
- **Profile Security**: Robust validation and secure data exposure (Email in UserViewModel).

---

## 🛠 Prerequisites
- .NET 8/10 SDK
- Node.js 18+
- SQL Server

## 🏁 Getting Started

### Backend (API)
```bash
cd DMS-DOTNETREACT/DMS-DOTNETREACT
dotnet run
```
The API runs on `http://localhost:5024`.

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
The Frontend runs on `http://localhost:5173`.

---

## 📖 Walkthrough / Verification

### 1. Dynamic Branding
1. Log in as **Admin**.
2. Go to **Settings** -> **Branding**.
3. Upload a logo or change the title.
4. Refresh the page to see changes reflected globally (Header/Home).

### 2. Email Templates
1. Go to **Admin Dashboard** -> **Email Templates**.
2. Select "WelcomeEmail".
3. Edit the body and save.
4. **Test**: Sign up a new user. Check backend console (or inbox if SMTP configured) for the formatted email.

### 3. Doctor Waiting Room
1. Log in as **Secretary**.
2. **Check-in** a patient for today.
3. Log in as **Doctor**.
4. See the patient appear in the "Waiting Room" widget.

### 4. Audit Logs
1. Perform actions (Log out, Log in, Pay).
2. Log in as **Admin**.
3. Go to **Audit Logs**.
4. Use the search bar to find specific actions.

---

## 📧 Email Configuration
To enable real email sending:
1. Open `DMS-DOTNETREACT/appsettings.json`.
2. Add your SMTP details under `EmailSettings`.
3. Restart the backend.
*(See `email_configuration.md` for detailed steps)*
