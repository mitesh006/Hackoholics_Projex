# 👕 ReWear - Clothing Exchange Platform

**ReWear** is a sustainable fashion platform that enables users to exchange unused clothing through **direct swaps** or a **point-based redemption system**. By encouraging reuse and reducing textile waste, ReWear promotes conscious consumption and a circular clothing economy.

---

## 🌱 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Key Concepts](#key-concepts)
- [Future Scope](#future-scope)
- [Contributors](#contributors)
- [License](#license)

---

## ✨ Features

### 👤 User Authentication
- Secure email/password registration and login
- Sessions for authenticated browsing and actions

### 🏠 Landing Page
- Platform overview
- Calls-to-action: “Start Swapping”, “Browse Items”, “List an Item”
- Carousel of featured clothing items

### 📋 Dashboard (for Logged-in Users)
- Profile details and current points balance
- Overview of uploaded items
- Track ongoing and completed swaps

### 🔍 Item Detail Page
- Full item description and image gallery
- Uploader contact/info
- Options to:
  - Send a **Swap Request**
  - **Redeem using points**
- Displays item availability status

### ➕ Add New Item Page
- Upload images
- Enter:
  - Title
  - Description
  - Category, Type, Size, Condition
  - Tags
- Submit item for listing

### 🔒 Admin Role
- Approve or reject submitted items
- Moderate inappropriate content
- Lightweight admin panel for platform management

---

## 🛠 Tech Stack

| Layer        | Technology                 |
|--------------|----------------------------|
| Frontend     | HTML5, CSS3, JavaScript (optional for interactivity) |
| Backend      | Node.js, Express.js        |
| Database     | MongoDB Atlas              |
| Authentication | Express Sessions or JWT  |
| File Uploads | Multer                     |
| Hosting      | Render / Railway / Vercel (suggested) |

---

