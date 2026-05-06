# FB-Post Microservice — API Documentation

## Base URL

```
http://localhost:3000
```

Change `PORT` in `.env` to change the port.

---

## 1. Health Check

**GET** `/api/health`

Check if the service is running.

**Request:**
```
GET http://localhost:3000/api/health
```

**Response (200):**
```json
{
  "status": "healthy",
  "uptime": 45,
  "timestamp": "2026-05-06T14:00:00.000Z"
}
```

---

## 2. Post to Facebook (Main Endpoint)

**POST** `/api/post`

Posts an image + caption to your Facebook Page.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://example.com/my-image.jpg",
  "caption": "Hello from my API! #test"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageUrl` | string | Yes | Direct URL of the image. Must be publicly accessible. Max 2048 chars. |
| `caption` | string | No | Text caption for the post. Max 5000 chars. |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "postId": "123456789_987654321",
    "postUrl": "https://facebook.com/123456789_987654321",
    "postedAt": "2026-05-06T14:05:30.000Z"
  }
}
```

**Error Response (400) — Facebook API Error:**
```json
{
  "success": false,
  "error": {
    "code": "FACEBOOK_API_ERROR",
    "message": "(#100) Invalid image URL"
  }
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json" \
  -d "{\"imageUrl\":\"https://example.com/image.jpg\",\"caption\":\"Test post\"}"
```

### Postman:
- Method: `POST`
- URL: `http://localhost:3000/api/post`
- Body → raw → JSON:
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Test post"
}
```

---

## 3. Validate Facebook Token

**POST** `/api/validate`

Tests if your Facebook credentials (page ID + access token) are valid.

**Request:**
```
POST http://localhost:3000/api/validate
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pageName": "My Awesome Page",
    "pageId": "123456789"
  }
}
```

**Error Response (500) — Invalid Token:**
```json
{
  "success": false,
  "error": {
    "code": "FACEBOOK_TOKEN_INVALID",
    "message": "Error validating access token"
  }
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/validate
```

---

## 4. Validation Errors (Bad Request)

If you send invalid data to `POST /api/post`:

**Missing imageUrl (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "imageUrl",
        "message": "\"Image URL\" is required"
      }
    ]
  }
}
```

**Invalid URL format (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "imageUrl",
        "message": "\"Image URL\" must be a valid URL"
      }
    ]
  }
}
```

---

## 5. Rate Limiting

- Default: **100 requests per 15 minutes** per IP
- Change via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` in `.env`

**Rate Limited Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## 6. Unknown Route (404)

```
GET http://localhost:3000/api/unknown
```

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route GET /api/unknown not found"
  }
}
```

---

## Quick Test Flow

```
1. Start server:
   npm start

2. Check health:
   curl http://localhost:3000/api/health

3. Validate token (before posting):
   curl -X POST http://localhost:3000/api/validate

4. Post to Facebook:
   curl -X POST http://localhost:3000/api/post \
     -H "Content-Type: application/json" \
     -d "{\"imageUrl\":\"YOUR_IMAGE_URL\",\"caption\":\"Your caption here\"}"
```
