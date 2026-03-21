# 🛡️ CyberGuide AI Mentor & Resource Hub

**CyberGuide** is a comprehensive cybersecurity educational platform featuring an **AI-powered Mentor** for technical guidance and a **Cloud-Integrated Resource Library** for lab documents and theoretical research.

---

## 🚀 Key Features

* **AI Mentor Chatbot**
  Real-time cybersecurity advice powered by **Google Gemini (multi-model fallback)** to handle rate limits and ensure reliability.

* **AWS S3 Resource Library**
  Publicly accessible PDFs for cybersecurity labs and theoretical research.

* **User Cloud Storage**
  Upload personal PDFs to AWS S3 with metadata stored in **PostgreSQL (Neon Tech)**.

* **Interactive Feedback System**
  Star-rating + comment system to track user experience.

* **Cyber Lab Dashboard**
  Modern dark-mode UI with glassmorphism and smooth animations.

---

## 📁 Project Structure

```
CyberGuide/
├── Frontend/                # React Application
│   ├── src/
│   │   ├── assets/          # Images, Icons
│   │   ├── components/      # Reusable UI Components
│   │   ├── pages/           # ChatBot, ResourcePage, FeedbackPage
│   │   └── App.js           # Routing
│   ├── public/
│   └── package.json
│
├── Backend/                 # Django Backend
│   ├── DjangoBackend/
│   │   ├── models.py        # DB Models
│   │   ├── views.py         # API Endpoints
│   │   ├── s3_utils.py      # AWS Integration
│   │   └── gemini_utils.py  # AI Logic
│   ├── manage.py
│   └── requirements.txt
│
└── Docker/                  # Deployment
    ├── docker-compose.yml
    ├── frontend.Dockerfile
    └── backend.Dockerfile
```

---

## 🛠️ Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | React.js, CSS3                |
| Backend  | Django, Django REST Framework |
| AI Model | Google Gemini                 |
| Database | PostgreSQL (Neon.tech)        |
| Storage  | AWS S3                        |
| DevOps   | Docker                        |

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
