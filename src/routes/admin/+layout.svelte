<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	/**
	 * Action `logout` harus berada di `+page.server.ts`, jadi form diarahkan
	 * ke action tersebut secara eksplisit agar tetap bisa dipakai dari halaman
	 * admin mana pun (logout tidak boleh bergantung pada halaman aktif).
	 */
	const logoutAction = '/admin/dashboard?/logout';

	let loggingOut = $state(false);

	const isActive = (href: string) => page.url.pathname === href;

	const navClass = (href: string) =>
		`rounded-md px-3 py-1.5 text-sm font-medium transition ${
			page.url.pathname === href
				? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
				: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
		}`;
</script>

<svelte:head>
	<title>Admin · BUKU.</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4">
			<a href={resolve('/admin/dashboard')} class="text-lg font-bold text-gray-900 dark:text-white">
				BUKU. <span class="text-xs font-medium text-gray-500 dark:text-gray-400">ADMIN</span>
			</a>

			<nav class="flex items-center gap-1">
				<a
					href={resolve('/admin/dashboard')}
					aria-current={isActive('/admin/dashboard') ? 'page' : undefined}
					class={navClass('/admin/dashboard')}
				>
					Dashboard
				</a>
				<a
					href={resolve('/admin/users')}
					aria-current={isActive('/admin/users') ? 'page' : undefined}
					class={navClass('/admin/users')}
				>
					Pengguna
				</a>
				<a
					href={resolve('/')}
					class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
				>
					Katalog
				</a>
			</nav>

			<div class="ml-auto flex items-center gap-3">
				{#if page.data.user?.email}
					<span class="hidden text-xs text-gray-500 sm:inline dark:text-gray-400">
						{page.data.user.email}
					</span>
				{/if}
				<form
					method="POST"
					action={logoutAction}
					use:enhance={() => {
						loggingOut = true;

						return async ({ update }) => {
							await update();
							loggingOut = false;
						};
					}}
				>
					<button
						type="submit"
						disabled={loggingOut}
						class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						{loggingOut ? 'Keluar…' : 'Keluar'}
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-4 py-8">
		{@render children()}
	</main>
</div>
