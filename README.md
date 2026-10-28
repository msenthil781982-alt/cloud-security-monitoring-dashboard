# 🛡️ CloudGuard AI – Cloud Security Monitoring Dashboard

A modern, full-stack cybersecurity SaaS application built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) and a dedicated **Python AI Anomaly Detection Service**. 

CloudGuard AI provides centralized visibility across multi-cloud infrastructure (AWS EC2, S3, RDS, WAF, API Gateway, IAM), correlates security events, calculates transparent risk scores (0–100), detects anomalous activity using behavioral heuristics, and manages security incidents.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [User Roles & Permissions](#-user-roles--permissions)
- [Demo Credentials](#-demo-credentials)
- [Risk Scoring Engine](#-risk-scoring-engine)
- [AI Anomaly Detection Workflow](#-ai-anomaly-detection-workflow)
- [Installation & Setup](#-installation--setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. AI Service Setup](#3-ai-service-setup)
  - [Database Seeding](#database-seeding)
- [API Documentation](#-api-documentation)
- [College Viva & Presentation Guide](#-college-viva--presentation-guide)
- [Future Enhancements](#-future-enhancements)

---

## 🎯 Overview

CloudGuard AI was engineered to fulfill industry-grade cloud security operations center (SOC) requirements. Modern organizations deploy workloads across dynamic cloud instances, creating challenges in identifying privilege escalation, public data leakage, unauthorized API bursts, and brute-force attacks.

CloudGuard AI centralizes:
1. **Asset Visibility**: Real-time health, compliance (CIS/SOC2), and vulnerability status.
2. **Behavioral Telemetry**: Event ingestion and dynamic risk calculation.
3. **AI Anomaly Detection**: Evaluation of high-velocity traffic patterns and permission anomalies.
4. **Incident & Alert Lifecycle**: Multi-tier SOC response workflow with audit trails.

> **Disclaimer**: *CloudGuard AI monitors simulated cloud telemetry in demo mode. No live AWS/GCP bills or real cloud credentials are required to run and demonstrate the application.*

---

## ✨ Key Features

- **Cybersecurity SaaS Dashboard**:
  - Live Overall Cloud Security Score (0–100) with radial score gauge.
  - 5 Real-Time KPI Cards: Total Resources, Active Threats, Critical Alerts, Open Incidents, Active Alerts.
  - Interactive Recharts Visualizations:
    - 7-Day Threat Activity & Frequency Area Chart
    - Threat Severity Distribution Donut Chart
    - Telemetry Events by Category Bar Chart
    - Cloud Asset Security Health Bar Chart
    - 24-Hour Dynamic Risk Score Trend Line Chart
  - Recent Security Events live table feed with one-click detail modal.

- **Cloud Resources Module**:
  - Monitors EC2 Servers, S3 Buckets, RDS Databases, API Gateways, Virtual Networks, IAM Roles, and CloudTrail.
  - Tracks encryption at rest, public internet exposure, MFA enforcement, firewall rules, and open ports.
  - Detailed vulnerability list with CVE tracking.
  - Interactive **"Run Security Audit"** button to perform on-demand compliance scans.

- **Security Event Ingestion**:
  - Categorized into Authentication, Access Control, Network, API, and Data Protection.
  - Advanced filtering by Severity, Event Type, Resource, Date range, and keyword search.
  - Auto-evaluates risk score and raises automated alerts for critical threats.

- **AI Anomaly Detection Suite**:
  - Separate Python FastAPI microservice (`ai-service/`).
  - Predefined 1-click viva test scenarios:
    - *API Flooding / DoS Signature (920 req/min)*
    - *Distributed Credential Stuffing (42 failed logins)*
    - *S3 Public Bucket Policy Exposure*
    - *IAM Rogue Administrator Escalation*
    - *Normal Production Baseline*
  - Interactive parameter sliders (API requests/min, failed logins, egress GB, off-hours).
  - Clear verdicts: Anomaly status, risk score, severity, reasoning, and recommended action.

- **Alert & Incident Management**:
  - Full lifecycle tracking: `New` ➔ `Investigating` ➔ `Contained` / `Resolved` ➔ `False Positive`.
  - Priority levels (P1, P2, P3, P4) and analyst assignments.
  - Appendable investigation timeline history and mitigation documentation.

- **Transparent Risk Scoring Engine**:
  - Mathematical 4-factor scoring model clearly documented for examiners.
  - Interactive client-side risk calculator for live parameter adjustment.

- **System Audit Trail**:
  - Immutable chronological audit log tracking user logins, role modifications, alert triage, incident updates, and security scans.

- **Enterprise Security & RBAC**:
  - Password hashing with bcrypt.
  - Stateless JWT authentication with Bearer token headers.
  - Role-based authorization middleware protecting administrative endpoints.
  - Rate limiting with `express-rate-limit`.
  - Input validation, clean error handling, and CORS.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │   React + Vite Frontend (UI)   │
                               │    Tailwind CSS + Recharts     │
                               │        Port: 5173              │
                               └───────────────┬────────────────┘
                                               │
                                      REST API │ (JWT Bearer)
                                               ▼
                               ┌────────────────────────────────┐
                               │     Express.js REST Backend    │
                               │   Auth, RBAC, Services, Audit  │
                               │        Port: 5000              │
                               └───────┬────────────────┬───────┘
                                       │                │
                         Mongoose ODM  │                │ HTTP REST
                                       ▼                ▼
                     ┌───────────────────┐    ┌───────────────────────────┐
                     │ MongoDB Database  │    │  Python AI Anomaly Engine │
                     │   cloudguard_db   │    │     FastAPI / Heuristics  │
                     │    Port: 27017    │    │        Port: 8000         │
                     └───────────────────┘    └───────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **React.js 18** (Modern functional components, Hooks)
- **Vite 6** (Blazing fast dev server and build tool)
- **Tailwind CSS 3** (Custom dark cybersecurity color palette)
- **React Router 6** (Nested routing, protected routes, role guards)
- **Recharts 2** (Interactive Area, Bar, Donut, and Line charts)
- **Lucide React** (Cybersecurity and SOC iconography)
- **Axios** (Configured interceptors for JWT token lifecycle)

### Backend
- **Node.js** & **Express.js** (Modular REST API architecture)
- **MongoDB** & **Mongoose 8** (Schema validation, indexes, aggregations)
- **JSON Web Tokens (JWT)** (Secure stateless authentication)
- **bcryptjs** (10-round salted password hashing)
- **express-rate-limit** (DDoS and brute-force mitigation)
- **Morgan** (HTTP request access logging)
- **CORS** & **Dotenv** (Cross-origin security & configuration)

### AI / Anomaly Detection
- **Python 3.12**
- **FastAPI** & **Uvicorn** (High-performance async ASGI server)
- **Pydantic v2** (Type validation and schemas)
- Built-in heuristic rule-based layer + resilient local fallback in Node.

---

## 📁 Project Structure

```
cloud-security-monitoring-dashboard/
├── client/                          # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Button, Badge, Card, Modal, EmptyState, Skeleton
│   │   │   └── layout/             # Sidebar, Navbar, AppLayout, ProtectedRoute, RoleRoute
│   │   ├── context/                # AuthContext, ToastContext
│   │   ├── pages/                  # Dashboard, Resources, Events, Alerts, Incidents,
│   │   │                           # AI Anomaly, Risk Scoring, Audit Logs, Users, Login, Register
│   │   ├── services/               # Axios API connector modules
│   │   ├── utils/                  # Formatters & Client Risk Engine replica
│   │   ├── App.jsx                 # Route definitions
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind CSS & custom cyber styling
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express.js REST API Backend
│   ├── config/                     # Database connection & environment configuration
│   ├── controllers/                # Auth, Dashboard, Resource, Event, Alert, Incident,
│   │                               # Anomaly, Audit, User controllers
│   ├── middleware/                 # JWT Auth, Role Guard, Input Validation, Error Handler
│   ├── models/                     # User, CloudResource, SecurityEvent, Alert, Incident, AuditLog
│   ├── routes/                     # REST API express routers
│   ├── services/                   # RiskService, AIService, AuditService
│   ├── seed.js                     # Rich demo database seeder
│   ├── test-api.js                 # Automated end-to-end integration test suite
│   ├── server.js                   # Application entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
├── ai-service/                      # Python FastAPI Anomaly Microservice
│   ├── app/
│   │   ├── models/                 # Telemetry schemas
│   │   ├── services/               # AnomalyDetector engine & rule baselines
│   │   └── main.py                 # FastAPI endpoints (/health, /analyze, /rules)
│   ├── run.py                      # Multi-mode microservice runner
│   ├── requirements.txt            # Python dependencies
│   └── README.md
│
└── README.md                        # Master Documentation
```

---

## 👥 User Roles & Permissions

| Capability | Administrator (`Admin`) | Security Analyst (`Security Analyst`) |
| :--- | :---: | :---: |
| View Security Dashboard & Analytics | ✅ Yes | ✅ Yes |
| Monitor Cloud Resources & Inspect Configurations | ✅ Yes | ✅ Yes |
| Trigger Manual Security Audit / Scan | ✅ Yes | ✅ Yes |
| View & Filter Security Events Stream | ✅ Yes | ✅ Yes |
| Ingest New Security Events via API | ✅ Yes | ✅ Yes |
| View Security Alerts & Threat Details | ✅ Yes | ✅ Yes |
| Triage Alerts & Update Alert Status | ✅ Yes | ✅ Yes |
| View Incidents & Update Response Timeline | ✅ Yes | ✅ Yes |
| Create New Incident Tickets | ✅ Yes | ✅ Yes |
| Run AI Anomaly Detection Suite | ✅ Yes | ✅ Yes |
| Inspect Transparent Risk Scoring Engine | ✅ Yes | ✅ Yes |
| View System Audit Trail | ✅ Yes | ✅ Yes |
| Create & Update Cloud Resources | ✅ Yes | ❌ No |
| Manage User Accounts & Modify User Roles | ✅ Yes | ❌ No |

---

## 🔑 Demo Credentials

CloudGuard AI includes pre-seeded demo accounts ready for immediate login:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator (CISO)** | `admin@cloudguard.io` | `Admin@123` |
| **Security Analyst (SOC Lead)** | `analyst@cloudguard.io` | `Analyst@123` |

*Tip: The login screen includes 1-click **"Admin Demo"** and **"Analyst Demo"** buttons to automatically fill credentials.*

---

## 🧮 Risk Scoring Engine

The risk scoring engine quantifies threat severity into a transparent **0 to 100** scale using four weighted components:

$$\text{Risk Score} = (S \times 0.40) + (F \times 0.20) + (R \times 0.20) + (I \times 0.20)$$

1. **Base Severity Weight ($S$, 40%)**:
   - `Low`: 15 pts
   - `Medium`: 45 pts
   - `High`: 75 pts
   - `Critical`: 95 pts
2. **Frequency & Velocity Factor ($F$, 20%)**:
   - Scaled logarithmically: 1 req (10 pts) up to >500 req/min (100 pts).
3. **Resource Sensitivity Index ($R$, 20%)**:
   - `IAM Role`: 95 pts (Identity privilege escalation vector)
   - `RDS Database`: 90 pts (Stateful sensitive customer data)
   - `S3 Bucket`: 85 pts (Object storage exposure target)
   - `CloudTrail`: 80 pts (Audit logging integrity)
   - `EC2 Server`: 70 pts (Compute execution layer)
   - `API Gateway`: 65 pts (External perimeter)
4. **Behavioral & Anomaly Indicators ($I$, 20%)**:
   - Baseline: 20 pts
   - Authentication Failure Present: $+35$ pts
   - AI Unusual Activity Flag: $+45$ pts

### Classification Thresholds:
- **0 – 30**: 🟢 **LOW** (Normal baseline activity)
- **31 – 60**: 🟡 **MEDIUM** (Operational drift or isolated failure)
- **61 – 80**: 🟠 **HIGH** (Elevated reconnaissance, automated alert raised)
- **81 – 100**: 🔴 **CRITICAL** (Active exploit or data leak, triggers P1 Incident)

---

## 🧠 AI Anomaly Detection Workflow

### Detection Process:
1. **Telemetry Ingestion**: Cloud metrics (requests/min, failed logins, egress GB, geo location, off-hours flag) are posted to `/api/anomaly/analyze`.
2. **Evaluation**: The microservice checks against defined statistical thresholds and heuristic rules:
   - **API Rate Flood**: Normal is 10–25 req/min. If traffic reaches $\ge 500$ req/min, an anomaly is flagged with critical severity.
   - **Brute Force**: $\ge 8$ failed authentication attempts flags credential stuffing.
   - **Public Storage**: Public access on S3 containers flags immediate policy violation.
   - **Privilege Escalation**: Unauthorized `AdministratorAccess` IAM attachment flags high-risk escalation.
   - **Data Egress**: Outbound data transfers $>30$ GB flag exfiltration.
3. **Structured Verdict**: Returns `anomalyDetected` (bool), `riskScore` (0–100), `severity` (LOW, MEDIUM, HIGH, CRITICAL), `explanation`, and `recommendedAction`.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18.x or v20.x+)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas connection URI
- **Python** 3.10+ (for the optional standalone FastAPI service)

---

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` (or use default `.env` already present):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/cloudguard_db
JWT_SECRET=cloudguard_super_secure_jwt_secret_key_2026_x89a
JWT_EXPIRE=7d
AI_SERVICE_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
```

#### Seed the Database:
Populate the database with demo admin/analyst users, 10 cloud assets, 26 security events, 12 alerts, 6 incidents, and audit logs:
```bash
npm run seed
```

#### Run Backend Server:
```bash
npm start
```
*Backend will be running at `http://localhost:5000`.*

#### Run End-to-End API Test Suite:
```bash
npm test
```

---

### 2. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```
*Frontend will be running at `http://localhost:5173`.*

---

### 3. AI Anomaly Service Setup

```bash
cd ../ai-service
pip install -r requirements.txt
python run.py
```
*AI service will be listening at `http://127.0.0.1:8000`.*

*(Note: If you run the backend without the Python service started, the Express server automatically activates its internal local fallback anomaly detector, ensuring 100% functionality without interruption!)*

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user & receive JWT token.
- `GET /api/auth/me` - Get profile of authenticated user (*Protected*).
- `POST /api/auth/logout` - Logout user & record audit log (*Protected*).

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/summary` - Aggregate metrics, threat trends, severity distribution, category counts, risk curves (*Protected*).

### Cloud Resources (`/api/resources`)
- `GET /api/resources` - Query resources with filtering (*Protected*).
- `GET /api/resources/:id` - Fetch single resource security profile (*Protected*).
- `POST /api/resources/:id/scan` - Trigger live simulated compliance scan (*Protected*).
- `POST /api/resources` - Register new cloud resource (*Admin Only*).
- `PUT /api/resources/:id` - Update resource configuration (*Admin Only*).

### Security Events (`/api/events`)
- `GET /api/events` - Retrieve security events stream with filtering and pagination (*Protected*).
- `GET /api/events/:id` - Single event details with metadata (*Protected*).
- `POST /api/events` - Ingest security event; auto-evaluates risk score & raises alerts (*Protected*).

### Security Alerts (`/api/alerts`)
- `GET /api/alerts` - Query active alerts (*Protected*).
- `GET /api/alerts/:id` - Alert details (*Protected*).
- `PATCH /api/alerts/:id/status` - Update status (`New`, `Investigating`, `Resolved`, `False Positive`) & resolution notes (*Protected*).
- `POST /api/alerts` - Create alert (*Protected*).

### Incidents (`/api/incidents`)
- `GET /api/incidents` - Query incidents (*Protected*).
- `GET /api/incidents/:id` - Single incident with full investigation timeline (*Protected*).
- `POST /api/incidents` - Create new incident ticket (*Protected*).
- `PATCH /api/incidents/:id` - Append timeline entry or update status (*Protected*).

### AI Anomaly (`/api/anomaly`)
- `POST /api/anomaly/analyze` - Evaluate cloud telemetry for anomalies (*Protected*).
- `GET /api/anomaly/scenarios` - Retrieve predefined attack simulation scenarios (*Protected*).

### Audit Trail (`/api/audit-logs`)
- `GET /api/audit-logs` - Query immutable operational audit logs (*Protected*).

### User Management (`/api/users`)
- `GET /api/users` - List all SOC operators (*Admin Only*).
- `PATCH /api/users/:id/role` - Modify user role (*Admin Only*).
- `PATCH /api/users/:id/status` - Activate or deactivate operator access (*Admin Only*).

---

## 🎓 College Viva & Presentation Guide

When explaining this project to professors, external examiners, or interviewers:

1. **Problem Statement**:
   - Cloud environments face rapid automated attacks (credential stuffing, API flooding, public S3 bucket leaks).
   - SOC teams need automated correlation, continuous compliance checks, and transparent risk scoring.

2. **Key Architectural Innovations**:
   - **MERN Stack Integration**: Seamless communication between React, Express REST APIs, and MongoDB Mongoose models.
   - **AI Microservice**: Decoupled Python service that can be upgraded with Scikit-learn (Isolation Forest) or deep learning autoencoders without modifying the main web app.
   - **Resilience**: The Express server contains an automatic fallback anomaly engine in case the Python microservice is offline.

3. **Viva Live Demo Steps**:
   1. **Login**: Click *Admin Demo* on the login screen to demonstrate instant JWT authentication.
   2. **Dashboard**: Highlight the dynamic Overall Security Score and the 5 charts populated directly from MongoDB.
   3. **Cloud Resources**: Click on `cloudguard-customer-records-bucket` to show the critical alert for public read access. Click **Run Security Audit** to demonstrate live compliance scanning.
   4. **AI Anomaly Detection**: Navigate to the AI Anomaly page. Click the preset *API Flooding / DoS (920 req/min)* button. Show how the engine immediately flags the critical anomaly, explains the 3680% baseline breach, and recommends WAF IP rate limiting.
   5. **Alert Triage**: Go to Alerts, select an alert, change its status from `New` to `Investigating`, and add forensic notes.
   6. **Audit Trail**: Open the Audit Trail to demonstrate that every action taken (login, scan, alert status change) was logged immutably with timestamp and operator name.
   7. **RBAC Security**: Log out and log in as the *Analyst Demo*. Show that the *User Management* link is absent from the sidebar and attempting to access `/users` is blocked by authorization middleware.

---

## 🔮 Future Enhancements
- Direct cloud connectors (AWS Boto3 SDK, GCP Cloud Asset Inventory, Azure Monitor).
- Real-time WebSocket alerts via Socket.io.
- Machine Learning models (Unsupervised Isolation Forest trained on VPC flow logs).
- Automated remediation playbooks using AWS Lambda webhooks (auto-revoke IAM policies, auto-enable S3 Block Public Access).
- Multi-factor authentication (TOTP via Google Authenticator).

---

## 📄 License
This project is open-source and intended for academic, research, and portfolio demonstration purposes.
