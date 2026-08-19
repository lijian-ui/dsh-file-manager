/**
 * DockItem — a round dock button for the conversation session header.
 * Each plugin owns its own DockItem copy (terminal in dsh-term, file-panel in
 * dsh-file-manager). Hover scales the button up via pure CSS — no JS event
 * coordination, no shared motion value.
 * @module dsh-file-manager/client/DockItem
 */
import { type ReactElement, type ReactNode } from 'react';
export declare function DockItem(props: {
    active: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
}): ReactElement;
//# sourceMappingURL=DockItem.d.ts.map