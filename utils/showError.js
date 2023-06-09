function showError(message, statusCode) {
  return {
    message,
    statusCode,
  };
}

module.exports = { showError };
