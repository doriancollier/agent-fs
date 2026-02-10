---
paths: src/app/api/**/*.ts
---

# API Route Handler Rules

These rules apply to all API route handlers in the Next.js App Router.

## When to Use API Routes

Only create API routes for:
- Webhooks (Stripe, GitHub, external services)
- Mobile app backends (external clients)
- Third-party integrations requiring HTTP
- GET requests that benefit from HTTP caching
- Streaming responses (SSE)

For internal UI mutations, prefer Server Actions instead.

## Required Patterns

### Input Validation

Always validate request body with Zod before processing:

```typescript
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = createUserSchema.safeParse(body)

  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  // Use result.data (typed and validated)
}
```

### Error Handling

Return consistent error responses:

```typescript
// Success
return Response.json(data, { status: 200 })
return Response.json(created, { status: 201 })

// Client errors
return Response.json({ error: 'Validation failed' }, { status: 400 })
return Response.json({ error: 'Unauthorized' }, { status: 401 })
return Response.json({ error: 'Not found' }, { status: 404 })

// Server errors
return Response.json({ error: 'Internal server error' }, { status: 500 })
```

### Use DAL Functions

Never call Prisma directly in route handlers:

```typescript
// WRONG
import { prisma } from '@/lib/prisma'
const user = await prisma.user.findUnique({ where: { id } })

// CORRECT
import { getUserById } from '@/layers/entities/user'
const user = await getUserById(id)
```

### Async Request APIs (Next.js 16)

Remember that request APIs are async:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // Must await
  // ...
}
```

## Security Checklist

- [ ] Validate all input with Zod
- [ ] Use DAL functions (auth checks built-in)
- [ ] Return appropriate status codes
- [ ] Don't expose internal error details to clients
- [ ] Rate limit sensitive endpoints (auth, payments)
