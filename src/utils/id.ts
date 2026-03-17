import { loadStore } from '../store.js';

export function getNextId(): number {
  return loadStore().next_id;
}
