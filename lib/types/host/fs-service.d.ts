/**
 * Host filesystem service for the panel: directory listing, file read with a
 * preview ceiling, text write with an mtime conflict check, filename search
 * with directory pruning, and delete (untracked discard). Every operation
 * resolves against a gated project root and refuses to escape it (path
 * traversal guard). Text is decoded utf-8; images come back as data URLs
 * (capped) so the browser renders them without extra round trips.
 *
 * Change delivery is intentionally NOT watch-based: the panel refreshes on
 * user actions (list/read/write) and the SCM tab polls git status on its own
 * schedule. A recursive `fs.watch` over the workspace root turned out to be
 * a measurable CPU/IO cost on large trees (a 70k-file workspace pushed the
 * host process to ~70% CPU during write bursts) for near-zero visible
 * benefit — content edits never auto-reloaded the preview anyway (only a
 * "updated" badge), so the always-on watcher was removed.
 * @module dsh-filemgr/host/fs-service
 */
import type { DirListing, FileRead, PanelError, SearchView } from '../core/types.ts';
import { type GateVerdict, type WorkspaceGate } from './gate.ts';
/** Preview text ceiling — mirrors FileManager's single-tab 80k-char cap. */
export declare const TEXT_CAP_CHARS = 80000;
/** The image probe: parse PNG/JPEG/GIF/WebP header dimensions (undefined on failure). */
export declare function probeImageSize(data: Buffer): {
    width: number;
    height: number;
} | undefined;
/**
 * Filesystem service: gated listing/read/write/search/delete. All relative
 * paths are resolved against the gated root.
 * @param gate - the workspace gate (host: registered workspace membership).
 */
export declare class FsService {
    private readonly gate;
    constructor(gate: WorkspaceGate);
    /** Verify a project root against the workspace gate (used by the SSE layer). */
    verify(root: string): Promise<GateVerdict>;
    /**
     * List one directory (relative path; '' = root). Sorted dirs-first alpha.
     * Entry metadata comes straight from `Dirent` (name + is-directory only) —
     * no per-file stat — so listing a giant dir stays cheap. The result is
     * capped at MAX_ENTRIES (truncated flag) to keep the tree and the '@'
     * menu responsive on node_modules-style flat dirs.
     */
    list(root: string, rel: string): Promise<DirListing | PanelError>;
    /** Read one file for preview: text decoded utf-8 (capped), images as data URLs. */
    read(root: string, rel: string, asImage: boolean): Promise<FileRead | PanelError>;
    /**
     * Resolve one file for raw streaming (the markdown image / pdf preview
     * route): gated, traversal-guarded, and .git-refusing. Returns the absolute
     * path with the derived mime, size and mtime — the HTTP layer streams the
     * bytes itself (createReadStream + Range), so even large files never sit in
     * host memory. Mime magic detection reads only the first few bytes. The
     * mtime feeds the route's ETag/Last-Modified validators.
     */
    readRaw(root: string, rel: string): Promise<{
        abs: string;
        mime: string;
        size: number;
        mtime: number;
    } | PanelError>;
    /** Write text content back, refusing when the file moved on disk (mtime conflict). */
    write(root: string, rel: string, content: string, baseMtime?: number): Promise<{
        mtime: number;
    } | PanelError>;
    /**
     * Rename a path within the root. newName is a bare name (no separators,
     * no '.'/'..') so the target always stays in the source's own directory;
     * the joined target is re-checked against the canonical root anyway.
     */
    rename(root: string, rel: string, newName: string): Promise<{
        ok: true;
    } | PanelError>;
    /** Create a directory at a relative path (its parent must already exist). */
    mkdir(root: string, rel: string): Promise<{
        ok: true;
    } | PanelError>;
    /** Create an empty file at a relative path (wx: refuses to overwrite). */
    newFile(root: string, rel: string): Promise<{
        ok: true;
    } | PanelError>;
    /**
     * Resolve a relative path to its gated absolute path without touching it —
     * the route layer uses it for reveal-in-file-manager / open-with-default.
     */
    resolveAbsolute(root: string, rel: string): Promise<{
        ok: true;
        abs: string;
    } | PanelError>;
    /** Recursive filename search (case-insensitive substring), pruned at noise dirs. */
    search(root: string, query: string): Promise<SearchView | PanelError>;
    /** Delete a path (discard of untracked files). Recursive for directories. */
    delete(root: string, rel: string): Promise<{
        ok: true;
    } | PanelError>;
}
//# sourceMappingURL=fs-service.d.ts.map