# Maruthuvam AI – requested modifications

## What changed

4. **Multi-document upload:** Medical Records accepts multiple files, OCR-processes each one sequentially, shows extracted text and uncertainty, and lets the user save each record individually. Batch uploads do not automatically schedule doses from uncertain OCR.
5. **Family profile labels:** Medical Records has a browser-local family member selector; new records are labeled with the selected member. This is a prototype convenience, not server-enforced per-family-member authorization. Do not treat it as secure separate medical accounts.
6. **Blood-bank finder:** Nearby has a Blood Availability filter and blood-group selector. It lists nearby hospitals and directs users to call to confirm stock; there is no verified live blood inventory integration in this ZIP.
7. **Removed medicine purchasing UI:** Medicine search cart and simulated order/checkout section were removed from Nearby.
8. **Removed daily wellness history UI:** The Log Today navigation/route and historical wellness chart on the dashboard were removed. Existing backend health-log endpoints/data are not deleted.
9. **Language-aware voice:** Chat voice input uses the selected English, Tamil, Tanglish, Hindi, or Telugu recognition locale where the browser supports it, and speech output selects a matching locale. Regional slang/dialect accuracy depends on the browser speech engine and AI provider.

1. **Medical-record-aware chat:** The FastAPI chat endpoint now passes the logged-in user's recent medical record summaries, structured/OCR text, active medication details, reminders and scheduled appointments into the AI context. The assistant is instructed to answer record-specific questions from this evidence, distinguish missing details, and not invent prescription instructions.
2. **Browser notifications:** The Reminders page now has an **Enable notifications** button. While the website is open, it checks active medication reminders every minute and sends a browser notification at the configured `HH:MM` time. It also sends a notification when a scheduled appointment is within 30 minutes.
3. **Prescription-aware entry:** Reminder form copy now encourages entering the medicine, dosage and duration exactly as written on the prescription.

## Run on Windows (VS Code)

Prerequisites: Python 3.11+, Node.js 18+, npm. Open the extracted project root in VS Code.

### Terminal 1 – backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
$env:PYTHONPATH = "backend"
python backend/seed.py
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### Terminal 2 – frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite (usually http://localhost:3000 or http://localhost:5173). Sign in with the local demo account if seed data was created: `demo_user` / `demo1234`.

### Optional: PostgreSQL + Docker

With Docker Desktop running, from the project root:

```powershell
docker compose up --build -d
```

Web: http://localhost:3000; API docs: http://localhost:8000/docs.

## Feature limitations to know

- Family profiles are currently local browser labels, not independently secured server-side family accounts. A full production version needs member IDs on medical records, per-member authorization, consent, and audit logging.
- Blood availability is not live or verified by a blood bank API. The app deliberately shows “call to confirm” instead of claiming that a particular group is available.
- Multiple uploaded files are OCR-processed one by one. Review each extracted record before saving; ambiguous medicine dosage, timing, and duration must be confirmed against the original prescription. The batch uploader does not create automatic medication reminders.
- GPS accuracy and regional dialect recognition depend on the device/browser and permissions. The browser may not support all speech locales or dialects.

## Notification limitations

- Click **Enable notifications** and allow permission in the browser.
- Browser notifications are checked while the app page is open. This is not a guaranteed background alarm when the browser is closed, the device sleeps, or the operating system blocks notifications. Reliable background/push reminders need a deployed push-notification service or native app.
- Appointment alerts are generated when an appointment is within 30 minutes of its stored date/time.

## Medical safety and prescription OCR

OCR/extracted prescription details can be imperfect. The app must not infer or change medicine dose, frequency, duration, or appointment dates from unclear text. Verify extracted instructions with the original prescription or a pharmacist/doctor. Chat context currently includes the latest five medical records and the actual text/structured fields saved for those records; it cannot answer from a file that has not been uploaded and successfully saved/extracted. External LLM-powered answers require a configured provider/API key; otherwise the app uses its built-in fallback responses.
