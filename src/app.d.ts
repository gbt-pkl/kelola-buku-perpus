import type { SupabaseClient, User } from '@supabase/supabase-js';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			/** Client Supabase per-request (anon key + cookie sesi). */
			supabase: SupabaseClient;
			/** User aktif hasil verifikasi token, `null` kalau belum login. */
			user: User | null;
			/** Role dari tabel `profiles` ('admin' | 'user'), `null` kalau tidak ada. */
			role: string | null;
		}

		interface PageData {
			user: { id: string; email: string | null } | null;
			role: string | null;
		}

		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
