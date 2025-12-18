# 🏥 DMS - Doctor Management System

**A comprehensive, full-stack Clinic Management System** built with **.NET 10 Web API** and **React + Vite**, featuring real-time communication, dynamic theming, role-based access control, and complete clinic workflow automation.

---

## 📋 Table of Contents

- [Features (A→Z)](#features-a-z)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Default Test Accounts](#default-test-accounts)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🚀 Features (A→Z)

### 👤 **Authentication & Authorization**
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Doctor, Secretary, Patient)
- **Protected routes** with automatic redirection
- **Password hashing** using BCrypt
- **Session persistence** with localStorage
- **Login/Signup modals** with real-time validation

### 📅 **Appointment Management**
- **Book appointments** with available time slots
- **Real-time availability** checking
- **Appointment status tracking** (Scheduled, Completed, Cancelled, No-Show)
- **Doctor-specific scheduling** with custom working hours
- **Appointment history** for patients and doctors
- **Check-in system** for secretaries
- **Waiting room dashboard** for doctors
- **Auto-block patients** after 3+ no-shows

### 💬 **Real-Time Chat System**
- **SignalR-powered** real-time messaging
- **Patient-Secretary chat** for appointment inquiries
- **Ticket-based system** with status tracking (Open, In Progress, Resolved)
- **Unread message indicators**
- **Chat history** with timestamps
- **AI-powered public chatbot** for general clinic information

### 👨‍⚕️ **Doctor Dashboard**
- **Waiting room widget** showing checked-in patients
- **Today's appointments** with quick actions
- **Patient consultation mode** with medical notes
- **Financial summary** (wallet balance, earnings)
- **Profit analytics** with charts and date filters
- **Off-days management** for vacation/unavailability
- **Calendar view** of all appointments
- **Patient medical history** access

### 🏢 **Secretary Dashboard**
- **Patient check-in/check-out** system
- **Payment processing** (Cash, Card, Insurance)
- **Daily schedule** overview
- **Payment reports** with PDF export
- **Chat management** for patient inquiries
- **Appointment booking** on behalf of patients

### 🔐 **Admin Panel**
- **User management** (Create, Edit, Block, Delete)
- **Role assignment** and permissions
- **Audit logs** with search and filtering
- **System settings** (Clinic name, contact info, social links)
- **Email template editor** with HTML support
- **Treatment management** with custom icons
- **Blocked phone numbers** management
- **Patient management** with detailed profiles
- **Schedule overview** across all doctors
- **Financial reports** and analytics

### 🎨 **Dynamic Theming & Branding**
- **Admin-controlled theme colors** (Primary, Secondary, Accent, Muted)
- **Light/Dark mode** with smooth transitions
- **Separate color schemes** for light and dark modes
- **CSS variable-based** theming system
- **Real-time theme preview**
- **Revert to default colors** button
- **Custom logo upload** (icon or image)
- **Hero section customization**
- **Footer branding** (clinic name, address, social links)

### 📧 **Email System**
- **Dynamic email templates** (Welcome, Appointment Reminders)
- **HTML email support** with placeholders (`{{FullName}}`, `{{UserName}}`)
- **Template editor** in admin panel
- **Automated welcome emails** on signup
- **Appointment reminder emails** (configurable)
- **SMTP integration** (Gmail, Outlook, custom)
- **Console simulation mode** for development

### 💰 **Payment & Financial**
- **Payment processing** with multiple methods
- **Payment history** tracking
- **Doctor wallet system** with balance tracking
- **Financial reports** with date range filters
- **PDF export** for payment reports
- **Revenue analytics** for admin
- **Payment status** tracking (Paid, Pending, Refunded)

### 🔍 **Search & Filtering**
- **Global search** across appointments, patients, users
- **Advanced filters** by date, status, role
- **Audit log search** by user, action, date range
- **Treatment search** by name or description

### 🔔 **Notifications & Reminders**
- **Real-time toast notifications**
- **Email reminders** for upcoming appointments
- **Background service** for scheduled tasks
- **Unread message badges**

### 📊 **Analytics & Reports**
- **Dashboard statistics** (revenue, appointments, patients)
- **Doctor profit analytics** with charts
- **Payment reports** with export
- **Audit trail** for compliance

### 🌐 **Multi-Language Support**
- **Language context** (English, Arabic)
- **RTL support** for Arabic
- **Language toggle** in header

### 🔒 **Security Features**
- **User blocking system** (login/booking blocks)
- **No-show tracking** with auto-block
- **Blocked phone numbers** database
- **Audit logging** for all actions
- **Secure password reset**
- **Input validation** and sanitization
- **CORS configuration**

### 📱 **Responsive Design**
- **Mobile-first approach**
- **Tablet and desktop optimized**
- **Touch-friendly UI**
- **Collapsible sidebars**
- **Mobile navigation**

### ✨ **UI/UX Enhancements**
- **Animated backgrounds** with theme-aware particles
- **Smooth transitions** and hover effects
- **Loading states** and skeletons
- **Error boundaries** for graceful error handling
- **Toast notifications** with animations
- **Modal dialogs** with backdrop blur
- **Icon library** (Lucide React)
- **Modern glassmorphism** effects

---

## 🛠 Tech Stack

### Backend
- **.NET 10** Web API
- **Entity Framework Core** (Code-First)
- **SQL Server** database
- **SignalR** for real-time communication
- **JWT** authentication
- **BCrypt** password hashing
- **SMTP** email integration

### Frontend
- **React 18** with Vite
- **React Router** v6
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **SignalR Client** for real-time features
- **jsPDF** for PDF generation
- **Context API** for state management

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 8 or 10 SDK** - [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** and npm - [Download](https://nodejs.org/)
- **SQL Server** (LocalDB, Express, or Full) - [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Git** - [Download](https://git-scm.com/)
- **Visual Studio 2022** or **VS Code** (recommended)

---

## 🏁 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/zaynounjamal/DMS-Doctor-Management-System.git
cd DMS-Doctor-Management-System
```

### 2. Backend Setup (.NET API)

#### Step 2.1: Navigate to Backend Folder

```bash
cd DMS-DOTNETREACT
```

#### Step 2.2: Configure Database Connection

Open `appsettings.json` or `appsettings.Development.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ClinicDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

**For SQL Server Express:**
```json
"DefaultConnection": "Server=.\\SQLEXPRESS;Database=ClinicDb;Trusted_Connection=True;MultipleActiveResultSets=true"
```

**For SQL Server with credentials:**
```json
"DefaultConnection": "Server=YOUR_SERVER;Database=ClinicDb;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True"
```

#### Step 2.3: Configure Email Settings (Optional)

In `appsettings.json`, add your SMTP settings:

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderPassword": "your-app-password",
    "SenderName": "DMS Health Center",
    "EnableSsl": true
  }
}
```

**Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

#### Step 2.4: Restore Dependencies

```bash
dotnet restore
```

#### Step 2.5: Apply Database Migrations

```bash
dotnet ef database update
```

This will:
- Create the `ClinicDb` database
- Apply all migrations
- Seed default data (users, treatments, settings)

#### Step 2.6: Run the Backend

```bash
dotnet run
```

The API will start on **`http://localhost:5024`**

You should see:
```
Now listening on: http://localhost:5024
Application started. Press Ctrl+C to shut down.
```

---

### 3. Frontend Setup (React)

#### Step 3.1: Navigate to Frontend Folder

Open a **new terminal** and navigate to the frontend:

```bash
cd frontend
```

#### Step 3.2: Install Dependencies

```bash
npm install
```

#### Step 3.3: Configure API URL (if needed)

The frontend is pre-configured to use `http://localhost:5024`. If your backend runs on a different port, update:

- `frontend/src/api.js`
- `frontend/src/adminApi.js`
- `frontend/src/doctorApi.js`
- `frontend/src/secretaryApi.js`

Change the `API_URL` constant:

```javascript
const API_URL = 'http://localhost:YOUR_PORT/api';
```

#### Step 3.4: Run the Frontend

```bash
npm run dev
```

The frontend will start on **`http://localhost:5173`**

You should see:
```
  VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 4. Access the Application

Open your browser and navigate to:

**`http://localhost:5173`**

You should see the DMS homepage with login/signup options.

---

## 🔑 Default Test Accounts

The database seeder creates the following test accounts:

### Admin Account
- **Username:** `admin1`
- **Password:** `Admin123!`
- **Email:** `admin@clinic.com`
- **Access:** Full system administration

### Doctor Accounts
- **Username:** `doctor1`
- **Password:** `Doctor123!`
- **Email:** `doctor1@clinic.com`
- **Specialization:** Cardiology

- **Username:** `doctor2`
- **Password:** `Doctor123!`
- **Email:** `doctor2@clinic.com`
- **Specialization:** Dermatology

### Secretary Account
- **Username:** `secretary1`
- **Password:** `Secretary123!`
- **Email:** `secretary1@clinic.com`
- **Access:** Patient check-in, payments, chat

### Patient Accounts
- **Username:** `patient1`
- **Password:** `Patient123!`
- **Email:** `patient1@example.com`

- **Username:** `patient2`
- **Password:** `Patient123!`
- **Email:** `patient2@example.com`

**Note:** You can also create new accounts via the signup form.

---

## 📁 Project Structure

```
DMS-DOTNETREACT/
├── DMS-DOTNETREACT/              # Backend (.NET API)
│   ├── Controllers/              # API endpoints
│   ├── Data/                     # DbContext
│   ├── DataModel/                # Entity models
│   ├── Helpers/                  # Utilities (DatabaseSeeder, PasswordHasher)
│   ├── Hubs/                     # SignalR hubs (ChatHub)
│   ├── Migrations/               # EF Core migrations
│   ├── Services/                 # Background services
│   ├── wwwroot/                  # Static files (uploads)
│   ├── appsettings.json          # Configuration
│   └── Program.cs                # Entry point
│
├── frontend/                     # Frontend (React + Vite)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── auth/             # Login/Signup modals
│   │   │   ├── booking/          # Appointment booking
│   │   │   ├── chat/             # Chat widgets
│   │   │   ├── layout/           # Header, Footer, Sidebar
│   │   │   └── ui/               # UI components
│   │   ├── contexts/             # React contexts (Auth, Theme, Toast, Language)
│   │   ├── pages/                # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── SecretaryDashboard.jsx
│   │   │   └── ...
│   │   ├── signalr/              # SignalR client setup
│   │   ├── api.js                # API client
│   │   ├── adminApi.js           # Admin API calls
│   │   ├── doctorApi.js          # Doctor API calls
│   │   ├── secretaryApi.js       # Secretary API calls
│   │   ├── App.jsx               # Root component
│   │   ├── App.css               # Global styles
│   │   └── main.jsx              # Entry point
│   ├── tailwind.config.js        # Tailwind configuration
│   ├── vite.config.js            # Vite configuration
│   └── package.json              # Dependencies
│
└── README.md                     # This file
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `appsettings.Development.json` for local development:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ClinicDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyHere_MustBe32CharsOrMore!",
    "Issuer": "DMSClinic",
    "Audience": "DMSUsers",
    "ExpiryMinutes": 1440
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderPassword": "your-app-password",
    "SenderName": "DMS Health Center",
    "EnableSsl": true
  }
}
```

### Frontend Environment Variables

Create `.env` in the `frontend/` folder (optional):

```env
VITE_API_URL=http://localhost:5024/api
```

Then update API files to use:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5024/api';
```

---

## 🐛 Troubleshooting

### Backend Issues

#### 1. Database Connection Errors

**Error:** `Cannot open database "ClinicDb" requested by the login`

**Solution:**
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Run `dotnet ef database update` to create the database

#### 2. Migration Errors

**Error:** `Build failed` or `No migrations found`

**Solution:**
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### 3. Port Already in Use

**Error:** `Address already in use`

**Solution:**
- Change port in `Program.cs` or `launchSettings.json`
- Or kill the process using port 5024:

**Windows:**
```bash
netstat -ano | findstr :5024
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:5024 | xargs kill -9
```

#### 4. Email Not Sending

**Solution:**
- Check SMTP settings in `appsettings.json`
- For Gmail, enable "Less secure app access" or use App Password
- Check backend console for email simulation logs

### Frontend Issues

#### 1. API Connection Errors

**Error:** `Network Error` or `CORS policy`

**Solution:**
- Ensure backend is running on `http://localhost:5024`
- Check API_URL in frontend API files
- Verify CORS is enabled in `Program.cs`

#### 2. White Screen / Build Errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 3. Dark Mode Not Working

**Solution:**
- Clear browser cache
- Check `tailwind.config.js` has `darkMode: 'class'`
- Verify CSS variables are applied in `App.css`

#### 4. Port 5173 Already in Use

**Solution:**
- Vite will auto-increment to 5174, 5175, etc.
- Or specify a port:

```bash
npm run dev -- --port 3000
```

### Database Reset

To completely reset the database:

```bash
cd DMS-DOTNETREACT
dotnet ef database drop
dotnet ef database update
```

This will:
- Drop the existing database
- Recreate it with all migrations
- Re-seed default data

---

## 🎯 Quick Start Verification

After setup, verify everything works:

### 1. Test Admin Login
1. Go to `http://localhost:5173`
2. Click **Login**
3. Enter: `admin1` / `Admin123!`
4. You should see the Admin Dashboard

### 2. Test Theme Customization
1. As admin, go to **Settings** → **Visual Identity**
2. Change **Primary Light** color
3. Click **Save Changes**
4. Refresh page - colors should update

### 3. Test Appointment Booking
1. Logout and login as `patient1` / `Patient123!`
2. Go to **Book Appointment**
3. Select a doctor and date
4. Choose a time slot
5. Confirm booking

### 4. Test Doctor Dashboard
1. Login as `doctor1` / `Doctor123!`
2. You should see today's appointments
3. Check the **Waiting Room** widget

### 5. Test Real-Time Chat
1. Login as `patient1`
2. Open the chat widget (bottom right)
3. Send a message
4. Login as `secretary1` in another browser/tab
5. You should see the message in real-time

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Zaynoun Jamal** - [GitHub](https://github.com/zaynounjamal)

---

## 🙏 Acknowledgments

- Built with ❤️ using .NET and React
- Icons by [Lucide](https://lucide.dev/)
- UI inspired by modern healthcare platforms

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/zaynounjamal/DMS-Doctor-Management-System/issues)
- Email: zaynounjamal@example.com

---

**Happy Coding! 🚀**
