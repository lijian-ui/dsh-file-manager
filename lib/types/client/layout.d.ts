/**
 * The DOM layout controller: extends the web shell's three-column frame
 * (`[data-dsh-frame]`, a grid) with two trailing grid tracks — the preview
 * region and the explorer column — by mirroring the shell's own inline
 * grid-template-columns string and re-appending the two panel tracks on every
 * shell update (MutationObserver, same frame before paint). Also owns the
 * absolute drag handles (12px explorer / 20px preview hit zones), the
 * floating expand button (docked at the top-right corner, just below the
 * shell header's divider — issues #374 / #292), the collapse-as-width-0
 * keep-mounted behavior, and the transient
 * maximize mode (issue #315): while a panel is maximized the target column
 * takes over the whole frame row (or renders as a fixed full-screen overlay
 * on narrow viewports), and Esc / the header button restore the layout.
 *
 * The shell's inline style is the source of truth for the sidebar and details
 * tracks; this controller never guesses their widths. Handles are out-of-flow
 * (absolute), so appending tracks never disturbs the shell's own children.
 *
 * FileManager Layout architecture (Apache-2.0, re-implemented): the explorer
 * column collapses to width 0 while staying mounted; the preview region keeps
 * a 1px left border only (no outer margins — gaps would expose the window
 * background, jarring in dark mode).
 * @module dsh-filemgr/client/layout
 */
import type { LayoutStore } from './store.ts';
/** Read the current frame element (undefined while the shell is not mounted). */
export declare function getFrameElement(): HTMLElement | null;
/**
 * Parse an inline grid-template-columns string into its tracks. Handles
 * "minmax(0, 1fr)" (spaces inside parens must not split). Empty on failure.
 */
export declare function parseGridTracks(input: string): string[];
/** Extract a px width from one track (0 for fr/minmax/non-px tracks). */
export declare function trackPx(track: string): number;
/** One drag handle's geometry (hit zone + visual line) — pure CSS in the module. */
export declare const EXPLORER_HANDLE_WIDTH = 12;
export declare const PREVIEW_HANDLE_WIDTH = 20;
/**
 * Drag target width: apply the hard px bounds (the same min/max the handle
 * always enforced), then the store's ordered container-aware clamp so the
 * grid never re-clamps a width the drag showed.
 */
export declare function dragTargetWidth(kind: 'explorer' | 'preview', startWidth: number, deltaX: number, snapshot: {
    availableWidth: number;
    previewOpen: boolean;
    explorerWidth: number;
}): number;
/** The layout controller: frame sync, handles, floating button, width math. */
export declare class PanelLayoutController {
    private readonly layout;
    private frame;
    private previewCol;
    private explorerCol;
    private explorerHandle;
    private previewHandle;
    private floatingButton;
    private styleObserver;
    private sizeObserver;
    private waitObserver;
    private frameWidth;
    /** Cached shell details handle (re-resolved when the shell rebuilds it). */
    private detailsHandle;
    /** The shell's own 3 tracks (sidebar, center, details) — mirror of its inline style. */
    private shellTracks;
    private instantTimer;
    private disposers;
    constructor(layout: LayoutStore);
    /** Start watching for the frame and attach once it appears. */
    mount(): void;
    /** Attach to the frame: columns, handles, observers, store subscription. */
    private attach;
    /** Create one drag handle element with its pointer wiring. */
    private createHandle;
    /** Toggle explorer collapse (width 0, kept mounted; no transition). */
    toggleExplorer(): void;
    /** Toggle the preview region (open = tabs exist; close keeps tabs). */
    setPreviewOpen(open: boolean): void;
    /**
     * Locate the shell conversation header: its bottom border is the
     * horizontal divider under the "Session log" row the button should
     * sit below. Resolved per call (the shell may mount it late); null when
     * the shell has no header (standalone installs, desktop variants).
     */
    private findHeaderBottom;
    /** Position the floating button: docked at the top-right corner, just
     * below the shell header's bottom divider (fallback: the chevron row). */
    private positionFloatingButton;
    /** Apply one store update with transitions disabled for exactly one frame. */
    private instant;
    /** Re-write the frame grid and reposition handles + floating button. */
    private applyGrid;
    /**
     * Maximize layout: the target column takes over the whole frame row (the
     * other tracks collapse to 0px). On narrow viewports the takeover grid is
     * skipped and the column renders as a fixed full-screen overlay instead
     * (issue #315). Everything stays mounted — only geometry changes.
     */
    private applyMaximized;
    /** Remove the narrow-screen overlay class from both columns. */
    private clearMaximizedChrome;
    /** Detach everything (plugin unload). */
    dispose(): void;
}
//# sourceMappingURL=layout.d.ts.map