const SUSPICIOUS_HOSTS = new Set([
  'secure-account-check.example',
  'verify-login-security.example',
  'free-prize-claim.example'
]);

const trustedBrands = ['google', 'microsoft', 'apple', 'amazon', 'paypal', 'netflix', 'facebook', 'instagram'];
const allowedForSession = new Set();

function assessUrl(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;

  const host = url.hostname.toLowerCase();
  const reasons = [];
  if (SUSPICIOUS_HOSTS.has(host)) reasons.push('This domain is on the demonstration suspicious-site list.');
  if (url.protocol === 'http:') reasons.push('This page does not use an encrypted HTTPS connection.');
  if (host.includes('xn--')) reasons.push('The address uses internationalized characters that can imitate another website.');
  if (host.split('.').length > 4) reasons.push('The address has an unusually deep chain of subdomains.');
  if (/(login|verify|secure|account|update)/i.test(url.pathname + url.search) && /(?:\d{4,}|%[0-9a-f]{2})/i.test(url.href)) {
    reasons.push('The link combines account-related wording with unusual encoded or numeric content.');
  }
  const brandInHost = trustedBrands.find(brand => host.includes(brand));
  if (brandInHost && !host.endsWith(`${brandInHost}.com`) && host !== `${brandInHost}.com`) {
    reasons.push(`The address mentions “${brandInHost}” but is not its normal .com domain.`);
  }
  return reasons.length ? { url: url.href, host, reasons } : null;
}

chrome.webNavigation.onBeforeNavigate.addListener(({ tabId, frameId, url }) => {
  if (frameId !== 0 || url.startsWith(chrome.runtime.getURL('warning.html'))) return;
  const assessment = assessUrl(url);
  if (!assessment || allowedForSession.has(url)) return;
  const warningUrl = new URL(chrome.runtime.getURL('warning.html'));
  warningUrl.searchParams.set('target', url);
  warningUrl.searchParams.set('reasons', JSON.stringify(assessment.reasons));
  chrome.tabs.update(tabId, { url: warningUrl.href });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'allow-once' && typeof message.url === 'string') {
    allowedForSession.add(message.url);
    sendResponse({ ok: true });
  }
});
