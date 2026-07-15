<script lang="ts">
	import type { Server } from '$types';
	import { getServerState } from '$states';
	import { Button, Card, Input } from '$components/ui';
	import { Send, Terminal } from 'lucide-svelte';
	import { cn } from '$theme';
	import { JSONEditor } from 'svelte-jsoneditor';

	let { server } = $props<{ server: Server }>();

	const serverState = getServerState();
	const apiResponse = $derived(serverState.apiResponse);

	// JSONEditor content - updates when apiResponse changes
	let editorContent = $derived.by(() => {
		if (apiResponse && apiResponse.server_id === server.id) {
			return { json: apiResponse.result.data };
		}
		return { json: {} };
	});

	type ApiEndpoint = {
		id: string;
		label: string;
		method: string;
		hasPayload: boolean;
		payloadTemplate?: Record<string, string>;
	};

	const endpoints: ApiEndpoint[] = [
		{ id: 'info', label: '서버 정보', method: 'GET', hasPayload: false },
		{ id: 'players', label: '플레이어 목록', method: 'GET', hasPayload: false },
		{ id: 'settings', label: '서버 설정', method: 'GET', hasPayload: false },
		{ id: 'metrics', label: '메트릭', method: 'GET', hasPayload: false },
		{ id: 'save', label: '월드 저장', method: 'POST', hasPayload: false },
		{
			id: 'shutdown',
			label: '서버 종료',
			method: 'POST',
			hasPayload: true,
			payloadTemplate: { waittime: '10', message: 'Server shutting down...' }
		},
		{ id: 'stop', label: '강제 정지', method: 'POST', hasPayload: false },
		{
			id: 'announce',
			label: '서버 공지',
			method: 'POST',
			hasPayload: true,
			payloadTemplate: { message: '' }
		},
		{
			id: 'kick',
			label: '플레이어 추방',
			method: 'POST',
			hasPayload: true,
			payloadTemplate: { userid: '', message: 'Kicked' }
		},
		{
			id: 'ban',
			label: '플레이어 차단',
			method: 'POST',
			hasPayload: true,
			payloadTemplate: { userid: '', message: 'Banned' }
		},
		{
			id: 'unban',
			label: '플레이어 차단 해제',
			method: 'POST',
			hasPayload: true,
			payloadTemplate: { userid: '' }
		}
	];

	let selectedEndpoint = $state<ApiEndpoint>(endpoints[0]);
	let payloadValues = $state<Record<string, string>>({});

	$effect(() => {
		if (selectedEndpoint.payloadTemplate) {
			payloadValues = { ...selectedEndpoint.payloadTemplate };
		} else {
			payloadValues = {};
		}
	});

	const isRunning = $derived(server.status?.running ?? false);
	const hasResponse = $derived(apiResponse && apiResponse.server_id === server.id);

	async function handleCall() {
		const payload = selectedEndpoint.hasPayload ? payloadValues : undefined;
		await serverState.callApi(server.id, selectedEndpoint.id, selectedEndpoint.method, payload);
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-bold">REST API 콘솔</h3>

	{#if !isRunning}
		<Card class="text-surface-400 text-center">
			<Terminal size={32} class="mx-auto mb-2 opacity-50" />
			<p>REST API를 사용하려면 서버가 작동 중이어야 합니다</p>
		</Card>
	{:else}
		<!-- Endpoint selector -->
		<div class="flex flex-wrap gap-2">
			{#each endpoints as ep (ep.id)}
				<button
					class={cn(
						'rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
						selectedEndpoint.id === ep.id
							? 'bg-secondary-500 text-white'
							: 'bg-surface-700 text-surface-300 hover:bg-surface-600'
					)}
					onclick={() => (selectedEndpoint = ep)}
				>
					<span class="text-surface-400 mr-1 text-[10px]">{ep.method}</span>
					{ep.label}
				</button>
			{/each}
		</div>

		<!-- Payload inputs -->
		{#if selectedEndpoint.hasPayload && selectedEndpoint.payloadTemplate}
			<Card padding="p-3">
				<div class="grid grid-cols-2 gap-2">
					{#each Object.keys(selectedEndpoint.payloadTemplate) as key (key)}
						<Input
							label={key}
							value={payloadValues[key] ?? ''}
							onValueChange={(v) => {
								payloadValues[key] = String(v);
								payloadValues = payloadValues;
							}}
						/>
					{/each}
				</div>
			</Card>
		{/if}

		<!-- Send button -->
		<div class="flex items-center gap-3">
			<Button variant="primary" onclick={handleCall}>
				<Send size={14} />
				요청 전송
			</Button>
			{#if hasResponse}
				<span
					class={cn(
						'rounded-sm px-2 py-0.5 text-xs',
						apiResponse!.result.status_code >= 200 && apiResponse!.result.status_code < 300
							? 'bg-green-500/20 text-green-400'
							: 'bg-red-500/20 text-red-400'
					)}
				>
					{apiResponse!.result.status_code}
				</span>
			{/if}
		</div>

		<!-- Response viewer -->
		{#if hasResponse}
			<div class="editor-wrapper max-h-[500px] overflow-auto">
				<JSONEditor content={editorContent} readOnly={true} />
			</div>
		{/if}
	{/if}
</div>

<style>
	.editor-wrapper {
		--jse-theme-color: var(--color-surface-700);
		--jse-theme-color-highlight: var(--color-secondary-500);
		--jse-background-color: var(--color-surface-900);
		--jse-text-color: var(--color-surface-100);
		--jse-panel-background: var(--color-surface-800);
		--jse-panel-border: var(--color-surface-700);
	}
</style>
