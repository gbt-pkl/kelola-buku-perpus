<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="columns-2 gap-4 md:columns-3 lg:columns-4">
	{@render children()}
</div>
