# Bolo — Speak up. Get things moving.

Bolo is a voice-first civic access prototype. It helps a person describe a neighbourhood issue in English, structures the details into a simple report form, reads back the result, and creates a clearly labelled demo receipt after confirmation.

## The problem

People can find digital service forms difficult to navigate, especially when typing on a phone or working through unfamiliar interfaces. Reporting a local issue should be as simple as describing it.

## What this prototype demonstrates

- English (India) browser speech recognition, when supported by the browser.
- Text fallback for browsers without speech recognition.
- Rule-based extraction of issue category, location phrase and urgency.
- Editable review form and spoken confirmation.
- Demo receipt with a generated reference number.
- No paid API keys, external service credentials or secrets required.

## Important prototype boundary

This is a hackathon demonstration, not a live government service. It does not transmit complaints to a municipality, store a user account, or promise that an issue will be resolved. The receipt is not an official complaint number. A future production version would require an authorised civic integration, consent, secure storage, accessibility testing and a privacy review.

## Run locally with Docker

```bash
docker compose up --build
```

Open http://localhost:3000.

## Run without Docker

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://localhost:3000.

## Voice input

Use a current version of Chrome or Edge and allow microphone access. Browser speech recognition generally requires HTTPS on deployed sites (localhost is also permitted). The browser may use its own speech service; check its privacy settings. If voice recognition is unavailable, type into the transcript box and continue.

## Example phrase

"There's a broken streetlight near City Park, Sector 12. It is dangerous and needs attention urgently."

## API

- `GET /api/health` — health check.
- `POST /api/parse` — accepts `{"transcript":"..."}` and returns structured fields.
- `POST /api/reports` — validates the reviewed form and returns a demo receipt.

## Hackathon checklist

- [x] Public-repository-ready source layout.
- [x] Dockerfile and docker-compose.yml.
- [x] App starts without API keys or secrets.
- [x] `.env.example` included.
- [x] Custom application code exceeds 300 lines across the app, frontend and styles.
- [ ] Push repository to a public GitHub repository.
- [ ] Record and publish a demo video (3 minutes or less).
- [ ] Export a text-rich pitch deck PDF.
- [ ] Test a fresh clone on another machine.

## Suggested demo flow (about 90 seconds)

1. Introduce the problem: typing a civic complaint can be a barrier.
2. Tap the microphone and say the example phrase above.
3. Show the extracted category, location and urgency.
4. Edit one field to demonstrate user control.
5. Confirm and show the demo receipt.
6. State clearly that the prototype does not yet connect to a municipal authority.
