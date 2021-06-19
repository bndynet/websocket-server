export function trimHelpText(text) {
  if (!text) return '';
  return text.startsWith('\n') ? text.substr(1).trimEnd() : text.trimEnd();
}