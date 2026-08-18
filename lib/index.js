import { Service } from "@deepseek-ai/cordis";
import { mkdir, open, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region node_modules/@deepseek-ai/dsh-settings/lib/index.js
/**
* Structural secret redaction for settings values. `role('secret')` fields are
* removed from a value before it crosses a wire boundary; a sidecar records
* each schema-declared secret position and whether it currently holds a value,
* so a configuration surface can render a write-only input without ever
* receiving the secret itself.
* @module @deepseek-ai/dsh-settings/redact
*/
/** Whether a value is a plain data object the walker may recurse into. */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function walk(node, value, path, secrets) {
	if (node === void 0) return value;
	if (node.meta?.role === "secret") {
		secrets.push({
			path,
			set: value !== void 0
		});
		return;
	}
	switch (node.type) {
		case "object": {
			const properties = node.dict ?? {};
			const source = isRecord(value) ? value : void 0;
			const rebuilt = {};
			if (source !== void 0) for (const [key, entry] of Object.entries(source)) {
				if (key in properties) continue;
				rebuilt[key] = entry;
			}
			for (const [key, child] of Object.entries(properties)) {
				const stripped = walk(child, source?.[key], [...path, key], secrets);
				if (stripped !== void 0) rebuilt[key] = stripped;
			}
			return source === void 0 && Object.keys(rebuilt).length === 0 ? value : rebuilt;
		}
		case "dict": {
			if (!isRecord(value)) return value;
			const rebuilt = {};
			for (const [key, entry] of Object.entries(value)) {
				const stripped = walk(node.inner, entry, [...path, key], secrets);
				if (stripped !== void 0) rebuilt[key] = stripped;
			}
			return rebuilt;
		}
		case "array":
			if (!Array.isArray(value)) return value;
			return value.map((entry, index) => walk(node.inner, entry, [...path, String(index)], secrets));
		default: return value;
	}
}
/**
* Service Definition for the user-settings capability seam (`ctx.settings`). Providers store one raw document of
* per-namespace sections; plugins register a namespace schema and read the
* resolved value, which layers schema defaults, the registrant's composition
* `base`, and the user document section, in that order.
* @module @deepseek-ai/dsh-settings
*/
const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/;
/**
* Brand a raw string as a {@link SettingsNamespace}.
* @param value - candidate namespace; lowercase kebab-case, as in plugin short names.
* @returns the branded namespace.
*/
function settingsNamespace(value) {
	if (!NAMESPACE_PATTERN.test(value)) throw new TypeError(`settings namespace "${value}" must match ${String(NAMESPACE_PATTERN)}`);
	return value;
}
/**
* Deep equality over JSON-compatible data (objects, arrays, primitives) — the
* Service Definition's single change-detection predicate, exported so the invariant
* companion checks exactly the implementation's relation.
* @param a - one JSON-compatible value.
* @param b - the other JSON-compatible value.
* @returns whether the two values are structurally equal.
*/
function deepEqualJson(a, b) {
	if (a === b) return true;
	if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((entry, index) => deepEqualJson(entry, b[index]));
	}
	const left = a;
	const right = b;
	const keys = Object.keys(left);
	if (keys.length !== Object.keys(right).length) return false;
	return keys.every((key) => key in right && deepEqualJson(left[key], right[key]));
}
/** Whether a value is a plain data object (not an array, null, or class instance). */
function isPlainObject(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
/** Apply one path op to a detached section, returning the next section. */
function applyPathOp(section, op) {
	const [head, ...rest] = op.path;
	if (head === void 0) {
		if (op.op === "unset") return {};
		if (!isPlainObject(op.value)) throw new TypeError("settings mutate: setting the section root requires a plain object");
		return { ...op.value };
	}
	if (rest.length === 0) {
		if (op.op === "set") return {
			...section,
			[head]: op.value
		};
		const { [head]: _removed, ...kept } = section;
		return kept;
	}
	const child = section[head];
	if (!isPlainObject(child)) {
		if (op.op === "unset") return section;
		return {
			...section,
			[head]: applyPathOp({}, {
				...op,
				path: rest
			})
		};
	}
	return {
		...section,
		[head]: applyPathOp(child, {
			...op,
			path: rest
		})
	};
}
/**
* Layer `over` onto `under`: plain objects merge recursively, every other
* value (arrays included) replaces the lower layer wholesale. `over` never
* carries `undefined` entries — sections come from parsed documents and write
* snapshots pass {@link cloneJsonShaped}, which strips them so a sparse patch
* cannot erase lower keys.
*/
function mergeLayers(under, over) {
	if (over === void 0) return under;
	if (!isPlainObject(under) || !isPlainObject(over)) return over;
	const merged = { ...under };
	for (const [key, value] of Object.entries(over)) merged[key] = key in merged ? mergeLayers(merged[key], value) : value;
	return merged;
}
/** Recursively freeze one resolved value so handed-out snapshots stay immutable. */
function deepFreeze(value) {
	if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
	for (const entry of Object.values(value)) deepFreeze(entry);
	return Object.freeze(value);
}
Service.init;
/**
* Value mirror of the `FiberState` members {@link isUnloading} compares
* against: a const enum has no runtime object to import, and the value is
* needed at runtime (same rationale as the CLI boot driver's mirror).
*/
const FIBER_DISPOSED = 4;
const FIBER_UNLOADING = 5;
/** Whether the consumer's own fiber is tearing down (not just losing the settings service). */
function isUnloading(ctx) {
	const state = ctx.fiber.state;
	return state === FIBER_UNLOADING || state === FIBER_DISPOSED;
}
/**
* Install the canonical optional-settings consumer wiring: while a settings
* service exists, register `ns` with the consumer's composition entry as the
* `base` layer and point the source thunk at the resolved scope; when the
* service goes away (disposal, provider reload), fall back to the entry so
* the consumer keeps working exactly as composed. The registration rides the
* scoped fiber, so no settings service ever mounted means none of this runs.
* @param ctx - consumer plugin context owning the wiring.
* @param ns - the consumer-owned settings namespace.
* @param schema - schema resolving the namespace (typically the plugin Config).
* @param entry - the consumer's composition entry config, used as `base`.
* @param hooks - source sink and change notification.
*/
function installSettingsSection(ctx, ns, schema, entry, hooks) {
	ctx.inject(["settings"], (sctx) => {
		const scope = sctx.settings.register(ns, schema, {
			base: entry,
			...hooks.validate === void 0 ? {} : { validate: hooks.validate }
		});
		hooks.setSource(() => scope.get());
		sctx.effect(() => () => {
			if (isUnloading(ctx)) return;
			hooks.setSource(() => entry);
			hooks.onChange();
		});
		hooks.onChange();
		scope.watch(() => {
			if (isUnloading(ctx)) return;
			hooks.onChange();
		});
	});
}
//#endregion
//#region node_modules/cosmokit/lib/index.cjs
var require_lib$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var index_exports = {};
	__export(index_exports, {
		Binary: () => Binary,
		Time: () => Time,
		arrayBufferToBase64: () => arrayBufferToBase64,
		arrayBufferToHex: () => arrayBufferToHex,
		base64ToArrayBuffer: () => base64ToArrayBuffer,
		camelCase: () => camelCase,
		camelize: () => camelize,
		capitalize: () => capitalize,
		clone: () => clone,
		contain: () => contain,
		deduplicate: () => deduplicate,
		deepEqual: () => deepEqual,
		defineProperty: () => defineProperty,
		difference: () => difference,
		filterKeys: () => filterKeys,
		formatProperty: () => formatProperty,
		hexToArrayBuffer: () => hexToArrayBuffer,
		hyphenate: () => hyphenate,
		intersection: () => intersection,
		is: () => is,
		isNonNullable: () => isNonNullable,
		isNullable: () => isNullable,
		isPlainObject: () => isPlainObject,
		makeArray: () => makeArray,
		mapValues: () => mapValues,
		noop: () => noop,
		omit: () => omit,
		paramCase: () => paramCase,
		pick: () => pick,
		remove: () => remove,
		sanitize: () => sanitize,
		snakeCase: () => snakeCase,
		trimSlash: () => trimSlash,
		uncapitalize: () => uncapitalize,
		union: () => union,
		valueMap: () => mapValues
	});
	module.exports = __toCommonJS(index_exports);
	function noop() {}
	function isNullable(value) {
		return value === null || value === void 0;
	}
	function isNonNullable(value) {
		return !isNullable(value);
	}
	function isPlainObject(data) {
		return data && typeof data === "object" && !Array.isArray(data);
	}
	function filterKeys(object, filter) {
		return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
	}
	function mapValues(object, transform) {
		return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
	}
	function pick(source, keys, forced) {
		if (!keys) return { ...source };
		const result = {};
		for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
		return result;
	}
	function omit(source, keys) {
		if (!keys) return { ...source };
		const result = { ...source };
		for (const key of keys) Reflect.deleteProperty(result, key);
		return result;
	}
	function defineProperty(object, key, value) {
		return Object.defineProperty(object, key, {
			writable: true,
			value,
			enumerable: false
		});
	}
	function contain(array1, array2) {
		return array2.every((item) => array1.includes(item));
	}
	function intersection(array1, array2) {
		return array1.filter((item) => array2.includes(item));
	}
	function difference(array1, array2) {
		return array1.filter((item) => !array2.includes(item));
	}
	function union(array1, array2) {
		return Array.from(/* @__PURE__ */ new Set([...array1, ...array2]));
	}
	function deduplicate(array) {
		return [...new Set(array)];
	}
	function remove(list, item) {
		const index = list?.indexOf(item);
		if (index >= 0) {
			list.splice(index, 1);
			return true;
		} else return false;
	}
	function makeArray(source) {
		return Array.isArray(source) ? source : isNullable(source) ? [] : [source];
	}
	function is(type, value) {
		if (arguments.length === 1) return (value2) => is(type, value2);
		return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
	}
	function isArrayBufferLike(value) {
		return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
	}
	function isArrayBufferSource(value) {
		return isArrayBufferLike(value) || ArrayBuffer.isView(value);
	}
	var Binary;
	((Binary2) => {
		Binary2.is = isArrayBufferLike;
		Binary2.isSource = isArrayBufferSource;
		function fromSource(source) {
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			else return source;
		}
		Binary2.fromSource = fromSource;
		function toBase64(source) {
			source = fromSource(source);
			if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
			let binary = "";
			const bytes = new Uint8Array(source);
			for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
			return btoa(binary);
		}
		Binary2.toBase64 = toBase64;
		function fromBase64(source) {
			if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
			return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
		}
		Binary2.fromBase64 = fromBase64;
		function toHex(source) {
			source = fromSource(source);
			if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
			return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
		}
		Binary2.toHex = toHex;
		function fromHex(source) {
			if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
			const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
			const buffer = [];
			for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
			return Uint8Array.from(buffer).buffer;
		}
		Binary2.fromHex = fromHex;
	})(Binary || (Binary = {}));
	var base64ToArrayBuffer = Binary.fromBase64;
	var arrayBufferToBase64 = Binary.toBase64;
	var hexToArrayBuffer = Binary.fromHex;
	var arrayBufferToHex = Binary.toHex;
	function clone(source, refs = /* @__PURE__ */ new Map()) {
		if (!source || typeof source !== "object") return source;
		if (is("Date", source)) return new Date(source.valueOf());
		if (is("RegExp", source)) return new RegExp(source.source, source.flags);
		if (isArrayBufferLike(source)) return source.slice(0);
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		const cached = refs.get(source);
		if (cached) return cached;
		if (Array.isArray(source)) {
			const result2 = [];
			refs.set(source, result2);
			source.forEach((value, index) => {
				result2[index] = Reflect.apply(clone, null, [value, refs]);
			});
			return result2;
		}
		const result = Object.create(Object.getPrototypeOf(source));
		refs.set(source, result);
		for (const key of Reflect.ownKeys(source)) {
			const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
			if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
			Reflect.defineProperty(result, key, descriptor);
		}
		return result;
	}
	function deepEqual(a, b, strict) {
		if (a === b) return true;
		if (!strict && isNullable(a) && isNullable(b)) return true;
		if (typeof a !== typeof b) return false;
		if (typeof a !== "object") return false;
		if (!a || !b) return false;
		function check(test, then) {
			return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
		}
		return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
			if (a2.byteLength !== b2.byteLength) return false;
			const viewA = new Uint8Array(a2);
			const viewB = new Uint8Array(b2);
			for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
			return true;
		}) ?? Object.keys({
			...a,
			...b
		}).every((key) => deepEqual(a[key], b[key], strict));
	}
	function capitalize(source) {
		return source.charAt(0).toUpperCase() + source.slice(1);
	}
	function uncapitalize(source) {
		return source.charAt(0).toLowerCase() + source.slice(1);
	}
	function camelCase(source) {
		return source.replace(/[_-][a-z]/g, (str) => str.slice(1).toUpperCase());
	}
	function tokenize(source, delimiters, delimiter) {
		const output = [];
		let state = 0;
		for (let i = 0; i < source.length; i++) {
			const code = source.charCodeAt(i);
			if (code >= 65 && code <= 90) {
				if (state === 1) {
					const next = source.charCodeAt(i + 1);
					if (next >= 97 && next <= 122) output.push(delimiter);
					output.push(code + 32);
				} else {
					if (state !== 0) output.push(delimiter);
					output.push(code + 32);
				}
				state = 1;
			} else if (code >= 97 && code <= 122) {
				output.push(code);
				state = 2;
			} else if (delimiters.includes(code)) {
				if (state !== 0) output.push(delimiter);
				state = 0;
			} else output.push(code);
		}
		return String.fromCharCode(...output);
	}
	function paramCase(source) {
		return tokenize(source, [45, 95], 45);
	}
	function snakeCase(source) {
		return tokenize(source, [45, 95], 95);
	}
	var camelize = camelCase;
	var hyphenate = paramCase;
	function formatProperty(key) {
		if (typeof key !== "string") return `[${key.toString()}]`;
		return /^[a-z_$][\w$]*$/i.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
	}
	function trimSlash(source) {
		return source.replace(/\/$/, "");
	}
	function sanitize(source) {
		if (!source.startsWith("/")) source = "/" + source;
		return trimSlash(source);
	}
	var Time;
	((Time2) => {
		Time2.millisecond = 1;
		Time2.second = 1e3;
		Time2.minute = Time2.second * 60;
		Time2.hour = Time2.minute * 60;
		Time2.day = Time2.hour * 24;
		Time2.week = Time2.day * 7;
		let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
		function setTimezoneOffset(offset) {
			timezoneOffset = offset;
		}
		Time2.setTimezoneOffset = setTimezoneOffset;
		function getTimezoneOffset() {
			return timezoneOffset;
		}
		Time2.getTimezoneOffset = getTimezoneOffset;
		function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
			if (typeof date === "number") date = new Date(date);
			if (offset === void 0) offset = timezoneOffset;
			return Math.floor((date.valueOf() / Time2.minute - offset) / 1440);
		}
		Time2.getDateNumber = getDateNumber;
		function fromDateNumber(value, offset) {
			const date = new Date(value * Time2.day);
			if (offset === void 0) offset = timezoneOffset;
			return new Date(+date + offset * Time2.minute);
		}
		Time2.fromDateNumber = fromDateNumber;
		const numeric = /\d+(?:\.\d+)?/.source;
		const timeRegExp = new RegExp(`^${[
			"w(?:eek(?:s)?)?",
			"d(?:ay(?:s)?)?",
			"h(?:our(?:s)?)?",
			"m(?:in(?:ute)?(?:s)?)?",
			"s(?:ec(?:ond)?(?:s)?)?"
		].map((unit) => `(${numeric}${unit})?`).join("")}$`);
		function parseTime(source) {
			const capture = timeRegExp.exec(source);
			if (!capture) return 0;
			return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
		}
		Time2.parseTime = parseTime;
		function parseDate(date) {
			const parsed = parseTime(date);
			if (parsed) date = Date.now() + parsed;
			else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
			else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
			return date ? new Date(date) : /* @__PURE__ */ new Date();
		}
		Time2.parseDate = parseDate;
		function format(ms) {
			const abs = Math.abs(ms);
			if (abs >= Time2.day - Time2.hour / 2) return Math.round(ms / Time2.day) + "d";
			else if (abs >= Time2.hour - Time2.minute / 2) return Math.round(ms / Time2.hour) + "h";
			else if (abs >= Time2.minute - Time2.second / 2) return Math.round(ms / Time2.minute) + "m";
			else if (abs >= Time2.second) return Math.round(ms / Time2.second) + "s";
			return ms + "ms";
		}
		Time2.format = format;
		function toDigits(source, length = 2) {
			return source.toString().padStart(length, "0");
		}
		Time2.toDigits = toDigits;
		function template(template2, time = /* @__PURE__ */ new Date()) {
			return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
		}
		Time2.template = template;
	})(Time || (Time = {}));
	0 && (module.exports = {
		Binary,
		Time,
		arrayBufferToBase64,
		arrayBufferToHex,
		base64ToArrayBuffer,
		camelCase,
		camelize,
		capitalize,
		clone,
		contain,
		deduplicate,
		deepEqual,
		defineProperty,
		difference,
		filterKeys,
		formatProperty,
		hexToArrayBuffer,
		hyphenate,
		intersection,
		is,
		isNonNullable,
		isNullable,
		isPlainObject,
		makeArray,
		mapValues,
		noop,
		omit,
		paramCase,
		pick,
		remove,
		sanitize,
		snakeCase,
		trimSlash,
		uncapitalize,
		union,
		valueMap
	});
}));
//#endregion
//#region src/host/gate.ts
var import_lib = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __name = (target, value) => __defProp(target, "name", {
		value,
		configurable: true
	});
	var import_cosmokit = require_lib$1();
	var kSchema = Symbol.for("schemastery");
	var kValidationError = Symbol.for("ValidationError");
	globalThis.__schemastery_index__ ??= 0;
	globalThis.__schemastery_refs__ = void 0;
	var ValidationError = class extends TypeError {
		constructor(message, options) {
			let prefix = "$";
			for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
			else if (typeof segment === "number") prefix += "[" + segment + "]";
			else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
			if (prefix.startsWith(".")) prefix = prefix.slice(1);
			super((prefix === "$" ? "" : `${prefix} `) + message);
			this.options = options;
		}
		static {
			__name(this, "ValidationError");
		}
		name = "ValidationError";
		static is(error) {
			return !!error?.[kValidationError];
		}
	};
	Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
	var Schema = /* @__PURE__ */ __name(function(options) {
		const schema = /* @__PURE__ */ __name(function(data, options2 = {}) {
			return Schema.resolve(data, schema, options2)[0];
		}, "schema");
		if (options.refs) {
			const refs = (0, import_cosmokit.valueMap)(options.refs, (options2) => new Schema(options2));
			const getRef = /* @__PURE__ */ __name((uid) => refs[uid], "getRef");
			for (const key in refs) {
				const options2 = refs[key];
				options2.sKey = getRef(options2.sKey);
				options2.inner = getRef(options2.inner);
				options2.list = options2.list && options2.list.map(getRef);
				options2.dict = options2.dict && (0, import_cosmokit.valueMap)(options2.dict, getRef);
			}
			return refs[options.uid];
		}
		Object.assign(schema, options);
		if (typeof schema.callback === "string") try {
			schema.callback = new Function("return " + schema.callback)();
		} catch {}
		Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
		Object.setPrototypeOf(schema, Schema.prototype);
		schema.meta ||= {};
		schema.toString = schema.toString.bind(schema);
		return schema;
	}, "Schema");
	Schema.prototype = Object.create(Function.prototype);
	Schema.prototype[kSchema] = true;
	Object.defineProperty(Schema.prototype, "~standard", { get() {
		return {
			version: 1,
			vendor: "schemastery",
			validate: /* @__PURE__ */ __name((value) => {
				try {
					return { value: Schema.resolve(value, this, {})[0] };
				} catch (error) {
					if (ValidationError.is(error)) return { issues: [{
						message: error.message,
						path: error.options.path
					}] };
					throw error;
				}
			}, "validate")
		};
	} });
	Schema.ValidationError = ValidationError;
	Schema.prototype.toJSON = /* @__PURE__ */ __name(function toJSON() {
		if (globalThis.__schemastery_refs__) {
			globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
			return this.uid;
		}
		globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
		globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
		const result = {
			uid: this.uid,
			refs: globalThis.__schemastery_refs__
		};
		globalThis.__schemastery_refs__ = void 0;
		return result;
	}, "toJSON");
	Schema.prototype.set = /* @__PURE__ */ __name(function set(key, value) {
		this.dict[key] = value;
		return this;
	}, "set");
	Schema.prototype.push = /* @__PURE__ */ __name(function push(value) {
		this.list.push(value);
		return this;
	}, "push");
	function mergeDesc(original, messages) {
		const result = typeof original === "string" ? { "": original } : { ...original };
		for (const locale in messages) {
			const value = messages[locale];
			if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
			else if (typeof value === "string") result[locale] = value;
		}
		return result;
	}
	__name(mergeDesc, "mergeDesc");
	function getInner(value) {
		return value?.$value ?? value?.$inner;
	}
	__name(getInner, "getInner");
	function extractKeys(data) {
		return (0, import_cosmokit.filterKeys)(data ?? {}, (key) => !key.startsWith("$"));
	}
	__name(extractKeys, "extractKeys");
	Schema.prototype.i18n = /* @__PURE__ */ __name(function i18n(messages) {
		const schema = Schema(this);
		const desc = mergeDesc(schema.meta.description, messages);
		if (Object.keys(desc).length) schema.meta.description = desc;
		if (schema.dict) schema.dict = (0, import_cosmokit.valueMap)(schema.dict, (inner, key) => {
			return inner.i18n((0, import_cosmokit.valueMap)(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
		});
		if (schema.list) schema.list = schema.list.map((inner, index) => {
			return inner.i18n((0, import_cosmokit.valueMap)(messages, (data = {}) => {
				if (Array.isArray(getInner(data))) return getInner(data)[index];
				if (Array.isArray(data)) return data[index];
				return extractKeys(data);
			}));
		});
		if (schema.inner) schema.inner = schema.inner.i18n((0, import_cosmokit.valueMap)(messages, (data) => {
			if (getInner(data)) return getInner(data);
			return extractKeys(data);
		}));
		if (schema.sKey) schema.sKey = schema.sKey.i18n((0, import_cosmokit.valueMap)(messages, (data) => data?.$key));
		return schema;
	}, "i18n");
	Schema.prototype.extra = /* @__PURE__ */ __name(function extra(key, value) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	}, "extra");
	for (const key of [
		"required",
		"disabled",
		"collapse",
		"hidden",
		"loose"
	]) Object.assign(Schema.prototype, { [key](value = true) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	} });
	Schema.prototype.deprecated = /* @__PURE__ */ __name(function deprecated() {
		const schema = Schema(this);
		schema.meta.badges ||= [];
		schema.meta.badges.push({
			text: "deprecated",
			type: "danger"
		});
		return schema;
	}, "deprecated");
	Schema.prototype.experimental = /* @__PURE__ */ __name(function experimental() {
		const schema = Schema(this);
		schema.meta.badges ||= [];
		schema.meta.badges.push({
			text: "experimental",
			type: "warning"
		});
		return schema;
	}, "experimental");
	Schema.prototype.pattern = /* @__PURE__ */ __name(function pattern(regexp) {
		const schema = Schema(this);
		const pattern2 = (0, import_cosmokit.pick)(regexp, ["source", "flags"]);
		schema.meta = {
			...schema.meta,
			pattern: pattern2
		};
		return schema;
	}, "pattern");
	Schema.prototype.simplify = /* @__PURE__ */ __name(function simplify(value) {
		if ((0, import_cosmokit.deepEqual)(value, this.meta.default, this.type === "dict")) return null;
		if ((0, import_cosmokit.isNullable)(value)) return value;
		if (this.type === "object" || this.type === "dict") {
			const result = {};
			for (const key in value) {
				const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
				if (this.type === "dict" || !(0, import_cosmokit.isNullable)(item)) result[key] = item;
			}
			if ((0, import_cosmokit.deepEqual)(result, this.meta.default, this.type === "dict")) return null;
			return result;
		} else if (this.type === "array" || this.type === "tuple") {
			const result = [];
			value.forEach((value2, index) => {
				const schema = this.type === "array" ? this.inner : this.list[index];
				const item = schema ? schema.simplify(value2) : value2;
				result.push(item);
			});
			return result;
		} else if (this.type === "intersect") {
			const result = {};
			for (const item of this.list) Object.assign(result, item.simplify(value));
			return result;
		} else if (this.type === "union") for (const schema of this.list) try {
			Schema.resolve(value, schema, {});
			return schema.simplify(value);
		} catch {}
		return value;
	}, "simplify");
	Schema.prototype.toString = /* @__PURE__ */ __name(function toString(inline) {
		return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
	}, "toString");
	Schema.prototype.role = /* @__PURE__ */ __name(function role(role, extra2) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			role,
			extra: extra2
		};
		return schema;
	}, "role");
	for (const key of [
		"default",
		"link",
		"comment",
		"description",
		"max",
		"min",
		"step"
	]) Object.assign(Schema.prototype, { [key](value) {
		const schema = Schema(this);
		schema.meta = {
			...schema.meta,
			[key]: value
		};
		return schema;
	} });
	var resolvers = {};
	Schema.extend = /* @__PURE__ */ __name(function extend(type, resolve2) {
		resolvers[type] = resolve2;
	}, "extend");
	Schema.resolve = /* @__PURE__ */ __name(function resolve(data, schema, options = {}, strict = false) {
		if (!schema) return [data];
		if (options.ignore?.(data, schema)) return [data];
		if ((0, import_cosmokit.isNullable)(data) && schema.type !== "lazy") {
			if (schema.meta.required) throw new ValidationError(`missing required value`, options);
			let current = schema;
			let fallback = schema.meta.default;
			while (current?.type === "intersect" && (0, import_cosmokit.isNullable)(fallback)) {
				current = current.list[0];
				fallback = current?.meta.default;
			}
			if ((0, import_cosmokit.isNullable)(fallback)) return [data];
			data = (0, import_cosmokit.clone)(fallback);
		}
		const callback = resolvers[schema.type];
		if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
		try {
			return callback(data, schema, options, strict);
		} catch (error) {
			if (!schema.meta.loose) throw error;
			return [schema.meta.default];
		}
	}, "resolve");
	Schema.from = /* @__PURE__ */ __name(function from(source) {
		if ((0, import_cosmokit.isNullable)(source)) return Schema.any();
		else if ([
			"string",
			"number",
			"boolean"
		].includes(typeof source)) return Schema.const(source).required();
		else if (source[kSchema]) return source;
		else if (typeof source === "function") switch (source) {
			case String: return Schema.string().required();
			case Number: return Schema.number().required();
			case Boolean: return Schema.boolean().required();
			case Function: return Schema.function().required();
			default: return Schema.is(source).required();
		}
		else throw new TypeError(`cannot infer schema from ${source}`);
	}, "from");
	Schema.lazy = /* @__PURE__ */ __name(function lazy(builder) {
		const schema = new Schema({
			type: "lazy",
			builder,
			inner: { toJSON: /* @__PURE__ */ __name(() => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			}, "toJSON") }
		});
		return schema;
	}, "lazy");
	Schema.natural = /* @__PURE__ */ __name(function natural() {
		return Schema.number().step(1).min(0);
	}, "natural");
	Schema.percent = /* @__PURE__ */ __name(function percent() {
		return Schema.number().step(.01).min(0).max(1).role("slider");
	}, "percent");
	Schema.date = /* @__PURE__ */ __name(function date() {
		return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
			const date2 = new Date(value);
			if (isNaN(+date2)) throw new ValidationError(`invalid date "${value}"`, options);
			return date2;
		}, true)]);
	}, "date");
	Schema.regExp = /* @__PURE__ */ __name(function regExp(flag = "") {
		return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
			try {
				return new RegExp(value, flag);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)]);
	}, "regExp");
	Schema.arrayBuffer = /* @__PURE__ */ __name(function arrayBuffer(encoding) {
		return Schema.union([
			Schema.is(ArrayBuffer),
			Schema.is(SharedArrayBuffer),
			Schema.transform(Schema.any(), (value, options) => {
				if (import_cosmokit.Binary.isSource(value)) return import_cosmokit.Binary.fromSource(value);
				throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
			}, true),
			...encoding ? [Schema.transform(Schema.string(), (value, options) => {
				try {
					return encoding === "base64" ? import_cosmokit.Binary.fromBase64(value) : import_cosmokit.Binary.fromHex(value);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)] : []
		]);
	}, "arrayBuffer");
	Schema.extend("lazy", (data, schema, options, strict) => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return Schema.resolve(data, schema.inner, options, strict);
	});
	Schema.extend("any", (data) => {
		return [data];
	});
	Schema.extend("never", (data, _, options) => {
		throw new ValidationError(`expected nullable but got ${data}`, options);
	});
	Schema.extend("const", (data, { value }, options) => {
		if ((0, import_cosmokit.deepEqual)(data, value)) return [value];
		throw new ValidationError(`expected ${value} but got ${data}`, options);
	});
	function checkWithinRange(data, meta, description, options, skipMin = false) {
		const { max = Infinity, min = -Infinity } = meta;
		if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
		if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
	}
	__name(checkWithinRange, "checkWithinRange");
	Schema.extend("string", (data, { meta }, options) => {
		if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
		if (meta.pattern) {
			const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
			if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
		}
		checkWithinRange(data.length, meta, "string length", options);
		return [data];
	});
	function decimalShift(data, digits) {
		const str = data.toString();
		if (str.includes("e")) return data * Math.pow(10, digits);
		const index = str.indexOf(".");
		if (index === -1) return data * Math.pow(10, digits);
		const frac = str.slice(index + 1);
		const integer = str.slice(0, index);
		if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
		return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
	}
	__name(decimalShift, "decimalShift");
	function isMultipleOf(data, min, step) {
		step = Math.abs(step);
		if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
		const index = step.toString().indexOf(".");
		const digits = step.toString().slice(index + 1).length;
		return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
	}
	__name(isMultipleOf, "isMultipleOf");
	Schema.extend("number", (data, { meta }, options) => {
		if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
		checkWithinRange(data, meta, "number", options);
		const { step } = meta;
		if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
		return [data];
	});
	Schema.extend("boolean", (data, _, options) => {
		if (typeof data === "boolean") return [data];
		throw new ValidationError(`expected boolean but got ${data}`, options);
	});
	Schema.extend("bitset", (data, { bits, meta }, options) => {
		let value = 0, keys = [];
		if (typeof data === "number") {
			value = data;
			for (const key in bits) if (data & bits[key]) keys.push(key);
		} else if (Array.isArray(data)) {
			keys = data;
			for (const key of keys) {
				if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
				if (key in bits) value |= bits[key];
			}
		} else throw new ValidationError(`expected number or array but got ${data}`, options);
		if (value === meta.default) return [value];
		return [value, keys];
	});
	Schema.extend("function", (data, _, options) => {
		if (typeof data === "function") return [data];
		throw new ValidationError(`expected function but got ${data}`, options);
	});
	Schema.extend("is", (data, { constructor }, options) => {
		if (typeof constructor === "function") {
			if (data instanceof constructor) return [data];
			throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
		} else {
			if ((0, import_cosmokit.isNullable)(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			let prototype = Object.getPrototypeOf(data);
			while (prototype) {
				if (prototype.constructor?.name === constructor) return [data];
				prototype = Object.getPrototypeOf(prototype);
			}
			throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		}
	});
	function property(data, key, schema, options) {
		try {
			const [value, adapted] = Schema.resolve(data[key], schema, {
				...options,
				path: [...options.path || [], key]
			});
			if (adapted !== void 0) data[key] = adapted;
			return value;
		} catch (e) {
			if (!options?.autofix) throw e;
			delete data[key];
			return schema.meta.default;
		}
	}
	__name(property, "property");
	Schema.extend("array", (data, { inner, meta }, options) => {
		if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
		checkWithinRange(data.length, meta, "array length", options, !(0, import_cosmokit.isNullable)(inner.meta.default));
		return [data.map((_, index) => property(data, index, inner, options))];
	});
	Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
		if (!(0, import_cosmokit.isPlainObject)(data)) throw new ValidationError(`expected object but got ${data}`, options);
		const result = {};
		for (const key in data) {
			let rKey;
			try {
				rKey = Schema.resolve(key, sKey, options)[0];
			} catch (error) {
				if (strict) continue;
				throw error;
			}
			result[rKey] = property(data, key, inner, options);
			data[rKey] = data[key];
			if (key !== rKey) delete data[key];
		}
		return [result];
	});
	Schema.extend("tuple", (data, { list }, options, strict) => {
		if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
		const result = list.map((inner, index) => property(data, index, inner, options));
		if (strict) return [result];
		result.push(...data.slice(list.length));
		return [result];
	});
	function merge(result, data) {
		for (const key in data) {
			if (key in result) continue;
			result[key] = data[key];
		}
	}
	__name(merge, "merge");
	Schema.extend("object", (data, { dict }, options, strict) => {
		if (!(0, import_cosmokit.isPlainObject)(data)) throw new ValidationError(`expected object but got ${data}`, options);
		const result = {};
		for (const key in dict) {
			const value = property(data, key, dict[key], options);
			if (!(0, import_cosmokit.isNullable)(value) || key in data) result[key] = value;
		}
		if (!strict) merge(result, data);
		return [result];
	});
	Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
		const messages = [];
		for (const inner of list) try {
			return Schema.resolve(data, inner, options, strict);
		} catch (error) {
			messages.push(error);
		}
		throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
	});
	Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
		if (!list.length) return [data];
		let result;
		for (const inner of list) {
			const value = Schema.resolve(data, inner, options, true)[0];
			if ((0, import_cosmokit.isNullable)(value)) continue;
			if ((0, import_cosmokit.isNullable)(result)) result = value;
			else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
			else if (typeof value === "object") merge(result ??= {}, value);
			else if (result !== value) throw new ValidationError(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
		}
		if (!strict && (0, import_cosmokit.isPlainObject)(data)) merge(result, data);
		return [result];
	});
	Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
		const [result, adapted = data] = Schema.resolve(data, inner, options, true);
		if (preserve) return [callback(result)];
		else return [callback(result), callback(adapted)];
	});
	var formatters = {};
	function defineMethod(name, keys, format) {
		formatters[name] = format;
		Object.assign(Schema, { [name](...args) {
			const schema = new Schema({ type: name });
			keys.forEach((key, index) => {
				switch (key) {
					case "sKey":
						schema.sKey = args[index] ?? Schema.string();
						break;
					case "inner":
						schema.inner = Schema.from(args[index]);
						break;
					case "list":
						schema.list = args[index].map(Schema.from);
						break;
					case "dict":
						schema.dict = (0, import_cosmokit.valueMap)(args[index], Schema.from);
						break;
					case "bits":
						schema.bits = {};
						for (const key2 in args[index]) {
							if (typeof args[index][key2] !== "number") continue;
							schema.bits[key2] = args[index][key2];
						}
						break;
					case "callback": {
						const callback = schema.callback = args[index];
						callback["toJSON"] ||= () => callback.toString();
						break;
					}
					case "constructor": {
						const constructor = schema.constructor = args[index];
						if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
						break;
					}
					default: schema[key] = args[index];
				}
			});
			if (name === "object" || name === "dict") schema.meta.default = {};
			else if (name === "array" || name === "tuple") schema.meta.default = [];
			else if (name === "bitset") schema.meta.default = 0;
			return schema;
		} });
	}
	__name(defineMethod, "defineMethod");
	defineMethod("is", ["constructor"], ({ constructor }) => {
		if (typeof constructor === "function") return constructor.name;
		else return constructor;
	});
	defineMethod("any", [], () => "any");
	defineMethod("never", [], () => "never");
	defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
	defineMethod("string", [], () => "string");
	defineMethod("number", [], () => "number");
	defineMethod("boolean", [], () => "boolean");
	defineMethod("bitset", ["bits"], () => "bitset");
	defineMethod("function", [], () => "function");
	defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
	defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
	defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
	defineMethod("object", ["dict"], ({ dict }) => {
		if (Object.keys(dict).length === 0) return "{}";
		return `{ ${Object.entries(dict).map(([key, inner]) => {
			return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
		}).join(", ")} }`;
	});
	defineMethod("union", ["list"], ({ list }, inline) => {
		const result = list.map(({ toString: format }) => format()).join(" | ");
		return inline ? `(${result})` : result;
	});
	defineMethod("intersect", ["list"], ({ list }) => {
		return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
	});
	defineMethod("transform", [
		"inner",
		"callback",
		"preserve"
	], ({ inner }, isInner) => inner.toString(isInner));
	module.exports = Schema;
})))(), 1);
/**
* Workspace gate for the /filemgr routes: canonicalize the requested
* project root and require it to be a registered workspace (or a directory
* inside one). This is the security boundary of the panel's fs/git routes -
* the browser may only read and mutate files under registered workspace
* roots, never arbitrary host directories.
* @module dsh-filemgr/host/gate
*/
/**
* Normalize a path for prefix comparison: collapse Windows separators to `/`
* and drop any trailing slash. On win32 the whole path is also lower-cased so
* a case-insensitive FS cannot trip the membership check (the drive letter and
* every segment are compared case-insensitively). On any other platform the
* path separator and case are left untouched.
*/
function normalizeForPrefix(value) {
	const normalized = value.replaceAll("\\", "/").replace(/\/+$/, "");
	return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}
/**
* The canonical prefix check: child must live inside (or equal) the root.
* Separator- and case-robust on Windows: `path.join` yields backslashes while
* git (`rev-parse --show-toplevel`) and the browser (`./x`) yield forward
* slashes, so both sides are normalized to forward slashes before comparing,
* and the comparison is case-insensitive on win32 (the FS is case-insensitive).
*/
function isPathInside(root, child) {
	if (root === "" || child === "") return false;
	const normRoot = normalizeForPrefix(root);
	const normChild = normalizeForPrefix(child);
	if (normChild === normRoot) return true;
	return normChild.startsWith(`${normRoot}/`);
}
/**
* Production gate: canonicalize the requested root and require it to be a
* registered workspace path (or a subdirectory of one). The host's workspace
* registry owns canonicalization, so an unowned path is rejected outright.
* @param ctx - context carrying the workspace service.
* @returns the gate.
*/
function createWorkspaceGate(ctx) {
	return async (root) => {
		if (typeof root !== "string" || root === "") return {
			ok: false,
			error: {
				code: "workspace-unknown",
				message: "empty project root"
			}
		};
		let canonical;
		try {
			canonical = await realpath(root);
		} catch {
			return {
				ok: false,
				error: {
					code: "workspace-unknown",
					message: "path does not resolve on disk"
				}
			};
		}
		const workspaces = ctx.workspaceRegistry.list();
		for (const workspace of workspaces) if (isPathInside(workspace.path, canonical)) return {
			ok: true,
			canonical
		};
		return {
			ok: false,
			error: {
				code: "workspace-unknown",
				message: "path is not inside a registered workspace"
			}
		};
	};
}
//#endregion
//#region src/host/fs-service.ts
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
/** Preview text ceiling — mirrors FileManager's single-tab 80k-char cap. */
const TEXT_CAP_CHARS = 8e4;
/** Image read cap (data URL payload budget). */
const IMAGE_CAP_BYTES = 8 << 20;
/** Filename-search caps (results and scanned entries). */
const SEARCH_HIT_CAP = 200;
const SEARCH_SCAN_CAP = 2e4;
/** Directories skipped by search (VS Code-like noise reduction). */
const SEARCH_SKIP_DIRS = /* @__PURE__ */ new Set([".git", "node_modules"]);
/** Directories never listed in the tree. */
const TREE_SKIP_DIRS = /* @__PURE__ */ new Set([".git"]);
/**
* Listing cap: a giant flat dir (node_modules top level) must not choke the
* tree or the @ mention menu. The tail is dropped (no paging) — the explorer
* tree stays usable and the truncated flag lets the UI hint at the cutoff.
*/
const MAX_ENTRIES = 1e3;
/**
* Resolve a relative path against the canonical root, realpath-checking the
* existing ancestors so a symlink cannot smuggle the operation outside the
* root. A path that does not yet exist (ENOENT) is verified through its
* nearest existing ancestor — a nonexistent tail cannot itself be a symlink.
* A path whose real path escapes the root is rejected with path-outside-root.
*/
async function resolveInsideRoot(root, rel) {
	if (rel.includes("\0")) return {
		ok: false,
		error: {
			code: "path-outside-root",
			message: "invalid path"
		}
	};
	const abs = join(root, rel);
	if (!isPathInside(root, abs)) return {
		ok: false,
		error: {
			code: "path-outside-root",
			message: `path escapes root: ${rel}`
		}
	};
	let probe = abs;
	for (let hop = 0; hop < 32; hop += 1) {
		let real;
		try {
			real = await realpath(probe);
		} catch (error) {
			if (error.code !== "ENOENT") return {
				ok: true,
				abs
			};
			const parent = dirname(probe);
			if (parent === probe) return {
				ok: true,
				abs
			};
			probe = parent;
			continue;
		}
		if (!isPathInside(root, real)) return {
			ok: false,
			error: {
				code: "path-outside-root",
				message: `path resolves outside root: ${rel}`
			}
		};
		return {
			ok: true,
			abs
		};
	}
	return {
		ok: false,
		error: {
			code: "path-outside-root",
			message: `path cannot be resolved: ${rel}`
		}
	};
}
/** True when the relative path is, or passes through, a .git component. */
function isGitPath(rel) {
	return rel.split("/").some((part) => part.toLowerCase() === ".git");
}
/** Case-insensitive alpha compare (dirs first, then files). */
function compareEntries(a, b) {
	if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
	const an = a.name.toLowerCase();
	const bn = b.name.toLowerCase();
	return an < bn ? -1 : an > bn ? 1 : 0;
}
/** The image probe: parse PNG/JPEG/GIF/WebP header dimensions (undefined on failure). */
function probeImageSize(data) {
	try {
		if (data.length >= 24 && data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71) return {
			width: data.readUInt32BE(16),
			height: data.readUInt32BE(20)
		};
		if (data.length >= 10 && data[0] === 255 && data[1] === 216 && data[2] === 255) {
			let pos = 2;
			for (let segment = 0; segment < 16; segment += 1) {
				if (pos + 2 > data.length) return void 0;
				if (data[pos] !== 255) return void 0;
				while (pos < data.length && data[pos] === 255) pos += 1;
				if (pos >= data.length) return void 0;
				const marker = data[pos];
				pos += 1;
				if (marker === 1 || marker >= 208 && marker <= 215 || marker === 216) continue;
				if (marker === 192 || marker === 193 || marker === 194 || marker === 195 || marker === 197 || marker === 198 || marker === 199 || marker === 201 || marker === 202 || marker === 203 || marker === 205 || marker === 206 || marker === 207) {
					if (pos + 7 > data.length) return void 0;
					return {
						height: data.readUInt16BE(pos + 3),
						width: data.readUInt16BE(pos + 5)
					};
				}
				if (pos + 2 > data.length) return void 0;
				const length = data.readUInt16BE(pos);
				pos += length;
				if (pos < 0) return void 0;
			}
			return;
		}
		if (data.length >= 14 && data[0] === 71 && data[1] === 73 && data[2] === 70) return {
			width: data.readUInt16LE(6),
			height: data.readUInt16LE(8)
		};
		if (data.length >= 30 && data[8] === 87 && data[9] === 69 && data[10] === 66 && data[11] === 80 && data[12] === 86 && data[13] === 80 && data[14] === 56 && data[15] === 88) {
			const size = (o) => data[o] | data[o + 1] << 8 | data[o + 2] << 16;
			return {
				width: size(24) + 1,
				height: size(27) + 1
			};
		}
	} catch {
		return;
	}
}
/** Mime lookup by file extension (undefined when the extension is unknown). */
function mimeByExtension(rel) {
	return {
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		avif: "image/avif",
		bmp: "image/bmp",
		pdf: "application/pdf"
	}[rel.split(".").pop()?.toLowerCase() ?? ""];
}
/** Derive the mime type for a raw read from the extension, then the content. */
function imageMime(rel, data) {
	const byExt = mimeByExtension(rel);
	if (byExt !== void 0) return byExt;
	if (data.length >= 3 && data[0] === 137 && data[1] === 80 && data[2] === 78) return "image/png";
	if (data.length >= 3 && data[0] === 255 && data[1] === 216) return "image/jpeg";
	if (data.length >= 4 && data[0] === 37 && data[1] === 80 && data[2] === 68 && data[3] === 70) return "application/pdf";
	return "application/octet-stream";
}
/** Read the first 4 magic bytes of a file (empty buffer when unreadable). */
async function readMagicBytes(abs) {
	let handle;
	try {
		handle = await open(abs, "r");
		const buf = Buffer.alloc(4);
		const { bytesRead } = await handle.read(buf, 0, 4, 0);
		return buf.subarray(0, bytesRead);
	} catch {
		return Buffer.alloc(0);
	} finally {
		if (handle !== void 0) await handle.close().catch(() => {});
	}
}
/**
* Filesystem service: gated listing/read/write/search/delete. All relative
* paths are resolved against the gated root.
* @param gate - the workspace gate (host: registered workspace membership).
*/
var FsService = class {
	gate;
	constructor(gate) {
		this.gate = gate;
	}
	/** Verify a project root against the workspace gate (used by the SSE layer). */
	verify(root) {
		return this.gate(root);
	}
	/**
	* List one directory (relative path; '' = root). Sorted dirs-first alpha.
	* Entry metadata comes straight from `Dirent` (name + is-directory only) —
	* no per-file stat — so listing a giant dir stays cheap. The result is
	* capped at MAX_ENTRIES (truncated flag) to keep the tree and the '@'
	* menu responsive on node_modules-style flat dirs.
	*/
	async list(root, rel) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		let dirents;
		try {
			dirents = await readdir(resolved.abs, { withFileTypes: true });
		} catch {
			return {
				code: "not-found",
				message: `cannot list ${rel}`
			};
		}
		const entries = [];
		for (const entry of dirents) {
			if (entry.isDirectory() && TREE_SKIP_DIRS.has(entry.name)) continue;
			entries.push({
				name: entry.name,
				path: rel === "" ? entry.name : `${rel}/${entry.name}`,
				isDir: entry.isDirectory(),
				size: 0,
				mtime: 0
			});
		}
		const truncated = entries.length > MAX_ENTRIES;
		if (truncated) entries.length = MAX_ENTRIES;
		entries.sort(compareEntries);
		return {
			root: gated.canonical,
			entries,
			truncated
		};
	}
	/** Read one file for preview: text decoded utf-8 (capped), images as data URLs. */
	async read(root, rel, asImage) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		let info;
		try {
			info = await stat(resolved.abs);
		} catch {
			return {
				code: "not-found",
				message: `cannot read ${rel}`
			};
		}
		if (info.isDirectory()) return {
			code: "is-directory",
			message: `${rel} is a directory`
		};
		if (asImage) {
			if (info.size > IMAGE_CAP_BYTES) return {
				code: "read-failed",
				message: "image exceeds preview cap"
			};
			let data;
			try {
				data = await readFile(resolved.abs);
			} catch {
				return {
					code: "not-found",
					message: `cannot read ${rel}`
				};
			}
			return {
				content: `data:${imageMime(rel, data)};base64,${data.toString("base64")}`,
				truncated: false,
				size: data.length,
				mtime: info.mtimeMs,
				image: probeImageSize(data)
			};
		}
		const budget = 320003;
		let data;
		try {
			if (info.size <= budget) data = await readFile(resolved.abs);
			else {
				const handle = await open(resolved.abs, "r");
				try {
					const buffer = Buffer.alloc(budget);
					const { bytesRead } = await handle.read(buffer, 0, budget, 0);
					data = buffer.subarray(0, bytesRead);
				} finally {
					await handle.close();
				}
			}
		} catch {
			return {
				code: "not-found",
				message: `cannot read ${rel}`
			};
		}
		const text = data.toString("utf8");
		const truncated = info.size > data.length || text.length > 8e4;
		return {
			content: truncated ? text.slice(0, TEXT_CAP_CHARS) : text,
			truncated,
			size: info.size,
			mtime: info.mtimeMs
		};
	}
	/**
	* Resolve one file for raw streaming (the markdown image / pdf preview
	* route): gated, traversal-guarded, and .git-refusing. Returns the absolute
	* path with the derived mime, size and mtime — the HTTP layer streams the
	* bytes itself (createReadStream + Range), so even large files never sit in
	* host memory. Mime magic detection reads only the first few bytes. The
	* mtime feeds the route's ETag/Last-Modified validators.
	*/
	async readRaw(root, rel) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to read .git"
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		let info;
		try {
			info = await stat(resolved.abs);
		} catch {
			return {
				code: "not-found",
				message: `cannot read ${rel}`
			};
		}
		if (info.isDirectory()) return {
			code: "is-directory",
			message: `${rel} is a directory`
		};
		const mime = mimeByExtension(rel) ?? imageMime(rel, await readMagicBytes(resolved.abs));
		return {
			abs: resolved.abs,
			mime,
			size: info.size,
			mtime: info.mtimeMs
		};
	}
	/** Write text content back, refusing when the file moved on disk (mtime conflict). */
	async write(root, rel, content, baseMtime) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to touch .git"
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		try {
			let current;
			try {
				current = await stat(resolved.abs);
			} catch {
				current = { mtimeMs: 0 };
			}
			if (baseMtime !== void 0 && Number(current.mtimeMs) !== 0 && Math.abs(Number(current.mtimeMs) - baseMtime) > 1) return {
				code: "write-conflict",
				message: "file changed on disk since it was loaded"
			};
			await mkdir(dirname(resolved.abs), { recursive: true });
			await writeFile(resolved.abs, content, "utf8");
			return { mtime: (await stat(resolved.abs)).mtimeMs };
		} catch {
			return {
				code: "write-failed",
				message: `cannot write ${rel}`
			};
		}
	}
	/**
	* Rename a path within the root. newName is a bare name (no separators,
	* no '.'/'..') so the target always stays in the source's own directory;
	* the joined target is re-checked against the canonical root anyway.
	*/
	async rename(root, rel, newName) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (rel === "") return {
			code: "path-outside-root",
			message: "refusing to rename the root"
		};
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to touch .git"
		};
		const name = newName.trim();
		if (name === "" || name === "." || name === ".." || /[\\/]/.test(name)) return {
			code: "path-outside-root",
			message: `invalid name: ${newName}`
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		if (relative(gated.canonical, resolved.abs) === "") return {
			code: "path-outside-root",
			message: "refusing to rename the root"
		};
		const target = join(dirname(resolved.abs), name);
		if (!isPathInside(gated.canonical, target)) return {
			code: "path-outside-root",
			message: `path escapes root: ${rel}`
		};
		try {
			await rename(resolved.abs, target);
			return { ok: true };
		} catch {
			return {
				code: "write-failed",
				message: `cannot rename ${rel}`
			};
		}
	}
	/** Create a directory at a relative path (its parent must already exist). */
	async mkdir(root, rel) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (rel === "") return {
			code: "path-outside-root",
			message: "refusing to create the root"
		};
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to touch .git"
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		try {
			await mkdir(resolved.abs);
			return { ok: true };
		} catch {
			return {
				code: "write-failed",
				message: `cannot create directory ${rel}`
			};
		}
	}
	/** Create an empty file at a relative path (wx: refuses to overwrite). */
	async newFile(root, rel) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (rel === "") return {
			code: "path-outside-root",
			message: "refusing to create the root"
		};
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to touch .git"
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		try {
			await writeFile(resolved.abs, "", { flag: "wx" });
			return { ok: true };
		} catch {
			return {
				code: "write-failed",
				message: `cannot create file ${rel}`
			};
		}
	}
	/**
	* Resolve a relative path to its gated absolute path without touching it —
	* the route layer uses it for reveal-in-file-manager / open-with-default.
	*/
	async resolveAbsolute(root, rel) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to touch .git"
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		return {
			ok: true,
			abs: resolved.abs
		};
	}
	/** Recursive filename search (case-insensitive substring), pruned at noise dirs. */
	async search(root, query) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		const needle = query.trim().toLowerCase();
		if (needle === "") return {
			query,
			hits: [],
			truncated: false
		};
		const hits = [];
		let scanned = 0;
		let truncated = false;
		const walk = async (rel, depth) => {
			if (truncated) return;
			const resolved = await resolveInsideRoot(gated.canonical, rel);
			if (!resolved.ok) return;
			let dirents;
			try {
				dirents = await readdir(resolved.abs, { withFileTypes: true });
			} catch {
				return;
			}
			for (const entry of dirents) {
				if (scanned >= SEARCH_SCAN_CAP) {
					truncated = true;
					return;
				}
				scanned += 1;
				const path = rel === "" ? entry.name : `${rel}/${entry.name}`;
				if (entry.isDirectory()) {
					if (SEARCH_SKIP_DIRS.has(entry.name)) continue;
					if (depth < 24 && !truncated) await walk(path, depth + 1);
					continue;
				}
				if (entry.name.toLowerCase().includes(needle)) {
					if (hits.length >= SEARCH_HIT_CAP) {
						truncated = true;
						return;
					}
					hits.push({
						path,
						name: entry.name,
						isDir: false
					});
				}
			}
		};
		try {
			await walk("", 0);
		} catch {
			return {
				code: "search-failed",
				message: "search walk failed"
			};
		}
		const rank = (hit) => {
			const name = hit.name.toLowerCase();
			if (name === needle) return 0;
			if (name.startsWith(needle)) return 1;
			return 2;
		};
		hits.sort((a, b) => rank(a) - rank(b) || a.path.length - b.path.length || (a.path < b.path ? -1 : 1));
		return {
			query,
			hits,
			truncated
		};
	}
	/** Delete a path (discard of untracked files). Recursive for directories. */
	async delete(root, rel) {
		const gated = await this.gate(root);
		if (!gated.ok) return gated.error;
		if (rel === "") return {
			code: "path-outside-root",
			message: "refusing to delete the root"
		};
		if (isGitPath(rel)) return {
			code: "path-outside-root",
			message: "refusing to touch .git"
		};
		const resolved = await resolveInsideRoot(gated.canonical, rel);
		if (!resolved.ok) return resolved.error;
		if (relative(gated.canonical, resolved.abs) === "") return {
			code: "path-outside-root",
			message: "refusing to delete the root"
		};
		try {
			await rm(resolved.abs, {
				recursive: true,
				force: true
			});
			return { ok: true };
		} catch {
			return {
				code: "write-failed",
				message: `cannot delete ${rel}`
			};
		}
	}
};
//#endregion
//#region src/host/git-runner.ts
/** Collected-output cap for one git command. */
const OUTPUT_CAP_BYTES = 1 << 20;
/**
* Production runner over the subprocess service: one managed child per
* command, bounded collect on both streams. Degrade mode keeps the SCM tab
* showing the friendly "not a git repository" state instead of a bare 400
* when git is missing or the subprocess service fails.
* @param ctx - context carrying the subprocess service.
* @param options - per-package behavior knobs.
* @returns the runner.
*/
function subprocessRunner$1(ctx, options = {}) {
	const spawnArgv = options.spawnArgv ?? ((argv) => ["git", ...argv]);
	const degrade = options.failureMode === "degrade";
	const errorTag = options.errorTag ?? "git";
	const failure = (prefix, error) => ({
		exitCode: 127,
		stdout: "",
		stderr: prefix + (error instanceof Error ? error.message : String(error))
	});
	return { async run(argv, cwd) {
		const spec = {
			argv: spawnArgv(argv),
			cwd,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: OUTPUT_CAP_BYTES },
				stderr: { maxBytes: OUTPUT_CAP_BYTES }
			},
			graceMs: 1e4
		};
		if (degrade) {
			let handle;
			try {
				handle = ctx.subprocess.spawn(spec);
			} catch (error) {
				console.error("[" + errorTag + "] git spawn failed:", error);
				return failure("git: spawn failed: ", error);
			}
			try {
				const outcome = await handle.done;
				const stdout = handle.collected.stdout?.readFrom(0).text ?? "";
				const stderr = handle.collected.stderr?.readFrom(0).text ?? "";
				return {
					exitCode: outcome.exitCode,
					stdout,
					stderr
				};
			} catch (error) {
				console.error("[" + errorTag + "] git run failed:", error);
				return failure("git: run failed: ", error);
			}
		}
		const handle = ctx.subprocess.spawn(spec);
		const outcome = await handle.done;
		const stdout = handle.collected.stdout?.readFrom(0).text ?? "";
		const stderr = handle.collected.stderr?.readFrom(0).text ?? "";
		return {
			exitCode: outcome.exitCode,
			stdout,
			stderr
		};
	} };
}
//#endregion
//#region src/host/git-service.ts
/**
* Host git service for the SCM tab: working-tree status (porcelain v1, -z),
* stage/unstage/discard batches, all scoped to the gated project root and
* executed through the managed subprocess seam. Parsing is pure and exported
* for tests; the service only wraps the runner. Discard never touches the
* staged side (the index is only ever rewritten by stage/unstage), matching
* the "discard = worktree side" contract.
* @module dsh-filemgr/host/git-service
*/
/** TTL for a positive repo-top-level verdict. */
const REPO_CACHE_TTL_MS = 6e4;
/** TTL for a negative (null) repo-top-level verdict. */
const NO_REPO_CACHE_TTL_MS = 3e4;
/** Production runner over `ctx.subprocess`: shared plumbing, degrade mode for the SCM tab. */
function subprocessRunner(ctx) {
	return subprocessRunner$1(ctx, {
		failureMode: "degrade",
		errorTag: "dsh-filemgr"
	});
}
/** Map one porcelain letter to the row state (unknown letters stay unknown). */
function porcelainState(letter) {
	switch (letter) {
		case "A": return "created";
		case "M": return "modified";
		case "D": return "deleted";
		case "R": return "renamed";
		case "C": return "created";
		case "U": return "conflicted";
		case "?": return "untracked";
		default: return "unknown";
	}
}
/**
* Parse `git status --porcelain=v1 -z` output into staged/unstaged/untracked
* rows. With -z every entry is NUL-terminated; rename entries carry two paths
* (old and new). Pure — exported for tests.
* @param output - raw porcelain v1 -z output.
* @returns the three change groups.
*/
function parsePorcelain(output) {
	const staged = [];
	const unstaged = [];
	const untracked = [];
	if (output === "") return {
		staged,
		unstaged,
		untracked
	};
	const fields = output.split("\0");
	for (let i = 0; i < fields.length; i += 1) {
		const field = fields[i];
		if (field === "") continue;
		const x = field[0] ?? " ";
		const y = field[1] ?? " ";
		const path = field.slice(3);
		if (x === "?" && y === "?") {
			untracked.push({
				path,
				state: "untracked",
				staged: false
			});
			continue;
		}
		if (x === "R" || x === "C") {
			const oldPath = path;
			const newPath = fields[i + 1] ?? oldPath;
			i += 1;
			staged.push({
				path: newPath,
				oldPath,
				state: porcelainState(x),
				staged: true
			});
			if (y !== " ") unstaged.push({
				path: newPath,
				oldPath,
				state: porcelainState(y),
				staged: false
			});
			continue;
		}
		if (x !== " ") staged.push({
			path,
			state: porcelainState(x),
			staged: true
		});
		if (y !== " ") unstaged.push({
			path,
			state: porcelainState(y),
			staged: false
		});
	}
	return {
		staged,
		unstaged,
		untracked
	};
}
/** Parse the porcelain row set into the status view shape. */
function parseStatusView(root, branch, output) {
	const { staged, unstaged, untracked } = parsePorcelain(output);
	return {
		root,
		branch,
		staged,
		unstaged,
		untracked
	};
}
/** The not-a-repository verdict for status reads. */
const NO_REPO = {
	code: "git-unavailable",
	message: "not a git repository"
};
/**
* Workspace-scoped git operations. Gated methods pass the gate, resolve the
* repository root, and reject non-repositories with a stable error; the
* `Canonical` variants trust an already-gated canonical root (the SSE poll)
* and skip the gate.
* @param runner - the spawn seam.
* @param gate - workspace-membership gate.
* @param fsDelete - delete seam for untracked discard (host: FsService.delete).
*/
var GitService = class {
	runner;
	gate;
	fsDelete;
	constructor(runner, gate, fsDelete) {
		this.runner = runner;
		this.gate = gate;
		this.fsDelete = fsDelete;
	}
	/** Cached one-shot git binary probe; never re-probes after the first call. */
	availablePromise;
	/**
	* Cached repo-top-level resolution per canonical workspace, with a TTL so
	* running `git init` (positive self-heal) or deleting `.git` (negative
	* self-heal) is discovered by a later probe. Positive verdicts live 60s,
	* negative (null) verdicts 30s; exitCode 127 is never cached because it
	* means spawn/run failed rather than "not a repository".
	*/
	repoCache = /* @__PURE__ */ new Map();
	/**
	* Probe the git binary once (git --version) and cache the verdict for the
	* service lifetime. A machine without git then degrades every operation to
	* the stable "not a git repository" state after a single failed spawn,
	* instead of re-spawning ENOENT on every poll tick. The cache stays false
	* even if git is installed later; the host restart picks it up.
	*/
	gitAvailable() {
		if (this.availablePromise === void 0) this.availablePromise = this.runner.run(["--version"], "/").then((result) => result.exitCode === 0).catch(() => false);
		return this.availablePromise;
	}
	/**
	* Resolve the repo top-level for one canonical root. Verdicts are cached
	* with a TTL: a positive repo path for 60s, a negative null for 30s. After
	* expiry the next call re-runs `rev-parse --show-toplevel`, so a repo
	* created or removed while the host is running is picked up later. An
	* exitCode 127 means the spawn/run itself failed; it returns null but is
	* deliberately not cached so the next call retries. Any other failure is
	* cached as a negative verdict for its TTL.
	*/
	repoOf(root) {
		const now = Date.now();
		const cached = this.repoCache.get(root);
		if (cached !== void 0 && cached.expiresAt > now) return cached.value;
		const entry = {
			value: Promise.resolve(null),
			expiresAt: Number.POSITIVE_INFINITY
		};
		entry.value = this.run(["rev-parse", "--show-toplevel"], root).then((result) => {
			if (result.exitCode === 127) {
				if (this.repoCache.get(root) === entry) this.repoCache.delete(root);
				return null;
			}
			if (result.exitCode !== 0) {
				entry.expiresAt = now + NO_REPO_CACHE_TTL_MS;
				return null;
			}
			const repo = result.stdout.trim();
			const found = repo !== "" && isPathInside(repo, root) ? repo : null;
			entry.expiresAt = now + (found === null ? NO_REPO_CACHE_TTL_MS : REPO_CACHE_TTL_MS);
			return found;
		}).catch(() => {
			entry.expiresAt = now + NO_REPO_CACHE_TTL_MS;
			return null;
		});
		this.repoCache.set(root, entry);
		return entry.value;
	}
	/**
	* Whether an already-gated canonical root is a git repository. Skips the
	* workspace gate so the SSE poll does not double-gate every 2s tick; the
	* underlying repoOf cache keeps rev-parse probes at TTL cadence.
	*/
	isRepositoryCanonical(canonicalRoot) {
		return this.repoOf(canonicalRoot).then((repo) => repo !== null);
	}
	/**
	* Whether a workspace root is a git repository. Gates the root first (POST
	* route entry point); the SSE poll should use `isRepositoryCanonical`.
	*/
	async isRepository(root) {
		const gated = await this.gate(root);
		if (!gated.ok) return false;
		return await this.isRepositoryCanonical(gated.canonical);
	}
	/** Resolve the gated canonical root and the repository top-level. */
	async repo(root) {
		const gated = await this.gate(root);
		if (!gated.ok) return {
			ok: false,
			error: gated.error
		};
		const repo = await this.repoOf(gated.canonical);
		if (repo === null) return {
			ok: false,
			error: NO_REPO
		};
		return {
			ok: true,
			root: gated.canonical,
			repo
		};
	}
	/** Run one git invocation and classify failures. */
	async run(argv, cwd) {
		return this.runner.run(argv, cwd);
	}
	/** The repo status view; null when the root is not a repository. */
	async status(root) {
		if (!await this.gitAvailable()) return null;
		const repo = await this.repo(root);
		if (!repo.ok) return repo.error.code === "git-unavailable" ? null : repo.error;
		return this.statusAt(repo.root, repo.repo);
	}
	/**
	* The repo status view for an already-gated canonical root; null when it is
	* not a repository. Skips the workspace gate (SSE subscribers were gated at
	* connect) and reuses the same repoOf cache + status parsing as `status`.
	*/
	async statusCanonical(canonicalRoot) {
		const repo = await this.repoOf(canonicalRoot);
		if (repo === null) return null;
		return this.statusAt(canonicalRoot, repo);
	}
	/** Run branch + porcelain status for one resolved repo and parse the view. */
	async statusAt(root, repo) {
		const [branchResult, statusResult] = await Promise.all([this.run([
			"rev-parse",
			"--abbrev-ref",
			"HEAD"
		], repo), this.run([
			"status",
			"--porcelain=v1",
			"-z",
			"--untracked-files=all"
		], repo)]);
		return parseStatusView(root, branchResult.stdout.trim() === "HEAD" ? "" : branchResult.stdout.trim(), statusResult.stdout);
	}
	/** The repo root for the watch layer (null when not a repository). */
	async repoRoot(root) {
		const repo = await this.repo(root);
		return repo.ok ? repo.repo : null;
	}
	/**
	* The unified diff of one path ('' when there is no diff to show). Staged
	* paths diff the index against HEAD (`--cached`); unstaged paths diff the
	* worktree against the index. Untracked paths have no index/HEAD entry, so
	* they diff against /dev/null (the canonical new-file shape); its exit code
	* is 1 — differences exist — which is a success here, not a failure.
	*/
	async diff(root, path, staged) {
		const repo = await this.repo(root);
		if (!repo.ok) return repo.error;
		const abs = join(repo.repo, path);
		if (!isPathInside(repo.repo, abs)) return {
			code: "path-outside-root",
			message: "path outside the repository"
		};
		const rel = relative(repo.repo, abs);
		const result = (await this.run([
			"ls-files",
			"--error-unmatch",
			"--",
			rel
		], repo.repo)).exitCode !== 0 ? await this.run([
			"diff",
			"--no-index",
			"--",
			"/dev/null",
			rel
		], repo.repo) : staged ? await this.run([
			"diff",
			"--cached",
			"--",
			rel
		], repo.repo) : await this.run([
			"diff",
			"--",
			rel
		], repo.repo);
		if (result.exitCode !== 0 && result.exitCode !== 1) return {
			code: "git-failed",
			message: "git diff failed"
		};
		return { content: result.stdout };
	}
	/** Verify paths stay inside the repo root (defense in depth). */
	pathsInside(repo, paths) {
		return paths.map((p) => join(repo, p)).filter((p) => isPathInside(repo, p)).map((p) => p);
	}
	/** Stage paths (git add). Batch result reflects the post-op status. */
	async stage(root, paths) {
		return this.batch(root, paths, async (repo, inside) => {
			return (await this.run([
				"add",
				"--",
				...inside
			], repo)).exitCode === 0;
		});
	}
	/** Unstage paths (git restore --staged). */
	async unstage(root, paths) {
		return this.batch(root, paths, async (repo, inside) => {
			return (await this.run([
				"restore",
				"--staged",
				"--",
				...inside
			], repo)).exitCode === 0;
		});
	}
	/**
	* Discard paths (worktree side only). Tracked paths are restored from the
	* index; untracked paths are deleted through the fs seam. The batch reports
	* applied/failed per path.
	*/
	async discard(root, paths) {
		const repo = await this.repo(root);
		if (!repo.ok) return repo.error;
		const inside = this.pathsInside(repo.repo, paths);
		const applied = [];
		const failed = [];
		const eligible = [];
		for (const p of paths) if (inside.includes(join(repo.repo, p))) eligible.push(p);
		else failed.push(p);
		const trackedSet = /* @__PURE__ */ new Set();
		if (eligible.length > 0) {
			const listed = await this.run([
				"ls-files",
				"-z",
				"--",
				...eligible.map((p) => ":(literal)" + p)
			], repo.repo);
			for (const entry of listed.stdout.split("\0")) if (entry !== "") trackedSet.add(entry);
		}
		const tracked = eligible.filter((p) => trackedSet.has(p));
		const untracked = eligible.filter((p) => !trackedSet.has(p));
		if (tracked.length > 0) if ((await this.run([
			"restore",
			"--worktree",
			"--",
			...tracked.map((p) => ":(literal)" + p)
		], repo.repo)).exitCode === 0) applied.push(...tracked);
		else for (const p of tracked) if ((await this.run([
			"restore",
			"--worktree",
			"--",
			":(literal)" + p
		], repo.repo)).exitCode === 0) applied.push(p);
		else failed.push(p);
		for (const p of untracked) {
			try {
				const real = await realpath(join(repo.repo, p));
				if (!isPathInside(repo.repo, real)) {
					failed.push(p);
					continue;
				}
			} catch {}
			const rel = relative(repo.root, join(repo.repo, p));
			if (rel === ".." || rel.startsWith("../")) {
				failed.push(p);
				continue;
			}
			const deleted = await this.fsDelete(repo.root, rel);
			if ("ok" in deleted && deleted.ok) applied.push(p);
			else failed.push(p);
		}
		return {
			applied,
			failed
		};
	}
	/** Shared batch plumbing: gate, repo resolve, path filter, run the op. */
	async batch(root, paths, op) {
		const repo = await this.repo(root);
		if (!repo.ok) return repo.error;
		const inside = this.pathsInside(repo.repo, paths);
		const ok = inside.length > 0 ? await op(repo.repo, inside) : true;
		if (!ok) return {
			code: "git-failed",
			message: "git operation failed"
		};
		return {
			applied: ok ? paths.filter((p) => inside.includes(join(repo.repo, p))) : [],
			failed: paths.filter((p) => !inside.includes(join(repo.repo, p)))
		};
	}
};
//#endregion
//#region src/host/poll-guard.ts
const DEFAULT_TIMERS = {
	set: (fn, ms) => setTimeout(fn, ms),
	clear: (handle) => {
		clearTimeout(handle);
	}
};
/**
* Owns one bounded poll loop.
*
* Guarantees: at most one task runs at a time (a scheduled tick whose turn
* arrives while a run is in flight is dropped); consecutive failures double
* the delay up to maxBackoffMs and reset on the first success; the loop
* stops forever at deadlineMs and cancels its timer.
*/
var PollGuard = class {
	options;
	handle;
	running = false;
	startedAt = 0;
	stopped = false;
	failures = 0;
	/** @param options - loop bounds; interval/deadline/backoff/onRun are required, the rest optional. */
	constructor(options) {
		this.options = {
			timers: DEFAULT_TIMERS,
			onDeadline: () => {},
			onSettled: () => {},
			...options
		};
	}
	/** Start the loop. Safe to call once; later calls are ignored. */
	start() {
		if (this.startedAt !== 0) return;
		this.startedAt = Date.now();
		this.schedule(this.options.intervalMs);
	}
	/** Stop the loop permanently and drop any pending tick. */
	stop() {
		this.stopped = true;
		this.options.timers.clear(this.handle);
		this.handle = void 0;
	}
	schedule(delayMs) {
		if (this.stopped) return;
		this.handle = this.options.timers.set(() => {
			this.tick();
		}, delayMs);
	}
	delay() {
		const backoff = this.options.intervalMs * 2 ** Math.min(this.failures, 8);
		return Math.min(backoff, this.options.maxBackoffMs);
	}
	async tick() {
		if (this.stopped) return;
		if (this.running) return;
		if (Date.now() - this.startedAt >= this.options.deadlineMs) {
			this.stopped = true;
			this.options.onDeadline();
			return;
		}
		this.running = true;
		try {
			await this.options.onRun();
			this.failures = 0;
		} catch {
			this.failures += 1;
		} finally {
			this.running = false;
			this.options.onSettled(this.failures);
			this.schedule(this.delay());
		}
	}
};
//#endregion
//#region src/host/loopback.ts
/** IPv4 127/8 predicate (four decimal octets, first == 127). */
function isIPv4Loopback(v4) {
	const parts = v4.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** Whether a socket remote address names the loopback range (127/8, ::1, IPv4-mapped). */
function isLoopbackAddress(address) {
	if (address === void 0) return false;
	const normalized = address.toLowerCase();
	if (normalized === "::1") return true;
	if (normalized.startsWith("::ffff:")) return isIPv4Loopback(normalized.slice(7));
	return isIPv4Loopback(normalized);
}
/** Whether a normalized URL hostname names the loopback authority (localhost, [::1], 127/8). */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	return isIPv4Loopback(hostname);
}
/**
* Request-level trust fence: a loopback socket address AND a loopback Host
* header, plus browser same-origin markers. The socket address is
* authoritative; X-Forwarded-For is never trusted.
*/
function isLoopbackRequest(request) {
	if (!isLoopbackAddress(request.socket.remoteAddress)) return false;
	const host = request.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl;
	try {
		hostUrl = new URL("http://" + host);
	} catch {
		return false;
	}
	if (!isLoopbackHostname(hostUrl.hostname)) return false;
	if (request.headers["sec-fetch-site"] === "cross-site") return false;
	const origin = request.headers.origin;
	if (origin === void 0) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
//#endregion
//#region src/host/routes.ts
const OK = (value) => ({
	ok: true,
	value
});
const FAIL = (error) => ({
	ok: false,
	error
});
/** Structural request failure (never a workspace fault). */
const BAD_REQUEST = {
	code: "internal",
	message: "malformed request"
};
/**
* Platform argv for "reveal in file manager" (select the entry). Windows
* Explorer selects via /select,; macOS Finder via open -R; Linux desktops
* have no select mode, so xdg-open opens the parent directory.
*/
function revealArgv(platform, abs) {
	if (platform === "win32") return ["explorer.exe", `/select,${abs}`];
	if (platform === "darwin") return [
		"open",
		"-R",
		abs
	];
	return ["xdg-open", dirname(abs)];
}
/** Platform argv for "open with the default app". */
function openArgv(platform, abs) {
	if (platform === "win32") return [
		"cmd.exe",
		"/c",
		"start",
		"",
		abs
	];
	if (platform === "darwin") return ["open", abs];
	return ["xdg-open", abs];
}
/**
* Spawn one OS GUI command fire-and-forget: Explorer / Finder / xdg-open
* detach immediately and their exit codes are not meaningful, so nothing is
* awaited beyond the spawn itself (failures still surface as an error).
*/
function spawnOsCommand(ctx, argv) {
	const spec = {
		argv,
		cwd: dirname(argv[argv.length - 1] ?? process.cwd()),
		stdio: {
			stdin: "ignore",
			stdout: { maxBytes: 65536 },
			stderr: { maxBytes: 65536 }
		},
		graceMs: 5e3
	};
	try {
		ctx.subprocess.spawn(spec).done.catch(() => {});
		return null;
	} catch (error) {
		ctx.logger.warn(`dsh-filemgr: OS command failed ([${argv.join(", ")}]): ${String(error)}`);
		return {
			code: "internal",
			message: "cannot run OS command"
		};
	}
}
/**
* Poll interval for git-status changes while subscribers are connected.
* Kept deliberately long (30s): on Windows a cold git.exe costs ~0.7s per
* spawn, and the SCM panel already refreshes event-driven (fs watch for
* file edits) and on window focus — the poll only needs to catch
* out-of-band .git writes (commits/checkouts from other tools).
*/
const GIT_POLL_MS = 3e4;
/** SSE keep-alive comment interval (proxies drop idle connections). */
const HEARTBEAT_MS = 15e3;
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
function parseRangeHeader(header, size) {
	if (header === void 0) return null;
	const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
	if (match === null || match[1] === "" && match[2] === "") return null;
	if (match[1] === "") {
		const suffix = Number(match[2]);
		if (suffix <= 0 || size === 0) return "invalid";
		return {
			start: Math.max(0, size - suffix),
			end: size - 1
		};
	}
	const start = Number(match[1]);
	const end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
	if (size === 0 || start > end || start >= size) return "invalid";
	return {
		start,
		end
	};
}
/** Strip the weak prefix and quotes so entity-tags compare by opaque value. */
function normalizeEtag(value) {
	return value.trim().replace(/^W\//, "").replace(/^"|"$/g, "");
}
/**
* Whether an If-None-Match header matches the current etag. Handles `*` and
* comma-separated entity-tag lists; GET revalidation uses weak comparison
* (RFC 9110), so the weak prefix is ignored on both sides.
*/
function ifNoneMatchSaidFresh(header, etag) {
	if (header === void 0) return false;
	const current = normalizeEtag(etag);
	return header.split(",").some((candidate) => {
		const tag = candidate.trim();
		return tag === "*" || normalizeEtag(tag) === current;
	});
}
/**
* Deadline for one git-status subprocess inside pollGit. Not an execution
* timeout — the subprocess' own graceMs limits a single binary run; this is
* the route layer's guard against a hung status (e.g. a wedged git daemon on
* a cold path) that would otherwise leave the anti-overlap guard (owned by
* PollGuard) wedged forever and silence SCM. Owned here so the deadline is independent
* of any service-level setting.
*/
const GIT_STATUS_TIMEOUT_MS = 15e3;
/**
* PollGuard loop bounds. The poll is stopped by the SSE subscriber lifecycle
* (start on first subscriber, stop when the last disconnects), so the guard's
* own deadline is never reached in practice (MAX_SAFE_INTEGER ms ~ no
* deadline), preserving the former setInterval which kept polling as long as
* any stream was connected. maxBackoffMs equals the interval so a rejected
* run retries at the same cadence as a healthy one (interval unchanged).
*/
const GIT_POLL_DEADLINE_MS = Number.MAX_SAFE_INTEGER;
const GIT_POLL_MAX_BACKOFF_MS = GIT_POLL_MS;
/** Write the shared non-loopback rejection (same body as dsh-ssh). */
function forbidden(res) {
	res.writeHead(403, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify({ error: "forbidden: loopback-only" }));
}
/** Read a JSON request body into an unknown value; null when unparseable. */
async function readJsonBody(req) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		const buffer = chunk;
		chunks.push(buffer);
		total += buffer.length;
		if (total > 1 << 20) return null;
	}
	const text = Buffer.concat(chunks).toString("utf8");
	if (text === "") return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
/** Extract the required string field from a JSON object payload. */
function strField(payload, key) {
	if (typeof payload !== "object" || payload === null) return null;
	const value = payload[key];
	return typeof value === "string" && value !== "" ? value : null;
}
/** Extract a string field, accepting the empty string as a value. */
function strOrEmpty(payload, key) {
	if (typeof payload !== "object" || payload === null) return null;
	const value = payload[key];
	return typeof value === "string" ? value : null;
}
/** Extract a string array field (defaults to []). */
function strArray(payload, key) {
	if (typeof payload !== "object" || payload === null) return null;
	const value = payload[key];
	if (value === void 0) return [];
	if (!Array.isArray(value)) return null;
	if (!value.every((item) => typeof item === "string")) return null;
	return value;
}
/** Write one JSON envelope response. */
function json(res, envelope, status = 200) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(envelope));
}
/**
* Register the /filemgr routes (prefix for JSON, exact for the SSE
* stream — longest-prefix-wins keeps them disjoint).
* @param ctx - context carrying the webServer service.
* @param fs - the gated filesystem service.
* @param git - the gated git service.
* @returns the route disposers.
*/
function registerPanelRoutes(ctx, fs, git) {
	const subscribers = /* @__PURE__ */ new Set();
	let gitPoll;
	let heartbeatTimer;
	const push = (subscriber, payload) => {
		subscriber.res.write(`event: change\ndata: ${JSON.stringify(payload)}\n\n`);
	};
	let gitProbed = false;
	let gitUnavailable = false;
	const pollGit = async () => {
		if (!gitProbed) {
			gitProbed = true;
			if (!await git.gitAvailable()) {
				gitUnavailable = true;
				ctx.logger.warn("dsh-filemgr: git binary unavailable, SCM polling disabled");
				for (const subscriber of subscribers) push(subscriber, { kind: "gitUnavailable" });
			}
		}
		if (gitUnavailable) return;
		await Promise.all([...subscribers].map(async (subscriber) => {
			try {
				if (!await git.isRepositoryCanonical(subscriber.root)) return;
				let timeout;
				const status = await Promise.race([git.statusCanonical(subscriber.root), new Promise((_, reject) => {
					timeout = setTimeout(() => reject(/* @__PURE__ */ new Error("git status timed out")), GIT_STATUS_TIMEOUT_MS);
				})]).finally(() => {
					if (timeout !== void 0) clearTimeout(timeout);
				});
				if (status === null) return;
				const key = `${status.branch}|${JSON.stringify(status.staged)}|${JSON.stringify(status.unstaged)}|${JSON.stringify(status.untracked)}`;
				if (key === subscriber.lastGit) return;
				subscriber.lastGit = key;
				push(subscriber, {
					kind: "git",
					status
				});
			} catch (error) {
				ctx.logger.warn(`dsh-filemgr: git poll failed for ${subscriber.root}: ${String(error)}`);
			}
		}));
	};
	const startGitPoll = () => {
		if (gitPoll !== void 0) return;
		gitPoll = new PollGuard({
			intervalMs: GIT_POLL_MS,
			deadlineMs: GIT_POLL_DEADLINE_MS,
			maxBackoffMs: GIT_POLL_MAX_BACKOFF_MS,
			onRun: pollGit
		});
		gitPoll.start();
	};
	const stopGitPoll = () => {
		if (gitPoll === void 0) return;
		gitPoll.stop();
		gitPoll = void 0;
	};
	/**
	* GET /filemgr/raw: stream one workspace file (markdown image srcs,
	* pdf preview). Gated like every other operation; FsService.readRaw only
	* resolves and stats the path, the bytes are piped straight from disk with
	* the derived mime — the whole file never sits in host memory. Single byte
	* ranges are honored (206/416) so the browser pdf viewer can seek large
	* files; unsupported range shapes are ignored per RFC 7233 (200 full
	* body). ETag/Last-Modified (size+mtime) keep no-cache revalidation cheap:
	* unchanged files answer 304, If-Range mismatches fall back to 200.
	*/
	const serveRaw = async (req, url, res) => {
		const root = url.searchParams.get("root");
		const path = url.searchParams.get("path");
		if (root === null || root === "" || path === null || path === "") {
			json(res, FAIL(BAD_REQUEST), 400);
			return;
		}
		const result = await fs.readRaw(root, path);
		if (!("abs" in result)) {
			const status = result.code === "path-outside-root" || result.code === "is-directory" ? 403 : 404;
			json(res, FAIL(result), status);
			return;
		}
		const etag = `W/"${result.size}-${Math.floor(result.mtime)}"`;
		const lastModified = new Date(result.mtime).toUTCString();
		const baseHeaders = {
			"content-type": result.mime,
			"cache-control": "no-cache",
			"x-content-type-options": "nosniff",
			"accept-ranges": "bytes",
			etag,
			"last-modified": lastModified
		};
		if (ifNoneMatchSaidFresh(req.headers["if-none-match"], etag) && req.headers.range === void 0) {
			res.writeHead(304, baseHeaders);
			res.end();
			return;
		}
		const ifRange = req.headers["if-range"];
		const range = ifRange !== void 0 && ifRange !== etag && ifRange !== lastModified ? null : parseRangeHeader(req.headers.range, result.size);
		if (range === "invalid") {
			res.writeHead(416, {
				...baseHeaders,
				"content-range": `bytes */${result.size}`
			});
			res.end();
			return;
		}
		const headers = { ...baseHeaders };
		if (range === null) {
			headers["content-length"] = result.size;
			res.writeHead(200, headers);
		} else {
			headers["content-range"] = `bytes ${range.start}-${range.end}/${result.size}`;
			headers["content-length"] = range.end - range.start + 1;
			res.writeHead(206, headers);
		}
		try {
			await pipeline(createReadStream(result.abs, range === null ? void 0 : {
				start: range.start,
				end: range.end
			}), res);
		} catch {
			res.destroy();
		}
	};
	/**
	* GET /filemgr/vendor/mermaid.js: the mermaid IIFE bundle shipped in
	* the package (lib/assets/mermaid.min.js, copied from the mermaid npm
	* dependency at build time). Same-origin for the browser half (no CDN),
	* loopback-fenced like every other route. One read is cached per plugin
	* instance; the size+mtime pair doubles as the ETag so the browser
	* revalidation is a cheap 304. A missing asset (build without the copy
	* step) 404s and the client keeps plain code blocks.
	*/
	let mermaidAsset;
	const serveVendorMermaid = async (req, res) => {
		if (mermaidAsset === void 0) {
			for (const relative of ["./assets/mermaid.min.js", "../../lib/assets/mermaid.min.js"]) try {
				const assetPath = fileURLToPath(new URL(relative, import.meta.url));
				const [data, info] = await Promise.all([readFile(assetPath), stat(assetPath)]);
				mermaidAsset = {
					data,
					etag: `"${data.length}-${info.mtimeMs.toString(16)}"`
				};
				break;
			} catch {}
			if (mermaidAsset === void 0) {
				res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
				res.end(JSON.stringify({ error: "mermaid vendor asset missing" }));
				return;
			}
		}
		if (req.headers["if-none-match"] === mermaidAsset.etag) {
			res.writeHead(304, { etag: mermaidAsset.etag });
			res.end();
			return;
		}
		res.writeHead(200, {
			"content-type": "application/javascript; charset=utf-8",
			"content-length": mermaidAsset.data.length,
			"cache-control": "no-cache",
			etag: mermaidAsset.etag,
			"x-content-type-options": "nosniff"
		});
		res.end(mermaidAsset.data);
	};
	const handler = async (req, res) => {
		if (!isLoopbackRequest(req)) {
			forbidden(res);
			return;
		}
		if (req.method === "GET") {
			const url = new URL(req.url ?? "/", "http://x");
			if (url.pathname === "/filemgr/raw") {
				await serveRaw(req, url, res);
				return;
			}
			if (url.pathname === "/filemgr/vendor/mermaid.js") {
				await serveVendorMermaid(req, res);
				return;
			}
			res.writeHead(405);
			res.end();
			return;
		}
		if (req.method !== "POST") {
			res.writeHead(405);
			res.end();
			return;
		}
		if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
			json(res, FAIL(BAD_REQUEST), 415);
			return;
		}
		const pathname = new URL(req.url ?? "/", "http://x").pathname;
		const payload = await readJsonBody(req);
		if (payload === null) {
			json(res, FAIL(BAD_REQUEST));
			return;
		}
		const root = strField(payload, "root");
		if (root === null) {
			json(res, FAIL(BAD_REQUEST));
			return;
		}
		switch (pathname) {
			case "/filemgr/list": {
				const path = strField(payload, "path") ?? "";
				const result = await fs.list(root, path);
				json(res, "entries" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/read": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const asImage = typeof payload === "object" && payload !== null ? payload.asImage === true : false;
				const result = await fs.read(root, path, asImage);
				json(res, "content" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/write": {
				const path = strField(payload, "path");
				const content = strOrEmpty(payload, "content");
				if (path === null || content === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const rawBase = typeof payload === "object" && payload !== null ? payload.baseMtime : void 0;
				const baseMtime = typeof rawBase === "number" && Number.isFinite(rawBase) ? rawBase : void 0;
				const result = await fs.write(root, path, content, baseMtime);
				json(res, "mtime" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/search": {
				const query = strField(payload, "query") ?? "";
				const result = await fs.search(root, query);
				json(res, "hits" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/delete": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await fs.delete(root, path);
				json(res, "ok" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/reveal": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const resolved = await fs.resolveAbsolute(root, path);
				if (!("ok" in resolved)) {
					json(res, FAIL(resolved));
					return;
				}
				const error = spawnOsCommand(ctx, revealArgv(process.platform, resolved.abs));
				json(res, error === null ? OK({ ok: true }) : FAIL(error));
				return;
			}
			case "/filemgr/open-with-default": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const resolved = await fs.resolveAbsolute(root, path);
				if (!("ok" in resolved)) {
					json(res, FAIL(resolved));
					return;
				}
				const error = spawnOsCommand(ctx, openArgv(process.platform, resolved.abs));
				json(res, error === null ? OK({ ok: true }) : FAIL(error));
				return;
			}
			case "/filemgr/rename": {
				const path = strField(payload, "path");
				const newName = strField(payload, "newName");
				if (path === null || newName === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await fs.rename(root, path, newName);
				json(res, "ok" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/mkdir": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await fs.mkdir(root, path);
				json(res, "ok" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/new-file": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await fs.newFile(root, path);
				json(res, "ok" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/git-status": {
				const result = await git.status(root);
				json(res, result === null ? OK(null) : "root" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/git-diff": {
				const path = strField(payload, "path");
				if (path === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const staged = typeof payload === "object" && payload !== null ? payload.staged === true : false;
				const result = await git.diff(root, path, staged);
				json(res, "content" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/git-stage": {
				const paths = strArray(payload, "paths");
				if (paths === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await git.stage(root, paths);
				json(res, "applied" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/git-unstage": {
				const paths = strArray(payload, "paths");
				if (paths === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await git.unstage(root, paths);
				json(res, "applied" in result ? OK(result) : FAIL(result));
				return;
			}
			case "/filemgr/git-discard": {
				const paths = strArray(payload, "paths");
				if (paths === null) {
					json(res, FAIL(BAD_REQUEST));
					return;
				}
				const result = await git.discard(root, paths);
				json(res, "applied" in result ? OK(result) : FAIL(result));
				return;
			}
			default:
				res.writeHead(404);
				res.end();
		}
	};
	const sse = async (req, res) => {
		if (!isLoopbackRequest(req)) {
			forbidden(res);
			return;
		}
		const root = new URL(req.url ?? "/", "http://x").searchParams.get("root");
		if (root === null || root === "") {
			res.writeHead(400);
			res.end();
			return;
		}
		const gated = await fs.verify(root);
		if (!gated.ok) {
			json(res, FAIL(gated.error), 400);
			return;
		}
		res.writeHead(200, {
			"content-type": "text/event-stream; charset=utf-8",
			"cache-control": "no-cache",
			connection: "keep-alive"
		});
		res.write("retry: 2000\n\n");
		const subscriber = {
			root: gated.canonical,
			lastGit: "",
			res
		};
		subscribers.add(subscriber);
		if (gitUnavailable) push(subscriber, { kind: "gitUnavailable" });
		startGitPoll();
		if (heartbeatTimer === void 0) heartbeatTimer = setInterval(() => {
			for (const current of subscribers) current.res.write(": ping\n\n");
		}, HEARTBEAT_MS);
		req.on("close", () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0) {
				stopGitPoll();
				if (heartbeatTimer !== void 0) clearInterval(heartbeatTimer);
				heartbeatTimer = void 0;
			}
		});
	};
	const disposers = [ctx.webServer.register({
		kind: "prefix",
		path: "/filemgr",
		handler
	}), ctx.webServer.register({
		kind: "exact",
		path: "/filemgr/events",
		handler: sse
	})];
	return () => {
		for (const dispose of disposers) dispose();
		stopGitPoll();
		if (heartbeatTimer !== void 0) clearInterval(heartbeatTimer);
		for (const subscriber of subscribers) subscriber.res.end();
		subscribers.clear();
	};
}
//#endregion
//#region src/mount-once.ts
/**
* Host single-instance guard shared by the plugin family. The family bundle
* (dsh-web-ui-all / dsh-skins) namespaces every child row id (web-ui-*), so
* the loader accepts a standalone install of the same package side by side;
* without this guard the second instance would still re-register the same
* webserver routes, tools, settings namespaces, and system-prompt sections
* and fail the boot. mountOnce makes the second host apply a no-op for the
* lifetime of the first instance (the browser half is already deduped by
* package name in the client module host).
*
* The registry rides a global symbol so two module instances of the same
* package (npm copy vs repository link) still share one verdict. cordis
* `ctx.effect` runs its callback immediately and treats the callback's
* return value as the fiber disposer, so the unmarker is returned, not run.
*/
const MOUNTED = Symbol.for("dsh-web-ui.mounted-plugins");
function mountedSet() {
	const registry = globalThis;
	return registry[MOUNTED] ??= /* @__PURE__ */ new Set();
}
/**
* Wrap a cordis plugin apply so the package runs at most once per process.
* The first mount registers normally and unmarks when its fiber disposes;
* any later mount of the same package name is a no-op.
* @param packageName - npm package identity shared by every install source.
* @param fn - the original plugin apply.
* @returns an apply of the same shape.
*/
function mountOnce(packageName, fn) {
	return ((...args) => {
		const mounted = mountedSet();
		if (mounted.has(packageName)) return;
		mounted.add(packageName);
		args[0]?.effect?.(() => () => {
			mounted.delete(packageName);
		});
		return fn(...args);
	});
}
//#endregion
//#region src/index.ts
/** Required services: the route registry, the managed subprocess seam, the workspace registry, and the prompt band. */
const inject = [
	"webServer",
	"subprocess",
	"workspaceRegistry",
	"systemPrompt"
];
/** Settings namespace the browser settings card edits (the Host registers it). */
const FILEMANAGER_PANEL_SETTINGS_NAMESPACE = "filemgr";
/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 210;
/** Model-facing announcement: plugin presence, capabilities, and limits. */
const FILEMANAGER_PANEL_GUIDANCE = "本机已安装 dsh-filemgr 插件（DSH Web GUI 的右侧面板系统）：项目会话打开时，聊天区右侧出现「预览」与「文件/变更」两块面板。能力：Explorer 文件树（点击文件在预览面板打开、整行点击展开文件夹、按文件名搜索定位）；Preview 多 tab 预览（markdown/html/code/diff/csv/pdf/office/图片/文本等格式，支持源码/预览切换、分屏编辑、保存；markdown 与聊天消息中的 mermaid 代码块会渲染成图表，图源语法错误时回退为代码块）；SCM 变更面板（真实 git stage/unstage/discard）；面板宽度可拖拽调整（Explorer 220~500px、Preview 340~1200px），双击把手复位默认宽度，折叠状态与宽度按项目持久化（localStorage）。数据源为当前会话工作目录的真实文件系统与真实 git 仓库，宿主进程经 /filemgr/* 路由提供。用户提到「右侧面板 / 预览面板 / 文件树 / 变更面板」时即指本插件，请据此协作。";
/**
* Mount the panel data services and their routes.
* @param ctx - context carrying webServer, subprocess, workspaceRegistry, systemPrompt.
*/
const apply = mountOnce("@lijian-ui/dsh-file-manager", applyImpl);
function applyImpl(ctx, config = {}) {
	const gate = createWorkspaceGate(ctx);
	const fs = new FsService(gate);
	const git = new GitService(subprocessRunner(ctx), gate, (root, rel) => fs.delete(root, rel));
	let current = () => base;
	const base = { enabled: config.enabled ?? true };
	let disposePanel;
	let disposePrompt;
	const syncPanel = () => {
		const enabled = current().enabled ?? true;
		if (disposePanel === void 0 && enabled) {
			disposePanel = ctx.effect(() => {
				const disposeRoutes = registerPanelRoutes(ctx, fs, git);
				return () => disposeRoutes();
			}, "dsh-filemgr: /filemgr routes");
			disposePrompt = ctx.effect(() => ctx.systemPrompt.section({
				name: "plugin:filemgr",
				order: SECTION_ORDER,
				text: FILEMANAGER_PANEL_GUIDANCE
			}), "dsh-filemgr: prompt section");
		} else if (disposePanel !== void 0 && !enabled) {
			disposePanel();
			disposePanel = void 0;
			disposePrompt?.();
			disposePrompt = void 0;
		}
	};
	installSettingsSection(ctx, settingsNamespace(FILEMANAGER_PANEL_SETTINGS_NAMESPACE), import_lib.default.object({ enabled: import_lib.default.boolean().default(true) }), base, {
		setSource: (source) => {
			current = source;
		},
		onChange: () => syncPanel()
	});
	syncPanel();
}
//#endregion
export { FILEMANAGER_PANEL_GUIDANCE, FILEMANAGER_PANEL_SETTINGS_NAMESPACE, apply, inject };
