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

import { open, readdir, readFile, realpath, rename as renameFile, stat, writeFile, rm, mkdir } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import type { DirListing, FileRead, FsEntry, PanelError, SearchHit, SearchView } from '../core/types.ts'
import { isPathInside, type GateVerdict, type WorkspaceGate } from './gate.ts'

/** Preview text ceiling — mirrors FileManager's single-tab 80k-char cap. */
export const TEXT_CAP_CHARS = 80_000
/** Image read cap (data URL payload budget). */
const IMAGE_CAP_BYTES = 8 << 20
/** Filename-search caps (results and scanned entries). */
const SEARCH_HIT_CAP = 200
const SEARCH_SCAN_CAP = 20_000
/** Directories skipped by search (VS Code-like noise reduction). */
const SEARCH_SKIP_DIRS = new Set(['.git', 'node_modules'])
/** Directories never listed in the tree. */
const TREE_SKIP_DIRS = new Set(['.git'])
/**
 * Listing cap: a giant flat dir (node_modules top level) must not choke the
 * tree or the @ mention menu. The tail is dropped (no paging) — the explorer
 * tree stays usable and the truncated flag lets the UI hint at the cutoff.
 */
const MAX_ENTRIES = 1_000

/**
 * Resolve a relative path against the canonical root, realpath-checking the
 * existing ancestors so a symlink cannot smuggle the operation outside the
 * root. A path that does not yet exist (ENOENT) is verified through its
 * nearest existing ancestor — a nonexistent tail cannot itself be a symlink.
 * A path whose real path escapes the root is rejected with path-outside-root.
 */
async function resolveInsideRoot(root: string, rel: string): Promise<{ ok: true; abs: string } | { ok: false; error: PanelError }> {
  if (rel.includes('\0')) return { ok: false, error: { code: 'path-outside-root', message: 'invalid path' } }
  const abs = join(root, rel)
  if (!isPathInside(root, abs)) {
    return { ok: false, error: { code: 'path-outside-root', message: `path escapes root: ${rel}` } }
  }
  // Walk ancestors until we hit one that exists; validate its real path.
  let probe = abs
  for (let hop = 0; hop < 32; hop += 1) {
    let real: string
    try {
      real = await realpath(probe)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      // Any other realpath failure (EACCES/ELOOP/...) lets the operation run;
      // the caller's own try/catch maps permission/IO problems to its normal
      // not-found / write-failed codes.
      if (code !== 'ENOENT') return { ok: true, abs }
      // Ancestor does not exist yet; realpath the parent instead.
      const parent = dirname(probe)
      if (parent === probe) return { ok: true, abs }
      probe = parent
      continue
    }
    if (!isPathInside(root, real)) {
      return { ok: false, error: { code: 'path-outside-root', message: `path resolves outside root: ${rel}` } }
    }
    return { ok: true, abs }
  }
  return { ok: false, error: { code: 'path-outside-root', message: `path cannot be resolved: ${rel}` } }
}

/** True when the relative path is, or passes through, a .git component. */
function isGitPath(rel: string): boolean {
  return rel.split('/').some((part) => part.toLowerCase() === '.git')
}

/** Case-insensitive alpha compare (dirs first, then files). */
function compareEntries(a: FsEntry, b: FsEntry): number {
  if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
  const an = a.name.toLowerCase()
  const bn = b.name.toLowerCase()
  return an < bn ? -1 : an > bn ? 1 : 0
}

/** The image probe: parse PNG/JPEG/GIF/WebP header dimensions (undefined on failure). */
export function probeImageSize(data: Buffer): { width: number; height: number } | undefined {
  try {
    if (data.length >= 24 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) {
      return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
    }
    if (data.length >= 10 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
      // Walk the marker segments to the first SOF marker (frame header) and
      // read the dimensions there; the bytes right after SOI (`FF E0 ...`)
      // are an APP segment, not the frame dimensions. Bounded to 16 segments
      // so a malformed file cannot stall the probe.
      let pos = 2 // skip the SOI marker itself (FF D8)
      for (let segment = 0; segment < 16; segment += 1) {
        if (pos + 2 > data.length) return undefined
        if (data[pos] !== 0xff) return undefined
        // Skip any 0xFF padding before the actual marker byte.
        while (pos < data.length && data[pos] === 0xff) pos += 1
        if (pos >= data.length) return undefined
        const marker = data[pos]
        pos += 1
        // Standalone markers (TEM / RST0..RST7) carry no payload.
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0xd8) continue
        // SOF0..SOF15 (excluding DHT/DAC/DNL/...): the frame header with dims.
        const isSof =
          marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3 ||
          marker === 0xc5 || marker === 0xc6 || marker === 0xc7 ||
          marker === 0xc9 || marker === 0xca || marker === 0xcb ||
          marker === 0xcd || marker === 0xce || marker === 0xcf
        if (isSof) {
          // pos points at the length field: length(2) precision(1) height(2) width(2).
          if (pos + 7 > data.length) return undefined
          return { height: data.readUInt16BE(pos + 3), width: data.readUInt16BE(pos + 5) }
        }
        // A sized segment: 2-byte length (including itself) + its payload.
        if (pos + 2 > data.length) return undefined
        const length = data.readUInt16BE(pos)
        pos += length
        if (pos < 0) return undefined
      }
      return undefined
    }
    if (data.length >= 14 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
      return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) }
    }
    if (
      data.length >= 30 && data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50
      && data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38 && data[15] === 0x58
    ) {
      const size = (o: number): number => data[o] | (data[o + 1] << 8) | (data[o + 2] << 16)
      return { width: size(24) + 1, height: size(27) + 1 }
    }
  } catch {
    return undefined
  }
  return undefined
}

/** Mime lookup by file extension (undefined when the extension is unknown). */
function mimeByExtension(rel: string): string | undefined {
  const ext = rel.split('.').pop()?.toLowerCase() ?? ''
  const byExt: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon', avif: 'image/avif', bmp: 'image/bmp',
    pdf: 'application/pdf',
  }
  return byExt[ext]
}

/** Derive the mime type for a raw read from the extension, then the content. */
// pdf mappings (extension + %PDF magic) contributed by EricWang1358 (#239).
function imageMime(rel: string, data: Buffer): string {
  const byExt = mimeByExtension(rel)
  if (byExt !== undefined) return byExt
  if (data.length >= 3 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e) return 'image/png'
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg'
  if (data.length >= 4 && data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) return 'application/pdf'
  return 'application/octet-stream'
}

/** Read the first 4 magic bytes of a file (empty buffer when unreadable). */
async function readMagicBytes(abs: string): Promise<Buffer> {
  let handle: Awaited<ReturnType<typeof open>> | undefined
  try {
    handle = await open(abs, 'r')
    const buf = Buffer.alloc(4)
    const { bytesRead } = await handle.read(buf, 0, 4, 0)
    return buf.subarray(0, bytesRead)
  } catch {
    return Buffer.alloc(0)
  } finally {
    if (handle !== undefined) await handle.close().catch(() => {})
  }
}

/**
 * Filesystem service: gated listing/read/write/search/delete. All relative
 * paths are resolved against the gated root.
 * @param gate - the workspace gate (host: registered workspace membership).
 */
export class FsService {
  constructor(
    private readonly gate: WorkspaceGate,
  ) {}

  /** Verify a project root against the workspace gate (used by the SSE layer). */
  verify(root: string): Promise<GateVerdict> {
    return this.gate(root)
  }

  /**
   * List one directory (relative path; '' = root). Sorted dirs-first alpha.
   * Entry metadata comes straight from `Dirent` (name + is-directory only) —
   * no per-file stat — so listing a giant dir stays cheap. The result is
   * capped at MAX_ENTRIES (truncated flag) to keep the tree and the '@'
   * menu responsive on node_modules-style flat dirs.
   */
  async list(root: string, rel: string): Promise<DirListing | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    let dirents: Dirent[]
    try {
      dirents = await readdir(resolved.abs, { withFileTypes: true })
    } catch {
      return { code: 'not-found', message: `cannot list ${rel}` }
    }
    const entries: FsEntry[] = []
    for (const entry of dirents) {
      if (entry.isDirectory() && TREE_SKIP_DIRS.has(entry.name)) continue
      entries.push({
        name: entry.name,
        path: rel === '' ? entry.name : `${rel}/${entry.name}`,
        isDir: entry.isDirectory(),
        // No stat: size/mtime are not rendered by the tree and the '@'
        // menu no longer shows byte sizes. Kept as 0 for type stability.
        size: 0,
        mtime: 0,
      })
    }
    const truncated = entries.length > MAX_ENTRIES
    if (truncated) entries.length = MAX_ENTRIES
    entries.sort(compareEntries)
    return { root: gated.canonical, entries, truncated }
  }

  /** Read one file for preview: text decoded utf-8 (capped), images as data URLs. */
  async read(root: string, rel: string, asImage: boolean): Promise<FileRead | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    // Stat before reading: directories, oversized images, and the text cap
    // are all decidable from metadata, so a huge file never enters memory
    // just to be truncated afterwards.
    let info: Awaited<ReturnType<typeof stat>>
    try {
      info = await stat(resolved.abs)
    } catch {
      return { code: 'not-found', message: `cannot read ${rel}` }
    }
    if (info.isDirectory()) return { code: 'is-directory', message: `${rel} is a directory` }
    if (asImage) {
      if (info.size > IMAGE_CAP_BYTES) {
        return { code: 'read-failed', message: 'image exceeds preview cap' }
      }
      let data: Buffer
      try {
        data = await readFile(resolved.abs)
      } catch {
        return { code: 'not-found', message: `cannot read ${rel}` }
      }
      const mime = imageMime(rel, data)
      return {
        content: `data:${mime};base64,${data.toString('base64')}`,
        truncated: false,
        size: data.length,
        mtime: info.mtimeMs,
        image: probeImageSize(data),
      }
    }
    // Bounded text read: 4 bytes per UTF-8 code point is the worst case, so
    // this budget always covers the character cap without decoding the tail.
    const budget = TEXT_CAP_CHARS * 4 + 3
    let data: Buffer
    try {
      if (info.size <= budget) {
        data = await readFile(resolved.abs)
      } else {
        const handle = await open(resolved.abs, 'r')
        try {
          const buffer = Buffer.alloc(budget)
          const { bytesRead } = await handle.read(buffer, 0, budget, 0)
          data = buffer.subarray(0, bytesRead)
        } finally {
          await handle.close()
        }
      }
    } catch {
      return { code: 'not-found', message: `cannot read ${rel}` }
    }
    const text = data.toString('utf8')
    const truncated = info.size > data.length || text.length > TEXT_CAP_CHARS
    return {
      content: truncated ? text.slice(0, TEXT_CAP_CHARS) : text,
      truncated,
      size: info.size,
      mtime: info.mtimeMs,
    }
  }

  /**
   * Resolve one file for raw streaming (the markdown image / pdf preview
   * route): gated, traversal-guarded, and .git-refusing. Returns the absolute
   * path with the derived mime, size and mtime — the HTTP layer streams the
   * bytes itself (createReadStream + Range), so even large files never sit in
   * host memory. Mime magic detection reads only the first few bytes. The
   * mtime feeds the route's ETag/Last-Modified validators.
   */
  async readRaw(root: string, rel: string): Promise<{ abs: string; mime: string; size: number; mtime: number } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to read .git' }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    let info: Awaited<ReturnType<typeof stat>>
    try {
      info = await stat(resolved.abs)
    } catch {
      return { code: 'not-found', message: `cannot read ${rel}` }
    }
    if (info.isDirectory()) return { code: 'is-directory', message: `${rel} is a directory` }
    // Extension-known types skip the magic-bytes open/read entirely.
    const mime = mimeByExtension(rel) ?? imageMime(rel, await readMagicBytes(resolved.abs))
    return { abs: resolved.abs, mime, size: info.size, mtime: info.mtimeMs }
  }

  /** Write text content back, refusing when the file moved on disk (mtime conflict). */
  async write(
    root: string,
    rel: string,
    content: string,
    baseMtime?: number,
  ): Promise<{ mtime: number } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to touch .git' }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    try {
      let current: Awaited<ReturnType<typeof stat>>
      try {
        current = await stat(resolved.abs)
      } catch {
        current = { mtimeMs: 0 } as Awaited<ReturnType<typeof stat>>
      }
      if (baseMtime !== undefined && Number(current.mtimeMs) !== 0 && Math.abs(Number(current.mtimeMs) - baseMtime) > 1) {
        return { code: 'write-conflict', message: 'file changed on disk since it was loaded' }
      }
      await mkdir(dirname(resolved.abs), { recursive: true })
      await writeFile(resolved.abs, content, 'utf8')
      const info = await stat(resolved.abs)
      return { mtime: info.mtimeMs }
    } catch {
      return { code: 'write-failed', message: `cannot write ${rel}` }
    }
  }

  /**
   * Rename a path within the root. newName is a bare name (no separators,
   * no '.'/'..') so the target always stays in the source's own directory;
   * the joined target is re-checked against the canonical root anyway.
   */
  async rename(root: string, rel: string, newName: string): Promise<{ ok: true } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (rel === '') return { code: 'path-outside-root', message: 'refusing to rename the root' }
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to touch .git' }
    const name = newName.trim()
    if (name === '' || name === '.' || name === '..' || /[\\/]/.test(name)) {
      return { code: 'path-outside-root', message: `invalid name: ${newName}` }
    }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    // Spellings like '.', './' or 'sub/..' land on the root itself (trailing
    // separators included), so compare by relative(), not string equality.
    if (relative(gated.canonical, resolved.abs) === '') return { code: 'path-outside-root', message: 'refusing to rename the root' }
    const target = join(dirname(resolved.abs), name)
    if (!isPathInside(gated.canonical, target)) {
      return { code: 'path-outside-root', message: `path escapes root: ${rel}` }
    }
    try {
      await renameFile(resolved.abs, target)
      return { ok: true }
    } catch {
      return { code: 'write-failed', message: `cannot rename ${rel}` }
    }
  }

  /** Create a directory at a relative path (its parent must already exist). */
  async mkdir(root: string, rel: string): Promise<{ ok: true } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (rel === '') return { code: 'path-outside-root', message: 'refusing to create the root' }
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to touch .git' }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    try {
      await mkdir(resolved.abs)
      return { ok: true }
    } catch {
      return { code: 'write-failed', message: `cannot create directory ${rel}` }
    }
  }

  /** Create an empty file at a relative path (wx: refuses to overwrite). */
  async newFile(root: string, rel: string): Promise<{ ok: true } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (rel === '') return { code: 'path-outside-root', message: 'refusing to create the root' }
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to touch .git' }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    try {
      await writeFile(resolved.abs, '', { flag: 'wx' })
      return { ok: true }
    } catch {
      return { code: 'write-failed', message: `cannot create file ${rel}` }
    }
  }

  /**
   * Resolve a relative path to its gated absolute path without touching it —
   * the route layer uses it for reveal-in-file-manager / open-with-default.
   */
  async resolveAbsolute(root: string, rel: string): Promise<{ ok: true; abs: string } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to touch .git' }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    return { ok: true, abs: resolved.abs }
  }

  /** Recursive filename search (case-insensitive substring), pruned at noise dirs. */
  async search(root: string, query: string): Promise<SearchView | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    const needle = query.trim().toLowerCase()
    if (needle === '') return { query, hits: [], truncated: false }
    const hits: SearchHit[] = []
    let scanned = 0
    let truncated = false
    const walk = async (rel: string, depth: number): Promise<void> => {
      if (truncated) return
      const resolved = await resolveInsideRoot(gated.canonical, rel)
      if (!resolved.ok) return
      let dirents: Dirent[]
      try {
        dirents = await readdir(resolved.abs, { withFileTypes: true })
      } catch {
        return
      }
      for (const entry of dirents) {
        if (scanned >= SEARCH_SCAN_CAP) {
          truncated = true
          return
        }
        scanned += 1
        const path = rel === '' ? entry.name : `${rel}/${entry.name}`
        if (entry.isDirectory()) {
          if (SEARCH_SKIP_DIRS.has(entry.name)) continue
          if (depth < 24 && !truncated) await walk(path, depth + 1)
          continue
        }
        if (entry.name.toLowerCase().includes(needle)) {
          if (hits.length >= SEARCH_HIT_CAP) {
            truncated = true
            return
          }
          hits.push({ path, name: entry.name, isDir: false })
        }
      }
    }
    try {
      await walk('', 0)
    } catch {
      return { code: 'search-failed', message: 'search walk failed' }
    }
    // Rank: exact matches first, then prefix, then substring; shorter paths first.
    const rank = (hit: SearchHit): number => {
      const name = hit.name.toLowerCase()
      if (name === needle) return 0
      if (name.startsWith(needle)) return 1
      return 2
    }
    hits.sort((a, b) => rank(a) - rank(b) || a.path.length - b.path.length || (a.path < b.path ? -1 : 1))
    return { query, hits, truncated }
  }

  /** Delete a path (discard of untracked files). Recursive for directories. */
  async delete(root: string, rel: string): Promise<{ ok: true } | PanelError> {
    const gated = await this.gate(root)
    if (!gated.ok) return gated.error
    if (rel === '') return { code: 'path-outside-root', message: 'refusing to delete the root' }
    if (isGitPath(rel)) return { code: 'path-outside-root', message: 'refusing to touch .git' }
    const resolved = await resolveInsideRoot(gated.canonical, rel)
    if (!resolved.ok) return resolved.error
    // Spellings like '.', './' or 'sub/..' land on the root itself (trailing
    // separators included), so compare by relative(), not string equality.
    if (relative(gated.canonical, resolved.abs) === '') return { code: 'path-outside-root', message: 'refusing to delete the root' }
    try {
      await rm(resolved.abs, { recursive: true, force: true })
      return { ok: true }
    } catch {
      return { code: 'write-failed', message: `cannot delete ${rel}` }
    }
  }
}
