# SecurePass — REST API Documentation (Role-Based Access Control)

The **SecurePass** backend runs on `http://localhost:5001` and provides role-separated endpoints for password policy evaluation, user registration, and authentication.

---

## Base URL
```
http://localhost:5001
```

---

## Endpoints Summary

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Root server status and API directory | Public |
| `GET` | `/api/health` | Health check and MongoDB Atlas status | Public |
| `POST` | `/api/auth/check` | Simple, user-friendly password strength & tips | Public |
| `POST` | `/api/auth/register` | Register new user (forces `user` role) | Public |
| `POST` | `/api/auth/user-login` | Dedicated Client User Login (checks password alone) | Public |
| `POST` | `/api/auth/admin-login` | Dedicated Company Administrator Login (validates admin credentials) | Public (Admin Creds) |
| `POST` | `/api/auth/login` | Unified authentication endpoint | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Authenticated (`user` or `admin`) |
| `POST` | `/api/auth/analyze` | Company technical DFA & Regex diagnostics | **Admin Only (`admin`)** |

---

## 1. Public Password Check (Normal User Interface)

### `POST /api/auth/check`
Used by normal users and visitors. Evaluates password strength, overall validity, and actionable recommendations.
**Guaranteed zero internal technical details** (no regex expressions, no DFA state progression, no transition tables).

#### Request Body
```json
{
  "password": "pass"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "isValid": false,
  "strength": "Weak",
  "passedRequirements": 1,
  "totalRequirements": 6,
  "requirements": [
    { "id": "length", "label": "At least 8 characters", "met": false },
    { "id": "upper", "label": "At least one uppercase letter (A-Z)", "met": false },
    { "id": "lower", "label": "At least one lowercase letter (a-z)", "met": true },
    { "id": "digit", "label": "At least one number (0-9)", "met": false },
    { "id": "special", "label": "At least one special character (!@#$%...)", "met": false },
    { "id": "whitespace", "label": "No spaces or whitespace", "met": true }
  ],
  "suggestions": [
    "Make your password at least 8 characters long.",
    "Add an uppercase letter (A-Z) to strengthen your password.",
    "Include at least one number (0-9).",
    "Include a special character (e.g. ! @ # $ %)."
  ]
}
```

---

## 2. Administrator-Only Technical Analysis (RBAC Protected)

### `POST /api/auth/analyze`
**Requires Administrator Authorization Header:** `Authorization: Bearer <admin_jwt_token>`

Returns deep technical diagnostics: Regex lookahead assertions, DFA product state vector, full transition history, trap state conditions, and formal 5-tuple parameters.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Request Body
```json
{
  "password": "SecurePass2026!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "authenticatedAdmin": {
    "id": "67415e4492652b041cfd192a",
    "email": "admin@securepass.local",
    "role": "admin"
  },
  "technicalAnalysis": {
    "passwordLength": 15,
    "regexResult": true,
    "dfaResult": true,
    "agreement": true,
    "isValid": true,
    "regexPattern": "/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:',.<>/?])[A-Za-z0-9!@#$%^&*()_+\\-=\\[\\]{};:',.<>/?]{8,}$/",
    "dfaState": "ACCEPT (q8_U1_L1_D1_S1)",
    "isTrap": false,
    "trapReason": null,
    "requirementsBreakdown": {
      "minLength": true,
      "hasUpper": true,
      "hasLower": true,
      "hasDigit": true,
      "hasSpecial": true,
      "noWhitespace": true,
      "onlyPermitted": true
    },
    "formalDefinition": {
      "statesCount": 145,
      "alphabetSize": 94,
      "startState": "q0_U0_L0_D0_S0",
      "acceptState": "q8_U1_L1_D1_S1",
      "trapState": "TRAP_REJECT"
    }
  }
}
```

#### Error Responses (RBAC Protection)

- **401 Unauthorized (Missing or Invalid Token)**:
  ```json
  {
    "success": false,
    "message": "Unauthorized: Missing or invalid authentication token"
  }
  ```
- **403 Forbidden (Non-Admin / Normal User)**:
  ```json
  {
    "success": false,
    "message": "Forbidden: Technical password analysis requires Administrator privileges"
  }
  ```

---

## 3. User Registration (Role Invariant)

### `POST /api/auth/register`
Creates a standard user account. Any `role` passed in the body is overridden and forced to `"user"`.

#### Request Body
```json
{
  "name": "Jane User",
  "email": "jane@example.com",
  "password": "SecurePass2026!",
  "role": "admin"
}
```

#### Success Response (`201 Created`)
*(Note: `role` is strictly assigned to `"user"` regardless of request input)*
```json
{
  "success": true,
  "message": "Registration successful! You can now log in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67415e4492652b041cfd192b",
    "name": "Jane User",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

## 4. User Login

### `POST /api/auth/login`
Authenticates credentials against MongoDB Atlas using `bcrypt.compare` and issues a signed 24-hour JWT token containing the user's verified role.

#### Request Body
```json
{
  "email": "admin@securepass.local",
  "password": "AdminSecurePass2026!"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67415e4492652b041cfd192a",
    "name": "System Administrator",
    "email": "admin@securepass.local",
    "role": "admin",
    "createdAt": "2026-11-23T04:00:00.000Z"
  }
}
```
