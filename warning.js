const params = new URLSearchParams(location.search);
const target = params.get('target');
let reasons = [];
try { reasons = JSON.parse(params.get('reasons') || '[]'); } catch { reasons = ['The address triggered a safety check.']; }

if (!target) location.replace('about:blank');
const parsed = new URL(target);
document.querySelector('#host').textContent = parsed.hostname;
document.querySelector('#reasons').replaceChildren(...reasons.map(reason => {
  const item = document.createElement('li'); item.textContent = reason; return item;
}));
document.querySelector('#back').addEventListener('click', () => history.length > 1 ? history.back() : location.assign('about:blank'));
document.querySelector('#continue').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'allow-once', url: target });
  location.replace(target);
});
