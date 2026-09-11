import { vi, describe, test, expect, beforeEach } from 'vitest';
import { BlackbirdCache } from '../src/cache.js';

// Explicitly anchor fake-indexeddb onto global memory space before tests start
import fakeIndexedDB, { IDBObjectStore } from 'fake-indexeddb';
globalThis.indexedDB = fakeIndexedDB;

describe('BlackbirdCache Test Suite', () => {
  let cache;

  beforeEach(() => {
    // Create a totally random, unique database name for every single test block
    cache = new BlackbirdCache('TestDB_' + Math.random(), 'test_score');
  });

  // TEST CASE #1
  test('should store and retrieve complex objects sucessfully', async () => {
    const payload = { id: 101, username: 'blackbird_user', 'permissions': ['read', 'write'] };

    // Run the async store operation
    await cache.set('user:session', payload);

    // Fetch the data
    const cachedData = await cache.get('user:session');

    // Verify that the retrieved object matches the original object exactly
    expect(cachedData).toEqual(payload);
  });

  // TEST CASE #2
  test('should return null for non-existent keys', async () => {
    const data = await cache.get('invalid_key');
    expect(data).toBeNull();
  });

  // TEST CASE #3
  test('should delete keys successfully using del()', async () => {
    await cache.set('temp_key', 'some_value');
    await cache.del('temp_key'); // Erase it from disk

    const data = await cache.get('temp_key');
    expect(data).toBeNull();
  });

  // TEST CASE #4
  test('should evict expired keys automatically when TTL lapses', async () => {
    // Seed the item to disk with a strict 1-second TTL expiration window
    await cache.set('expires_fast', 'speed_of_light', 1);

    const immediateData = await cache.get('expires_fast');
    expect(immediateData).toBe('speed_of_light');

    // SPY DIRECTLY ON THE BROWSER DATABASE ENGINE
    // Every delete action calls IDBObjectStore.prototype.delete natively.
    const nativeDeleteSpy = vi.spyOn(IDBObjectStore.prototype, 'delete');

    // Fast-forward past the 1-second storage expiration threshold
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Trigger the retrieval loop (which internally kicks off the background delete)
    const expiredData = await cache.get('expires_fast');
    expect(expiredData).toBeNull();

    // Flush the microtask queue to let the background database write finish
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Assert that the browser database engine itself was told to delete the key
    expect(nativeDeleteSpy).toHaveBeenCalledWith('expires_fast');

    // Clean up the native database spy
    nativeDeleteSpy.mockRestore();
  });
});
