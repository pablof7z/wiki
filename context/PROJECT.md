# Wikifreedia

Wikifreedia is a decentralized, censorship-resistant alternative to Wikipedia, built entirely on the Nostr protocol. It was created by developer Pablo Fernandez (@PABLOF7z) to demonstrate how a collaborative knowledge repository can exist without centralized control.

The core principle of Wikifreedia is that there is **no single source of truth**. Multiple perspectives and versions of a topic can coexist, and it is up to the community to decide which versions they find most valuable through a voting mechanism.

## Core Principles

*   **No Single Source of Truth:** Unlike traditional wikis, Wikifreedia allows multiple, parallel versions of an article to exist. Different authors can publish their own take on the same subject.
*   **Open and Permissionless:** Anyone with a Nostr identity can create, edit, or "fork" an article without needing prior approval from a central authority.
*   **Community Curation:** The platform incorporates a voting mechanism that allows the community to signal which versions of an article they find most accurate or valuable.
*   **Censorship-Resistant:** Because all content is stored as Nostr events and broadcasted to a network of relays, no single entity can block, modify, or remove content.

## User Flows

Users interact with Wikifreedia through a web-based interface. The primary user journey involves:

1.  **Authentication**: Users connect to the platform using a Nostr NIP-07 compatible signer (like the Alby browser extension), ensuring a secure and decentralized login experience.
2.  **Content Discovery**: Users can browse, search for, and discover articles on various topics. The official website is **wikifreedia.xyz**.
3.  **Content Creation & Editing**: Any authenticated user can create a new article or propose an edit to an existing one. Articles are written in Asciidoc format and published using a rich-text editor.
4.  **Collaboration & Versioning**: Instead of a single "edit history," users can "fork" an entire article to create their own version. This allows for competing narratives to coexist, which other users can then view and compare.
5.  **Curation**: Users can vote on the different versions of an article, helping others to find the most trusted or highest-quality content.

## Upcoming Features

### Decentralized Knowledge Graph
To enhance content discovery and reveal the relationships between articles, Wikifreedia will introduce a decentralized knowledge graph. This feature will allow authors to explicitly link articles together, creating a rich, interconnected web of knowledge. Users will be able to visualize these connections, navigate between related topics seamlessly, and gain a deeper understanding of the context surrounding any given topic.

## Technical Foundation

Wikifreedia is built on Nostr and uses specific event kinds for its functionality:

*   **Kind 30818**: The core `Nostr Wiki Article` event. Used for addressable, encyclopedic entries.
*   **Kind 30819**: Used for creating redirects between topics.
