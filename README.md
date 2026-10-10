# CityCare AI

CityCare AI is a civic technology platform that allows residents to report urban issues, receive AI-powered classification, and monitor service performance with a sustainability-oriented dashboard.

## Features

- AI complaint classification for waste, road damage, waterlogging, street lighting, and air quality issues.
- Complaint submission with validation and confidence scoring.
- SQLite-backed complaint management and admin status updates.
- Analytics dashboard for complaint trends and neighborhood activity.
- Synthetic training data and a reproducible ML workflow using scikit-learn.

## Quick start

### 1. Configure secrets (Windows PowerShell)

Copy `.env.example` to `.env`, then replace both placeholder secrets with separate random values of at least 32 characters. Do not commit or share `.env`.

```powershell
Copy-Item .env.example .env
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$secretBytes = New-Object byte[] 48
$adminBytes = New-Object byte[] 48
$rng.GetBytes($secretBytes)
$rng.GetBytes($adminBytes)
$secret = [Convert]::ToBase64String($secretBytes)
$adminKey = [Convert]::ToBase64String($adminBytes)
$content = Get-Content .env
$content = $content -replace '^SECRET_KEY=.*$', "SECRET_KEY=$secret"
$content = $content -replace '^ADMIN_API_KEY=.*$', "ADMIN_API_KEY=$adminKey"
Set-Content -Path .env -Value $content
$rng.Dispose()
```

The configured administrator key is not bundled with the frontend. Enter it in the Dashboard’s **Admin API key** field only when changing complaint statuses.

### 2. Python environment

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python backend\ml\train_model.py
python scripts\init_db.py
python -m flask --app backend.app run --debug --host 127.0.0.1
```

If PowerShell blocks activation, run the venv interpreter directly, for example `.\.venv\Scripts\python.exe -m flask --app backend.app run --debug --host 127.0.0.1`.

### 3. Frontend

```bash
Set-Location frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173` with both servers running.

### 4. Tests

```bash
.\.venv\Scripts\python.exe -m pytest backend\tests -q
```

## ML model notes

The model uses a small synthetic civic complaint dataset for demonstration purposes. Accuracy metrics are evaluated from that dataset and are displayed transparently. The dataset is intentionally compact and should be treated as a prototype.

## Environment variables

Copy [.env.example](.env.example) to `.env` and set unique random values for `SECRET_KEY` and `ADMIN_API_KEY`. The example contains placeholders only. `DATABASE_URL` defaults to the existing local SQLite database when unset; do not add database credentials unless you intentionally configure a different database.

No user login/password system exists in this project. Administrator status updates use the API key configured on the backend and supplied at runtime in the dashboard.

Older versions of this project may have included demo credentials. If those credentials or any real secret were ever committed or shared, rotate them immediately: replace them with newly generated values in `.env`, update the backend deployment environment, invalidate the old values, and remove them from repository history if applicable. History cleanup does not replace rotation.
