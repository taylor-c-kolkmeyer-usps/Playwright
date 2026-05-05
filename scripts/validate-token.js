// Validates that the live ACE ID token endpoint returns a response
// that extractToken() in global-setup.ts can successfully parse.
// Usage: node scripts/validate-token.js

require('dotenv').config();
const { chromium } = require('playwright');

function findTokenDeep(value) {
  const asText = typeof value === 'string' ? value : JSON.stringify(value);
  const normalized = asText
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&amp;', '&');
  const m = /"token"\s*:\s*"([^"]+)"/i.exec(normalized);
  return m?.[1]?.trim() || null;
}

function classifyAndExtract(raw) {
  const trimmed = raw.trim();
  const dequoted = trimmed
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&amp;', '&');

  for (const candidate of [trimmed, dequoted]) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === 'string' && parsed.trim()) {
        return { ok: true, format: 'json-string', token: parsed.trim() };
      }
      const deep = findTokenDeep(parsed);
      if (deep) {
        return { ok: true, format: 'json-object-deep-token', token: deep };
      }
    } catch { /* non-JSON candidate, try next */ }
  }

  for (const candidate of [trimmed, dequoted]) {
    const m = /"token"\s*:\s*"([^"]+)"/i.exec(candidate);
    if (m?.[1]) {
      return { ok: true, format: 'regex-token-field', token: m[1] };
    }
  }

  return {
    ok: false,
    format: 'no-match',
    sample: dequoted.slice(0, 500).replaceAll(/\s+/g, ' '),
  };
}

(async () => {
  const proxy =
    process.env.IBPS_PROXY_SERVER ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    'http://proxy.usps.gov:8080';

  const ace = process.env.IBPS_APPLICATION_ACE_ID;
  const user = process.env.IBPS_USER;

  if (!ace) { console.error('MISSING: IBPS_APPLICATION_ACE_ID'); process.exit(1); }
  if (!user) { console.error('MISSING: IBPS_USER'); process.exit(1); }

  const url = ace + user;
  console.log('proxy        :', proxy);
  console.log('token_url    :', url);
  console.log('');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    proxy: proxy ? { server: proxy } : undefined,
    ignoreHTTPSErrors: true,
    userAgent: process.env.IBPS_USER_AGENT || 'Selenium',
  });

  const page = await context.newPage();
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const body = resp ? await resp.text() : await page.locator('pre').first().innerText();

  const result = classifyAndExtract(body);

  console.log('http_status  :', resp ? resp.status() : 'no-response-object');
  console.log('matched_format:', result.format);

  if (result.ok) {
    console.log('token_present :', 'yes');
    console.log('token_length  :', result.token.length);
    console.log('token_preview :', result.token.slice(0, 8) + '...');
  } else {
    console.log('token_present :', 'no');
    console.log('response_sample:', result.sample);
  }

  await context.close();
  await browser.close();

  process.exit(result.ok ? 0 : 1);
})().catch((e) => {
  console.error('validation_error:', e.message);
  process.exit(1);
});
