I will implement the login/registration interfaces, encapsulate the response tools, and verify the functionality by creating a local test script.

## 1. Environment & Dependencies
- **Install `dotenv`**: Essential for loading environment variables in local test scripts (fixing the `test-db.ts` error).
- **Verify Database Connection**: Re-run `test-db.ts` to ensure the new Prisma 7 + MariaDB adapter configuration works correctly.

## 2. Universal API Response & Validation
- **Encapsulate Response Logic**: Ensure `src/lib/api-response.ts` is robust and consistently used.
- **Request Validation**: Add `Content-Type: application/json` checks to `register` and `login` routes to prevent the `SyntaxError` (unexpected token 'u') seen in your logs.

## 3. Auth API Implementation & Refinement
- **Register API**: Verify input validation, password hashing (Argon2), and duplicate user checks.
- **Login API**: Verify credential checking and JWT token generation.
- **User Tools**: Ensure `hashPassword`, `verifyPassword`, `signToken`, etc., are properly encapsulated in `src/lib/auth.ts`.

## 4. Verification (Debug until pass)
- **Create `scripts/test-auth-flow.ts`**: A standalone script to simulate the entire auth flow without needing the browser:
    1.  **Register** a new user.
    2.  **Login** with the new user to get a token.
    3.  **Validate** the response format matches the universal structure (code, message, data).
- **Execute & Fix**: Run this script and fix any issues until the flow passes completely.
