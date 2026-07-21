class ExportProviderError extends Error {
  constructor(message, status = 502, retryAfterSeconds = 60) {
    super(message);
    this.name = 'ExportProviderError';
    this.status = status;
    this.retryAfterSeconds = Math.max(1, Math.min(3600, retryAfterSeconds));
  }
}

function configuration() {
  const rawUrl = String(process.env.EXPORT_PROVIDER_URL || '').trim();
  const token = String(process.env.EXPORT_PROVIDER_TOKEN || '').trim();
  if (!rawUrl || !token || token.length < 16 || /^(?:replace|your-|change-me|example)/i.test(token)) {
    throw new ExportProviderError('Export provider is not configured', 503, 300);
  }
  let url;
  try { url = new URL(rawUrl); } catch { throw new ExportProviderError('Export provider URL is invalid', 503, 300); }
  if (url.protocol !== 'https:') throw new ExportProviderError('Export provider URL must use HTTPS', 503, 300);
  return { url, token };
}

async function submitExport(payload) {
  const { url, token } = configuration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  timeout.unref?.();
  try {
    const response = await fetch(new URL('/v1/exports', url), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'idempotency-key': payload.idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const retryAfter = Number(response.headers.get('retry-after')) || 60;
    if (!response.ok) throw new ExportProviderError(`Export provider rejected the request (${response.status})`, response.status === 429 ? 503 : 502, retryAfter);
    const body = await response.json().catch(() => null);
    if (!body || typeof body.reference !== 'string' || body.reference.length < 1) throw new ExportProviderError('Export provider returned invalid evidence');
    return { provider: url.hostname, reference: body.reference };
  } catch (error) {
    if (error instanceof ExportProviderError) throw error;
    throw new ExportProviderError(error.name === 'AbortError' ? 'Export provider timed out' : 'Export provider request failed');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { ExportProviderError, configuration, submitExport };
