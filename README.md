# @blackbirdjs/cache

An asynchronous, Promise-wrapped IndexedDB caching engine for modern browsers, featuring native Redis-style TTL (Time-To-Live) expiration mechanics.

## Features

- ⚡ **Async/Await Ready:** Bridges the native event-driven IndexedDB API into standard modern Promises.
- ⏱️ **Automatic Eviction:** Self-cleaning architecture that purges expired keys from disk during read operations to save storage.
- 📦 **Zero Dependencies:** Pure JavaScript implementation that runs completely client-side.
- 🔒 **High Capacity:** Bypasses the strict 5MB quota limitation of `localStorage` to securely house gigabytes of structured objects.

## Installation

```bash
npm install @blackbirdjs/cache
```

## Usage

### 1. Initialization
Create an instance of the cache. If the database does not exist on the user's machine, the browser will configure it automatically on the fly.

```javascript
import { BlackbirdCache } from '@blackbirdjs/cache';

const cache = new BlackbirdCache('MyApplicationCache', 'api_store');
```

### 2. Set with TTL (Redis-style Expiration)
You can save plain values, arrays, or deeply nested objects directly without manually calling `JSON.stringify()`. Pass an optional third parameter to set an expiration window in seconds.

```javascript
// Permanent storage (survives page reloads indefinitely)
await cache.set('user:theme', 'dark');

// Expiring storage (automatically expires and deletes itself after 60 seconds)
const sessionToken = { token: 'xyz123', role: 'admin' };
await cache.set('user:session', sessionToken, 60);
```

### 3. Get with Auto-Eviction
Retrieve your cached object with standard asynchronous operations. If a key's expiration window has passed, the cache will instantly return `null` and silently delete the stale entry from the user's hard drive to free up space.

```javascript
const session = await cache.get('user:session');

if (session) {
  console.log('Valid session found:', session.role);
} else {
  console.log('Session has expired or does not exist.');
}
```

### 4. Explicit Deletion
Manually remove any single key out of your storage database block instantly.

```javascript
await cache.del('user:theme');
```

## API Reference

### `new BlackbirdCache(databaseName, storeName)`
- `databaseName` *(String)*: The browser IndexedDB file group name. Defaults to `'BlackbirdCacheDB'`.
- `storeName` *(String)*: The underlying table/bucket layout name. Defaults to `'cache_store'`.

### `set(key, value, ttlInSeconds)`
- `key` *(String)*: The unique look-up string.
- `value` *(any)*: Any structural JavaScript data payload (Objects, Arrays, Booleans, etc.).
- `ttlInSeconds` *(Number)*: Optional. Time until data automatically expires.

### `get(key)`
- Returns a Promise resolving to the stored payload value, or `null` if the key is missing or expired.

### `del(key)`
- Returns a Promise resolving to `true` once the target entry is erased from disk.

## License

Distributed under the Apache License 2.0. See `LICENSE` for details.
