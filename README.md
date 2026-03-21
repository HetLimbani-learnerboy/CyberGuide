# 🛡️ CyberGuide AI Mentor & Resource Hub

**CyberGuide** is a comprehensive cybersecurity educational platform featuring an **AI-powered Mentor** for technical guidance and a **Cloud-Integrated Resource Library** for lab documents and theoretical research.

It also includes an **interactive dual-terminal environment**, where users can work with **two terminals on a single page**, enabling hands-on practice such as attacker–victim simulations, command execution, and real-time experimentation in a simplified interface.

Additionally, the platform provides a **dedicated Resources & Notes section**, where users can access curated cybersecurity materials, theoretical papers, practical lab guides, and even upload their own documents to personal cloud storage for easy reference and learning continuity.


---

## 🚀 Key Features

<details>
<summary>🤖 AI Mentor Chatbot</summary>

Real-time cybersecurity guidance powered by **Google Gemini (multi-model fallback)** with automatic model switching to handle rate limits and ensure uninterrupted responses.

</details>

<details>
<summary>💻 Dual Terminal Cyber Lab</summary>

Interactive **two-terminal interface on a single page** allowing users to simulate attacker–victim scenarios, execute commands in parallel, and perform hands-on cybersecurity experiments seamlessly.

</details>
<details>
<summary>⚡ Real-Time API Integration</summary>

Seamless communication between React frontend and Django backend using REST APIs and async operations for fast and responsive interactions.

</details>

<details>
<summary>🎨 Modern Cyber Dashboard UI</summary>

Dark-mode interface with **glassmorphism design**, smooth animations, and responsive layout for an engaging user experience.

</details>

<details>
<summary>🔐 Secure Backend Architecture</summary>
Environment-based configuration, protected API routes, and controlled AI responses to ensure safe and reliable system behavior.

</details>

<details>
<summary>🐳 Dockerized Lab Environment</summary>

Containerized attacker and victim setups using Docker, enabling isolated and reproducible cybersecurity lab simulations.

</details>
<details>
<summary>☁️ AWS S3 Resource Library</summary>

Publicly accessible repository of cybersecurity PDFs, including practical labs, tools documentation, and theoretical research papers.

</details>

<details>
<summary>📂 User Cloud Storage</summary>

Upload and manage personal PDFs directly to AWS S3 with metadata securely stored in **PostgreSQL (Neon Tech)** for persistent access.

</details>

<details>
<summary>📝 Resource & Notes Management</summary>

Dedicated section for organizing study materials, enabling users to access curated content and maintain their own learning notes in one place.

</details>

<details>
<summary>⭐ Interactive Feedback System</summary>
Star-rating and comment-based system to collect user feedback and improve platform experience.
</details>

---

## 📁 Project Structure

```text
CyberGuide/
├── Frontend/                          # React Frontend Application
│   ├── src/                           # Source code
│   │   ├── assets/                    # Images, icons, static files
│   │   ├── components/                # Reusable UI components
│   │   └── App.js                     # Routing configuration
│   ├── public/                        # Static public files
│   └── package.json                   # Frontend dependencies
│
├── Backend/                           # Django Backend Server
│   ├── DjangoBackend/                 # Main Django App
│   │   ├── models.py                  # Database models (UserResource, Feedback)
│   │   ├── views.py                   # API endpoints (AI, Feedback, S3 upload)
│   │   ├── s3_utils.py                # AWS S3 upload logic using boto3
│   │   └── gemini_utils.py            # Gemini AI integration + fallback logic
│   │
│   ├── config/                        # Django Project Configuration
│   │   ├── asgi.py                    # ASGI config (for WebSockets / Daphne)
│   │   ├── settings.py                # Main project settings (DB, CORS, etc.)
│   │   ├── urls.py                    # Global URL routing
│   │   └── wsgi.py                    # WSGI config (for production servers)
│   │
│   ├── terminal/                      # Web-based terminal module (cyber lab)
│   │   ├── __init__.py                # Package initializer
│   │   ├── consumer.py                # WebSocket consumer (real-time terminal)
│   │   └── views.py                   # Terminal-related APIs
│   │
│   ├── manage.py                      # Django CLI entry point
│   └── requirements.txt               # Backend dependencies
│
└── Docker/                            # Dockerized Cyber Lab Environment
    ├── attacker/                      # Attacker container (Kali / tools)
    │   └── Dockerfile                 # Docker config for attacker environment
    │
    ├── victim/                        # Victim container (vulnerable machine)
    │   └── Dockerfile                 # Docker config for vulnerable system
```

---

## 🛠️ Tech Stack

| Layer           | Technology                                                           |
| --------------- | -------------------------------------------------------------------- |
| Frontend        | React.js, React Router, CSS3 (Animations, Glassmorphism)             |
| Backend         | Django, Django REST Framework (DRF)                                  |
| AI Model        | Google Gemini (Flash / Flash-Lite, Multi-model fallback)             |
| Database        | PostgreSQL (Neon.tech)                                               |
| Storage         | AWS S3 (Cloud Object Storage)                                        |
| DevOps          | Docker, Docker Compose                                               |
| API             | REST APIs, JSON, Fetch API                                           |
| Realtime        | WebSockets (Django Channels for Terminal)                            |
| Cloud Tools     | AWS IAM, S3 Bucket Policies                                          |
| Version Control | Git, GitHub                                                          |
| Terminal Engine | Pseudo Terminal (PTY), WebSocket Streaming                           |
| UI/UX           | Dark Mode UI, Responsive Design, Animations                          |


---

## ⚙️ Setup & Installation

### 🔹 1. Backend Setup

Navigate to Backend:

```bash
cd Backend
```

Create `.env` file:

```env
GEMINI_API_KEY=your_gemini_key
AWS_ACCESS_KEY_ID=your_aws_id
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=your_region
DATABASE_URL=your_neon_postgres_url
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start server:

```bash
python manage.py runserver
```

---

### 🔹 2. Frontend Setup

```bash
cd Frontend
npm install
npm start
```

---

### 🔹 3. Docker Setup

```bash
docker-compose up --build
```

---

## 🔍 API Logic Highlights

### 🤖 AI Fallback Strategy

The chatbot uses multiple models:

```
gemini-2.5-flash-lite → gemini-2.5-flash → gemini-1.5-flash
```

If a **429 rate limit error** occurs, the system automatically switches models.

---

### ☁️ AWS S3 Upload Flow

1. User selects PDF (React)
2. Django receives file (`multipart/form-data`)
3. File uploaded to AWS S3 via `boto3`
4. Public S3 URL stored in PostgreSQL

---

## 📝 Database Schema

### Table: `DjangoBackend_userresource`

| Field       | Type         |
| ----------- | ------------ |
| id          | Primary Key  |
| useremail   | VARCHAR(255) |
| title       | VARCHAR(255) |
| pdf_url     | VARCHAR(500) |
| uploaded_at | TIMESTAMP    |

---

## 🛡️ Security Best Practices

* Environment variables stored in `.env`
* `.env` excluded via `.gitignore`
* AI responses restricted using system prompts
* CORS configured for trusted origins only

---

## 👨‍💻 Developed By

**Het Limbani**
CSE (AI & ML) Student & Full-Stack Developer

---

## ⭐ Future Improvements

* User authentication with JWT
* File preview (PDF viewer)
* Admin dashboard
* AI chat history storage
* Real-time notifications

---

## 📌 License

This project is for educational purposes.
