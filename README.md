# 🚀 Roofbot CRM – Complete Documentation & Onboarding Guide

Welcome to the **CRM System** — a powerful multi-tenant platform designed for lead management, appointment scheduling, chatbot automation, and workflow integrations.

This README provides a **complete onboarding guide** for developers, contributors, and administrators.

---

# 📌 Table of Contents
- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Integrations](#-integrations)
- [Database Schema](#-database-schema)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

# 🧭 Overview

This CRM is built for businesses requiring:

- Lead management  
- Appointment scheduling  
- Automated chatbot interaction  
- Multi-tenant separation  
- Integration with external tools (Twilio, Google Calendar, N8N, ChatGPT Agents)  
- A modern Next.js frontend  
- A scalable Laravel backend API

---

# 🛠 Tech Stack

### **Frontend**
- Next.js 14  
- React  
- TailwindCSS 
- Lucide Icons  

### **Backend**
- Laravel 12
- Postgres
- JWT Authentication  
- REST APIs  

### **Integrations**
- Twilio  
- Google Calendar  
- N8N Automation  
- ChatGPT AI Agent  
- Stripe  

---

# ⭐ Features

### 🔹 Leads Module
- Create, update, delete leads  
- Assign services  
- Track activities  
- chatbot-assisted leads
- Auto follow-ups

### 🔹 Appointments Module
- Select date/time  
- Google Calendar sync  
- Auto reminders  
- Chatbot-assisted booking  

### 🔹 Services Management
- Add services  
- Map services to leads   

### 🔹 Multi-Tenant System
- Separate tenant resources  
- Role-based access  
- Company-level API keys  

### 🔹 Chatbot Integration
- Web widget  
- AI-powered workflow  
- Lead + appointment automation
### 🔹 Job Creation
- Convert appointments to job    

### 🔹 Dashboard
- Stats overview  
- Lead funnel  
- Appointments timeline
- Jobs timeline

---

# 📁 Project Structure

## **Backend (Laravel)**
backend/
│── app/
│ ├── Http/Controllers/
│ ├── Models/
│ ├── Services/
│── routes/api.php
│── database/migrations,seeders/
│── .env


## **Frontend (Next.js)**



frontend/
│── src/app/
│── src/components/
│── src/contexts/AuthContext.tsx
│── src/lib/api.ts
│── public/
│── .env


---

# 📥 Installation Guide

---

# ⚙️ Backend Installation (Laravel)

### 1. Clone the repository

- git clone <repo-url>
cd backend

2. Install dependencies
composer install

3. Create environment file
cp .env.example .env

4. Generate app key
php artisan key:generate

5. Migrate database
php artisan migrate --seed

6. Start local server
php artisan serve

💻 Frontend Installation (Next.js)
1. Navigate to the frontend
cd frontend

2. Install packages
npm install

3. Create environment file
cp .env.example .env.local

4. Run development server
npm run dev 
###
---

# 🔧 Environment Variables

---
Backend (.env)
APP_NAME=
APP_ENV=
APP_KEY=
APP_DEBUG=
APP_URL=
FRONTEND_URL=

APP_LOCALE=
APP_FALLBACK_LOCALE=
APP_FAKER_LOCALE=

APP_MAINTENANCE_DRIVER=
//APP_MAINTENANCE_STORE=database

PHP_CLI_SERVER_WORKERS=

BCRYPT_ROUNDS=

LOG_CHANNEL=
LOG_STACK=
LOG_DEPRECATIONS_CHANNEL=
LOG_LEVEL=

DB_CONNECTION=
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

SESSION_DRIVER=
SESSION_LIFETIME=
SESSION_ENCRYPT=
SESSION_PATH=
SESSION_DOMAIN=
SANCTUM_STATEFUL_DOMAINS=

BROADCAST_CONNECTION=
FILESYSTEM_DISK=
QUEUE_CONNECTION=

CACHE_STORE=
// CACHE_PREFIX=

MEMCACHED_HOST=

REDIS_CLIENT=
REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=




MAIL_MAILER=
MAIL_SCHEME=
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=



GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=

VITE_APP_NAME=
OPENAI_API_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=
N8N_WEBHOOK_URL=

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET= 
Frontend (.env)
BASE_URL = 

NEXT_DISABLE_ESLINT=

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_N8N_URL=


GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=

NEXT_PUBLIC_STRIPE_PK=

###
---

#🔌 Integrations

---
🟦 Twilio

Used for SMS alerts, reminders,followups.

🟩 Google Calendar

Used for appointment syncing to calender.

🟧 N8N Workflow Automation

Chatbot → Lead → Appointment automation.

🔵 ChatGPT Agent

Handles the natural conversation & tool usage.

--Connect your google calender account on integration page on frontend to sync appointments on your calender
--Connect your Twilio account by adding Account_sid and Auth_Token on integration page on frontend to send and recieve sms
--Enter your GPT Api key on integration page on frontend to use chat model.

🟪 Stripe

Subscription system (if enabled).

#🗄 Database Schema Overview

Table	Description
users	Application users
tenants	Company accounts
leads	Customer leads
appointments	Scheduling system
services	Services offered
tenant_integrations	Twilio, Google, API keys
chat_logs	Chatbot conversation logs



#🌐 Deployment Guide
Backend Deployment

--Apache / Nginx

--Docker

--Laravel Forge

--Shared hosting (with PHP 8.2+)

Commands:

--php artisan config:cache
--php artisan route:cache
--php artisan migrate --force

--Frontend Deployment

--Recommended: Vercel
--Other supported: Netlify, Docker, Custom Node server

#⚠️ Troubleshooting
❌ 500 Error

--Incorrect env

--Missing DB connection

❌ CORS Issue

--Configure in Laravel CORS middleware.

❌ Google Calendar Sync Errors

--Wrong redirect URI

--Missing OAuth scopes

❌ Chatbot Not Creating Leads

--Wrong N8N webhook

--Invalid tool parameters

📜 License

