<script lang="ts">
	import { resolve } from '$app/paths';
	import StatCard from '$lib/components/StatCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard · BUKU. Admin</title>
</svelte:head>

<section class="space-y-8">
	<header>
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			Ringkasan data perpustakaan. Login sebagai{data.email ? ` ${data.email}` : ''}.
		</p>
	</header>

	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<StatCard label="Judul Buku" value={data.stats.books} />
		<StatCard label="Total Eksemplar" value={data.stats.stock} hint="Total stok buku" />
		<StatCard label="Pengguna" value={data.stats.users} hint="Terdaftar di profiles" />
		<StatCard
			label="Peminjaman"
			value={data.stats.borrowings}
			hint={`${data.stats.borrowedQuantity} buku dipinjam`}
		/>
	</div>

	<div
		class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
	>
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Aksi Cepat</h2>
		<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
			Akun tidak bisa mendaftar sendiri. Buat admin atau user baru dari halaman pengguna.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<a
				href={resolve('/admin/users')}
				class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
			>
				Kelola Pengguna
			</a>
			<a
				href={resolve('/')}
				class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
			>
				Lihat Katalog
			</a>
		</div>
	</div>
</section>
