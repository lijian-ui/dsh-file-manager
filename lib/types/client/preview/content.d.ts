/**
 * Preview content routing: the renderers for every content type plus the
 * split-screen editor|preview layout. View mode (source/preview) resets to
 * preview when the displayed FILE changes (keyed on path+type, not tab id —
 * FileManager contract), and the split ratio is persisted under
 * preview-panel-split-ratio with a 20..80 clamp.
 * @module dsh-filemgr/client/preview/content
 */
import type { JSX } from 'react';
import type { PreviewTabState } from '../store.ts';
/** Split-ratio persistence key (FileManager contract). */
export declare const KEY_SPLIT_RATIO = "preview-panel-split-ratio";
/** The rendered content of one tab (viewMode/split are controlled by the panel). */
export declare function TabContent({ tab, viewMode, split, onContentChange, onSave, }: {
    tab: PreviewTabState;
    viewMode: 'source' | 'preview';
    split: boolean;
    onContentChange: (content: string) => void;
    onSave: () => void;
}): JSX.Element;
/**
 * Syntax-highlighted code/text viewer (official shiki core via CodeBlock),
 * wrapped in a line-number gutter.
 *
 * Alignment strategy: instead of trusting CSS to mirror the code block's
 * internal metrics (its language banner, `pre` padding and line-height are
 * owned by the primitives package), the gutter is measured against the live
 * `pre` — its top offset inside the shell (the banner's height) and its
 * computed line-height are read after render and applied as inline styles.
 * This keeps the numbers exactly on their lines regardless of the primitives'
 * internal layout. The trailing newline is not counted (CodeBlock trims it).
 */
export declare function CodeViewer({ content, language }: {
    content: string;
    language: string;
}): JSX.Element;
/** Parse CSV lines (quoted cells with escaped quotes). */
export declare function parseCsv(text: string): string[][];
/** Convert a data URL to a Blob (null on failure). */
export declare function dataUrlToBlob(dataUrl: string): Blob | null;
/** Bare domains get https://; whitespace queries go to a search engine. */
export declare function normalizeUrl(input: string): string;
//# sourceMappingURL=content.d.ts.map