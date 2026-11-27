from datetime import datetime, timezone
from flask import Flask, jsonify, render_template, request
import re
import uuid

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

CATEGORIES = {
    "streetlight": ["streetlight", "street light", "light", "lamp", "dark road"],
    "garbage": ["garbage", "waste", "rubbish", "trash", "dustbin"],
    "water": ["water leak", "water is leaking", "leaking water", "water leakage", "pipe burst", "water supply"],
    "road": ["pothole", "road", "broken road", "footpath", "pavement"],
    "drainage": ["drain", "drainage", "sewer", "blocked drain", "overflow"],
    "other": ["other", "something else"]
}

URGENCY_WORDS = {
    "high": ["urgent", "dangerous", "emergency", "immediately", "high priority"],
    "medium": ["soon", "as soon as possible", "quickly"],
    "low": ["not urgent", "low priority", "when possible"]
}

def detect_category(text):
    lowered = text.lower()
    for category, phrases in CATEGORIES.items():
        if any(phrase in lowered for phrase in phrases):
            return category
    return ""

def detect_urgency(text):
    lowered = text.lower()
    # Check explicit low-priority phrases first so "not urgent" is not
    # incorrectly classified as high just because it contains "urgent".
    for level in ("low", "high", "medium"):
        phrases = URGENCY_WORDS[level]
        if any(phrase in lowered for phrase in phrases):
            return level
    return "medium"

def clean_location(text):
    patterns = [
        r"(?:near|at|outside|opposite|beside|behind)\s+(.+?)(?:\.|,|$)",
        r"(?:location is|location:)\s*(.+?)(?:\.|,|$)"
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip(" .")
    return ""

def extract_report(transcript):
    """Extract a small, transparent set of fields from a spoken civic report."""
    return {
        "category": detect_category(transcript),
        "location": clean_location(transcript),
        "description": transcript.strip(),
        "urgency": detect_urgency(transcript)
    }

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Bolo demo API"})

@app.post("/api/parse")
def parse_speech():
    payload = request.get_json(silent=True) or {}
    transcript = str(payload.get("transcript", "")).strip()
    if not transcript:
        return jsonify({"error": "Please provide something you said."}), 400
    if len(transcript) > 1200:
        return jsonify({"error": "Please keep the report under 1,200 characters."}), 400
    return jsonify(extract_report(transcript))

@app.post("/api/reports")
def create_report():
    payload = request.get_json(silent=True) or {}
    required = ["category", "location", "description", "urgency"]
    missing = [field for field in required if not str(payload.get(field, "")).strip()]
    if missing:
        return jsonify({
            "error": "Please complete all fields before confirming.",
            "missing": missing
        }), 400

    category = str(payload["category"]).strip().lower()
    urgency = str(payload["urgency"]).strip().lower()
    if category not in CATEGORIES:
        return jsonify({"error": "Choose a valid report category."}), 400
    if urgency not in {"low", "medium", "high"}:
        return jsonify({"error": "Choose a valid urgency level."}), 400

    # Demo-only: no report is sent to a government department.
    receipt = {
        "reference": "BOLO-" + uuid.uuid4().hex[:8].upper(),
        "category": category,
        "location": str(payload["location"]).strip()[:180],
        "description": str(payload["description"]).strip()[:1200],
        "urgency": urgency,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "Demo request created"
    }
    return jsonify({
        "message": "Your demo report is ready.",
        "receipt": receipt,
        "notice": "This prototype does not send reports to a municipal authority."
    }), 201

@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "That page was not found."}), 404

@app.errorhandler(500)
def server_error(_error):
    return jsonify({"error": "Something went wrong. Please try again."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=False)
