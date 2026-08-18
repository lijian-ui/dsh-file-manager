/**
 * React bindings for the framework-free stores: useSyncExternalStore with a
 * stable snapshot (the stores return immutable snapshots, so selector-free
 * subscription is safe), plus a stable-callback helper for event handlers.
 * @module dsh-filemgr/client/hooks/useStore
 */
import type { StateHandle } from '../store.ts';
/** Subscribe a component to one store (full snapshot). */
export declare function useStore<S>(store: StateHandle<S>): S;
//# sourceMappingURL=useStore.d.ts.map