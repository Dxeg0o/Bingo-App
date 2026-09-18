import type { BingoGameState } from "./types";

export const CHANNEL_NAME = "bingo-game";

export type SyncMessage =
  | { type: "state"; senderId: string; state: BingoGameState }
  | { type: "request"; senderId: string };

export const CLIENT_ID = Math.random().toString(36).slice(2, 10);

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function publishState(state: BingoGameState): void {
  getChannel()?.postMessage({ type: "state", senderId: CLIENT_ID, state } satisfies SyncMessage);
}

export function requestState(): void {
  getChannel()?.postMessage({ type: "request", senderId: CLIENT_ID } satisfies SyncMessage);
}

export function subscribe(handler: (message: SyncMessage) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};
  const listener = (event: MessageEvent<SyncMessage>) => {
    const data = event.data;
    if (!data || data.senderId === CLIENT_ID) return;
    handler(data);
  };
  ch.addEventListener("message", listener);
  return () => ch.removeEventListener("message", listener);
}
