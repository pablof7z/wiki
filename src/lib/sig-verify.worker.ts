import { schnorr } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";

/**
 * Web worker for signature verification.
 * Verifies event signatures asynchronously to avoid blocking the main thread.
 */
globalThis.onmessage = (msg: MessageEvent) => {
    const { serialized, id, sig, pubkey } = msg.data as {
        serialized: string;
        id: string;
        sig: string;
        pubkey: string;
    };

    queueMicrotask(() => {
        const eventHash = sha256(new TextEncoder().encode(serialized));

        const idBytes = hexToBytes(id);
        const sigBytes = hexToBytes(sig);
        const pubkeyBytes = hexToBytes(pubkey);

        // Verify the event hash matches the id
        if (!compareTypedArrays(eventHash, idBytes)) {
            postMessage([id, false]);
            return;
        }

        // Verify the signature
        try {
            const result = schnorr.verify(sigBytes, eventHash, pubkeyBytes);
            postMessage([id, result]);
        } catch (error) {
            console.error("Signature verification error:", error);
            postMessage([id, false]);
        }
    });
};

function compareTypedArrays(arr1: Uint8Array, arr2: Uint8Array): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

function hexToBytes(value: string): Uint8Array {
    const pairs = value.match(/.{1,2}/g) ?? [];
    return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)));
}
