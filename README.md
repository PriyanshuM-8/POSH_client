# 🛡️ Sentinel POSH Client

> Enterprise-grade Frontend for the **Sentinel POSH (Prevention of Sexual Harassment) Management System** built using **React, Vite, Tailwind CSS, and Framer Motion**.

This application provides a modern, secure, and responsive user interface for managing the complete POSH complaint lifecycle while maintaining confidentiality, compliance, and enterprise-grade user experience.

---

# 🚀 Features

- 🔐 Secure Authentication
- 🏢 Company Owner Dashboard
- 👨‍💼 POSH Admin Dashboard
- 👤 Employee Dashboard
- 👥 HR SPOC Dashboard
- 🧑‍⚖️ IC Member Dashboard
- ⚖️ External Member Dashboard
- 📑 Complaint Management
- 📂 Case Management
- 📎 Evidence Upload & Review
- 📅 Hearing Scheduling
- 📋 Committee Recommendation
- ⚖️ Final Decision
- 🔒 Case Closure
- 📊 Reports & Analytics
- 🔔 Real-time Notifications
- 📜 Timeline Tracking
- 🌙 Dark / Light Theme
- 📱 Fully Responsive UI
- ✨ Premium Animations
- 🎨 Enterprise Dashboard Design

---

# 🏗️ Tech Stack

## Frontend

- React 18
- Vite
- React Router DOM
- Axios

## UI

- Tailwind CSS
- Radix UI
- Framer Motion
- Lucide React
- Sonner
- SweetAlert2

## Forms

- React Hook Form
- React Select
- React Dropzone

## Charts

- Recharts

## Utilities

- clsx
- tailwind-merge
- date-fns

---

# 👥 Supported Roles

- Company Owner
- POSH Admin
- Employee
- HR SPOC
- IC Member
- External Committee Member
- Legal Team

---

# 🔄 Workflow

Company Owner
      │
      ▼
Create POSH Admin
      │
      ▼
Employee
      │
      ▼
Submit Complaint
      │
      ▼
Upload Evidence
      │
      ▼
POSH Admin Review
      │
      ├── Reject Complaint
      │         │
      │         ▼
      │      Workflow Ends
      │
      └── Accept Complaint
                │
                ▼
          Create Case
                │
                ▼
        Assign Committee
                │
                ▼
      IC Member Accept Assignment
                │
                ▼
      Investigation Started
                │
                ▼
        Evidence Review
                │
      ┌─────────┴──────────┐
      │                    │
      ▼                    ▼
Approve Evidence    Request More Evidence
      │                    │
      │            Employee Uploads Evidence
      │                    │
      └────────────┬───────┘
                   ▼
          Schedule Hearing
                   │
                   ▼
          Conduct Hearing
                   │
                   ▼
        Record Hearing Minutes
                   │
                   ▼
      Submit Recommendation
                   │
                   ▼
     POSH Admin Recommendation Review
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
Approve       Return       Reject
      │            │
      │            ▼
      │     Committee Revises
      │            │
      │            ▼
      └──── Recommendation Resubmitted
                   │
                   ▼
         Record Final Decision
                   │
                   ▼
            Close Case
                   │
                   ▼
      Employee Notification
                   │
                   ▼
        View Final Decision
                   │
                   ▼
         Submit Feedback
                   │
                   ▼
          Archive Case
---

# 📂 Project Structure

```
src
│
├── assets
├── components
├── context
├── hooks
├── layouts
├── pages
├── routes
├── services
├── utils
├── App.jsx
└── main.jsx
```

---

# 📦 Installation

```bash
git clone https://github.com/PriyanshuM-8/POSH_Client.git

cd POSH_Client

npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

# ▶️ Run Project

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
```

Preview Build

```bash
npm run preview
```

---

# 🎨 UI Highlights

- Enterprise-grade Dashboard
- Modern Card Layouts
- Responsive Navigation
- Interactive Charts
- Timeline Components
- Professional Forms
- Loading Skeletons
- Empty States
- Error Handling
- Smooth Animations
- Dark Mode Support

---

# 🔗 Backend Repository

👉 https://github.com/PriyanshuM-8/POSH_Server

---

# 👨‍💻 Developer

**Priyanshu Maddeshiya**
**+91-8808802188**


MERN Full Stack Developer

GitHub:
https://github.com/PriyanshuM-8

---

# ⭐ Support

If you like this project, don't forget to **Star ⭐ the repository** and share your feedback.

---

# 📄 License

This project is developed for educational and enterprise demonstration purposes.