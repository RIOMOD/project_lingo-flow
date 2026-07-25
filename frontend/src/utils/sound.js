// Sound utility for Text-to-Speech (TTS) using Web Speech API

export function speakText(text, lang = "en-US") {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clear pronunciation
  utterance.pitch = 1.0;

  // Try to find a high quality English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}
