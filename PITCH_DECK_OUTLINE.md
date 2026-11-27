# Bolo — Pitch deck content

## 1. Problem and solution
A simple civic issue can be hard to report when a person has to navigate a long form or type on a small screen. Bolo lets people describe a neighbourhood issue by voice, reviews the extracted details with them, and prepares a structured report.

## 2. Who it is for
Residents who prefer speaking to typing, people using smartphones, and anyone who finds multi-step digital forms difficult. The first prototype focuses on English-speaking users in India and common neighbourhood issues: streetlights, garbage, water leaks, damaged roads and drainage.

## 3. What the prototype does
- Captures speech in the browser where supported, with a typing fallback.
- Extracts issue type, a nearby place phrase and urgency.
- Presents an editable form so the user remains in control.
- Reads back the report and creates a demo receipt after confirmation.

## 4. Dependencies and failure plan
The prototype uses browser speech recognition and speech synthesis, a Python Flask API, and Docker. Speech recognition support and accuracy vary by browser, device, network and accent. If speech recognition is unavailable or permission is denied, the user can type instead. No OpenAI or Google API key is required. The demo does not submit to a municipal authority.

## 5. Launch plan
Start with a small usability test with residents and accessibility-focused users. Improve recognition and location extraction from feedback. Then explore partnerships with municipal bodies or authorised civic platforms before enabling real submissions. Add more Indian languages only after testing with native speakers and measuring accuracy.

## 6. Responsible rollout
Obtain explicit consent before recording or sending any information. Minimise personal data. Provide edit, cancel and confirmation steps. Clearly distinguish a demo receipt from an official complaint reference. Conduct security, privacy, accessibility and language-quality reviews before a public launch.
