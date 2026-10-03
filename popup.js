chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const site = document.querySelector('#site');
  const status = document.querySelector('#status');
  try {
    const url = new URL(tab.url);
    site.textContent = url.hostname;
    status.textContent = /^https:$/.test(url.protocol)
      ? 'Encrypted connection detected. SafeBrowse will keep checking new links.'
      : 'This page is not using HTTPS. Treat any submitted information with care.';
  } catch {
    site.textContent = 'Browser page';
    status.textContent = 'SafeBrowse checks normal website links when you browse.';
  }
});
