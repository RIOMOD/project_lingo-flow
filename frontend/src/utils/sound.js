// Sound utility for Text-to-Speech (TTS) using Web Speech API

export function speakText(text, lang = "en-US", rate = 0.9) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate; // Custom speed rate (e.g. 1.0 for normal, 0.75 for slow)
  utterance.pitch = 1.0;

  // Get all available voices
  const voices = window.speechSynthesis.getVoices();
  const isVi = lang.startsWith("vi");
  
  // Try to find a matching voice (Vietnamese or English)
  const targetVoice = voices.find(
    (v) => v.lang.startsWith(isVi ? "vi" : "en") && 
           (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Microsoft") || v.name.includes("Samantha"))
  ) || voices.find((v) => v.lang.startsWith(isVi ? "vi" : "en"));

  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
}

