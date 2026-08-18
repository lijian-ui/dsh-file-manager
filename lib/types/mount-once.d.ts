/**
 * Host single-instance guard shared by the plugin family. The family bundle
 * (dsh-web-ui-all / dsh-skins) namespaces every child row id (web-ui-*), so
 * the loader accepts a standalone install of the same package side by side;
 * without this guard the second instance would still re-register the same
 * webserver routes, tools, settings namespaces, and system-prompt sections
 * and fail the boot. mountOnce makes the second host apply a no-op for the
 * lifetime of the first instance (the browser half is already deduped by
 * package name in the client module host).
 *
 * The registry rides a global symbol so two module instances of the same
 * package (npm copy vs repository link) still share one verdict. cordis
 * `ctx.effect` runs its callback immediately and treats the callback's
 * return value as the fiber disposer, so the unmarker is returned, not run.
 */
/**
 * Wrap a cordis plugin apply so the package runs at most once per process.
 * The first mount registers normally and unmarks when its fiber disposes;
 * any later mount of the same package name is a no-op.
 * @param packageName - npm package identity shared by every install source.
 * @param fn - the original plugin apply.
 * @returns an apply of the same shape.
 */
export declare function mountOnce<T extends (...args: any[]) => unknown>(packageName: string, fn: T): T;
//# sourceMappingURL=mount-once.d.ts.map