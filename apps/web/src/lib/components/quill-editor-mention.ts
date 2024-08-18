import { userFollows } from '$stores/session';
import { searchUser } from '$lib/utils/search/user';
import { get } from 'svelte/store';
import type NDK from '@nostr-dev-kit/ndk';
import { prettifyNip05 } from '@nostr-dev-kit/ndk-svelte-components';

export default function (ndk: NDK) {
  return {
    source: async (searchTerm: any, renderList: any) => {
      const $userFollows = get(userFollows);
      const result = await searchUser(searchTerm, ndk, $userFollows);
      renderList(result);
    },
    showDenotationChar: false,
    dataAttributes: ['id', 'value', 'avatar', 'followed', 'nip05'],
    renderItem
  };
}

export function renderItem (data: any) {
  const div = document.createElement('div');
  div.classList.add('inline-flex', 'items-end', 'mention', 'gap-3', 'cursor-pointer');
  div.innerHTML = `<img src="${data.avatar}" class="w-7 h-7 rounded-full" />`;
  const span = document.createElement('span');
  span.classList.add('grow');
  span.innerText = data.value;
  div.appendChild(span);
  if (typeof data.nip05 === 'string') {
    const nip05Span = document.createElement('span');
    nip05Span.innerText = prettifyNip05(data.nip05, 30);
    nip05Span.classList.add('text-xs', 'opacity-40', 'truncate');
    div.appendChild(nip05Span);
  }
  return div;
}
