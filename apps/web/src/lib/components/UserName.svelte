<script lang="ts">
	import { ndk } from "@/ndk";
	import { networkFollows } from "@/stores/session";
	import { wot } from "@/stores/wot";
	import type { NDKUser } from "@nostr-dev-kit/ndk";
	import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";

    export let pubkey: string | undefined = undefined;
    export let user: NDKUser | undefined = undefined;

    if (pubkey && !user) user = $ndk.getUser({pubkey})

    if (!user) throw new Error('User not found')

    console.log('networkFollows', $networkFollows)

    const wotScore = $networkFollows.get(user.pubkey) ?? "";
</script>

<div class="flex flex-row items-center gap-2">
    <Avatar ndk={$ndk} {user} class="w-8 h-8 object-cover rounded-full flex-none" />
    <Name ndk={$ndk} {user} class="inline-block" />

    <div class="text-xs opacity-50">
        {wotScore}
    </div>
</div>