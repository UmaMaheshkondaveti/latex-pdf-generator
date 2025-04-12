# 📄 Dynamic LaTeX Template Generator with Tiptap Editor

This is a full-stack application that allows users to create rich-text content using Tiptap Editor, choose from LaTeX-style resume templates (e.g., Modern Resume, Academic CV), and generate downloadable PDF documents using Puppeteer.

---

## 🧩 Features

- ✍️ Rich text editor with Tiptap (Headings, Lists, Formatting, etc.)
- 📂 Multiple template options for generating resumes/CVs
- 🧠 Intelligent JSON → HTML conversion for structured content
- 📄 PDF generation using Puppeteer
- 🔐 JWT-based authentication (Login/Signup)
- 🌐 REST API built with Express.js
- 🗂 SQLite for storing templates/content

---

## 🏗️ Tech Stack

**Frontend**
- React.js
- Tiptap Editor
- Axios
- React Router

**Backend**
- Node.js
- Express.js
- Puppeteer
- SQLite (via better-sqlite3 or sequelize)
- Helmet, CORS, dotenv

---

## 🛠️ Getting Started

## ⚛️ Frontend Setup

```bash
cd client
npm install
npm start
```

### ⚙️ Backend Setup

```bash
cd server
npm install
node index.js
