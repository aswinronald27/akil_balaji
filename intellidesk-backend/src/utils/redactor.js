/**
 * Utility to redact sensitive credentials, tokens, and PII from log contents and text.
 */
function redactSensitiveData(text) {
  if (!text || typeof text !== 'string') return text;

  let redacted = text;

  // Bearer tokens
  redacted = redacted.replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, 'Bearer [REDACTED_TOKEN]');

  // Authorization headers
  redacted = redacted.replace(/(Authorization:\s*)([^\r\n]+)/gi, '$1[REDACTED_AUTH]');

  // API keys / tokens (generic patterns like api_key=..., apiKey: "...", token=...)
  redacted = redacted.replace(/(api[_-]?key|secret|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*["']?([A-Za-z0-9_\-\.]{8,})["']?/gi, '$1="[REDACTED_KEY]"');

  // Passwords
  redacted = redacted.replace(/(password|passwd|pwd)\s*[:=]\s*["']?([^\s"',;]+)["']?/gi, '$1="[REDACTED_PASSWORD]"');

  // Credit Card Numbers (Luhn-like 13-19 digits)
  redacted = redacted.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_PAN]');

  // Basic JWT tokens (header.payload.signature)
  redacted = redacted.replace(/\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED_JWT]');

  // Social Security Numbers (US format XXX-XX-XXXX)
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');

  return redacted;
}

module.exports = {
  redactSensitiveData,
};
