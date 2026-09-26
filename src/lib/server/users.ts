import type { User } from '@supabase/supabase-js';
import type { UserRole } from '$lib/auth';
import { supabaseAdmin } from './supabase';

export type UserAccount = {
	id: string;
	email: string;
	role: UserRole | null;
	createdAt: string;
	lastSignInAt: string | null;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Batas jumlah user yang ditampilkan di halaman manajemen user. */
const MAX_USERS = 200;

function toUserAccount(user: User, role: UserRole | null): UserAccount {
	return {
		id: user.id,
		email: user.email ?? '-',
		role,
		createdAt: user.created_at,
		lastSignInAt: user.last_sign_in_at ?? null
	};
}

function toReadableError(message: string): string {
	if (/already (been )?registered|already exists/i.test(message)) {
		return 'Email sudah terdaftar. Gunakan email lain.';
	}

	if (/password/i.test(message)) {
		return `Password ditolak: ${message}`;
	}

	return message;
}

/**
 * Gabungkan data autentikasi (`auth.users`) dengan role di tabel `profiles`.
 * User tanpa row `profiles` tetap ditampilkan, dengan role `null` (= bukan admin).
 */
export async function listUserAccounts(): Promise<Result<UserAccount[]>> {
	const [{ data: users, error: usersError }, { data: profiles, error: profilesError }] =
		await Promise.all([
			supabaseAdmin.auth.admin.listUsers({ perPage: MAX_USERS }),
			supabaseAdmin.from('profiles').select('id, role')
		]);

	if (usersError) {
		return { ok: false, error: toReadableError(usersError.message) };
	}

	if (profilesError) {
		return { ok: false, error: toReadableError(profilesError.message) };
	}

	const roles = new Map<string, UserRole>();
	for (const profile of profiles ?? []) {
		if (profile.role === 'admin' || profile.role === 'user') {
			roles.set(profile.id, profile.role);
		}
	}

	return {
		ok: true,
		value: (users?.users ?? [])
			.map((user) => toUserAccount(user, roles.get(user.id) ?? null))
			.sort((a, b) => a.email.localeCompare(b.email))
	};
}

/**
 * Buat akun baru sekaligus mendaftarkannya di tabel `profiles`.
 *
 * Tidak ada halaman registrasi publik: akun hanya bisa dibuat dari dashboard
 * admin, memakai service-role client sehingga email langsung terkonfirmasi
 * (`email_confirm: true`) tanpa perlu Confirmation Email.
 */
export async function createUserAccount(input: {
	email: string;
	password: string;
	role: UserRole;
}): Promise<Result<User>> {
	const { data, error } = await supabaseAdmin.auth.admin.createUser({
		email: input.email,
		password: input.password,
		email_confirm: true,
		user_metadata: { role: input.role }
	});

	if (error || !data.user) {
		return { ok: false, error: toReadableError(error?.message ?? 'Gagal membuat user.') };
	}

	const { error: profileError } = await supabaseAdmin
		.from('profiles')
		.upsert({ id: data.user.id, email: input.email, role: input.role }, { onConflict: 'id' });

	if (profileError) {
		// Jangan sisakan akun yang tidak punya profil: batalkan pembuatan user.
		await supabaseAdmin.auth.admin.deleteUser(data.user.id);
		return {
			ok: false,
			error: `User dibuat tetapi gagal disimpan ke tabel profiles: ${profileError.message}`
		};
	}

	return { ok: true, value: data.user };
}

export async function updateUserRole(userId: string, role: UserRole): Promise<Result<null>> {
	const { data, error } = await supabaseAdmin
		.from('profiles')
		.update({ role })
		.eq('id', userId)
		.select('id')
		.maybeSingle();

	if (error) {
		return { ok: false, error: toReadableError(error.message) };
	}

	if (data) {
		return { ok: true, value: null };
	}

	// Row profil belum ada (mis. akun dibuat sebelum trigger/tabel profiles siap),
	// jadi buat sekarang memakai email resmi dari Supabase Auth.
	const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

	if (userError || !userData.user) {
		return { ok: false, error: toReadableError(userError?.message ?? 'User tidak ditemukan.') };
	}

	const { error: insertError } = await supabaseAdmin
		.from('profiles')
		.insert({ id: userId, email: userData.user.email, role });

	if (insertError) {
		return { ok: false, error: toReadableError(insertError.message) };
	}

	return { ok: true, value: null };
}

export async function deleteUserAccount(userId: string): Promise<Result<null>> {
	const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

	if (error) {
		return { ok: false, error: toReadableError(error.message) };
	}

	// Row di `profiles` biasanya ikut terhapus lewat FK ON DELETE CASCADE,
	// tapi tetap dibersihkan manual supaya tidak ada data yatim.
	const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);

	if (profileError) {
		return { ok: false, error: toReadableError(profileError.message) };
	}

	return { ok: true, value: null };
}
