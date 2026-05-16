window.addEventListener('load', () => {
  const match = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/);

  if (!match || !window.ui) {
    return;
  }

  window.ui.preauthorizeApiKey('csrf', decodeURIComponent(match[1]));
});

console.log('swagger-ui');
