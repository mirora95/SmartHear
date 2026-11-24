import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { GoogleGenAI } from '@google/genai';
import { classifySound } from '../src/lib/gemini.ts';

// Intercept before the SDK's HTTP request, with fetch disabled as an extra guard.
const requestPrototype = Object.getPrototypeOf(Reflect.get(new GoogleGenAI({ apiKey: 'test-only' }).models, 'apiClient'));
const originalKey = process.env.GEMINI_API_KEY;
beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-only';
  mock.method(globalThis, 'fetch', async () => { throw new Error('Network disabled in classification tests'); });
});
afterEach(() => {
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  mock.restoreAll();
});

function respond(text: string | undefined) {
  return mock.method(requestPrototype, 'request', async () => new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text }] } }],
  }), { headers: { 'content-type': 'application/json' } }));
}

for (const label of ['baby crying', 'dog barking', 'siren', 'alarm', 'door knock', 'human speech', 'loud noise', 'quiet']) {
  test(`accepts and normalizes supported label: ${label}`, async () => {
    const request = respond(`  ${label.toUpperCase()}\n`);
    assert.equal(await classifySound(10, [0]), label);
    assert.equal(request.mock.callCount(), 1);
  });
}

for (const text of ['fire', '{"label":"alarm"}', 'alarm or siren']) {
  for (const sample of [{ db: 10, freq: [0], expected: 'quiet' }, { db: 90, freq: [255], expected: 'alarm' }]) {
    test(`uses the sample's fallback for unsupported response ${text} at ${sample.db}`, async () => {
      const request = respond(text);
      assert.equal(await classifySound(sample.db, sample.freq), sample.expected);
      assert.equal(request.mock.callCount(), 1);
    });
  }
}

for (const text of ['', undefined]) {
  test(`uses fallback for ${text === undefined ? 'missing' : 'empty'} response text`, async () => {
    const request = respond(text);
    assert.equal(await classifySound(90, [255]), 'alarm');
    assert.equal(request.mock.callCount(), 1);
  });
}

test('uses fallback when the provider request fails', async () => {
  mock.method(console, 'error', () => {});
  const request = mock.method(requestPrototype, 'request', async () => { throw new Error('Synthetic provider failure'); });
  assert.equal(await classifySound(90, [255]), 'alarm');
  assert.equal(request.mock.callCount(), 1);
});

test('uses local fallback without calling the provider when no key is configured', async () => {
  process.env.GEMINI_API_KEY = '';
  const request = respond('siren');
  assert.equal(await classifySound(90, [255]), 'alarm');
  assert.equal(request.mock.callCount(), 0);
});
