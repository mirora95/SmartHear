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

function installAudioContext() {
  const disconnect = mock.fn();
  const closeContext = mock.fn(() => Promise.resolve());
  const cancelFrame = mock.fn();
  const createContext = mock.fn();
  setGlobal('AudioContext', class {
    constructor() { createContext(); }
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
  return { disconnect, closeContext, cancelFrame, createContext };
}

test('keeps successful monitoring active until explicitly stopped', async () => {
  const stopTrack = installMicrophone();
  const { disconnect, closeContext, cancelFrame } = installAudioContext();
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

test('releases late microphone permission after stop without starting audio', async () => {
  const stopTrack = mock.fn();
  let grant!: (stream: MediaStream) => void;
  setGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise<MediaStream>(resolve => { grant = resolve; }) } });
  const { createContext } = installAudioContext();
  const onData = mock.fn();
  const monitor = new AudioMonitor();

  const startup = monitor.start(onData);
  monitor.stop();
  grant({ getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream);
  const started = await startup;

  assert.equal(stopTrack.mock.callCount(), 1);
  assert.equal(createContext.mock.callCount(), 0);
  assert.equal(onData.mock.callCount(), 0);
  assert.equal(started, false);
});

for (const rejects of [false, true]) {
  test(`obsolete permission ${rejects ? 'rejection' : 'grant'} does not interrupt a newer monitor`, async () => {
    const oldStop = mock.fn();
    const currentStop = mock.fn();
    let grantOld!: (stream: MediaStream) => void;
    let rejectOld!: (error: Error) => void;
    let requests = 0;
    setGlobal('navigator', { mediaDevices: { getUserMedia: () => ++requests === 1
      ? new Promise<MediaStream>((resolve, reject) => { grantOld = resolve; rejectOld = reject; })
      : Promise.resolve({ getTracks: () => [{ stop: currentStop }] }) } });
    const { createContext, closeContext } = installAudioContext();
    const oldData = mock.fn();
    const currentData = mock.fn();
    const monitor = new AudioMonitor();

    const obsoleteStartup = monitor.start(oldData);
    const currentStarted = await monitor.start(currentData);
    if (rejects) rejectOld(new Error('Old permission denied'));
    else grantOld({ getTracks: () => [{ stop: oldStop }] } as unknown as MediaStream);
    const obsoleteStarted = await obsoleteStartup;

    assert.equal(oldStop.mock.callCount(), rejects ? 0 : 1);
    assert.equal(currentStop.mock.callCount(), 0);
    assert.equal(closeContext.mock.callCount(), 0);
    assert.equal(createContext.mock.callCount(), 1);
    assert.equal(oldData.mock.callCount(), 0);
    assert.equal(currentData.mock.callCount(), 1);
    assert.equal(currentStarted, true);
    assert.equal(obsoleteStarted, false);
    monitor.stop();
    assert.equal(currentStop.mock.callCount(), 1);
  });
}

test('restarting an active monitor releases its previous resources', async () => {
  const stopTrack = installMicrophone();
  const { closeContext, cancelFrame } = installAudioContext();
  const monitor = new AudioMonitor();

  await monitor.start(() => {});
  await monitor.start(() => {});

  assert.equal(stopTrack.mock.callCount(), 1);
  assert.equal(closeContext.mock.callCount(), 1);
  assert.equal(cancelFrame.mock.callCount(), 1);
  monitor.stop();
  assert.equal(stopTrack.mock.callCount(), 2);
});
