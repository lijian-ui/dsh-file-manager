/**
 * Self-contained build config for @lijian-ui/dsh-file-manager.
 *
 * Ported from the dsh-web-ui `shared/tsdown.client.ts` preset (the original
 * referenced `../../shared/tsdown.client.ts`, which does not exist under
 * extensions/). Emits two artifacts into a single lib/ dir:
 *
 *   1. Host half  — ESM lib/index.js (+ d.ts): the workspace-gated fs/git
 *      services and the /filemgr/* HTTP routes, run in the node host process.
 *   2. Client half — CJS lib/client.js: the browser panel UI, wrapped in the
 *      loader's closure-factory handoff (window.__ModuleLoader__.load). CSS
 *      Modules are compiled by lightningcss and auto-injected as a
 *      <style data-plugin="<id>"> tag at factory execution.
 *
 * The platform module list mirrors web-platform.ts in the harness checkout.
 * @module @lijian-ui/dsh-file-manager/tsdown
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { basename, dirname, isAbsolute, relative, resolve as resolvePath, sep } from 'node:path'
import { defineConfig } from 'tsdown'
import { transform } from 'lightningcss'

const PLUGIN_ID = '@lijian-ui/dsh-file-manager'

/**
 * Platform seed modules the shell shares into the frozen module table. These
 * resolve through the loader's require() at runtime and must stay external.
 */
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-schema-form',
] as const

/**
 * Documented temporary exemption (not a platform module): the snapshot-store
 * engine lives in runtime pending its promotion-time rehoming. At runtime the
 * lazy CJS table answers the require natively.
 */
const RUNTIME_STORE_EXEMPTION = '@deepseek-ai/dsh-client-runtime/client'

/** Externals resolved from the loader module table. */
const CLIENT_EXTERNALS: readonly string[] = [...PLATFORM_MODULES, RUNTIME_STORE_EXEMPTION]

/**
 * Wire/type layers a client bundle may inline (browser-safe contract surfaces
 * with no shared runtime identity). Everything else under @deepseek-ai/* is
 * either a module-table entry (external) or a leak the purity gate rejects.
 */
const INLINE_SAFE = /^@deepseek-ai\/dsh-(host-apiproxy|session|llm|tools|brand)(\/|$)/
const GENERATED_REMOTE = /^@deepseek-ai\/dsh-[a-z0-9]+(?:-[a-z0-9]+)*\/remote$/

/** Repository root for this standalone package (deterministic virtual ids). */
const REPOSITORY_ROOT = fileURLToPath(new URL('.', import.meta.url))

/** Rebase a physical path onto a repository-relative id when it lives under the repo. */
function repositoryRelativePath(physical: string): string {
  if (!isAbsolute(physical)) return physical
  const repositoryPath = relative(REPOSITORY_ROOT, physical).split(sep).join('/')
  return repositoryPath.startsWith('../') ? physical : repositoryPath
}

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

/**
 * Resolve an emitted JS asset import against its source-tree counterpart.
 */
function sourceAssetPath(source: string, importer: string): string {
  const emitted = resolvePath(dirname(importer), source)
  if (existsSync(emitted)) return emitted
  const marker = `${sep}lib${sep}types${sep}`
  const boundary = emitted.indexOf(marker)
  if (boundary < 0) return emitted
  return resolvePath(emitted.slice(0, boundary), 'src', emitted.slice(boundary + marker.length))
}

/**
 * Host half: ESM library with .d.ts for the single-entry bundle.
 */
const hostConfig = {
  name: PLUGIN_ID,
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['esm'] as const,
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  // The host .d.ts is emitted by `tsc -b` (tsconfig.host.json → lib/types);
  // tsdown's rolldown-plugin-dts cannot load the solution tsconfig (it has
  // "references"), so dts emission stays with tsc. Keep `clean: false` so the
  // host build does not wipe the `lib/types` directory tsc just wrote.
  dts: false,
  clean: false,
  // cordis resolves at runtime from the dsh profile tree, never from this
  // repo's install; its .ts-suffixed relative imports rolldown cannot follow.
  external: ['@deepseek-ai/cordis'],
}

/**
 * Browser half: CJS bundle landed exactly at lib/client.js, wrapped in the
 * loader's factory handoff format.
 */
const clientConfig = {
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  external: [...CLIENT_EXTERNALS],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
  },
  noExternal: (id: string) => (CLIENT_EXTERNALS.includes(id) ? undefined : true),
  plugins: [{
    name: 'dsh-client-bundle-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (CLIENT_EXTERNALS.includes(source)) return null
      if (INLINE_SAFE.test(source) || GENERATED_REMOTE.test(source)) return null
      throw new Error(
        `client bundle purity: "${source}" is not a platform module (CLIENT_EXTERNALS), an inline-safe wire layer, or a generated /remote contribution — `
        + 'cross-plugin value imports are forbidden; collaborate through cordis services',
      )
    },
  }, {
    name: 'dsh-css-modules-inline',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith('.module.css')) return null
      const abs = importer !== undefined ? sourceAssetPath(source, importer) : source
      return CSS_VIRTUAL_PREFIX + repositoryRelativePath(abs) + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const fileId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      const physical = isAbsolute(fileId) ? fileId : resolvePath(REPOSITORY_ROOT, fileId)
      this.addWatchFile(physical)
      const source = await readFile(physical)
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      for (const [local, exp] of Object.entries(cssExports ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
        classMap[local] = exp.name
      }
      return [
        `const css = ${JSON.stringify(code.toString())};`,
        `const tagId = ${JSON.stringify(`${PLUGIN_ID}/${basename(fileId)}`)};`,
        'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
        '  const tag = document.createElement(\'style\');',
        `  tag.dataset.plugin = ${JSON.stringify(PLUGIN_ID)};`,
        '  tag.dataset.pluginCss = tagId;',
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
        `export default ${JSON.stringify(classMap)};`,
      ].join('\n')
    },
  }],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default defineConfig([hostConfig, clientConfig])
