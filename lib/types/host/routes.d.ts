/**
 * /filemgr/* route layer: JSON envelope (ok/error with stable codes) for
 * the fs/git operations and one SSE stream (git status changes) per project
 * root. The services own gating and parsing; this layer owns HTTP shape and
 * subscriber bookkeeping.
 *
 * There is deliberately no fs-change push: the explorer/preview refresh on
 * user actions and the SCM tab polls git status here, so a recursive
 * fs.watch over the workspace (a measurable cost on large trees) is not
 * needed. Subscribers only exist while an SCM panel is visible, so the
 * git poll below runs only during that window.
 * @module dsh-filemgr/host/routes
 */
import type { Context } from '@deepseek-ai/cordis';
import type { FsService } from './fs-service.ts';
import type { GitService } from './git-service.ts';
/**
 * Platform argv for "reveal in file manager" (select the entry). Windows
 * Explorer selects via /select,; macOS Finder via open -R; Linux desktops
 * have no select mode, so xdg-open opens the parent directory.
 */
export declare function revealArgv(platform: NodeJS.Platform, abs: string): string[];
/** Platform argv for "open with the default app". */
export declare function openArgv(platform: NodeJS.Platform, abs: string): string[];
/**
 * Parse a `Range: bytes=start-end` header against the file size. RFC 7233
 * lets a server ignore any Range it does not support, so unknown units,
 * malformed headers and multi-range requests all return null (the caller
 * answers 200 with the full body); only a syntactically valid single range
 * that cannot be satisfied returns 'invalid' (the caller answers 416).
 * Suffix ranges (`bytes=-N`) select the last N bytes. Range support added
 * after human review on #242 (pdf seeking); ignore-instead-of-416 for
 * unsupported shapes per maintainer feedback.
 */
export declare function parseRangeHeader(header: string | undefined, size: number): {
    start: number;
    end: number;
} | 'invalid' | null;
/**
 * Whether an If-None-Match header matches the current etag. Handles `*` and
 * comma-separated entity-tag lists; GET revalidation uses weak comparison
 * (RFC 9110), so the weak prefix is ignored on both sides.
 */
export declare function ifNoneMatchSaidFresh(header: string | undefined, etag: string): boolean;
/**
 * Register the /filemgr routes (prefix for JSON, exact for the SSE
 * stream — longest-prefix-wins keeps them disjoint).
 * @param ctx - context carrying the webServer service.
 * @param fs - the gated filesystem service.
 * @param git - the gated git service.
 * @returns the route disposers.
 */
export declare function registerPanelRoutes(ctx: Context, fs: FsService, git: GitService): () => void;
//# sourceMappingURL=routes.d.ts.map