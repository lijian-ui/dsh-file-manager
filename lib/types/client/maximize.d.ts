/**
 * Maximize-mode geometry (issue #315): when a panel is maximized the layout
 * controller rewrites the frame grid so the target column takes the whole
 * row (sidebar, details, chat and the other panel collapse to 0px tracks —
 * everything stays mounted, nothing unmounts). On narrow viewports the
 * maximized column instead leaves the grid and renders as a fixed
 * full-screen overlay (mobile-friendly full-screen mode), so the shell's
 * own narrow layout stays untouched behind it.
 * @module dsh-filemgr/client/maximize
 */
import type { MaximizeTarget } from './store.ts';
/** Below this available row width the maximized panel renders as a fixed
 * full-screen overlay instead of a grid takeover. */
export declare const MAXIMIZE_OVERLAY_BREAKPOINT_PX = 640;
/**
 * The five grid tracks while one panel is maximized: shell sidebar, chat,
 * shell details and the other panel all collapse to 0px; the target column
 * takes the whole measured frame width. Tracks are the same string shape the
 * shell's own inline style uses (px + fr), so nothing else needs to change.
 */
export declare function maximizedGridTracks(target: MaximizeTarget, frameWidth: number): string;
/** Whether the maximized panel should render as a fixed full-screen overlay. */
export declare function maximizedOverlay(availableWidth: number): boolean;
//# sourceMappingURL=maximize.d.ts.map