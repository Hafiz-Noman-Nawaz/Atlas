/**
 * Natural Neural Speech Synthesis for ZeoAtlas Messages
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function getCurrentUtterance() {
  return currentUtterance;
}

export function speakMessage(
  _messageId: string,
  rawText: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('[TTS] Web Speech API not supported in this browser.');
    onError?.();
    return;
  }

  // If already speaking, cancel previous
  stopSpeech();

  // Strip markdown formatting symbols for crystal clean speech
  const cleanText = rawText
    .replace(/```[\s\S]*?```/g, 'Code block omitted from audio playback.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~#>]/g, '')
    .replace(/\|.*\|/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Pick high-quality English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Samantha')) &&
      v.lang.startsWith('en')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('[TTS Error]', e);
    currentUtterance = null;
    onError?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}
