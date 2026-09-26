<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Terjadi kesalahan yang tidak diketahui.');
</script>

<main
	class="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 text-center dark:bg-gray-950"
>
	<p class="text-6xl font-bold text-gray-900 dark:text-white">{status}</p>

	<div class="space-y-2">
		<h1 class="text-xl font-semibold text-gray-900 dark:text-white">
			{status === 403 ? 'Akses Ditolak' : 'Halaman Tidak Ditemukan'}
		</h1>
		<p class="text-sm text-gray-600 dark:text-gray-400">{message}</p>
	</div>

	<div class="flex flex-wrap items-center justify-center gap-3">
		<a
			href={resolve('/')}
			class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
		>
			Kembali ke Katalog
		</a>

		{#if status === 403 && !page.data?.user}
			<a
				href={resolve('/login')}
				class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
			>
				Masuk sebagai Admin
			</a>
		{/if}
	</div>
</main>
