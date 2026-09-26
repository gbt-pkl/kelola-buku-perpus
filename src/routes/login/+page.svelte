<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Masuk Admin · BUKU.</title>
	<meta name="description" content="Login admin untuk mengelola buku perpustakaan" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
	<div class="w-full max-w-sm">
		<a
			href={resolve('/')}
			class="mb-6 block text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>
			BUKU.
		</a>

		<div
			class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<h1 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Masuk Admin</h1>
			<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
				Gunakan email dan password admin yang terdaftar.
			</p>

			{#if form?.message}
				<div
					class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
					role="alert"
				>
					{form.message}
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				class="space-y-4"
				use:enhance={() => {
					submitting = true;

					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<input type="hidden" name="redirectTo" value={data.redirectTo} />

				<div class="space-y-1">
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="username"
						placeholder="admin@perpus.sch.id"
						value={form?.email ?? ''}
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
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
						autocomplete="current-password"
						placeholder="••••••••"
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
					/>
				</div>

				<button
					type="submit"
					disabled={submitting}
					class="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					{submitting ? 'Memproses…' : 'Masuk'}
				</button>
			</form>
		</div>

		<p class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
			Tidak ada pendaftaran publik. Akun admin/user dibuat dari dashboard admin.
		</p>
	</div>
</main>
