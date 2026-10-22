import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { AudioMonitor } from '../src/lib/audio.ts';

const globalNames = ['navigator', 'AudioContext', 'requestAnimationFrame', 'cancelAnimationFrame'] as const;
const originalGlobals = globalNames.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);

afterEach(() => {
  for (const [name, descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  mock.restoreAll();
});

function setGlobal(name: typeof globalNames[number], value: unknown) {
  Object.defineProperty(globalThis, name, { configurable: true, value });
}

function installMicrophone() {
  const stopTrack = mock.fn();
  setGlobal('navigator', {
    mediaDevices: {
      getUserMedia: () => Promise.resolve({ getTracks: () => [{ stop: stopTrack }] }),
    },
  });
  mock.method(console, 'error', () => {});
  return stopTrack;
}

test('releases the microphone when AudioContext construction fails', async () => {
  const stopTrack = installMicrophone();
  const failure = new Error('Audio context unavailable');
  setGlobal('AudioContext', class {
    constructor() { throw failure; }
  });

  await assert.rejects(new AudioMonitor().start(() => {}), error => error === failure);

  assert.equal(stopTrack.mock.callCount(), 1);
});

test('releases the stream, source, and context when connection fails', async () => {
  const stopTrack = installMicrophone();
  const disconnect = mock.fn();
  const closeContext = mock.fn(() => Promise.resolve());
  const failure = new Error('Source connection failed');
  setGlobal('AudioContext', class {
    createAnalyser() { return {}; }
    createMediaStreamSource() {
      return { connect() { throw failure; }, disconnect };
    }
    close = closeContext;
  });

  await assert.rejects(new AudioMonitor().start(() => {}), error => error === failure);

  assert.equal(stopTrack.mock.callCount(), 1);
  assert.equal(disconnect.mock.callCount(), 1);
  assert.equal(closeContext.mock.callCount(), 1);
});

test('keeps successful monitoring active until explicitly stopped', async () => {
  const stopTrack = installMicrophone();
  const disconnect = mock.fn();
  const closeContext = mock.fn(() => Promise.resolve());
  const cancelFrame = mock.fn();
  setGlobal('AudioContext', class {
    createAnalyser() {
      return {
        frequencyBinCount: 2,
        getByteFrequencyData(data: Uint8Array) { data.set([0, 255]); },
      };
    }
    createMediaStreamSource() { return { connect() {}, disconnect }; }
    close = closeContext;
  });
  setGlobal('requestAnimationFrame', () => 1);
  setGlobal('cancelAnimationFrame', cancelFrame);
  const onData = mock.fn();
  const monitor = new AudioMonitor();

  await monitor.start(onData);

  assert.deepEqual(onData.mock.calls[0].arguments, [50, [0, 255]]);
  assert.equal(stopTrack.mock.callCount(), 0);
  assert.equal(closeContext.mock.callCount(), 0);

  monitor.stop();

  assert.equal(stopTrack.mock.callCount(), 1);
  assert.equal(disconnect.mock.callCount(), 1);
  assert.equal(closeContext.mock.callCount(), 1);
  assert.deepEqual(cancelFrame.mock.calls[0].arguments, [1]);
});
