<script lang="ts">
	import type { Server } from '$types';
	import { getServerState, getModalState } from '$states';
	import { Button, Card } from '$components/ui';
	import { FolderOpen, AlertTriangle } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let { server } = $props<{ server: Server }>();

	const serverState = getServerState();
	const modal = getModalState();

	const isRunning = $derived(server.status?.running ?? false);

	async function handleLoadSave() {
		if (isRunning) {
			const confirmed = await modal.showConfirmModal({
				title: '서버가 작동 중입니다',
				message: '세이브 파일을 편집하려면 서버가 정지 상태여야 합니다. 지금 정지하시겠습니까?',
				confirmText: '정지 및 로드',
				cancelText: '취소'
			});
			if (!confirmed) return;
			await serverState.stopServer(server.id);
			// Wait a moment for container to stop
			await new Promise((r) => setTimeout(r, 3000));
		}
		await serverState.loadServerSave(server.id);
		goto('/edit');
	}
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-lg font-bold">세이브 파일</h3>

	{#if isRunning}
		<Card class="border border-yellow-500/30">
			<div class="flex items-center gap-3 text-yellow-400">
				<AlertTriangle size={20} />
				<div>
					<p class="font-medium">서버가 작동 중입니다</p>
					<p class="text-surface-400 text-sm">
						세이브 파일을 불러오려면 서버를 정지해야 합니다. 서버가 작동 중일 때 편집하면
						세이브 데이터가 손상될 수 있습니다.
					</p>
				</div>
			</div>
		</Card>
	{/if}

	<Card>
		<div class="flex items-center justify-between">
			<div>
				<h4 class="font-medium">서버 세이브 파일 불러오기</h4>
				<p class="text-surface-400 text-sm">
					이 서버의 세이브 파일을 편집기로 불러와 확인 및 수정합니다.
				</p>
				<p class="text-surface-500 mt-1 text-xs">세이브 경로: {server.saves_path}</p>
			</div>
			<Button variant="primary" onclick={handleLoadSave}>
				<FolderOpen size={14} />
				편집기로 불러오기
			</Button>
		</div>
	</Card>
</div>
