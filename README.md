# elysia-versioning

A lightweight and flexible versioning plugin for **ElysiaJS**.  
Easily manage multiple API versions using URI, query, header, or custom strategies.

## Installation

```bash
bun add @gradienttim/elysia-versioning
```

## Quick Start

A simple example using **URI-based versioning**:

```typescript
import { Elysia } from 'elysia'
import versioning from '@gradienttim/elysia-versioning'

const v1 = new Elysia()
  .get('', () => 'Version 1')

const v2 = new Elysia()
  .get('', () => 'Version 2')

new Elysia()
  .use(versioning({
    versions: {
      '1': v1,
      '2': v2,
    },
  }))
  .listen(3000)

// GET http://localhost:3000/   -> Version 1
// GET http://localhost:3000/v1 -> Version 1
// GET http://localhost:3000/v2 -> Version 2
```

## Versioning Strategies

You can configure different strategies to determine which API version to serve.

### 1. URI Strategy (default)

Adds the version directly to the request path.

```typescript
new Elysia()
  .use(versioning({
    prefix: 'v', // optional, default set to 'v'
    strategy: { type: 'URI' }, // optional, default set to 'URI'
    versions: { '1': v1, '2': v2 },
  }))
  .listen(3000)

// GET http://localhost:3000/ -> v1
// GET http://localhost:3000/v1 -> v1
// GET http://localhost:3000/v2 -> v2
```

---

### 2. Query Strategy

Determines the version from a query parameter (e.g., `?version=2`).

```typescript
new Elysia()
  .use(versioning({
    strategy: {
      type: 'QUERY',
      queryName: 'version', // optional, default set to 'options.prefix'
    },
    versions: { '1': v1, '2': v2 },
    defaultVersion: '1',
  }))
  .listen(3000)

// GET /?version=1 -> v1
// GET /?version=2 -> v2
// GET /           -> v1 (default)
```

---

### 3. Header Strategy

Determines the version using a request header (e.g., `X-API-Version: 2`).

```typescript
new Elysia()
  .use(versioning({
    strategy: {
      type: 'HEADER',
      headerName: 'X-API-Version', // optional, default set to 'X-Version'
    },
    versions: { '1': v1, '2': v2 },
  }))
  .listen(3000)

// curl -H "X-API-Version: 1" http://localhost:3000 -> v1
// curl -H "X-API-Version: 2" http://localhost:3000 -> v2
```

---

### 4. Custom Strategy

Provide your own logic to extract version information from the request.

```typescript
new Elysia()
  .use(versioning({
    strategy: {
      type: 'CUSTOM', 
      extract: (request, options) => {
        const refererHeader = request.headers.get('Referer')
        if (refererHeader && refererHeader === 'http://v1.example.com') {
          return options.versions['1']!!
        }
        return options.versions['2']!!
      },
    },
    versions: { '1': v1, '2': v2 },
  }))
  .listen(3000)

// curl -H "Referer: http://v1.example.com" http://localhost:3000 -> v1
// curl http://localhost:3000 -> v2
```

## License

This project is licensed under the [MIT License](./LICENSE).
