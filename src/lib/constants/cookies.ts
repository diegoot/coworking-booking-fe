/**
 * Cookie names shared between the login Route Handler (which sets them),
 * the server-side session reader, and the logout Server Action (which
 * clears them). Centralized here so all three stay in sync.
 */
export const SESSION_TOKEN_COOKIE = "session_token";
export const SESSION_USER_COOKIE = "session_user";
