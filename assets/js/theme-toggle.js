(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem('theme'); } catch (_) { /* Storage is optional. */ }
  if (preference !== 'dark' && preference !== 'light') preference = null;
  let button;
  const applyTheme = () => {
    const theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#19171e' : '#ffffff';
  };
  applyTheme();
  system.addEventListener('change', applyTheme);
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme' || event.key === null) {
      preference = ['dark', 'light'].includes(event.newValue) ? event.newValue : null;
      applyTheme();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    button = document.getElementById('light-toggle');
    if (!button) return;
    button.hidden = false;
    applyTheme();
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      try { localStorage.setItem('theme', preference); } catch (_) { /* Keep the session preference. */ }
    });
  });
})();
