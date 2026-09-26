<script lang="ts">
	let { label, value, hint } = $props<{ label: string; value: string | number; hint?: string }>();
</script>

<div
	class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<p class="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
		{label}
	</p>
	<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
	{#if hint}
		<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
	{/if}
</div>
