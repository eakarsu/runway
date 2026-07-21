const test = require('node:test');
const assert = require('node:assert/strict');
const { configuration, submitExport, ExportProviderError } = require('../lib/exportProvider');

const originalFetch = global.fetch;
const originalUrl = process.env.EXPORT_PROVIDER_URL;
const originalToken = process.env.EXPORT_PROVIDER_TOKEN;

test.afterEach(() => {
  global.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.EXPORT_PROVIDER_URL; else process.env.EXPORT_PROVIDER_URL = originalUrl;
  if (originalToken === undefined) delete process.env.EXPORT_PROVIDER_TOKEN; else process.env.EXPORT_PROVIDER_TOKEN = originalToken;
});

test('export provider configuration fails closed for missing, placeholder, and HTTP settings', () => {
  delete process.env.EXPORT_PROVIDER_URL;
  delete process.env.EXPORT_PROVIDER_TOKEN;
  assert.throws(() => configuration(), ExportProviderError);
  process.env.EXPORT_PROVIDER_URL = 'http://provider.example.test';
  process.env.EXPORT_PROVIDER_TOKEN = 'provider-token-long-enough';
  assert.throws(() => configuration(), /HTTPS/);
});

test('export provider submits exact idempotency evidence and validates the reference', async () => {
  process.env.EXPORT_PROVIDER_URL = 'https://provider.example.test';
  process.env.EXPORT_PROVIDER_TOKEN = 'provider-token-long-enough';
  let request;
  global.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ reference: 'provider-export-1' }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const evidence = await submitExport({ idempotencyKey: 'stable-key-123456', exportId: 1 });
  assert.deepEqual(evidence, { provider: 'provider.example.test', reference: 'provider-export-1' });
  assert.equal(request.url, 'https://provider.example.test/v1/exports');
  assert.equal(request.options.headers['idempotency-key'], 'stable-key-123456');
  assert.equal(request.options.headers.authorization, 'Bearer provider-token-long-enough');
});

test('export provider bounds retry evidence and rejects invalid success bodies', async () => {
  process.env.EXPORT_PROVIDER_URL = 'https://provider.example.test';
  process.env.EXPORT_PROVIDER_TOKEN = 'provider-token-long-enough';
  global.fetch = async () => new Response('busy', { status: 429, headers: { 'retry-after': '99999' } });
  await assert.rejects(() => submitExport({ idempotencyKey: 'stable-key-123456' }), (error) => error instanceof ExportProviderError && error.retryAfterSeconds === 3600);
  global.fetch = async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  await assert.rejects(() => submitExport({ idempotencyKey: 'stable-key-123456' }), /invalid evidence/);
});
