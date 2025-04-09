# CS Goals - Backend (Python)

This is the Python backend for the CS Goals application. It uses Uvicorn as the ASGI server and is designed to run on Windows with simple setup instructions.

---

## Prerequisites

- Python 3.8+
- `pip` (Python package manager)
- Git Bash, CMD, or PowerShell on Windows

---

## Setup Instructions

### Step 1: Create a Virtual Environment

```bash
python -m venv venv
```

---

### Step 2: Activate the Virtual Environment

- **For Command Prompt:**
  ```bash
  venv\Scripts\activate
  ```

- **For Git Bash or WSL:**
  ```bash
  source venv/Scripts/activate
  ```

---

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

> If `uvicorn` is not installed, install it manually:

```bash
pip install uvicorn
```

---

### Step 4: Run the Application

```bash
uvicorn main:app --host 0.0.0.0 --port 8080
---

## Access via Browser or Network

If running locally:
```
http://localhost:8080/
```

From another device on the same network:
```
http://<your-local-ip>:8080/
```

