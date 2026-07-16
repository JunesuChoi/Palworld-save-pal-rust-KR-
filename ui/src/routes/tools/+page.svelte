<script lang="ts">
	import { PUBLIC_DESKTOP_MODE } from '$env/static/public';
	import { getAppState, getToastState } from '$states';
	import { Button, Card, Spinner } from '$components/ui';
	import { send, sendAndWait } from '$lib/utils/websocketUtils';
	import { MessageType, type GamepassSave } from '$types';
	import { ASSET_DATA_PATH } from '$lib/constants';
	import { assetLoader } from '$utils';
	import { cn } from '$theme';
	import { GamepassBrowser } from '$components/gamepass';
	import * as m from '$i18n/messages';
	import {
		ArrowRightLeft,
		Monitor,
		HardDrive,
		ArrowLeft,
		Gamepad2,
		RefreshCw,
		Hash,
		Copy,
		Check,
		Repeat,
		Upload
	} from 'lucide-svelte';

	const appState = getAppState();
	const toast = getToastState();
	const isDesktopMode = PUBLIC_DESKTOP_MODE === 'true';

	const steamIcon = assetLoader.loadSvg(`${ASSET_DATA_PATH}/img/app/steam.svg`);
	const xboxIcon = assetLoader.loadSvg(`${ASSET_DATA_PATH}/img/app/xbox.svg`);

	import type { PlayerSummary } from '$types';

	type Tab = 'convert' | 'gamepass' | 'steamid' | 'uidswap' | 'transfer';
	let activeTab: Tab = $state('convert');

	// Convert tab state
	let isConverting = $state(false);
	let conversionResult = $state('');
	let convertGamepassSaves: Record<string, GamepassSave> = $state({});
	let showConvertBrowser = $state(false);
	let isConvertScanning = $state(false);

	// GamePass browser tab state
	let browserSaves: Record<string, GamepassSave> = $state({});
	let isBrowserScanning = $state(false);
	let browserLoaded = $state(false);

	// UID Swap tab state
	let swapPlayerA: string = $state('');
	let swapPlayerB: string = $state('');
	let isSwapping = $state(false);
	let swapResult: { success?: boolean; error?: string } | null = $state(null);
	let showSwapConfirm = $state(false);

	// Steam ID tab state
	let steamInput = $state('');
	let steamConverting = $state(false);
	let steamResult: {
		palworld_uid?: string;
		nosteam_uid?: string;
		error?: string;
		from_uid?: boolean;
	} | null = $state(null);
	let copiedField: string | null = $state(null);

	const currentFormat = $derived(appState.saveFile?.type ?? null);
	const targetFormat = $derived(currentFormat === 'steam' ? 'gamepass' : 'steam');
	const hasLoadedSave = $derived(!!appState.saveFile);

	// Transfer tab state
	let transferStep: 'select' | 'players' | 'done' = $state('select');
	let isLoadingTransfer = $state(false);
	let sourceWorldName = $state('');
	let targetWorldName = $state('');
	let sourcePlayers: Record<string, PlayerSummary> = $state({});
	let standaloneTargetPlayers: Record<string, PlayerSummary> = $state({});
	let sourceLoaded = $state(false);
	let standaloneTargetLoaded = $state(false);
	let selectedSourcePlayer = $state('');
	let selectedTargetPlayer = $state('');
	let transferOpts = $state({
		character: true,
		inventory: true,
		pals: true,
		tech: true,
		appearance: true
	});
	let isTransferring = $state(false);
	let transferResult: { success?: boolean; error?: string } | null = $state(null);

	const sourcePlayersArray = $derived(Object.values(sourcePlayers));
	const standaloneTargetPlayersArray = $derived(Object.values(standaloneTargetPlayers));
	const useStandaloneTarget = $derived(!hasLoadedSave);
	const targetPlayersArray = $derived(
		useStandaloneTarget ? standaloneTargetPlayersArray : appState.playerSummariesArray
	);
	const readyForPlayerSelect = $derived(
		sourceLoaded && (!useStandaloneTarget || standaloneTargetLoaded)
	);

	const tabs: { id: Tab; label: string; icon: typeof ArrowRightLeft }[] = [
		{ id: 'convert', label: () => m.convert(), icon: ArrowRightLeft },
		{ id: 'gamepass', label: () => m.gamepass_browser(), icon: Gamepad2 },
		{ id: 'steamid', label: () => m.steam_id(), icon: Hash },
		{ id: 'uidswap', label: () => m.uid_swap(), icon: Repeat },
		{ id: 'transfer', label: () => m.player_transfer(), icon: Upload }
	];

	// --- Convert tab handlers ---

	function handleResult(result: { message?: string; error?: string }) {
		isConverting = false;
		if (result.error) {
			conversionResult = result.error;
			toast.add(result.error, 'Error', 'error');
		} else if (result.message) {
			conversionResult = result.message;
			toast.add(result.message);
		}
	}

	async function handleConvertLoaded() {
		if (!hasLoadedSave || !isDesktopMode) return;
		isConverting = true;
		conversionResult = '';
		try {
			const result = await sendAndWait<{ message?: string; error?: string }>(
				MessageType.CONVERT_SAVE_FORMAT,
				{ target_format: targetFormat }
			);
			handleResult(result);
		} catch (err: any) {
			isConverting = false;
			conversionResult = `Error: ${err.message}`;
			toast.add(`Conversion failed: ${err.message}`, 'Error', 'error');
		}
	}

	async function handleSteamToGamepass() {
		if (!isDesktopMode) return;
		isConverting = true;
		conversionResult = '';
		try {
			const result = await sendAndWait<{ message?: string; error?: string }>(
				MessageType.CONVERT_SAVE_FORMAT,
				{ target_format: 'gamepass', source_path: '__select__', output_path: '__select__' }
			);
			handleResult(result);
		} catch (err: any) {
			isConverting = false;
			conversionResult = `Error: ${err.message}`;
			toast.add(`Conversion failed: ${err.message}`, 'Error', 'error');
		}
	}

	async function handleGamepassToSteamClick() {
		if (!isDesktopMode) return;
		isConvertScanning = true;
		try {
			const result = await sendAndWait<{
				saves?: Record<string, GamepassSave>;
				error?: string;
			}>(MessageType.SCAN_GAMEPASS_SAVES, {});
			if (result.error) {
				toast.add(result.error, 'Error', 'error');
			} else if (result.saves) {
				convertGamepassSaves = result.saves;
				showConvertBrowser = true;
			}
		} catch (err: any) {
			toast.add(`Failed to scan: ${err.message}`, 'Error', 'error');
		} finally {
			isConvertScanning = false;
		}
	}

	async function handleGamepassSaveSelected(save: GamepassSave) {
		showConvertBrowser = false;
		isConverting = true;
		conversionResult = '';
		try {
			const result = await sendAndWait<{ message?: string; error?: string }>(
				MessageType.CONVERT_SAVE_FORMAT,
				{ target_format: 'steam', save_id: save.save_id }
			);
			handleResult(result);
		} catch (err: any) {
			isConverting = false;
			conversionResult = `Error: ${err.message}`;
			toast.add(`Conversion failed: ${err.message}`, 'Error', 'error');
		}
	}

	// --- GamePass browser tab handlers ---

	async function loadBrowserSaves() {
		isBrowserScanning = true;
		try {
			const result = await sendAndWait<{
				saves?: Record<string, GamepassSave>;
				error?: string;
			}>(MessageType.SCAN_GAMEPASS_SAVES, {});
			if (result.saves) {
				browserSaves = result.saves;
				browserLoaded = true;
			}
		} catch (err: any) {
			toast.add(`Failed to scan: ${err.message}`, 'Error', 'error');
		} finally {
			isBrowserScanning = false;
		}
	}

	function handleTabChange(tab: Tab) {
		activeTab = tab;
		if (tab === 'gamepass' && !browserLoaded && isDesktopMode) {
			loadBrowserSaves();
		}
	}

	// --- Steam ID tab handlers ---

	async function handleConvertSteamId() {
		if (!steamInput.trim()) return;
		steamConverting = true;
		steamResult = null;
		try {
			const result = await sendAndWait<{
				palworld_uid?: string;
				nosteam_uid?: string;
				error?: string;
			}>(MessageType.CONVERT_STEAM_ID, { steam_input: steamInput.trim() });
			steamResult = result;
			if (result.error) {
				toast.add(result.error, 'Error', 'error');
			}
		} catch (err: any) {
			steamResult = { error: err.message };
			toast.add(`Conversion failed: ${err.message}`, 'Error', 'error');
		} finally {
			steamConverting = false;
		}
	}

	// --- Transfer tab handlers ---

	async function handleLoadTransferSave(role: 'source' | 'target') {
		isLoadingTransfer = true;
		transferResult = null;
		try {
			const result = await sendAndWait<{
				success?: boolean;
				error?: string;
				role?: string;
				player_count?: number;
				world_name?: string;
			}>(MessageType.LOAD_SOURCE_SAVE, { type: 'steam', path: '__select__', role });

			if (result.error) {
				toast.add(result.error, 'Error', 'error');
			} else if (result.success) {
				const playersResult = await sendAndWait<{
					source?: Record<string, PlayerSummary>;
					target?: Record<string, PlayerSummary>;
				}>(MessageType.GET_SOURCE_PLAYERS, {});

				if (role === 'source') {
					sourceWorldName = result.world_name ?? 'Unknown';
					sourcePlayers = playersResult?.source ?? {};
					sourceLoaded = true;
				} else {
					targetWorldName = result.world_name ?? 'Unknown';
					standaloneTargetPlayers = playersResult?.target ?? {};
					standaloneTargetLoaded = true;
				}

				if (readyForPlayerSelect) {
					transferStep = 'players';
				}
			}
		} catch (err: any) {
			toast.add(`Failed to load ${role}: ${err.message}`, 'Error', 'error');
		} finally {
			isLoadingTransfer = false;
		}
	}

	async function handleTransfer() {
		if (!selectedSourcePlayer) return;
		isTransferring = true;
		transferResult = null;
		try {
			const result = await sendAndWait<{ success?: boolean; error?: string }>(
				MessageType.TRANSFER_PLAYER,
				{
					source_player_uid: selectedSourcePlayer,
					target_player_uid: selectedTargetPlayer || null,
					transfer_character: transferOpts.character,
					transfer_inventory: transferOpts.inventory,
					transfer_pals: transferOpts.pals,
					transfer_tech: transferOpts.tech,
					transfer_appearance: transferOpts.appearance
				}
			);
			transferResult = result;
			if (result.error) {
				toast.add(result.error, 'Error', 'error');
			} else if (result.success) {
				toast.add('Player transferred successfully. Save your changes to apply.');
				transferStep = 'done';
			}
		} catch (err: any) {
			transferResult = { error: err.message };
			toast.add(`Transfer failed: ${err.message}`, 'Error', 'error');
		} finally {
			isTransferring = false;
		}
	}

	function resetTransfer() {
		transferStep = 'select';
		sourcePlayers = {};
		standaloneTargetPlayers = {};
		sourceLoaded = false;
		standaloneTargetLoaded = false;
		sourceWorldName = '';
		targetWorldName = '';
		selectedSourcePlayer = '';
		selectedTargetPlayer = '';
		transferResult = null;
		sendAndWait(MessageType.UNLOAD_SOURCE_SAVE, {});
	}

	// --- UID Swap tab handlers ---

	async function handleSwapUids() {
		if (!swapPlayerA || !swapPlayerB || swapPlayerA === swapPlayerB) return;
		showSwapConfirm = false;
		isSwapping = true;
		swapResult = null;
		try {
			const result = await sendAndWait<{ success?: boolean; error?: string }>(
				MessageType.SWAP_PLAYER_UIDS,
				{ old_player_uid: swapPlayerA, new_player_uid: swapPlayerB }
			);
			swapResult = result;
			if (result.error) {
				toast.add(result.error, 'Error', 'error');
			} else if (result.success) {
				toast.add('Player UIDs swapped successfully. Save your changes to apply.');
			}
		} catch (err: any) {
			swapResult = { error: err.message };
			toast.add(`Swap failed: ${err.message}`, 'Error', 'error');
		} finally {
			isSwapping = false;
		}
	}

	async function copyToClipboard(text: string, field: string) {
		await navigator.clipboard.writeText(text);
		copiedField = field;
		setTimeout(() => (copiedField = null), 2000);
	}
</script>

<div class="flex min-h-screen w-full flex-col items-center py-8">
	<div class="flex w-full max-w-3xl flex-col gap-8">
		<!-- Tabs -->
		<div class="border-surface-700 flex gap-1 border-b">
			{#each tabs as tab}
				<button
					class={cn(
						'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
						activeTab === tab.id
							? 'text-primary-400 border-primary-400 border-b-2'
							: 'text-surface-400 hover:text-surface-200 border-b-2 border-transparent'
					)}
					onclick={() => handleTabChange(tab.id)}
				>
					<tab.icon size={16} />
					{tab.label()}
				</button>
			{/each}
		</div>

		<!-- Convert Tab -->
		{#if activeTab === 'convert'}
			<div class="flex flex-col gap-8">
				{#if isConverting || isConvertScanning}
					<div class="flex flex-col items-center gap-4">
						<Spinner />
						{#if appState.progressMessage}
							<span class="text-surface-200">{appState.progressMessage}</span>
						{:else if isConvertScanning}
							<span class="text-surface-200">Scanning GamePass saves...</span>
						{/if}
					</div>
				{:else if showConvertBrowser}
					<section class="w-full">
						<div class="mb-4 flex items-center gap-3">
							<button
								class="text-surface-400 hover:text-surface-200"
								onclick={() => (showConvertBrowser = false)}
							>
								<ArrowLeft size={20} />
							</button>
							<h2 class="text-surface-100 text-2xl font-bold">
								GamePass → {m.steam()}
							</h2>
						</div>
						<p class="text-surface-400 mb-4 text-sm">{m.docs_select_save_to_extract()}</p>
						<GamepassBrowser
							saves={convertGamepassSaves}
							selectable={true}
							onselect={handleGamepassSaveSelected}
						/>
					</section>
				{:else}
					<!-- Convert Loaded Save -->
					{#if hasLoadedSave && isDesktopMode}
						<section class="w-full">
							<h2 class="text-surface-100 mb-4 text-center text-2xl font-bold">
								{m.tools_convert_loaded()}
							</h2>
							<Card class="mx-auto max-w-lg">
								<div class="flex flex-col items-center gap-4 p-4">
									<div class="flex items-center gap-4">
										<div class="flex flex-col items-center gap-1">
											<div
												class="bg-surface-800 flex h-16 w-16 items-center justify-center rounded-full p-3"
											>
												{#if currentFormat === 'steam'}
													{@html steamIcon}
												{:else}
													{@html xboxIcon}
												{/if}
											</div>
											<span class="text-surface-300 text-sm capitalize">{currentFormat}</span>
										</div>
										<ArrowRightLeft class="text-primary-400" size={28} />
										<div class="flex flex-col items-center gap-1">
											<div
												class="bg-surface-800 flex h-16 w-16 items-center justify-center rounded-full p-3"
											>
												{#if targetFormat === 'steam'}
													{@html steamIcon}
												{:else}
													{@html xboxIcon}
												{/if}
											</div>
											<span class="text-surface-300 text-sm capitalize">{targetFormat}</span>
										</div>
									</div>
									<p class="text-surface-300 text-center text-sm">
										Convert
										<strong>{appState.saveFile?.world_name ?? 'save'}</strong> from
										<span class="text-primary-400 capitalize">{currentFormat}</span>
										to
										<span class="text-primary-400 capitalize">{targetFormat}</span>
										format
									</p>
									<Button variant="primary" onclick={handleConvertLoaded}>
										<ArrowRightLeft size={16} />
										<span>{m.convert()}</span>
									</Button>
								</div>
							</Card>
						</section>

						<hr class="border-surface-700" />
					{/if}

					<!-- Standalone Conversion -->
					{#if isDesktopMode}
						<section class="w-full">
							<h2 class="text-surface-100 mb-4 text-center text-2xl font-bold">
								{m.tools_convert_standalone()}
							</h2>
							<p class="text-surface-400 mb-6 text-center text-sm">
								Convert save files without loading them into the editor
							</p>
							<div class="grid w-full grid-cols-1 justify-center gap-8 sm:grid-cols-2">
								<!-- Steam to GamePass -->
								<button
									type="button"
									class={cn(
										'bg-surface-800 hover:border-primary-500 border-surface-700 flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-8 shadow-md transition-all'
									)}
									onclick={handleSteamToGamepass}
								>
									<div class="flex flex-col items-center gap-3">
										<div class="flex items-center gap-3">
											<div
												class="bg-surface-900 flex h-14 w-14 items-center justify-center rounded-full p-3"
											>
												{@html steamIcon}
											</div>
											<ArrowRightLeft class="text-surface-400" size={20} />
											<div
												class="bg-surface-900 flex h-14 w-14 items-center justify-center rounded-full p-3"
											>
												{@html xboxIcon}
											</div>
										</div>
										<span class="text-surface-50 text-lg font-semibold">{m.steam()} → GamePass</span
										>
										<span class="text-surface-300 text-center text-sm">
											Import a Steam save directory into GamePass container format
										</span>
									</div>
								</button>

								<!-- GamePass to Steam -->
								<button
									type="button"
									class={cn(
										'bg-surface-800 hover:border-primary-500 border-surface-700 flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-8 shadow-md transition-all'
									)}
									onclick={handleGamepassToSteamClick}
								>
									<div class="flex flex-col items-center gap-3">
										<div class="flex items-center gap-3">
											<div
												class="bg-surface-900 flex h-14 w-14 items-center justify-center rounded-full p-3"
											>
												{@html xboxIcon}
											</div>
											<ArrowRightLeft class="text-surface-400" size={20} />
											<div
												class="bg-surface-900 flex h-14 w-14 items-center justify-center rounded-full p-3"
											>
												{@html steamIcon}
											</div>
										</div>
										<span class="text-surface-50 text-lg font-semibold">GamePass → {m.steam()}</span
										>
										<span class="text-surface-300 text-center text-sm">
											Extract GamePass containers to Steam save directory format
										</span>
									</div>
								</button>
							</div>
						</section>
					{:else}
						<section class="w-full">
							<Card class="mx-auto max-w-lg">
								<div class="flex flex-col items-center gap-4 p-4">
									<Monitor size={48} class="text-surface-400" />
									<p class="text-surface-300 text-center">
										{m.docs_convert_save_requirement()}
									</p>
								</div>
							</Card>
						</section>
					{/if}

					<!-- Conversion Result -->
					{#if conversionResult}
						<Card class="mx-auto max-w-lg">
							<div class="flex items-center gap-3 p-4">
								<HardDrive size={20} class="text-primary-400" />
								<span class="text-surface-200">{conversionResult}</span>
							</div>
						</Card>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- Transfer Tab -->
		{#if activeTab === 'transfer'}
			<div class="flex flex-col gap-8">
				{#if !isDesktopMode}
					<Card class="mx-auto max-w-lg">
						<div class="flex flex-col items-center gap-4 p-4">
							<Monitor size={48} class="text-surface-400" />
							<p class="text-surface-300 text-center">
								{m.docs_transfer_requirement()}
							</p>
						</div>
					</Card>
				{:else if isLoadingTransfer || isTransferring}
					<div class="flex flex-col items-center gap-4">
						<Spinner />
						{#if appState.progressMessage}
							<span class="text-surface-200">{appState.progressMessage}</span>
						{/if}
					</div>
				{:else}
					<section class="w-full">
						<h2 class="text-surface-100 mb-2 text-center text-2xl font-bold">Player Transfer</h2>
						<p class="text-surface-400 mb-6 text-center text-sm">
							{m.docs_transfer_desc()}
							{#if hasLoadedSave}
								{m.docs_transfer_target_loaded()}
							{/if}
						</p>

						{#if transferStep === 'select'}
							<div class="mx-auto flex max-w-2xl flex-col gap-6">
								<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
									<!-- Source save -->
									<Card>
										<div class="flex flex-col items-center gap-4 p-4">
											<h3 class="text-surface-200 font-semibold">{m.docs_source_save()}</h3>
											{#if sourceLoaded}
												<p class="text-sm text-green-400">
													{sourceWorldName} ({sourcePlayersArray.length} players)
												</p>
												<button
													class="text-surface-400 hover:text-surface-200 text-xs"
													onclick={() => {
														sourceLoaded = false;
														sourcePlayers = {};
														sourceWorldName = '';
													}}
												>
													Change
												</button>
											{:else}
												<p class="text-surface-400 text-center text-sm">
													{m.docs_select_transfer_source()}
												</p>
												<Button variant="primary" onclick={() => handleLoadTransferSave('source')}>
													<Upload size={16} />
													<span>{m.docs_select_source()}</span>
												</Button>
											{/if}
										</div>
									</Card>

									<!-- Target save -->
									<Card>
										<div class="flex flex-col items-center gap-4 p-4">
											<h3 class="text-surface-200 font-semibold">{m.docs_target_save()}</h3>
											{#if hasLoadedSave}
												<p class="text-sm text-green-400">
													{appState.saveFile?.world_name ?? 'Loaded save'} ({appState
														.playerSummariesArray.length} players)
												</p>
												<span class="text-surface-500 text-xs">Using loaded save</span>
											{:else if standaloneTargetLoaded}
												<p class="text-sm text-green-400">
													{targetWorldName} ({standaloneTargetPlayersArray.length} players)
												</p>
												<button
													class="text-surface-400 hover:text-surface-200 text-xs"
													onclick={() => {
														standaloneTargetLoaded = false;
														standaloneTargetPlayers = {};
														targetWorldName = '';
													}}
												>
													Change
												</button>
											{:else}
												<p class="text-surface-400 text-center text-sm">
													{m.docs_select_transfer_target()}
												</p>
												<Button variant="primary" onclick={() => handleLoadTransferSave('target')}>
													<Upload size={16} />
													<span>{m.docs_select_target()}</span>
												</Button>
											{/if}
										</div>
									</Card>
								</div>

								{#if readyForPlayerSelect}
									<Button
										variant="primary"
										class="mx-auto"
										onclick={() => (transferStep = 'players')}
									>
										{m.docs_continue_to_player()}
									</Button>
								{/if}
							</div>
						{:else if transferStep === 'players'}
							<div class="mx-auto flex max-w-2xl flex-col gap-6">
								<div class="flex items-center justify-between">
									<span class="text-surface-400 text-sm">
										{sourceWorldName} → {hasLoadedSave
											? (appState.saveFile?.world_name ?? 'Loaded save')
											: targetWorldName}
									</span>
									<button
										class="text-surface-400 hover:text-surface-200 text-sm"
										onclick={resetTransfer}
									>
										{m.docs_start_over()}
									</button>
								</div>

								<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
									<!-- Source player -->
									<Card>
										<div class="flex flex-col gap-3 p-4">
											<h3 class="text-surface-200 text-sm font-semibold">{m.docs_source_player()}</h3>
											<select
												bind:value={selectedSourcePlayer}
												class="bg-surface-800 border-surface-600 text-surface-100 focus:border-primary-500 rounded-lg border px-3 py-2 text-sm focus:outline-none"
											>
												<option value="">{m.docs_select_player_placeholder()}</option>
												{#each sourcePlayersArray as player}
													<option value={player.uid}>
														{player.nickname} (Lv.{player.level ?? '?'})
													</option>
												{/each}
											</select>
										</div>
									</Card>

									<!-- Target player -->
									<Card>
										<div class="flex flex-col gap-3 p-4">
											<h3 class="text-surface-200 text-sm font-semibold">{m.docs_target_player()}</h3>
											<select
												bind:value={selectedTargetPlayer}
												class="bg-surface-800 border-surface-600 text-surface-100 focus:border-primary-500 rounded-lg border px-3 py-2 text-sm focus:outline-none"
											>
												<option value="">{m.docs_new_player_spawn()}</option>
												{#each targetPlayersArray as player}
													<option value={player.uid}>
														{player.nickname} (Lv.{player.level ?? '?'})
													</option>
												{/each}
											</select>
											<span class="text-surface-500 text-xs">
												{m.docs_leave_new_player_desc()}
											</span>
										</div>
									</Card>
								</div>

								<!-- Transfer options -->
								<Card>
									<div class="flex flex-col gap-3 p-4">
										<h3 class="text-surface-200 text-sm font-semibold">{m.docs_transfer_options()}</h3>
										<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
											{#each [{ key: 'character', label: m.docs_character() }, { key: 'inventory', label: m.docs_inventory() }, { key: 'pals', label: m.pal({ count: 2 }) }, { key: 'tech', label: m.technologies() }, { key: 'appearance', label: m.docs_appearance() }] as opt}
												<label class="text-surface-300 flex items-center gap-2 text-sm">
													<input
														type="checkbox"
														bind:checked={transferOpts[opt.key as keyof typeof transferOpts]}
														class="accent-primary-500"
													/>
													{opt.label}
												</label>
											{/each}
										</div>
									</div>
								</Card>

								<Button
									variant="primary"
									class="mx-auto"
									onclick={handleTransfer}
									disabled={!selectedSourcePlayer}
								>
									<Upload size={16} />
									<span>{m.player_transfer()}</span>
								</Button>
							</div>
						{:else if transferStep === 'done'}
							<Card class="mx-auto max-w-lg">
								<div class="flex flex-col items-center gap-4 p-4">
									{#if transferResult?.success}
										<p class="text-center text-green-400">
											Player transferred successfully. Save your changes to apply.
										</p>
									{/if}
									{#if transferResult?.error}
										<p class="text-center text-red-400">{transferResult.error}</p>
									{/if}
									<Button variant="neutral" onclick={resetTransfer}>{m.docs_transfer_another()}</Button>
								</div>
							</Card>
						{/if}
					</section>
				{/if}
			</div>
		{/if}

		<!-- UID Swap Tab -->
		{#if activeTab === 'uidswap'}
			<div class="flex flex-col gap-8">
				{#if !hasLoadedSave}
					<Card class="mx-auto max-w-lg">
						<div class="flex flex-col items-center gap-4 p-4">
							<HardDrive size={48} class="text-surface-400" />
							<p class="text-surface-300 text-center">
								{m.docs_load_save_first_swap()}
							</p>
						</div>
					</Card>
				{:else if isSwapping}
					<div class="flex flex-col items-center gap-4">
						<Spinner />
						{#if appState.progressMessage}
							<span class="text-surface-200">{appState.progressMessage}</span>
						{/if}
					</div>
				{:else}
					<section class="w-full">
						<h2 class="text-surface-100 mb-2 text-center text-2xl font-bold">Player UID Swap</h2>
						<p class="text-surface-400 mb-6 text-center text-sm">
							{m.docs_swap_desc()}
						</p>

						<Card class="mx-auto max-w-lg">
							<div class="flex flex-col gap-4 p-4">
								<div class="flex flex-col gap-2">
									<label for="swap-player-a" class="text-surface-300 text-sm font-medium">
										{m.docs_player_a()}
									</label>
									<select
										id="swap-player-a"
										bind:value={swapPlayerA}
										class="bg-surface-800 border-surface-600 text-surface-100 focus:border-primary-500 rounded-lg border px-3 py-2 text-sm focus:outline-none"
									>
										<option value="">{m.docs_select_player_placeholder()}</option>
										{#each appState.playerSummariesArray as player}
											<option value={player.uid} disabled={player.uid === swapPlayerB}>
												{player.nickname} (Lv.{player.level ?? '?'}) — {player.uid.substring(0, 8)}
											</option>
										{/each}
									</select>
								</div>

								<div class="flex items-center justify-center">
									<Repeat size={20} class="text-primary-400" />
								</div>

								<div class="flex flex-col gap-2">
									<label for="swap-player-b" class="text-surface-300 text-sm font-medium">
										{m.docs_player_b()}
									</label>
									<select
										id="swap-player-b"
										bind:value={swapPlayerB}
										class="bg-surface-800 border-surface-600 text-surface-100 focus:border-primary-500 rounded-lg border px-3 py-2 text-sm focus:outline-none"
									>
										<option value="">{m.docs_select_player_placeholder()}</option>
										{#each appState.playerSummariesArray as player}
											<option value={player.uid} disabled={player.uid === swapPlayerA}>
												{player.nickname} (Lv.{player.level ?? '?'}) — {player.uid.substring(0, 8)}
											</option>
										{/each}
									</select>
								</div>

								{#if showSwapConfirm}
									<div class="bg-surface-900 rounded-lg border border-yellow-600/50 p-3">
										<p class="mb-3 text-sm text-yellow-400">
											{m.docs_swap_confirm_msg()}
										</p>
										<div class="flex justify-end gap-2">
											<Button variant="neutral" size="sm" onclick={() => (showSwapConfirm = false)}>
												Cancel
											</Button>
											<Button variant="primary" size="sm" onclick={handleSwapUids}>
												{m.docs_confirm_swap()}
											</Button>
										</div>
									</div>
								{:else}
									<Button
										variant="primary"
										onclick={() => (showSwapConfirm = true)}
										disabled={!swapPlayerA || !swapPlayerB || swapPlayerA === swapPlayerB}
									>
										<Repeat size={16} />
										<span>{m.uid_swap()}</span>
									</Button>
								{/if}

								{#if swapResult?.success}
									<div class="border-surface-700 border-t pt-3">
										<p class="text-sm text-green-400">
											UIDs swapped successfully. Save your changes to apply.
										</p>
									</div>
								{/if}

								{#if swapResult?.error}
									<div class="border-surface-700 border-t pt-3">
										<p class="text-sm text-red-400">{swapResult.error}</p>
									</div>
								{/if}
							</div>
						</Card>
					</section>
				{/if}
			</div>
		{/if}

		<!-- Steam ID Tab -->
		{#if activeTab === 'steamid'}
			<div class="flex flex-col gap-8">
				<section class="w-full">
					<h2 class="text-surface-100 mb-2 text-center text-2xl font-bold">{m.steam_id()} {m.convert()}</h2>
					<p class="text-surface-400 mb-6 text-center text-sm">
						{m.docs_steam_id_converter_desc()}
					</p>

					<Card class="mx-auto max-w-lg">
						<div class="flex flex-col gap-4 p-4">
							<div class="flex flex-col gap-2">
								<label for="steam-input" class="text-surface-300 text-sm font-medium">
									{m.docs_steam_id_profile_url()}
								</label>
								<div class="flex gap-2">
									<input
										id="steam-input"
										type="text"
										bind:value={steamInput}
										placeholder="76561198012345678 or steamcommunity.com/profiles/..."
										class="bg-surface-800 border-surface-600 text-surface-100 placeholder:text-surface-500 focus:border-primary-500 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none"
										onkeydown={(e) => e.key === 'Enter' && handleConvertSteamId()}
									/>
									<Button
										variant="primary"
										onclick={handleConvertSteamId}
										disabled={steamConverting || !steamInput.trim()}
									>
										{#if steamConverting}
											<Spinner />
										{:else}
											<Hash size={16} />
											<span>{m.convert()}</span>
										{/if}
									</Button>
								</div>
								<span class="text-surface-500 text-xs">
									{m.docs_steam_id_accepts()}
								</span>
							</div>

							{#if steamResult && !steamResult.error}
								<div class="border-surface-700 flex flex-col gap-3 border-t pt-4">
									{#if steamResult.from_uid}
										<p class="text-surface-400 text-xs italic">Input detected as Palworld UID</p>
									{/if}
									<div class="flex flex-col gap-1">
										<span class="text-surface-400 text-xs font-medium tracking-wider uppercase">
											Palworld UID
										</span>
										<div class="flex items-center gap-2">
											<code
												class="bg-surface-900 text-primary-400 flex-1 rounded px-3 py-1.5 font-mono text-sm"
											>
												{steamResult.palworld_uid}
											</code>
											<button
												class="text-surface-400 hover:text-surface-200 p-1"
												onclick={() => copyToClipboard(steamResult!.palworld_uid!, 'palworld')}
											>
												{#if copiedField === 'palworld'}
													<Check size={16} class="text-green-400" />
												{:else}
													<Copy size={16} />
												{/if}
											</button>
										</div>
									</div>
									<div class="flex flex-col gap-1">
										<span class="text-surface-400 text-xs font-medium tracking-wider uppercase">
											NoSteam UID
										</span>
										<div class="flex items-center gap-2">
											<code
												class="bg-surface-900 text-primary-400 flex-1 rounded px-3 py-1.5 font-mono text-sm"
											>
												{steamResult.nosteam_uid}
											</code>
											<button
												class="text-surface-400 hover:text-surface-200 p-1"
												onclick={() => copyToClipboard(steamResult!.nosteam_uid!, 'nosteam')}
											>
												{#if copiedField === 'nosteam'}
													<Check size={16} class="text-green-400" />
												{:else}
													<Copy size={16} />
												{/if}
											</button>
										</div>
									</div>
								</div>
							{/if}

							{#if steamResult?.error}
								<div class="border-surface-700 border-t pt-4">
									<p class="text-sm text-red-400">{steamResult.error}</p>
								</div>
							{/if}
						</div>
					</Card>
				</section>
			</div>
		{/if}

		<!-- GamePass Browser Tab -->
		{#if activeTab === 'gamepass'}
			<div class="flex flex-col gap-6">
				{#if !isDesktopMode}
					<Card class="mx-auto max-w-lg">
						<div class="flex flex-col items-center gap-4 p-4">
							<Monitor size={48} class="text-surface-400" />
							<p class="text-surface-300 text-center">
								GamePass browser requires the desktop app for direct file system access.
							</p>
						</div>
					</Card>
				{:else if isBrowserScanning}
					<div class="flex flex-col items-center gap-4">
						<Spinner />
						<span class="text-surface-200">Scanning GamePass saves...</span>
					</div>
				{:else}
					<div class="flex items-center justify-between">
						<p class="text-surface-400 text-sm">View and inspect your GamePass save files</p>
						<button
							class="text-surface-400 hover:text-surface-200 flex items-center gap-1.5 text-sm"
							onclick={loadBrowserSaves}
						>
							<RefreshCw size={14} />
							Refresh
						</button>
					</div>
					<GamepassBrowser
						bind:saves={browserSaves}
						manageable={true}
						onchange={loadBrowserSaves}
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>
