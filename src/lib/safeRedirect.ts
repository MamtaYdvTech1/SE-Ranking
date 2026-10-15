/**
 * Returns `target` only if it is a same-site path ("/projects?x=1"); otherwise `fallback`.
 * Rejects absolute URLs, "javascript:" and other schemes, protocol-relative "//host" and
 * "/\host", and control characters — all of which could send a user off-site after login.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = '/projects'): string {
  if (!target) return fallback;
  if (!/^\/(?![/\\])/.test(target)) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(target)) return fallback;
  return target;
}
