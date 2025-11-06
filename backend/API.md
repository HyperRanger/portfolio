# Portfolio Backend API Documentation

## Authentication

### Sign In

- **POST** `/api/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "string"
  }
  ```

### Bootstrap Admin User

- **POST** `/api/admin/bootstrap`
- **Headers**:
  - `Content-Type: application/json`
  - `x-bootstrap-secret: string`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "email": "string"
        // ... other user data
      }
    }
  }
  ```

## Projects

### Get All Projects

- **GET** `/api/projects`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "projects": [
        {
          "id": "number",
          "title": "string",
          "description": "string",
          "image": "string",
          "technologies": ["string"],
          "github": "string",
          "live": "string",
          "created_at": "string",
          "updated_at": "string"
        }
      ]
    }
  }
  ```

### Create Project

- **POST** `/api/admin/project`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "image": "string",
    "technologies": ["string"],
    "github": "string",
    "live": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "number"
      // ... project data
    }
  }
  ```

### Update Project

- **PUT** `/api/admin/project/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Parameters**: `id: number`
- **Body**: Same as Create Project
- **Response**: Same as Create Project

### Delete Project

- **DELETE** `/api/admin/project/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `id: number`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      // deleted project data
    }
  }
  ```

## Contact Form

### Submit Contact Form

- **POST** `/api/contact`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Message sent successfully!"
  }
  ```

## Health Check

### Get Server Status

- **GET** `/api/health`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Server is running",
    "timestamp": "string"
  }
  ```

## Rate Limiting

All endpoints are protected by rate limiting:

- General API: 100 requests per 15 minutes
- Contact Form: 5 submissions per hour
- Login/Bootstrap: 10 attempts per 15 minutes

## Error Responses

Standard error response format:

```json
{
  "success": false,
  "message": "string",
  "errors": [] // optional validation errors
}
```

Common HTTP status codes:

- 400: Bad Request (invalid input)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error
