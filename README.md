# 💰 Expense Hub – Personal Expense Management System

**Expense Hub** is a full-stack web application designed to simplify personal financial management. It helps users track their income, expenses, budgets, categories, and transactions in one place.

Built with modern web technologies, Expense Hub provides an organized and user-friendly experience for managing daily finances.

---

## 🚀 Features

- 🔐 **User Authentication** – Secure user registration and login.
- 📊 **Dashboard** – Get an overview of your financial activities.
- 💵 **Income Management** – Track and manage your income.
- 💸 **Expense Management** – Add, update, view, and delete expenses.
- 📁 **Category Management** – Organize transactions into different categories.
- 🎯 **Budget Management** – Create and manage budgets.
- 👥 **Party Management** – Manage party-related financial records.
- 📜 **Transaction History** – Keep track of financial transactions.
- 📱 **Responsive UI** – User-friendly interface across different devices.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- HTML5
- CSS3
- React Router
- Fetch API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Cookie-based Authentication

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
│   │   └── index.js
│   │
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── public/
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

### 3. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file inside the Backend folder.

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

Run the backend:

```bash
npm run dev
```

### 4. Setup Frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

### 5. Open in Browser

```text
http://localhost:5173
```

---

## 🔒 Security

- JWT-based authentication.
- Protected routes and user access control.
- Environment variables for sensitive credentials.
- Secure password handling.
- Cookie-based token management.

---

## 📸 Screenshots

Add your project screenshots here.

| Dashboard | Transactions |
|---|---|
| Add Dashboard Screenshot | Add Transactions Screenshot |

---

## 🎯 Project Objectives

- To simplify personal income and expense tracking.
- To provide an organized financial management system.
- To understand full-stack web development.
- To implement REST APIs and database operations.
- To gain practical experience with React, Node.js, Express.js, and MongoDB.

---

## 🔮 Future Enhancements

- Financial reports and analytics.
- Interactive charts and graphs.
- Monthly and yearly expense summaries.
- Export transactions to PDF and Excel.
- Advanced budget tracking.
- Notifications and reminders.

---

## 👨‍💻 Developer

**Developed by:** Project Developer

**Project Name:** Expense Hub

**Project Type:** Full-Stack Web Application

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

**Thanks for visiting Expense Hub!**