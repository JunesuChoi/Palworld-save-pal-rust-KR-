<script lang="ts">
	import { Button, Card } from '$components/ui';
	import * as m from '$i18n/messages';
	import { c } from '$lib/utils/commonTranslations';
	import { send } from '$lib/utils/websocketUtils';
	import { MessageType } from '$types';

	let { closeModal } = $props<{
		closeModal: (value: [string, number]) => void;
	}>();

	function handleUpdateNow() {
		send(MessageType.OPEN_IN_BROWSER, "https://github.com/JunesuChoi/Palworld-save-pal-rust-KR-/releases");
		closeModal(null);
	}

	function handleLater() {
		closeModal(null);
	}
</script>

<div class="flex h-full w-full flex-col items-center justify-center space-y-4">
	<Card class="min-w-[calc(100vw/3)]">
		<div class="flex flex-col space-y-4 p-4">
			<h3 class="h3">{m.update_available()}</h3>
			<p class="my-4">{m.new_version_available()}</p>

			<div class="mt-2 flex flex-row items-center justify-end space-x-2">
				<Button
					variant="primary"
					onclick={handleUpdateNow}>{m.update_now()}</Button
				>
				<Button variant="ghost" onclick={handleLater}>{m.later()}</Button>
			</div>
		</div>
	</Card>
</div>
