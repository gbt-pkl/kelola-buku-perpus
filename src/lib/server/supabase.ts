import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { dev } from '$app/environment';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { UserRole } from '$lib/auth';

/**
 * Client dengan service-role key. Hanya boleh dipakai di server (form action,
 * load server, API handler) karena key ini melewati Row Level Security.
 * Jangan pernah mengimpornya dari kode yang berjalan di browser.
 */
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
});

/**
 * Client per-request yang memakai anon key dan menyimpan sesi di cookie.
 *
 * Sengaja `httpOnly: true` supaya token tidak bisa dibaca JavaScript
 * (DoD: session di HttpOnly cookie, bukan localStorage), dan `secure` dimatikan
 * saat development agar cookie tetap tersimpan di http://localhost.
 */
export function createSupabaseServerClient(event: RequestEvent): SupabaseClient {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookieOptions: {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			secure: !dev
		},
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				for (const { name, value, options } of cookiesToSet) {
					if (value === '') {
						// Nilai kosong = penghapusan cookie sesi (mis. saat signOut).
						event.cookies.delete(name, { path: options.path ?? '/' });
						continue;
					}

					event.cookies.set(name, value, { ...options, path: options.path ?? '/' });
				}
			}
		}
	});
}

/**
 * Ambil role user dari tabel `profiles`.
 *
 * Dibaca lewat service-role client supaya hasil tidak bergantung pada RLS policy
 * tabel `profiles`. Row yang tidak ada berarti akun belum diberi role, dan
 * dianggap bukan admin.
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
	const { data, error } = await supabaseAdmin
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error('[supabase] gagal membaca role dari profiles:', error.message);
		return null;
	}

	return (data?.role as UserRole | undefined) ?? null;
}
