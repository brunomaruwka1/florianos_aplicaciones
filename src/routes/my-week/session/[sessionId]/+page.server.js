import { error as kitError, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
  const session = locals.session;
  if (!session) throw redirect(303, '/login');

  const sessionId = params.sessionId;

  if (!sessionId || sessionId === 'undefined') {
    throw kitError(400, 'Brak sessionId w URL');
  }

  return {
    sessionId
  };
}
