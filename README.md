# 💰 Expense Hub – Personal Expense Management System

**Expense Hub** is a full-stack personal finance management application built to help users manage their income, expenses, budgets, categories, parties, and transactions in one place.

It provides a simple and organized platform where users can track their financial activities, manage their budgets, and monitor their overall financial situation.

---

## 🚀 Features

- 🔐 **User Authentication** – Secure user registration, login, logout, and password management using JWT and cookie-based authentication.
- 📊 **Dashboard** – View an overview of financial activities.
- 💵 **Income Management** – Manage and track income transactions.
- 💸 **Expense Management** – Add, view, update, and delete expense transactions.
- 📁 **Category Management** – Organize income, expenses, and investments into categories.
- 👥 **Party Management** – Manage different parties such as customers, suppliers, banks, companies, and individuals.
- 🎯 **Budget Management** – Create, update, and manage personal budgets.
- 📜 **Transaction History** – Maintain and manage financial transaction records.
- 👤 **Profile Management** – View user account information.
- 🔒 **Protected Routes** – Restrict access to authenticated users.
- ⚡ **Redux State Management** – Manage application data and authentication state.
- 📱 **Responsive UI** – User-friendly interface for different screen sizes.
- 🗂️ **Default Data Initialization** – Automatically create default categories and party records when a new user registers.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- TypeScript
- Vite
- React Bootstrap
- Bootstrap
- React Router DOM
- Redux Toolkit
- Axios
- Formik
- Yup
- React Icons
- React Toastify
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Cookie-based Authentication
- bcrypt

### Development Tools

- Visual Studio Code
- Git & GitHub
- Postman
- MongoDB Atlas
- npm

---

## 📂 Project Structure

```text
Expense-Hub/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── index.js
│   │
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to run Expense Hub locally.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd Expense-Hub
```

### 3. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside the Backend folder.

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string

CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

Start the backend development server:

```bash
npm run dev
```

### 4. Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside the Frontend folder.

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

### 5. Open in Browser

```text
http://localhost:5173
```

---

## 🔒 Security

- JWT-based authentication.
- Secure password hashing.
- HTTP cookie-based token management.
- Protected frontend routes.
- Backend authentication middleware.
- User-specific data access.
- Environment variables for sensitive credentials.
- Secure API request handling.

---

## 📸 Screenshots

Add your actual project screenshots below.

| Dashboard | Transactions |
|:---:|:---:|
| Add Dashboard Screenshot | Add Transactions Screenshot |

| Categories | Budget Management |
|:---:|:---:|
| Add Categories Screenshot | Add Budget Screenshot |

| Party Management | Authentication |
|:---:|:---:|
| Add Party Screenshot | Add Login Screenshot |

---

## 🎯 Project Objectives

- To simplify personal income and expense management.
- To provide an organized financial tracking system.
- To manage budgets and financial categories efficiently.
- To implement secure user authentication.
- To develop RESTful APIs using Node.js and Express.js.
- To understand frontend and backend integration.
- To gain practical experience with the MERN stack and TypeScript.

---

## 🔮 Future Enhancements

- 📈 Interactive financial charts and analytics.
- 📅 Monthly and yearly expense summaries.
- 📄 Export transactions to PDF and Excel.
- 🔔 Notifications and budget reminders.
- 📊 Advanced financial reports.
- 💹 Improved investment tracking.
- 📱 Enhanced mobile experience.

---

## 👨‍💻 Developer 

**Project Name:** Expense Hub

**Project Type:** Full-Stack Web Application

**Technology:** MERN Stack + TypeScript

**Developed by:** Tarun Gohil

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

**Thanks for visiting Expense Hub!** 💚