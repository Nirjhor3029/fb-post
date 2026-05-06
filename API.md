# FB-Post Microservice — API Documentation

## Base URL

```
http://localhost:3000
```

Change `PORT` in `.env` to change the port.

---

## Environment Variables

Add to `.env` before running:

```
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_ACCESS_TOKEN=your_access_token
FACEBOOK_API_VERSION=v18.0
MONGODB_URI=mongodb://localhost:27017/fb-post
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## Section A: Direct Facebook Posting

### 1. Health Check

**GET** `/api/health`

Check if the service is running.

**Response (200):**
```json
{
  "status": "healthy",
  "uptime": 45,
  "timestamp": "2026-05-06T14:00:00.000Z"
}
```

---

### 2. Post to Facebook (Direct)

**POST** `/api/post`

Posts an image + caption to your Facebook Page immediately.

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

---

### 3. Validate Facebook Token

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

## Section B: Scheduled Posts (MongoDB)

### Post Model Structure

```json
{
  "post_text": "string (max 5000 chars)",
  "post_image": "string (required, max 2048 chars)",
  "scheduled_at": "Date or null",
  "is_posted": "0 or 1 (default: 0)",
  "posted_at": "Date or null",
  "created_at": "Date (auto-generated)",
  "updated_at": "Date (auto-updated)"
}
```

---

### 4. Create Scheduled Post

**POST** `/api/scheduled-posts/schedule`

Creates a new post in the database. It will NOT be posted immediately — use the process-next endpoint to post it later.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "post_image": "https://example.com/my-image.jpg",
  "post_text": "This will be posted when I trigger it!",
  "scheduled_at": "2026-05-07T10:00:00.000Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `post_image` | string | Yes | Direct URL of the image. Must be publicly accessible. Max 2048 chars. |
| `post_text` | string | No | Text caption for the post. Max 5000 chars. |
| `scheduled_at` | Date (ISO string) | No | Optional future date/time for scheduling. Must be in the future if provided. |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "post_text": "This will be posted when I trigger it!",
    "post_image": "https://example.com/my-image.jpg",
    "scheduled_at": "2026-05-07T10:00:00.000Z",
    "is_posted": 0,
    "posted_at": null,
    "created_at": "2026-05-06T14:00:00.000Z",
    "updated_at": "2026-05-06T14:00:00.000Z"
  }
}
```

**Error Response (400) — Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "post_image",
        "message": "\"Post image URL\" is required"
      }
    ]
  }
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/scheduled-posts/schedule \
  -H "Content-Type: application/json" \
  -d "{\"post_image\":\"https://example.com/image.jpg\",\"post_text\":\"Hello from scheduled post!\"}"
```

---

### 5. Process Next Scheduled Post

**GET** `/api/scheduled-posts/process-next`

Fetches the first unposted post (`is_posted=0`) from the database, posts it to Facebook, and updates `is_posted=1`, `posted_at`, and `updated_at`.

**Request:**
```
GET http://localhost:3000/api/scheduled-posts/process-next
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "postId": "123456789_987654321",
    "postUrl": "https://facebook.com/123456789_987654321",
    "postedAt": "2026-05-06T14:10:00.000Z",
    "post": {
      "_id": "507f191e810c19729de860ea",
      "post_text": "This was posted!",
      "post_image": "https://example.com/my-image.jpg",
      "scheduled_at": null,
      "is_posted": 1,
      "posted_at": "2026-05-06T14:10:00.000Z",
      "created_at": "2026-05-06T13:00:00.000Z",
      "updated_at": "2026-05-06T14:10:00.000Z"
    }
  }
}
```

**Response — No Pending Posts (200):**
```json
{
  "success": false,
  "error": {
    "code": "NO_PENDING_POSTS",
    "message": "No pending posts found"
  }
}
```

**Error Response (400) — Facebook API Error:**
```json
{
  "success": false,
  "error": {
    "code": "FACEBOOK_API_ERROR",
    "message": "(#100) Invalid image URL",
    "details": {
      "code": 100,
      "type": "OAuthException",
      "message": "(#100) Invalid image URL"
    }
  }
}
```

### cURL Example:
```bash
curl http://localhost:3000/api/scheduled-posts/process-next
```

---

### 6. Get All Scheduled Posts

**GET** `/api/scheduled-posts/all`

List all posts with pagination and optional filtering.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page |
| `is_posted` | number | No | - | Filter by posted status (0 or 1) |

**Request Examples:**
```
GET http://localhost:3000/api/scheduled-posts/all
GET http://localhost:3000/api/scheduled-posts/all?page=1&limit=5
GET http://localhost:3000/api/scheduled-posts/all?is_posted=0
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "507f191e810c19729de860ea",
        "post_text": "Hello world!",
        "post_image": "https://example.com/image.jpg",
        "scheduled_at": null,
        "is_posted": 0,
        "posted_at": null,
        "created_at": "2026-05-06T13:00:00.000Z",
        "updated_at": "2026-05-06T13:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### cURL Example:
```bash
curl http://localhost:3000/api/scheduled-posts/all?page=1&limit=5
```

---

### 7. Get Single Post

**GET** `/api/scheduled-posts/:id`

Get a single post by its MongoDB ID.

**Request:**
```
GET http://localhost:3000/api/scheduled-posts/507f191e810c19729de860ea
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "post_text": "Hello world!",
    "post_image": "https://example.com/image.jpg",
    "scheduled_at": null,
    "is_posted": 0,
    "posted_at": null,
    "created_at": "2026-05-06T13:00:00.000Z",
    "updated_at": "2026-05-06T13:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post not found"
  }
}
```

### cURL Example:
```bash
curl http://localhost:3000/api/scheduled-posts/507f191e810c19729de860ea
```

---

### 8. Delete Post

**DELETE** `/api/scheduled-posts/:id`

Delete a post by its MongoDB ID.

**Request:**
```
DELETE http://localhost:3000/api/scheduled-posts/507f191e810c19729de860ea
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post not found"
  }
}
```

### cURL Example:
```bash
curl -X DELETE http://localhost:3000/api/scheduled-posts/507f191e810c19729de860ea
```

---

## Section C: Common Responses

### Validation Errors (Bad Request)

If you send invalid data to any endpoint:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "post_image",
        "message": "\"Post image URL\" is required"
      }
    ]
  }
}
```

---

### Rate Limiting

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

### Unknown Route (404)

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

### Internal Server Error (500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong"
  }
}
```

---

## Quick Test Flow

### Direct Posting Flow
```
1. Start server:
   npm start

2. Check health:
   curl http://localhost:3000/api/health

3. Validate token (before posting):
   curl -X POST http://localhost:3000/api/validate

4. Post to Facebook directly:
   curl -X POST http://localhost:3000/api/post \
     -H "Content-Type: application/json" \
     -d "{\"imageUrl\":\"YOUR_IMAGE_URL\",\"caption\":\"Your caption here\"}"
```

### Scheduled Posting Flow
```
1. Start server:
   npm start

2. Create a scheduled post:
   curl -X POST http://localhost:3000/api/scheduled-posts/schedule \
     -H "Content-Type: application/json" \
     -d "{\"post_image\":\"YOUR_IMAGE_URL\",\"post_text\":\"Your caption here\"}"

3. Check pending posts (optional):
   curl "http://localhost:3000/api/scheduled-posts/all?is_posted=0"

4. Trigger the next post (posts to FB + marks as posted):
   curl http://localhost:3000/api/scheduled-posts/process-next
```
