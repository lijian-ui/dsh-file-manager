/**
 * Mermaid diagram enhancement for markdown surfaces: lazily loads the
 * mermaid runtime from the host vendor route (same origin, no CDN), renders
 * every fenced ```mermaid code block in place, and re-renders on theme
 * flips. Framework-free so both the preview panel (React effect) and the
 * chat transcript observer can drive it over disjoint DOM scopes.
 *
 * Failure policy: any load/render failure leaves the original code block
 * untouched (or restores it verbatim); nothing here throws to the caller.
 * @module dsh-filemgr/client/preview/mermaid
 */
/** Minimal structural type of the mermaid runtime this module consumes. */
interface MermaidRuntime {
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, text: string, container?: HTMLElement) => Promise<{
        svg: string;
    }>;
}
/** Host-served mermaid IIFE bundle (lib/assets/mermaid.min.js behind the route). */
export declare const MERMAID_VENDOR_URL = "/filemgr/vendor/mermaid.js";
/** Marker the preview viewer stamps on its own subtree (chat enhancement skips it). */
export declare const DATA_MD_SCOPE = "data-filemgr-md-scope";
/**
 * Load the mermaid runtime once per page: injects a <script> for the host
 * vendor route and resolves with the runtime. Concurrent callers share one
 * injection; a failure clears the cache so a later surface can retry.
 */
export declare function loadMermaidLibrary(): Promise<MermaidRuntime>;
/** Mermaid theme name for the shell theme marker (`default` or `dark`). */
export declare function mermaidTheme(isDark: boolean): 'default' | 'dark';
/** Whether the shell currently carries the dark marker attribute. */
export declare function shellIsDark(): boolean;
/**
 * Application-level defense-in-depth on top of mermaid's own strict-mode
 * escaping: parse the rendered SVG in a detached container, remove disallowed
 * elements and dangerous attributes, and return the serialized cleaned markup.
 * Throws when the input cannot be parsed as markup or still carries dangerous
 * raw tokens, so callers fall back to their failure path.
 */
export declare function sanitizeSvg(svg: string): string;
/**
 * Collect the still-unclaimed fenced mermaid code blocks under one scope.
 * Both shapes are found: the panel renderer's `pre.language-mermaid` and
 * the chat renderer's `pre > code.language-mermaid` (the claim always
 * targets the <pre>). Empty blocks and blocks another driver already
 * claimed are skipped. Pure (DOM-read only) so tests can drive it in jsdom.
 */
export declare function findMermaidCodeBlocks(scope: ParentNode): HTMLPreElement[];
/** Options for {@link enhanceMermaidBlocks}. */
export interface EnhanceOptions {
    /** Class for the diagram container (a CSS module export). */
    className: string;
    /** Resolved mermaid theme name. */
    theme: string;
    /** Optional extra exclusion for scopes another driver owns. */
    skip?: (pre: HTMLPreElement) => boolean;
}
/**
 * Render every unclaimed ```mermaid block under `scope` into an inline SVG
 * diagram. Idempotent per block across drivers (claimed blocks are skipped);
 * failures restore the original code block. Never rejects.
 */
export declare function enhanceMermaidBlocks(scope: ParentNode, options: EnhanceOptions): Promise<void>;
/**
 * Re-render every completed diagram container under `scope` after a theme
 * flip (stored sources re-render with the new theme). Containers not in the
 * `done` state are skipped; a failure keeps the previous render.
 */
export declare function rethemeMermaidBlocks(scope: ParentNode, options: {
    theme: string;
}): Promise<void>;
/**
 * One dark-marker watcher per surface: fires on body attribute flips so the
 * caller can retheme. Returns the disposer.
 */
export declare function watchShellTheme(onChange: (isDark: boolean) => void): () => void;
export {};
//# sourceMappingURL=mermaid.d.ts.map