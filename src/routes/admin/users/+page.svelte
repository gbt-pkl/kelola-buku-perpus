<script lang="ts">
	import { enhance } from '$app/forms';
	import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from '$lib/auth';

	let { data, form } = $props();

	let creating = $state(false);
	let updatingId = $state<string | null>(null);
	let removingId = $state<string | null>(null);

	// Format tanggal dengan timezone tetap supaya hasil render server dan client sama.
	const dateFormatter = new Intl.DateTimeFormat('id-ID', {
		dateStyle: 'medium',
		timeZone: 'UTC'
	});

	const inputClass =
		'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white';
	const selectClass =
		'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white';

	function formatDate(value: string | null): string {
		if (!value) return '-';
		return dateFormatter.format(new Date(value));
	}

	function roleBadgeClass(role: UserRole | null): string {
		return role === 'admin'
			? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
			: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
	}
</script>

<svelte:head>
	<title>Pengguna · BUKU. Admin</title>
</svelte:head>

<section class="space-y-8">
	<header>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			Buat akun admin atau user. Akun langsung aktif tanpa konfirmasi email.
		</p>
	</header>

	{#if data.loadError}
		<div
			class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
			role="alert"
		>
			Gagal memuat daftar pengguna: {data.loadError}
		</div>
	{/if}

	{#if form?.message}
		<div
			class="rounded-md border px-3 py-2 text-sm {form.success
				? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
				: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'}"
			role="alert"
		>
			{form.message}
		</div>
	{/if}

	<div
		class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Buat Akun Baru</h2>

		<form
			method="POST"
			action="?/create"
			class="mt-4 grid gap-4 sm:grid-cols-2"
			use:enhance={() => {
				creating = true;

				return async ({ update }) => {
					await update({ reset: false });
					creating = false;
				};
			}}
		>
			<div class="space-y-1">
				<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autocomplete="off"
					placeholder="nama@perpus.sch.id"
					value={form?.intent === 'create' ? (form.email ?? '') : ''}
					class={inputClass}
				/>
			</div>

			<div class="space-y-1">
				<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minlength="8"
					autocomplete="new-password"
					placeholder="Minimal 8 karakter"
					class={inputClass}
				/>
			</div>

			<div class="space-y-1">
				<label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Role
				</label>
				<select id="role" name="role" class="{selectClass} w-full">
					{#each USER_ROLES as role (role)}
						<option value={role} selected={role === 'user'}>
							{USER_ROLE_LABELS[role]}
						</option>
					{/each}
				</select>
			</div>

			<div class="flex items-end">
				<button
					type="submit"
					disabled={creating}
					class="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					{creating ? 'Menyimpan…' : 'Buat Akun'}
				</button>
			</div>
		</form>
	</div>

	<div
		class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
			<h2 class="text-sm font-semibold text-gray-900 dark:text-white">
				Daftar Akun ({data.users.length})
			</h2>
		</div>

		{#if data.users.length === 0}
			<p class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
				Belum ada akun. Buat akun pertama di atas.
			</p>
		{:else}
			<ul class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each data.users as user (user.id)}
					<li class="flex flex-wrap items-center gap-4 px-4 py-4">
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
								{user.email}
							</p>
							<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
								Dibuat {formatDate(user.createdAt)} · Login terakhir {formatDate(user.lastSignInAt)}
							</p>
						</div>

						<span class="rounded-full px-2 py-1 text-xs font-bold {roleBadgeClass(user.role)}">
							{user.role ? USER_ROLE_LABELS[user.role] : 'Tanpa Profil'}
						</span>

						<form
							method="POST"
							action="?/updateRole"
							class="flex items-center gap-2"
							use:enhance={() => {
								updatingId = user.id;

								return async ({ update }) => {
									await update({ reset: false });
									updatingId = null;
								};
							}}
						>
							<input type="hidden" name="userId" value={user.id} />
							<select
								name="role"
								class="{selectClass} py-1.5"
								disabled={updatingId === user.id}
								aria-label="Role {user.email}"
							>
								{#each USER_ROLES as role (role)}
									<option value={role} selected={user.role === role}>
										{USER_ROLE_LABELS[role]}
									</option>
								{/each}
							</select>
							<button
								type="submit"
								disabled={updatingId === user.id}
								class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
							>
								Simpan
							</button>
						</form>

						<form
							method="POST"
							action="?/remove"
							use:enhance={({ cancel }) => {
								if (!confirm(`Hapus akun ${user.email}?`)) {
									cancel();
									return;
								}

								removingId = user.id;

								return async ({ update }) => {
									await update({ reset: false });
									removingId = null;
								};
							}}
						>
							<input type="hidden" name="userId" value={user.id} />
							<button
								type="submit"
								disabled={removingId === user.id}
								class="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
							>
								{removingId === user.id ? 'Menghapus…' : 'Hapus'}
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
