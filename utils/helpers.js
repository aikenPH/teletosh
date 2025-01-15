function escapeMarkdown(text) {
  const specialChars = ['_', '*', '`', '['];
  let escapedText = text;
  for (const char of specialChars) {
    escapedText = escapedText.replace(new RegExp('\\' + char, 'g'), '\\' + char);
  }
  return escapedText;
}

module.exports = {
  escapeMarkdown,
};

