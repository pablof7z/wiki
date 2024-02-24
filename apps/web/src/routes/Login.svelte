<script lang="ts">
	import { ndk } from "$lib/ndk";
	import { Button } from "@/components/ui/button";
	import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";

    onMount(() => {
        if (localStorage.getItem("signed-in")) {
            nip07();
        }
    })

    async function nip07() {
        document.body.appendChild(document.createElement('script')).src = 'https://unpkg.com/window.nostr.js/dist/window.nostr.js';

        try {
            const signer = new NDKNip07Signer();
            const user = await signer.blockUntilReady();

            if (user) {
                $ndk.signer = signer;
                $ndk = $ndk
                localStorage.setItem("signed-in", "true");
            }
        } catch (e) {
            alert(e);
        }
    }
</script>

<Button on:click={nip07}>
    Login
</Button>