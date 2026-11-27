const $ = (id) => document.getElementById(id);
const micButton = $("micButton");
const transcript = $("transcript");
const micStatus = $("micStatus");
const micCaption = $("micCaption");
const processButton = $("processButton");
const charCount = $("charCount");
let recognition = null;
let listening = false;

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function updateCount() {
  charCount.textContent = `${transcript.value.length} / 1200`;
}
transcript.addEventListener("input", updateCount);

function setListening(active) {
  listening = active;
  $("micButton").classList.toggle("listening", active);
  micStatus.textContent = active ? "LISTENING" : "READY";
  micStatus.classList.toggle("listening", active);
  micCaption.textContent = active ? "Listening… tap to stop" : "Tap to start speaking";
  micButton.setAttribute("aria-label", active ? "Stop voice input" : "Start voice input");
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const engine = new SpeechRecognition();
  engine.lang = "en-IN";
  engine.continuous = true;
  engine.interimResults = true;
  engine.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let i = 0; i < event.results.length; i++) {
      const phrase = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += phrase + " ";
      else interimText += phrase;
    }
    if (finalText.trim()) {
      transcript.value = (transcript.dataset.finalText || "") + finalText;
      transcript.dataset.finalText = transcript.value;
    }
    if (interimText) micCaption.textContent = interimText;
    updateCount();
  };
  engine.onerror = (event) => {
    setListening(false);
    if (event.error === "not-allowed") showToast("Microphone permission was blocked. You can type instead.");
    else if (event.error !== "no-speech") showToast("Voice input stopped. Please try again.");
  };
  engine.onend = () => {
    if (listening) setListening(false);
    transcript.dataset.finalText = transcript.value;
  };
  return engine;
}

micButton.addEventListener("click", () => {
  if (listening) {
    recognition?.stop();
    setListening(false);
    return;
  }
  if (!recognition) recognition = setupSpeechRecognition();
  if (!recognition) {
    showToast("Voice recognition is not supported in this browser. Try Chrome or Edge, or type below.");
    return;
  }
  if (!window.isSecureContext && location.hostname !== "localhost") {
    showToast("Voice input requires HTTPS. You can still type your report.");
    return;
  }
  transcript.dataset.finalText = transcript.value;
  try {
    recognition.start();
    setListening(true);
  } catch (_error) {
    showToast("Voice input is already starting. Please wait a moment.");
  }
});

$("clearButton").addEventListener("click", () => {
  transcript.value = "";
  transcript.dataset.finalText = "";
  updateCount();
  showToast("Your transcript has been cleared.");
});

async function postJSON(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong.");
  return result;
}

processButton.addEventListener("click", async () => {
  const spoken = transcript.value.trim();
  if (!spoken) {
    showToast("Speak or type a short description first.");
    transcript.focus();
    return;
  }
  processButton.disabled = true;
  processButton.textContent = "Understanding…";
  try {
    const result = await postJSON("/api/parse", {transcript: spoken});
    if (result.category) $("category").value = result.category;
    if (result.location) $("location").value = result.location;
    $("description").value = result.description;
    const urgency = document.querySelector(`input[name="urgency"][value="${result.urgency}"]`);
    if (urgency) urgency.checked = true;
    const speech = new SpeechSynthesisUtterance(
      `I understood a ${result.category || "civic"} issue. ` +
      `${result.location ? "The location is " + result.location + ". " : ""}` +
      "Please review the details on screen and confirm when ready."
    );
    speech.lang = "en-IN";
    window.speechSynthesis?.speak(speech);
    showToast("Your report has been organised. Please review it.");
  } catch (error) {
    showToast(error.message);
  } finally {
    processButton.disabled = false;
    processButton.innerHTML = 'Understand my report <span>↗</span>';
  }
});

$("reportForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const urgency = document.querySelector('input[name="urgency"]:checked')?.value || "medium";
  const payload = {
    category: $("category").value,
    location: $("location").value.trim(),
    description: $("description").value.trim(),
    urgency
  };
  const button = $("confirmButton");
  button.disabled = true;
  button.textContent = "Creating demo receipt…";
  try {
    const result = await postJSON("/api/reports", payload);
    $("receiptMessage").textContent = result.notice;
    $("receiptReference").textContent = result.receipt.reference;
    $("receiptModal").hidden = false;
    const confirmation = new SpeechSynthesisUtterance("Your demo report has been created. Please note, this is not an official complaint.");
    confirmation.lang = "en-IN";
    window.speechSynthesis?.speak(confirmation);
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = 'Confirm demo report <span>→</span>';
  }
});

function closeReceipt() {
  $("receiptModal").hidden = true;
}
$("closeModal").addEventListener("click", closeReceipt);
$("doneButton").addEventListener("click", closeReceipt);
$("receiptModal").addEventListener("click", (event) => {
  if (event.target === $("receiptModal")) closeReceipt();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeReceipt();
});

updateCount();
