import { fail, redirect } from '@sveltejs/kit';
import { getUserRole } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

const ADMIN_HOME = '/admin/dashboard';

/**
 * Hanya izinkan redirect ke path internal supaya `redirectTo` tidak bisa
 * dipakai sebagai open redirect.
 */
function safeRedirect(target: unknown): string {
	if (typeof target !== 'string') return ADMIN_HOME;
	if (!target.startsWith('/') || target.startsWith('//')) return ADMIN_HOME;
	return target;
}

export const load: PageServerLoad = async ({ url }) => {
	return {
		redirectTo: safeRedirect(url.searchParams.get('redirectTo'))
	};
};

export const actions = {
	// Form action default: POST /login
	login: async (event) => {
		const form = await event.request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const redirectTo = safeRedirect(form.get('redirectTo'));

		if (!email || !password) {
			return fail(400, { message: 'Email dan password wajib diisi.', email });
		}

		const { data, error } = await event.locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error || !data.user) {
			console.error('[login] gagal masuk:', error?.message);
			return fail(400, { message: 'Email atau password salah.', email });
		}

		const role = await getUserRole(data.user.id);

		if (role !== 'admin') {
			// Akun non-admin tidak boleh menyimpan sesi aktif di server.
			await event.locals.supabase.auth.signOut();
			return fail(403, { message: 'Akses ditolak. Khusus Admin.', email });
		}

		redirect(303, redirectTo);
	}
} satisfies Actions;
