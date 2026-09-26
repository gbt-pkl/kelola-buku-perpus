import { error, redirect, type Handle } from '@sveltejs/kit';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createSupabaseServerClient, getUserRole } from '$lib/server/supabase';

const ADMIN_AREA = '/admin';
const LOGIN_PATH = '/login';
const ADMIN_HOME = '/admin/dashboard';

function isAdminArea(pathname: string): boolean {
	return pathname === ADMIN_AREA || pathname.startsWith(`${ADMIN_AREA}/`);
}

/**
 * Verifikasi sesi dari cookie. `getUser()` memvalidasi token ke Supabase Auth
 * server, jadi user di `locals` tidak bisa dipalsukan dari sisi client.
 */
async function resolveUser(supabase: SupabaseClient): Promise<User | null> {
	try {
		const { data, error: authError } = await supabase.auth.getUser();

		if (authError) {
			// Pengunjung anonim adalah kondisi normal, bukan error.
			if (authError.name !== 'AuthSessionMissingError') {
				console.error('[hooks] sesi tidak valid:', authError.message);
			}

			return null;
		}

		return data.user ?? null;
	} catch (cause) {
		// Credential Supabase yang salah/placeholder tidak boleh menjatuhkan request.
		console.error('[hooks] gagal memverifikasi sesi:', cause);
		return null;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createSupabaseServerClient(event);
	event.locals.supabase = supabase;
	event.locals.user = await resolveUser(supabase);
	event.locals.role = event.locals.user ? await getUserRole(event.locals.user.id) : null;

	const { pathname, search } = event.url;

	if (isAdminArea(pathname)) {
		if (!event.locals.user) {
			const target = `${pathname}${search}`;
			redirect(303, `${LOGIN_PATH}?redirectTo=${encodeURIComponent(target)}`);
		}

		if (event.locals.role !== 'admin') {
			error(403, 'Unauthorized Access');
		}
	}

	if (pathname === LOGIN_PATH && event.locals.role === 'admin') {
		redirect(303, ADMIN_HOME);
	}

	return resolve(event);
};
