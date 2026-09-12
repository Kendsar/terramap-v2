export const DEFAULT_REDIRECT = '/';

/**
 * Resolves the `?redirect=` parameter of the full-page auth flow to a safe
 * in-app destination. Anything that is not a relative path (protocol-relative
 * or absolute URLs) is rejected to avoid open redirects.
 */
export function resolveAuthRedirect(redirect: string | null): string {
  if (!redirect) return DEFAULT_REDIRECT;

  // Legacy value produced before listing had a real destination; it used to 404 on /list.
  if (redirect === 'list') return '/map?action=list';

  if (!redirect.startsWith('/') || redirect.startsWith('//')) return DEFAULT_REDIRECT;

  return redirect;
}
