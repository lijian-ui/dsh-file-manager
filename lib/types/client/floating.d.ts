/**
 * Floating expand button geometry (issues #374 / #292): the button is a
 * fixed chrome element docked at the viewport's top-right corner, just
 * below the shell conversation header — the horizontal divider under the
 * "Session log" row — so the re-expand control sits below the header
 * chrome instead of overlapping it. Its top stays below the Window
 * Controls Overlay titlebar strip when dsh-desktop reports one (issue
 * #292). Every computed position is clamped into the usable range.
 * @module dsh-filemgr/client/floating
 */
/** Breathing room above/below the button (px). */
export declare const FLOATING_MARGIN_PX = 6;
/** Gap between the shell header's bottom divider and the button top (px). */
export declare const FLOATING_HEADER_GAP_PX = 8;
/** The button's rendered size (kept in sync with tokens.module.css). */
export declare const FLOATING_BUTTON_HEIGHT_PX = 24;
/** Top offset of the explorer's collapse chevron inside its tab bar (px).
 * Used only as a fallback when the shell conversation header is not found
 * (kept in sync with the chevron rule in tokens.module.css). */
export declare const COLLAPSE_CHEVRON_TOP_PX = 6;
/** The WCO titlebar height when visible; 0 in a plain browser tab. */
export declare function titlebarAreaHeight(): number;
/** Clamp a requested top px into the usable vertical range. */
export declare function clampFloatingTop(top: number, viewportHeight: number, buttonHeight: number, titlebar: number): number;
/** The default top: aligned with the collapse chevron at the top-right. */
export declare function topAlignedFloatingTop(viewportHeight: number, buttonHeight: number, titlebar: number): number;
//# sourceMappingURL=floating.d.ts.map