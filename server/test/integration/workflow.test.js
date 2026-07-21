const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.ALLOW_PUBLIC_REGISTRATION = 'true';
delete process.env.EXPORT_PROVIDER_URL;
delete process.env.EXPORT_PROVIDER_TOKEN;

const sequelize = require('../../config/database');
const { createApp } = require('../../app');
const { User, Export } = require('../../models');

let server;
let baseUrl;

async function request(path, { token, method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

async function register(email) {
  const response = await request('/api/auth/register', {
    method: 'POST',
    body: { email, name: email.split('@')[0], password: 'Secure1!IntegrationPassword' },
  });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body;
}

test.before(async () => {
  await sequelize.query('TRUNCATE TABLE "AuditEvents", "Exports", "Comments", "ProjectSnapshots", "Projects", "Users" RESTART IDENTITY CASCADE');
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

test('private project review, versions, comments, export failure, revocation, and audit evidence work end to end', async () => {
  const owner = await register('owner@example.test');
  const outsider = await register('outsider@example.test');

  const created = await request('/api/projects', { token: owner.token, method: 'POST', body: { name: 'Launch film', description: 'Private rough cut', type: 'video' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.version, 0);
  assert.equal(created.body.reviewStatus, 'pending');
  const projectId = created.body.id;

  assert.equal((await request(`/api/projects/${projectId}`, { token: outsider.token })).status, 404);
  assert.equal((await request(`/api/comments/project/${projectId}`, { token: outsider.token })).status, 404);
  assert.equal((await request(`/api/projects/${projectId}/snapshots`, { token: outsider.token })).status, 404);

  const concurrent = await Promise.all([
    request(`/api/projects/${projectId}`, { token: owner.token, method: 'PUT', body: { version: 0, description: 'Owner edit A' } }),
    request(`/api/projects/${projectId}`, { token: owner.token, method: 'PUT', body: { version: 0, description: 'Owner edit B' } }),
  ]);
  assert.equal(concurrent.filter((value) => value.status === 200).length, 1);
  assert.equal(concurrent.filter((value) => value.status === 409 && value.body.code === 'VERSION_CONFLICT').length, 1);

  const current = await request(`/api/projects/${projectId}`, { token: owner.token });
  assert.equal(current.body.version, 1);
  const comment = await request('/api/comments', { token: owner.token, method: 'POST', body: { projectId, body: 'Human checked the framing', anchor: '00:12' } });
  assert.equal(comment.status, 201);
  assert.equal((await request('/api/comments', { token: outsider.token, method: 'POST', body: { projectId, body: 'Unauthorized note' } })).status, 404);

  const manualSnapshot = await request(`/api/projects/${projectId}/snapshots`, { token: owner.token, method: 'POST', body: { version: 1, note: 'Pre-approval checkpoint' } });
  assert.equal(manualSnapshot.status, 201);
  const snapshots = await request(`/api/projects/${projectId}/snapshots`, { token: owner.token });
  assert.ok(snapshots.body.data.length >= 2);

  const review = await request(`/api/projects/${projectId}/review`, { token: owner.token, method: 'POST', body: { version: 1, decision: 'approved', notes: 'Human approved this exact version' } });
  assert.equal(review.status, 200);
  assert.equal(review.body.reviewStatus, 'approved');

  const exportRequest = { token: owner.token, method: 'POST', headers: { 'idempotency-key': 'workflow-export-key-0001' }, body: { projectId, name: 'Approved master', format: 'mp4', resolution: '1080p' } };
  const firstExport = await request('/api/exports', exportRequest);
  const repeatedExport = await request('/api/exports', exportRequest);
  assert.equal(firstExport.status, 201);
  assert.equal(repeatedExport.status, 200);
  assert.equal(repeatedExport.body.id, firstExport.body.id);
  assert.equal((await request(`/api/exports/${firstExport.body.id}`, { token: outsider.token })).status, 404);

  const providerFailure = await request(`/api/exports/${firstExport.body.id}/submit`, { token: owner.token, method: 'POST' });
  assert.equal(providerFailure.status, 503);
  assert.equal(providerFailure.body.code, 'PROVIDER_FAILURE');
  const failed = await request(`/api/exports/${firstExport.body.id}`, { token: owner.token });
  assert.equal(failed.body.status, 'failed');
  assert.equal(failed.body.attempts, 1);
  assert.ok(failed.body.nextRetryAt);

  const restored = await request(`/api/projects/${projectId}/snapshots/${manualSnapshot.body.id}/restore`, { token: owner.token, method: 'POST', body: { version: 1 } });
  assert.equal(restored.status, 200);
  assert.equal(restored.body.version, 2);
  assert.equal(restored.body.reviewStatus, 'pending');
  await Export.update({ nextRetryAt: null }, { where: { id: firstExport.body.id } });
  const staleExport = await request(`/api/exports/${firstExport.body.id}/submit`, { token: owner.token, method: 'POST' });
  assert.equal(staleExport.status, 409);
  assert.equal(staleExport.body.code, 'STALE_APPROVAL');

  const audit = await request(`/api/projects/${projectId}/audit`, { token: owner.token });
  assert.equal(audit.status, 200);
  assert.equal(audit.body.validHashChain, true);
  assert.ok(audit.body.data.some((event) => event.action === 'EXPORT_SUBMISSION_FAILED'));
  await assert.rejects(() => sequelize.query('UPDATE "AuditEvents" SET "action" = \'TAMPERED\' WHERE "projectId" = :projectId', { replacements: { projectId } }));
  await assert.rejects(() => sequelize.query('DELETE FROM "ProjectSnapshots" WHERE "projectId" = :projectId', { replacements: { projectId } }));

  await User.update({ isActive: false }, { where: { id: owner.user.id } });
  assert.equal((await request('/api/auth/me', { token: owner.token })).status, 401);
});
