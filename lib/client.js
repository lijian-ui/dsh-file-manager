window.__ModuleLoader__.load({
	id: "@lijian-ui/dsh-file-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom_client = require("react-dom/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region src/client/api.ts
		/** Transport failure (fetch threw or the response was not JSON). */
		const TRANSPORT_ERROR = {
			code: "internal",
			message: "panel route unavailable"
		};
		/** POST one JSON payload and decode the envelope; never throws. */
		async function post(path, payload) {
			let response;
			try {
				response = await fetch(path, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(payload)
				});
			} catch {
				return {
					ok: false,
					error: TRANSPORT_ERROR
				};
			}
			try {
				const envelope = await response.json();
				if (typeof envelope !== "object" || envelope === null) return {
					ok: false,
					error: TRANSPORT_ERROR
				};
				const record = envelope;
				if (record.ok === true) return {
					ok: true,
					value: record.value
				};
				return {
					ok: false,
					error: record.error ?? TRANSPORT_ERROR
				};
			} catch {
				return {
					ok: false,
					error: TRANSPORT_ERROR
				};
			}
		}
		/** Typed panel operations over the wire. */
		var PanelApi = class {
			/** List one directory of the project root (rel path; '' = root). */
			list(root, path) {
				return post("/filemgr/list", {
					root,
					path
				});
			}
			/** Read one file (text or image data URL). */
			read(root, path, asImage) {
				return post("/filemgr/read", {
					root,
					path,
					asImage
				});
			}
			/** Write text content back with an optional mtime conflict base. */
			write(root, path, content, baseMtime) {
				return post("/filemgr/write", {
					root,
					path,
					content,
					baseMtime
				});
			}
			/** Filename search under the root. */
			search(root, query) {
				return post("/filemgr/search", {
					root,
					query
				});
			}
			/** Delete a path (untracked discard). */
			delete(root, path) {
				return post("/filemgr/delete", {
					root,
					path
				});
			}
			/** Reveal a path in the OS file manager (selecting the entry). */
			reveal(root, path) {
				return post("/filemgr/reveal", {
					root,
					path
				});
			}
			/** Open a path with the OS default app. */
			openWithDefault(root, path) {
				return post("/filemgr/open-with-default", {
					root,
					path
				});
			}
			/** Rename a path (newName is a bare name, no separators). */
			rename(root, path, newName) {
				return post("/filemgr/rename", {
					root,
					path,
					newName
				});
			}
			/** Create a directory at a relative path (parent must exist). */
			mkdir(root, path) {
				return post("/filemgr/mkdir", {
					root,
					path
				});
			}
			/** Create an empty file at a relative path (refuses to overwrite). */
			newFile(root, path) {
				return post("/filemgr/new-file", {
					root,
					path
				});
			}
			/** The repo status view; null when the root is not a repository. */
			gitStatus(root) {
				return post("/filemgr/git-status", { root });
			}
			/** The unified diff text of one path (staged = index vs HEAD). */
			gitDiff(root, path, staged) {
				return post("/filemgr/git-diff", {
					root,
					path,
					staged
				});
			}
			/** Stage paths. */
			gitStage(root, paths) {
				return post("/filemgr/git-stage", {
					root,
					paths
				});
			}
			/** Unstage paths. */
			gitUnstage(root, paths) {
				return post("/filemgr/git-unstage", {
					root,
					paths
				});
			}
			/** Discard paths (worktree side; untracked paths are deleted). */
			gitDiscard(root, paths) {
				return post("/filemgr/git-discard", {
					root,
					paths
				});
			}
		};
		/**
		* Subscribe to host-pushed changes for one project root (fs watch events and
		* git status polls). Reconnects are handled by the EventSource; the caller
		* re-subscribes when the root changes.
		* @param root - project root to watch.
		* @param onChange - fired on every pushed change.
		* @returns the disposer closing the stream.
		*/
		function subscribePanelEvents(root, onChange) {
			const source = new EventSource(`/filemgr/events?root=${encodeURIComponent(root)}`);
			source.addEventListener("change", (raw) => {
				try {
					onChange(JSON.parse(raw.data));
				} catch {}
			});
			return () => {
				source.close();
			};
		}
		//#endregion
		//#region \0dsh-css:src/client/settings-card.module.css.mjs
		const css$7 = ".KApx_W_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.KApx_W_card:hover{border-color:var(--dsw-alias-label-dimmed)}.KApx_W_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.KApx_W_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.KApx_W_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.KApx_W_headerStatic{border-radius:12px;align-items:center;gap:12px;width:100%;padding:14px 16px;display:flex}.KApx_W_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.KApx_W_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.KApx_W_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.KApx_W_pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.KApx_W_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.KApx_W_chevronOpen{transform:rotate(180deg)}.KApx_W_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.KApx_W_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.KApx_W_notExposed{color:var(--dsw-alias-state-warn-primary);margin:12px 0 0;font-size:12px;line-height:1.5}.KApx_W_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.KApx_W_failed{min-width:0;color:var(--dsw-alias-label-error);text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:12px;line-height:1.5;overflow:hidden}.KApx_W_discard,.KApx_W_save{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.KApx_W_discard{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.KApx_W_discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.KApx_W_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.KApx_W_discard:disabled,.KApx_W_save:disabled{opacity:.4;cursor:default}.KApx_W_discard:focus-visible,.KApx_W_save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.KApx_W_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.KApx_W_field+.KApx_W_field{border-top:1px solid var(--dsw-alias-border-l2)}.KApx_W_head{align-items:center;gap:8px;display:flex}.KApx_W_label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.KApx_W_badges{align-items:center;gap:8px;display:inline-flex}.KApx_W_badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.KApx_W_reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;padding:0;font-size:12px;line-height:1.5}.KApx_W_reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.KApx_W_reset:disabled{cursor:default}.KApx_W_reset:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.KApx_W_input,.KApx_W_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.KApx_W_input:focus-visible,.KApx_W_select:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.KApx_W_input:disabled,.KApx_W_select:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.KApx_W_inputInvalid{border:1px solid var(--dsw-alias-label-error);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.KApx_W_inputInvalid:focus-visible{outline:2px solid var(--dsw-alias-label-error);outline-offset:1px;border-color:var(--dsw-alias-label-error)}.KApx_W_invalid{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}.KApx_W_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}@media (prefers-reduced-motion:reduce){.KApx_W_card,.KApx_W_header,.KApx_W_chevron,.KApx_W_chevronOpen,.KApx_W_discard,.KApx_W_save{transition:none}}";
		const tagId$7 = "@lijian-ui/dsh-file-manager/settings-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$7) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$7;
			tag.textContent = css$7;
			document.head.appendChild(tag);
		}
		var settings_card_module_css_default = {
			"badge": "KApx_W_badge",
			"badges": "KApx_W_badges",
			"body": "KApx_W_body",
			"card": "KApx_W_card",
			"cardOpen": "KApx_W_cardOpen",
			"chevron": "KApx_W_chevron",
			"chevronOpen": "KApx_W_chevronOpen",
			"description": "KApx_W_description",
			"discard": "KApx_W_discard",
			"failed": "KApx_W_failed",
			"field": "KApx_W_field",
			"footer": "KApx_W_footer",
			"head": "KApx_W_head",
			"headText": "KApx_W_headText",
			"header": "KApx_W_header",
			"headerStatic": "KApx_W_headerStatic",
			"hint": "KApx_W_hint",
			"input": "KApx_W_input",
			"inputInvalid": "KApx_W_inputInvalid",
			"invalid": "KApx_W_invalid",
			"label": "KApx_W_label",
			"name": "KApx_W_name",
			"notExposed": "KApx_W_notExposed",
			"pending": "KApx_W_pending",
			"readOnly": "KApx_W_readOnly",
			"reset": "KApx_W_reset",
			"save": "KApx_W_save",
			"select": "KApx_W_select"
		};
		//#endregion
		//#region src/client/PluginSettingsCard.tsx
		/**
		* Family-shared chrome for plugin settings cards: a disclosure header naming
		* the plugin and what its settings govern, the controls inside, and the save
		* that writes them. Renders nothing while the namespace is unavailable — a
		* deployment that does not compose the owning plugin should show no trace of
		* it. Inlined into each consumer's client bundle; mirrors the official
		* ui-plugin-config PluginCard in a self-contained slice.
		*/
		/**
		* Render one plugin settings card.
		* @param props - the plugin's copy keys, its form state, and its controls.
		* @returns the card, or nothing while the namespace is still loading.
		*/
		function PluginSettingsCard(props) {
			const [open, setOpen] = (0, react.useState)(props.defaultOpen ?? true);
			const { state, alwaysOpen } = props;
			if (!state.available) return null;
			const title = props.t(props.titleKey);
			const description = props.t(props.descriptionKey);
			const blocked = !state.dirty || state.invalid || state.saving;
			const expanded = alwaysOpen === true || open;
			const cardClass = expanded ? `${settings_card_module_css_default.cardOpen} ${settings_card_module_css_default.card}` : settings_card_module_css_default.card;
			const header = alwaysOpen === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: settings_card_module_css_default.headerStatic,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: settings_card_module_css_default.headText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.name,
						title,
						children: title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.description,
						title: description,
						children: description
					})]
				}), state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: settings_card_module_css_default.pending,
					title: props.t("settings.unsaved"),
					children: props.t("settings.unsaved")
				}) : null]
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: settings_card_module_css_default.header,
				"aria-expanded": open,
				"aria-label": `${props.t(open ? "settings.collapse" : "settings.expand")}: ${title}`,
				onClick: () => {
					setOpen(!open);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							title,
							children: title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.description,
							title: description,
							children: description
						})]
					}),
					state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: settings_card_module_css_default.pending,
						title: props.t("settings.unsaved"),
						children: props.t("settings.unsaved")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 14 14",
						fill: "none",
						xmlns: "http://www.w3.org/2000/svg",
						className: open ? `${settings_card_module_css_default.chevron} ${settings_card_module_css_default.chevronOpen}` : settings_card_module_css_default.chevron,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
							fill: "currentColor"
						})
					})
				]
			});
			if (!state.exposed) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: cardClass,
				children: [header, expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: settings_card_module_css_default.body,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: settings_card_module_css_default.notExposed,
						role: "status",
						children: props.t("settings.notExposed")
					})
				}) : null]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: cardClass,
				children: [header, expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.body,
					children: [
						!state.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: settings_card_module_css_default.readOnly,
							role: "status",
							children: props.t("settings.readOnly")
						}) : null,
						props.children,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.footer,
							children: [
								state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: settings_card_module_css_default.failed,
									role: "status",
									children: [props.t("settings.saveFailed"), state.failedReason ? " - " + state.failedReason : ""]
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: settings_card_module_css_default.discard,
									disabled: !state.dirty || state.saving,
									onClick: props.onDiscard,
									children: props.t("settings.discard")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: settings_card_module_css_default.save,
									disabled: blocked,
									onClick: props.onSave,
									children: props.t(!state.saving ? "settings.save" : "settings.saving")
								})
							]
						})
					]
				}) : null]
			});
		}
		/** A staged boolean field: 继承 / 开 / 关. */
		function BooleanField(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: settings_card_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: settings_card_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: settings_card_module_css_default.label,
							htmlFor: props.id,
							children: props.label
						}), props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: settings_card_module_css_default.badges,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: settings_card_module_css_default.badge,
								children: props.overriddenLabel
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: settings_card_module_css_default.reset,
								disabled: props.disabled,
								onClick: props.onReset,
								children: props.resetLabel
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						id: props.id,
						className: settings_card_module_css_default.select,
						value: props.text,
						disabled: props.disabled,
						onChange: (event) => {
							props.onEdit(event.target.value);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: props.inheritLabel
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "true",
								children: props.onLabel
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "false",
								children: props.offLabel
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: settings_card_module_css_default.hint,
						children: props.hint
					})
				]
			});
		}
		//#endregion
		//#region src/client/settings-form.ts
		/** A boolean field, edited through true/false draft text. */
		function booleanField(field) {
			return {
				field,
				format: (value) => typeof value === "boolean" ? String(value) : "",
				parse: (text) => {
					const trimmed = text.trim();
					if (trimmed === "") return { kind: "clear" };
					if (trimmed === "true") return {
						kind: "set",
						value: true
					};
					if (trimmed === "false") return {
						kind: "set",
						value: false
					};
				}
			};
		}
		/**
		* Stages one card's edits over one settings namespace and writes them on save.
		*
		* The Host is the only authority on whether a value was accepted — its
		* validators own the constraints no schema can express — so the outcome is
		* read back from the section rather than predicted here. A save that did not
		* land keeps its drafts, so the user can correct them instead of retyping.
		*/
		var CardForm = class {
			scope;
			specs;
			staged = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			/** The scope subscription installed in the constructor; released by dispose(). */
			disposeScope;
			disposed = false;
			saving = false;
			failed = false;
			failedReason;
			/** @param scope - the bound settings scope for this card's namespace. */
			constructor(scope, specs) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				this.disposeScope = scope.subscribe(() => {
					this.publish();
				});
			}
			/**
			* Release the scope subscription and every bound store listener. The card
			* must call this on teardown; later calls are no-ops.
			*/
			dispose() {
				if (this.disposed) return;
				this.disposed = true;
				this.disposeScope();
				this.listeners.clear();
			}
			/** Publish a projection of this form, rebuilt whenever the scope or a draft changes. */
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
				this.listeners.add(() => {
					store.set(project());
				});
				return store;
			}
			/** Read the card-level state: what the Host serves, and what a save would do. */
			shell() {
				const snapshot = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snapshot.status !== "loading",
					exposed: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty: plan.length > 0,
					invalid: plan.some((item) => item.run === void 0),
					saving: this.saving,
					failed: this.failed,
					...this.failedReason === void 0 ? {} : { failedReason: this.failedReason }
				};
			}
			/** Read one field's state from the effective section and its staged draft. */
			field(field) {
				const spec = this.specOf(field);
				const staged = this.staged.get(field);
				if (staged === void 0) return {
					text: spec.format(this.sectionValue(field)),
					overridden: this.stored(field),
					invalid: false
				};
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return {
					text: staged.text,
					overridden: write?.kind === "set",
					invalid: write === void 0
				};
			}
			/** The actions the card's slot registration injects. */
			actions() {
				return {
					edit: (field, text) => {
						this.stage(field, {
							text,
							clear: false
						});
					},
					resetField: (field) => {
						this.stage(field, {
							text: this.specOf(field).format(this.baseValue(field)),
							clear: true
						});
					},
					save: () => {
						this.save();
					},
					discard: () => {
						if (this.staged.size === 0 && !this.failed) return;
						this.staged.clear();
						this.failed = false;
						this.failedReason = void 0;
						this.publish();
					}
				};
			}
			/**
			* Write every staged edit, then re-seed from what the Host accepted.
			*
			* When the scope carries the optional batch surface (the dsh-web-ui
			* bridge scope), every planned write rides one mutation so cross-field
			* validate hooks (baseURL+model) judge the batch as a unit instead of
			* deadlocking on per-field writes. Otherwise the per-field loop runs.
			* A field lands only when the Host reports it held the staged value; a
			* landed field's draft is dropped, a failed one stays staged for the user.
			* @returns settlement after every write and the read-back.
			*/
			async save() {
				const plan = this.plan();
				const valid = plan.filter((item) => item.run !== void 0);
				if (plan.length === 0 || this.saving || valid.length !== plan.length) return;
				const plannedWrites = valid.map((item) => item.op);
				const fields = new Set(plan.map((item) => item.field));
				this.saving = true;
				this.failed = false;
				this.failedReason = void 0;
				this.publish();
				const landed = /* @__PURE__ */ new Set();
				const batch = this.batchedScope();
				if (batch !== void 0) {
					const result = await batch.mutate(plannedWrites);
					if (result.ok) {
						for (const field of result.fields) if (field.landed) landed.add(field.field);
					} else this.failedReason = result.message;
				} else for (const item of valid) if (await item.run()) landed.add(item.field);
				for (const field of fields) if (landed.has(field)) this.staged.delete(field);
				this.saving = false;
				this.failed = landed.size !== fields.size;
				this.publish();
			}
			/** The scope's batch surface when it supports one; undefined conservatively otherwise. */
			batchedScope() {
				const candidate = this.scope;
				return typeof candidate?.mutate === "function" ? candidate : void 0;
			}
			/**
			* Every staged edit a save would write. An entry whose draft is not a value
			* its field accepts carries no write: the form is still dirty, and the save
			* refuses rather than dropping the edit. A staged edit that matches the
			* effective section is not a write at all.
			* @returns the planned writes, in the order the fields were staged.
			*/
			plan() {
				const plan = [];
				for (const [field, staged] of this.staged) {
					const spec = this.specOf(field);
					if (staged.clear) {
						if (this.stored(field)) plan.push({
							field,
							op: {
								field,
								op: "unset"
							},
							run: () => this.clear(field)
						});
						continue;
					}
					if (staged.text === spec.format(this.sectionValue(field))) continue;
					const write = spec.parse(staged.text);
					if (write === void 0) plan.push({
						field,
						op: {
							field,
							op: "unset"
						},
						run: void 0
					});
					else if (write.kind === "clear") plan.push({
						field,
						op: {
							field,
							op: "unset"
						},
						run: () => this.clear(field)
					});
					else plan.push({
						field,
						op: {
							field,
							op: "set",
							value: write.value
						},
						run: () => this.store(field, write.value)
					});
				}
				return plan;
			}
			async clear(field) {
				await this.scope.unset(field);
				return !this.stored(field);
			}
			async store(field, value) {
				await this.scope.set(field, value);
				if (this.specOf(field).secret) return true;
				return this.userLayer()?.[field] === value;
			}
			stage(field, edit) {
				this.staged.set(field, edit);
				this.failed = false;
				this.failedReason = void 0;
				this.publish();
			}
			specOf(field) {
				const spec = this.specs.get(field);
				if (spec === void 0) throw new Error(`settings card has no field ${field}`);
				return spec;
			}
			snapshotOf() {
				return this.scope.getSnapshot();
			}
			sectionValue(field) {
				return this.snapshotOf().value?.[field];
			}
			baseValue(field) {
				return this.snapshotOf().base?.[field];
			}
			userLayer() {
				return this.snapshotOf().user;
			}
			stored(field) {
				const user = this.userLayer();
				return user !== void 0 && Object.hasOwn(user, field);
			}
			publish() {
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/FileManagerSettingsCard.tsx
		/** Bridges the `filemgr` scope onto the card's staged form. */
		var FileManagerSettingsCardController = class {
			form;
			store;
			/** @param scope - the bound settings scope for the `filemgr` namespace. */
			constructor(scope) {
				this.form = new CardForm(scope, [booleanField("enabled")]);
				this.store = this.form.bind(() => this.projection());
			}
			projection() {
				return {
					...this.form.shell(),
					enabled: this.form.field("enabled")
				};
			}
			/**
			* Build the face the card's slot registration injects.
			* @returns the card's snapshot and its form actions.
			*/
			inject() {
				return {
					hooks: { filemgrSettingsCard: this.store },
					...this.form.actions()
				};
			}
			/**
			* Release the card's scope subscription and bound stores; the slot
			* disposer calls this on teardown.
			*/
			dispose() {
				this.form.dispose();
			}
		};
		/**
		* Render the filemgr card.
		* @param props - locale copy, the card snapshot, and its form actions.
		* @returns the card.
		*/
		function FileManagerSettingsCard(props) {
			const { t } = props;
			const state = props.useFilemgrSettingsCard((snapshot) => snapshot);
			const disabled = !state.writable;
			const fieldProps = {
				overriddenLabel: t("settings.overridden"),
				resetLabel: t("settings.reset"),
				invalidLabel: t("settings.invalidNumber"),
				disabled
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginSettingsCard, {
				t,
				titleKey: "settings.title",
				descriptionKey: "settings.description",
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BooleanField, {
					id: "settings-filemgr-enabled",
					label: t("settings.enabled"),
					hint: t("settings.enabledHint"),
					inheritLabel: t("settings.inherit"),
					onLabel: t("settings.on"),
					offLabel: t("settings.off"),
					...fieldProps,
					...state.enabled,
					onEdit: (text) => {
						props.edit("enabled", text);
					},
					onReset: () => {
						props.resetField("enabled");
					}
				})
			});
		}
		//#endregion
		//#region src/client/drag.ts
		/** Whether a pointer event is the primary (left) button or touch. */
		function isPrimaryPointer(event) {
			return event.pointerType === "touch" || event.button === 0;
		}
		/**
		* Handle one pointer-down: wire capture + window listeners, run the rAF
		* loop, and end on any of the five termination paths. Call from a
		* onPointerDown handler (React or plain DOM).
		* @param event - the raw pointerdown event.
		* @param el - the handle element (capture target + reverse marker source).
		* @param opts - drag behavior.
		* @returns a disposer (idempotent; also called internally on end).
		*/
		function handlePointerDragStart(event, el, opts) {
			if (!isPrimaryPointer(event)) return () => {};
			event.preventDefault();
			const startX = event.clientX;
			const startWidth = opts.getStartWidth();
			const pointerId = event.pointerId;
			const reverse = opts.reverse;
			let rafId = null;
			let pendingWidth = null;
			let latestWidth = startWidth;
			let isDragging = true;
			let cleanup = null;
			const flushPending = () => {
				if (pendingWidth === null) return;
				latestWidth = pendingWidth;
				opts.onFrame(pendingWidth);
			};
			const addWindowListener = (key, handler) => {
				window.addEventListener(key, handler);
				return () => window.removeEventListener(key, handler);
			};
			const computeWidth = (clientX) => {
				const deltaX = reverse ? startX - clientX : clientX - startX;
				return opts.compute(startWidth, deltaX);
			};
			const finishDrag = (e) => {
				if (!isDragging) return;
				isDragging = false;
				if (rafId !== null) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
				flushPending();
				let finalWidth = latestWidth;
				if (e !== void 0 && "clientX" in e && typeof e.clientX === "number") finalWidth = computeWidth(e.clientX);
				opts.onEnd(finalWidth);
				cleanup?.();
			};
			const handlePointerMove = (e) => {
				if (!isDragging) return;
				if (e.buttons === 0) {
					finishDrag(e);
					return;
				}
				pendingWidth = computeWidth(e.clientX);
				if (rafId === null) rafId = requestAnimationFrame(() => {
					rafId = null;
					flushPending();
				});
			};
			const handlePointerUp = (e) => finishDrag(e);
			const handlePointerCancel = (e) => finishDrag(e);
			const handleMouseUp = (e) => finishDrag(e);
			const handleLostCapture = () => finishDrag();
			const previousUserSelect = document.body.style.userSelect;
			const previousCursor = document.body.style.cursor;
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";
			const frame = el.closest("[data-dsh-frame]");
			frame?.setAttribute("data-filemgr-instant", "");
			const restore = () => {
				document.body.style.userSelect = previousUserSelect;
				document.body.style.cursor = previousCursor;
				frame?.removeAttribute("data-filemgr-instant");
			};
			if (el.setPointerCapture) try {
				el.setPointerCapture(pointerId);
				el.addEventListener("lostpointercapture", handleLostCapture);
			} catch {}
			const releaseCapture = () => {
				try {
					if (el.releasePointerCapture && el.hasPointerCapture?.(pointerId)) el.releasePointerCapture(pointerId);
				} catch {}
				el.removeEventListener("lostpointercapture", handleLostCapture);
			};
			const listeners = [
				addWindowListener("pointermove", handlePointerMove),
				addWindowListener("pointerup", handlePointerUp),
				addWindowListener("pointercancel", handlePointerCancel),
				addWindowListener("mouseup", handleMouseUp),
				addWindowListener("blur", () => finishDrag())
			];
			cleanup = () => {
				restore();
				releaseCapture();
				for (const dispose of listeners) dispose();
			};
			return cleanup;
		}
		//#endregion
		//#region src/client/fileType.ts
		/** Markdown extensions. */
		const MARKDOWN_EXT = /* @__PURE__ */ new Set([
			"md",
			"markdown",
			"mdx"
		]);
		/** HTML extensions. */
		const HTML_EXT = /* @__PURE__ */ new Set([
			"html",
			"htm",
			"xhtml"
		]);
		/** Diff extensions. */
		const DIFF_EXT = /* @__PURE__ */ new Set(["diff", "patch"]);
		/** CSV. */
		const CSV_EXT = /* @__PURE__ */ new Set(["csv"]);
		/** PDF. */
		const PDF_EXT = /* @__PURE__ */ new Set(["pdf"]);
		/** Office documents. */
		const WORD_EXT = /* @__PURE__ */ new Set([
			"doc",
			"docx",
			"odt",
			"rtf"
		]);
		const EXCEL_EXT = /* @__PURE__ */ new Set([
			"xls",
			"xlsx",
			"ods"
		]);
		const PPT_EXT = /* @__PURE__ */ new Set([
			"ppt",
			"pptx",
			"odp"
		]);
		/** Images. */
		const IMAGE_EXT = /* @__PURE__ */ new Set([
			"png",
			"jpg",
			"jpeg",
			"gif",
			"webp",
			"svg",
			"ico",
			"bmp",
			"avif"
		]);
		/** Extensions treated as editable code/text. */
		const CODE_EXT = /* @__PURE__ */ new Set([
			"ts",
			"tsx",
			"js",
			"jsx",
			"mjs",
			"cjs",
			"json",
			"jsonc",
			"css",
			"scss",
			"less",
			"yml",
			"yaml",
			"toml",
			"xml",
			"sh",
			"bash",
			"zsh",
			"fish",
			"rs",
			"py",
			"go",
			"java",
			"c",
			"h",
			"cpp",
			"hpp",
			"cc",
			"cs",
			"sql",
			"php",
			"rb",
			"swift",
			"kt",
			"vue",
			"svelte",
			"astro",
			"txt",
			"log",
			"ini",
			"env",
			"conf",
			"cfg",
			"gitignore",
			"dockerfile",
			"makefile",
			"graphql",
			"proto",
			"prisma",
			"zig",
			"lua",
			"r",
			"dart",
			"ex",
			"exs",
			"erl",
			"hs",
			"clj",
			"scala",
			"groovy",
			"vb",
			"ps1",
			"bat",
			"cmd",
			"pl",
			"pm",
			"tcl",
			"asm",
			"s",
			"f",
			"f90",
			"jl",
			"nim",
			"ml",
			"elm",
			"purs",
			"solidity",
			"sol",
			"tf",
			"hcl",
			"dockerignore",
			"editorconfig",
			"prettierrc",
			"eslintrc",
			"babelrc",
			"npmrc",
			"nix",
			"lock",
			"map"
		]);
		/** No-extension names that are plain text. */
		const TEXT_NAMES = /* @__PURE__ */ new Set([
			"license",
			"licence",
			"readme",
			"changelog",
			"contributing",
			"authors",
			"notice",
			"makefile",
			"dockerfile",
			"justfile",
			"gemfile",
			"rakefile",
			"procfile"
		]);
		/**
		* Leading-dot config dotfiles whose full (dotted) basename is plain text. The
		* de-dot rule below maps most single-dot files (`.gitignore` -> ext `gitignore`)
		* into CODE_EXT; these multi-suffix / uncommon ones have no useful extension
		* (`.env.local` -> `local`), so we match them by their whole dotted name.
		*/
		const DOTFILE_TEXT_NAMES = /* @__PURE__ */ new Set([
			".gitignore",
			".gitattributes",
			".gitmodules",
			".env",
			".env.local",
			".env.production",
			".env.development",
			".env.test",
			".npmrc",
			".npmrc.template",
			".prettierrc",
			".prettierrc.json",
			".prettierrc.yaml",
			".babelrc",
			".babelrc.json",
			".eslintrc",
			".eslintrc.json",
			".eslintrc.js",
			".editorconfig",
			".dockerignore",
			".eslintignore",
			".prettierignore",
			".gitignore.local",
			".hgignore"
		]);
		/** Detect the preview content type of a file by name (lowercased). */
		function detectContentType(name) {
			const lower = (name.split("/").pop() ?? name).toLowerCase();
			const dot = lower.lastIndexOf(".");
			const ext = lower[0] === "." ? dot > 0 ? lower.slice(dot + 1) : lower.slice(1) : dot > 0 ? lower.slice(dot + 1) : "";
			const stem = dot > 0 ? lower.slice(0, dot) : lower;
			if (lower[0] === "." && DOTFILE_TEXT_NAMES.has(lower)) return "text";
			if (ext === "" && TEXT_NAMES.has(stem)) return "text";
			if (ext === "") return "unsupported";
			if (MARKDOWN_EXT.has(ext)) return "markdown";
			if (HTML_EXT.has(ext)) return "html";
			if (DIFF_EXT.has(ext)) return "diff";
			if (CSV_EXT.has(ext)) return "csv";
			if (PDF_EXT.has(ext)) return "pdf";
			if (WORD_EXT.has(ext)) return "word";
			if (EXCEL_EXT.has(ext)) return "excel";
			if (PPT_EXT.has(ext)) return "ppt";
			if (IMAGE_EXT.has(ext)) return "image";
			if (CODE_EXT.has(ext)) return "code";
			return "unsupported";
		}
		/** Whether the type can be edited and saved back. */
		function isEditableType(type) {
			return type === "markdown" || type === "html" || type === "code" || type === "csv" || type === "text";
		}
		/** Whether the type reads its content as text (vs image data URL). */
		function isTextType(type) {
			return type !== "image" && type !== "pdf" && type !== "word" && type !== "excel" && type !== "ppt" && type !== "unsupported" && type !== "url";
		}
		/** A stable tab id from the file identity (root + path + type). */
		function tabIdOf(root, path, type) {
			return `${root}\u0000${path}\u0000${type}`;
		}
		/** The parent relative path of a path ('' for a root-level item). */
		function parentRel(path) {
			const idx = path.lastIndexOf("/");
			return idx > 0 ? path.slice(0, idx) : "";
		}
		/**
		* The streaming URL a pdf tab renders: the host raw route serves the bytes
		* with mime application/pdf, so the preview iframe loads them directly — no
		* base64 round-trip and no read-size cap. The nonce defeats browser caching
		* when the tab is refreshed after the file changed on disk.
		*
		* Contributed by EricWang1358 (#239).
		*/
		function pdfPreviewUrl(root, path, nonce) {
			return `/filemgr/raw?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}&v=${nonce}`;
		}
		//#endregion
		//#region src/client/persist.ts
		/**
		* Persistence helpers for panel preferences: range-validated reads (invalid
		* stored values fall back to defaults — a broken or hand-edited value must
		* never produce a 0px or NaN panel), debounced writes, and the LRU registry
		* for preview scopes (at most 12 scopes; the oldest savedAt evicts).
		*
		* Keys follow the FileManager contract verbatim:
		*   chat-workspace-width-px, chat-preview-width-px, preview-panel-split-ratio,
		*   project-panel-collapse:<root>, explorer-ui:<root>, scm-ui:<root>,
		*   preview-ui:<root>.
		* @module dsh-filemgr/client/persist
		*/
		/** Read a stored number, validating it against [min, max]; fallback otherwise. */
		function readStoredNumber(key, min, max, fallback) {
			try {
				const raw = localStorage.getItem(key);
				if (raw === null) return fallback;
				const value = Number(raw);
				if (!Number.isFinite(value)) return fallback;
				if (value < min || value > max) return fallback;
				return value;
			} catch {
				return fallback;
			}
		}
		/** Write a number if it differs from the stored value (avoids churn). */
		function writeStoredNumber(key, value) {
			try {
				const raw = String(Math.round(value));
				if (localStorage.getItem(key) === raw) return;
				localStorage.setItem(key, raw);
			} catch {}
		}
		/** Create one debounced scheduler (default 150ms). */
		function createDebounced(delayMs = 150) {
			let timer;
			let pending = null;
			const flush = () => {
				if (timer !== void 0) clearTimeout(timer);
				timer = void 0;
				const fn = pending;
				pending = null;
				if (fn !== null) fn();
			};
			return {
				schedule(fn) {
					pending = fn;
					if (timer !== void 0) clearTimeout(timer);
					timer = setTimeout(flush, delayMs);
				},
				flush,
				dispose() {
					if (timer !== void 0) clearTimeout(timer);
					timer = void 0;
					pending = null;
				}
			};
		}
		/** The preview-ui scope registry: keys, savedAt values, eviction. */
		const PREVIEW_SCOPE_PREFIX = "preview-ui:";
		/**
		* Collect every stored key under a prefix. localStorage has no prefix index,
		* so the whole store is swept once, then filtered to the package's own keys
		* — enumeration is never interleaved with removal (removals would shift the
		* indices mid-loop and skip entries).
		*/
		function listStoredKeysByPrefix(prefix) {
			const keys = [];
			try {
				for (let i = 0; i < localStorage.length; i += 1) {
					const key = localStorage.key(i);
					if (key !== null && key.startsWith(prefix)) keys.push(key);
				}
			} catch {
				return [];
			}
			return keys;
		}
		/** All stored preview scopes with their savedAt timestamps, oldest first. */
		function listPreviewScopes() {
			const out = [];
			for (const key of listStoredKeysByPrefix(PREVIEW_SCOPE_PREFIX)) {
				const root = key.slice(11);
				let savedAt = 0;
				try {
					const raw = localStorage.getItem(key);
					if (raw !== null) {
						const parsed = JSON.parse(raw);
						if (typeof parsed.savedAt === "number") savedAt = parsed.savedAt;
					}
				} catch {
					savedAt = 0;
				}
				out.push({
					root,
					savedAt
				});
			}
			out.sort((a, b) => a.savedAt - b.savedAt);
			return out;
		}
		/** Evict the oldest scopes beyond the cap. */
		function evictPreviewScopes(keep) {
			if (listStoredKeysByPrefix("preview-ui:").length <= 12) return;
			const scopes = listPreviewScopes().filter((scope) => scope.root !== keep);
			let excess = scopes.length - 11;
			for (const scope of scopes) {
				if (excess <= 0) break;
				try {
					localStorage.removeItem(`${PREVIEW_SCOPE_PREFIX}${scope.root}`);
				} catch {}
				excess -= 1;
			}
		}
		/** Serialize a JSON value with a size guard (quota failures degrade silently). */
		function writeJson(key, value) {
			try {
				localStorage.setItem(key, JSON.stringify(value));
				return true;
			} catch {
				try {
					localStorage.removeItem(key);
				} catch {}
				return false;
			}
		}
		/** Parse a stored JSON value; fallback on any failure. */
		function readJson(key, fallback) {
			try {
				const raw = localStorage.getItem(key);
				if (raw === null) return fallback;
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object") return fallback;
				return parsed;
			} catch {
				return fallback;
			}
		}
		//#endregion
		//#region src/client/store.ts
		/** Internal channel for the stored-layout flush used by pagehide flushing. */
		const FLUSH_PERSIST = Symbol("flushPersist");
		/** Create a state handle with an immutable snapshot (new object per update). */
		function createState(initial) {
			let state = initial;
			const listeners = /* @__PURE__ */ new Set();
			return {
				getSnapshot: () => state,
				subscribe(listener) {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				update(fn) {
					const next = fn(state);
					if (next === state) return;
					state = next;
					for (const listener of listeners) listener();
				}
			};
		}
		const MAX_PREVIEW_REGION_PX = 1200;
		/** Storage keys (FileManager contract, verbatim). */
		const KEY_EXPLORER_WIDTH = "chat-workspace-width-px";
		const KEY_PREVIEW_WIDTH = "chat-preview-width-px";
		const KEY_COLLAPSE = "project-panel-collapse:";
		const KEY_EXPLORER_UI = "explorer-ui:";
		const KEY_SCM_UI = "scm-ui:";
		/**
		* Explorer clamp (runs first): reserve chat's floor plus the preview region
		* (min + chrome) when open, so the explorer never grows into the preview's
		* space; floor at the explorer minimum so a narrow container cannot squeeze
		* it to nothing.
		*/
		function clampExplorerWidth(requested, available, previewOpen) {
			const maxByContainer = Math.max(220, available - (360 + (previewOpen ? 364 : 0)));
			return Math.min(requested, maxByContainer);
		}
		/**
		* Preview clamp (runs after the explorer clamp): reserve chat's floor plus
		* the already-clamped explorer width plus the region chrome. The ordered pair
		* guarantees chat = available - explorer - preview >= 360.
		*/
		function clampPreviewWidth(requested, available, explorerWidth) {
			const maxByContainer = Math.max(340, available - 360 - explorerWidth - 24);
			return Math.min(requested, maxByContainer);
		}
		/** Storage key of the collapse preference for one root. */
		const collapseKey = (root) => `${KEY_COLLAPSE}${root}`;
		/** Create the layout store (reads persisted widths on init). */
		function createLayoutStore() {
			const handle = createState({
				root: "",
				explorerWidth: readStoredNumber(KEY_EXPLORER_WIDTH, 220, 500, 260),
				previewWidth: readStoredNumber(KEY_PREVIEW_WIDTH, 340, MAX_PREVIEW_REGION_PX, 480),
				explorerCollapsed: true,
				previewOpen: false,
				availableWidth: 0,
				dragging: false,
				maximized: null
			});
			return Object.assign(handle, {
				explorerWidthPx(state) {
					return state.explorerCollapsed ? 0 : clampExplorerWidth(state.explorerWidth, state.availableWidth, state.previewOpen);
				},
				previewWidthPx(state) {
					if (!state.previewOpen) return 0;
					const explorer = state.explorerCollapsed ? 0 : clampExplorerWidth(state.explorerWidth, state.availableWidth, true);
					return clampPreviewWidth(state.previewWidth, state.availableWidth, explorer);
				},
				shrinkToFit(state) {
					if (state.availableWidth <= 0) return;
					const explorer = clampExplorerWidth(state.explorerWidth, state.availableWidth, state.previewOpen);
					if (state.explorerWidth > explorer && !state.explorerCollapsed) {
						writeStoredNumber(KEY_EXPLORER_WIDTH, explorer);
						handle.update((prev) => ({
							...prev,
							explorerWidth: explorer
						}));
					}
					const preview = clampPreviewWidth(state.previewWidth, state.availableWidth, explorer);
					if (state.previewOpen && state.previewWidth > preview) {
						writeStoredNumber(KEY_PREVIEW_WIDTH, preview);
						handle.update((prev) => ({
							...prev,
							previewWidth: preview
						}));
					}
				}
			});
		}
		/** Switch the layout to a project root (restores collapse + widths). */
		function layoutSetRoot(store, root, previewOpen) {
			store.update((prev) => {
				if (prev.root === root && prev.previewOpen === previewOpen) return prev;
				let collapsed = prev.explorerCollapsed;
				if (prev.root !== root) try {
					collapsed = localStorage.getItem(collapseKey(root)) === "collapsed";
				} catch {
					collapsed = false;
				}
				return {
					...prev,
					root,
					explorerCollapsed: collapsed,
					previewOpen,
					maximized: prev.root === root ? prev.maximized : null
				};
			});
		}
		/** Read the persisted explorer UI state for a root (range-guarded). */
		function readExplorerUi(root) {
			const stored = readJson(`${KEY_EXPLORER_UI}${root}`, {});
			return {
				expanded: Array.isArray(stored.expanded) ? stored.expanded.filter((item) => typeof item === "string") : [],
				selected: typeof stored.selected === "string" ? stored.selected : null
			};
		}
		const EMPTY_SEARCH = {
			query: "",
			status: "idle",
			hits: [],
			truncated: false
		};
		/** Create the explorer store (per-root persistence, debounced writes). */
		function createExplorerStore(api) {
			const handle = createState({
				root: "",
				dirs: {},
				expanded: [],
				selected: null,
				loading: [],
				activeTab: "files",
				search: { ...EMPTY_SEARCH },
				version: 0
			});
			const persistDebounced = createDebounced();
			const searchDebounced = createDebounced();
			let fsVersion = 0;
			let fsInFlight = false;
			let fsScheduled;
			let persistRoot = "";
			let persistExpanded = [];
			let persistSelected = null;
			const persistWrite = () => {
				if (persistRoot !== "") writeJson(`${KEY_EXPLORER_UI}${persistRoot}`, {
					expanded: persistExpanded,
					selected: persistSelected
				});
			};
			const flushPersist = () => {
				persistDebounced.flush();
			};
			const schedulePersist = (root, expanded, selected) => {
				if (root === "") return;
				persistRoot = root;
				persistExpanded = expanded;
				persistSelected = selected;
				persistDebounced.schedule(persistWrite);
			};
			/** Load one dir's listing into the cache (no-op when already present). */
			const ensureDir = async (root, rel) => {
				const state = handle.getSnapshot();
				if (state.root !== root || state.dirs[rel] !== void 0 || state.loading.includes(rel)) return;
				handle.update((prev) => ({
					...prev,
					loading: [...prev.loading, rel]
				}));
				const result = await api.list(root, rel);
				handle.update((prev) => {
					if (prev.root !== root) return prev;
					if (rel !== "" && !prev.expanded.includes(rel)) return {
						...prev,
						loading: prev.loading.filter((item) => item !== rel)
					};
					const dirs = { ...prev.dirs };
					if (result.ok) dirs[rel] = result.value.entries;
					else delete dirs[rel];
					return {
						...prev,
						dirs,
						loading: prev.loading.filter((item) => item !== rel)
					};
				});
			};
			/** Drop cached subtrees under a collapsed dir (its own key included). */
			const dropSubtree = (dirs, rel) => {
				const prefix = rel === "" ? "" : `${rel}/`;
				const next = {};
				for (const key of Object.keys(dirs)) {
					if (rel !== "" && (key === rel || key.startsWith(prefix))) continue;
					next[key] = dirs[key];
				}
				return next;
			};
			/** A dir's ancestor chain ('' .. parent). */
			const ancestors = (rel) => {
				const out = [];
				const parts = rel.split("/").filter(Boolean);
				let acc = "";
				for (const part of parts) {
					acc = acc === "" ? part : `${acc}/${part}`;
					out.push(acc);
				}
				return out;
			};
			/**
			* Refetch the root plus every expanded dir (seq-guarded against stale
			* results) and the active search after an fs change event.
			*/
			const runFsRefresh = async () => {
				const state = handle.getSnapshot();
				const root = state.root;
				if (root === "") return;
				const dirs = [.../* @__PURE__ */ new Set(["", ...state.expanded])];
				const seq = ++fsVersion;
				const results = await Promise.allSettled(dirs.map((rel) => api.list(root, rel)));
				handle.update((prev) => {
					if (prev.root !== root || seq !== fsVersion) return prev;
					const nextDirs = { ...prev.dirs };
					results.forEach((result, index) => {
						const rel = dirs[index];
						if (result.status !== "fulfilled" || !result.value.ok) return;
						if (rel !== "" && !prev.expanded.includes(rel)) return;
						nextDirs[rel] = result.value.value.entries;
					});
					return {
						...prev,
						dirs: nextDirs,
						version: prev.version + 1
					};
				});
				if (state.search.query !== "") api.search(root, state.search.query).then((result) => {
					handle.update((prev) => {
						if (prev.root !== root || prev.search.query !== state.search.query) return prev;
						return {
							...prev,
							search: result.ok ? {
								query: state.search.query,
								status: "done",
								hits: result.value.hits,
								truncated: result.value.truncated
							} : prev.search
						};
					});
				});
			};
			const store = Object.assign(handle, {
				setRoot(root) {
					handle.update((prev) => {
						if (prev.root === root) return prev;
						const ui = readExplorerUi(root);
						return {
							...prev,
							root,
							dirs: {},
							expanded: ui.expanded,
							selected: ui.selected,
							loading: [],
							search: { ...EMPTY_SEARCH }
						};
					});
					ensureDir(root, "");
				},
				setActiveTab(tab) {
					handle.update((prev) => prev.activeTab === tab ? prev : {
						...prev,
						activeTab: tab
					});
				},
				toggleDir(rel) {
					const state = handle.getSnapshot();
					const isExpanded = state.expanded.includes(rel);
					if (isExpanded) handle.update((prev) => ({
						...prev,
						expanded: prev.expanded.filter((item) => item !== rel),
						dirs: dropSubtree(prev.dirs, rel)
					}));
					else {
						handle.update((prev) => ({
							...prev,
							expanded: [...prev.expanded, rel]
						}));
						ensureDir(state.root, rel);
					}
					schedulePersist(state.root, isExpanded ? state.expanded.filter((item) => item !== rel) : [...state.expanded, rel], state.selected);
				},
				select(rel) {
					handle.update((prev) => prev.selected === rel ? prev : {
						...prev,
						selected: rel
					});
					const state = handle.getSnapshot();
					schedulePersist(state.root, state.expanded, rel);
				},
				reveal(rel) {
					const state = handle.getSnapshot();
					const missing = ancestors(rel).filter((item) => !state.expanded.includes(item));
					handle.update((prev) => {
						const expanded = [...prev.expanded];
						for (const item of missing) if (!expanded.includes(item)) expanded.push(item);
						return {
							...prev,
							expanded,
							selected: rel,
							search: { ...EMPTY_SEARCH }
						};
					});
					for (const item of missing) ensureDir(state.root, item);
					schedulePersist(state.root, [...state.expanded, ...missing], rel);
				},
				setSearchQuery(query) {
					const trimmed = query.trim();
					handle.update((prev) => {
						if (trimmed === "" && prev.search.query === "") return prev;
						return {
							...prev,
							search: trimmed === "" ? { ...EMPTY_SEARCH } : {
								...prev.search,
								query: trimmed,
								status: "searching"
							}
						};
					});
					searchDebounced.dispose();
					if (trimmed === "") return;
					const root = handle.getSnapshot().root;
					searchDebounced.schedule(() => {
						api.search(root, trimmed).then((result) => {
							handle.update((prev) => {
								if (prev.root !== root || prev.search.query !== trimmed) return prev;
								return {
									...prev,
									search: result.ok ? {
										query: trimmed,
										status: "done",
										hits: result.value.hits,
										truncated: result.value.truncated
									} : {
										...prev.search,
										status: "error",
										hits: []
									}
								};
							});
						});
					});
				},
				cancelSearch() {
					searchDebounced.dispose();
					handle.update((prev) => prev.search.query === "" ? prev : {
						...prev,
						search: { ...EMPTY_SEARCH }
					});
				},
				async revealInFileManager(rel) {
					const root = handle.getSnapshot().root;
					if (root === "") return false;
					return (await api.reveal(root, rel)).ok;
				},
				async openWithDefaultApp(rel) {
					const root = handle.getSnapshot().root;
					if (root === "") return false;
					return (await api.openWithDefault(root, rel)).ok;
				},
				async renameEntry(rel, newName) {
					const root = handle.getSnapshot().root;
					if (root === "" || rel === "") return false;
					const result = await api.rename(root, rel, newName);
					if (result.ok) {
						handle.update((prev) => {
							const parent = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
							const newRel = parent === "" ? newName : `${parent}/${newName}`;
							const next = {
								...prev,
								dirs: dropSubtree(prev.dirs, rel),
								expanded: prev.expanded.filter((item) => item !== rel)
							};
							if (prev.selected === rel) next.selected = newRel;
							return next;
						});
						this.handleFsChange();
					}
					return result.ok;
				},
				async createDir(rel) {
					const root = handle.getSnapshot().root;
					if (root === "") return false;
					const result = await api.mkdir(root, rel);
					if (result.ok) {
						const parent = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
						const state = handle.getSnapshot();
						if (parent !== "" && !state.expanded.includes(parent)) this.toggleDir(parent);
						this.handleFsChange();
					}
					return result.ok;
				},
				async createFile(rel) {
					const root = handle.getSnapshot().root;
					if (root === "") return false;
					const result = await api.newFile(root, rel);
					if (result.ok) {
						const parent = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
						const state = handle.getSnapshot();
						if (parent !== "" && !state.expanded.includes(parent)) this.toggleDir(parent);
						this.handleFsChange();
					}
					return result.ok;
				},
				async deleteEntry(rel) {
					const root = handle.getSnapshot().root;
					if (root === "" || rel === "") return false;
					const result = await api.delete(root, rel);
					if (result.ok) {
						handle.update((prev) => ({
							...prev,
							selected: prev.selected === rel || prev.selected?.startsWith(rel + "/") ? null : prev.selected,
							dirs: dropSubtree(prev.dirs, rel)
						}));
						this.handleFsChange();
					}
					return result.ok;
				},
				async handleFsChange() {
					if (handle.getSnapshot().root === "") return;
					if (fsInFlight) {
						if (fsScheduled === void 0) fsScheduled = setTimeout(() => {
							fsScheduled = void 0;
							this.handleFsChange();
						}, 200);
						return;
					}
					fsInFlight = true;
					try {
						await runFsRefresh();
					} finally {
						fsInFlight = false;
					}
				}
			});
			store[FLUSH_PERSIST] = flushPersist;
			return store;
		}
		/** Read the persisted scm UI state for a root (guarded). */
		function readScmUi(root) {
			const stored = readJson(`${KEY_SCM_UI}${root}`, {});
			return {
				viewMode: stored.viewMode === "tree" ? "tree" : "list",
				sectionCollapsed: typeof stored.sectionCollapsed === "object" && stored.sectionCollapsed !== null ? Object.fromEntries(Object.entries(stored.sectionCollapsed).filter(([, v]) => typeof v === "boolean")) : {},
				treeExpanded: Array.isArray(stored.treeExpanded) ? stored.treeExpanded.filter((item) => typeof item === "string") : [],
				selected: typeof stored.selected === "string" ? stored.selected : null
			};
		}
		/** Create the scm store (host status is the only truth — no optimistic rows). */
		function createScmStore(api) {
			const handle = createState({
				root: "",
				status: null,
				gitMissing: false,
				loading: false,
				busy: [],
				failed: [],
				viewMode: "list",
				sectionCollapsed: {},
				treeExpanded: [],
				selected: null
			});
			const persistDebounced = createDebounced();
			let persistState = null;
			let loadSeq = 0;
			const persistWrite = () => {
				if (persistState !== null && persistState.root !== "") writeJson(`${KEY_SCM_UI}${persistState.root}`, {
					viewMode: persistState.viewMode,
					sectionCollapsed: persistState.sectionCollapsed,
					treeExpanded: persistState.treeExpanded,
					selected: persistState.selected
				});
			};
			const flushPersist = () => {
				persistDebounced.flush();
			};
			const schedulePersist = (state) => {
				if (state.root === "") return;
				persistState = state;
				persistDebounced.schedule(persistWrite);
			};
			/** Fetch the status and land it (guarded against root switches + out-of-order). */
			const load = async (root, keepBusy = []) => {
				const seq = ++loadSeq;
				handle.update((prev) => ({
					...prev,
					loading: true
				}));
				const result = await api.gitStatus(root);
				handle.update((prev) => {
					if (prev.root !== root || seq !== loadSeq) return prev;
					return {
						...prev,
						status: result.ok ? result.value : prev.status,
						gitMissing: result.ok && result.value !== null ? false : prev.gitMissing,
						loading: false,
						busy: keepBusy
					};
				});
			};
			const store = Object.assign(handle, {
				setRoot(root) {
					handle.update((prev) => {
						if (prev.root === root) return prev;
						const ui = readScmUi(root);
						return {
							...prev,
							root,
							status: null,
							gitMissing: false,
							loading: true,
							busy: [],
							failed: [],
							viewMode: ui.viewMode,
							sectionCollapsed: ui.sectionCollapsed,
							treeExpanded: ui.treeExpanded,
							selected: ui.selected
						};
					});
					load(root);
				},
				async refresh() {
					const root = handle.getSnapshot().root;
					if (root !== "") await load(root);
				},
				async stage(paths) {
					const root = handle.getSnapshot().root;
					if (root === "" || paths.length === 0) return;
					handle.update((prev) => ({
						...prev,
						busy: [...prev.busy, ...paths]
					}));
					const result = await api.gitStage(root, paths);
					handle.update((prev) => ({
						...prev,
						failed: result.ok && Array.isArray(result.value?.failed) ? result.value.failed : result.ok ? [] : paths,
						busy: prev.busy.filter((item) => !paths.includes(item))
					}));
					await load(root);
				},
				async unstage(paths) {
					const root = handle.getSnapshot().root;
					if (root === "" || paths.length === 0) return;
					handle.update((prev) => ({
						...prev,
						busy: [...prev.busy, ...paths]
					}));
					const result = await api.gitUnstage(root, paths);
					handle.update((prev) => ({
						...prev,
						failed: result.ok && Array.isArray(result.value?.failed) ? result.value.failed : result.ok ? [] : paths,
						busy: prev.busy.filter((item) => !paths.includes(item))
					}));
					await load(root);
				},
				async discard(paths) {
					const root = handle.getSnapshot().root;
					if (root === "" || paths.length === 0) return;
					handle.update((prev) => ({
						...prev,
						busy: [...prev.busy, ...paths]
					}));
					const result = await api.gitDiscard(root, paths);
					handle.update((prev) => ({
						...prev,
						failed: result.ok && Array.isArray(result.value?.failed) ? result.value.failed : result.ok ? [] : paths,
						busy: prev.busy.filter((item) => !paths.includes(item))
					}));
					await load(root);
				},
				async discardAll() {
					const state = handle.getSnapshot();
					const paths = [...state.status?.unstaged ?? [], ...state.status?.untracked ?? []].map((row) => row.path);
					await this.discard(paths);
				},
				setViewMode(mode) {
					handle.update((prev) => prev.viewMode === mode ? prev : {
						...prev,
						viewMode: mode
					});
					schedulePersist(handle.getSnapshot());
				},
				setSectionCollapsed(id, collapsed) {
					handle.update((prev) => ({
						...prev,
						sectionCollapsed: {
							...prev.sectionCollapsed,
							[id]: collapsed
						}
					}));
					schedulePersist(handle.getSnapshot());
				},
				setTreeExpanded(keys) {
					handle.update((prev) => ({
						...prev,
						treeExpanded: keys
					}));
					schedulePersist(handle.getSnapshot());
				},
				setFailed(paths) {
					handle.update((prev) => ({
						...prev,
						failed: paths
					}));
				},
				select(path) {
					handle.update((prev) => prev.selected === path ? prev : {
						...prev,
						selected: path
					});
					schedulePersist(handle.getSnapshot());
				}
			});
			store[FLUSH_PERSIST] = flushPersist;
			return store;
		}
		/** Read persisted tabs for a root (guarded, content-less). */
		function readPreviewTabs(root) {
			const stored = readJson(`preview-ui:${root}`, {});
			if (!Array.isArray(stored.tabs)) return [];
			const out = [];
			for (const item of stored.tabs) {
				if (typeof item !== "object" || item === null) continue;
				const record = item;
				if (typeof record.id !== "string" || typeof record.path !== "string") continue;
				const rawDiff = record.diff;
				const diff = typeof rawDiff === "object" && rawDiff !== null && typeof rawDiff.staged === "boolean" ? { staged: rawDiff.staged } : void 0;
				out.push({
					id: record.id,
					title: typeof record.title === "string" ? record.title : record.path,
					root: typeof record.root === "string" ? record.root : root,
					path: record.path,
					contentType: typeof record.contentType === "string" ? record.contentType : "text",
					diff,
					savedAt: typeof record.savedAt === "number" ? record.savedAt : 0
				});
			}
			return out;
		}
		/** Create the preview store (per-root tab persistence with LRU scopes). */
		function createPreviewStore(api) {
			const handle = createState({
				root: "",
				open: false,
				tabs: [],
				activeTabId: null,
				version: 0
			});
			let previewFsInFlight = false;
			let previewFsScheduled;
			const persistDebounced = createDebounced();
			const persistWrite = () => {
				const current = handle.getSnapshot();
				if (current.root === "") return;
				const meta = current.tabs.map((tab) => ({
					id: tab.id,
					title: tab.title,
					root: tab.root,
					path: tab.path,
					contentType: tab.contentType,
					diff: tab.diff,
					savedAt: tab.savedAt
				}));
				writeJson(`preview-ui:${current.root}`, {
					savedAt: Date.now(),
					tabs: meta
				});
				evictPreviewScopes(current.root);
			};
			const flushPersist = () => {
				persistDebounced.flush();
			};
			const schedulePersist = (state) => {
				if (state.root === "") return;
				persistDebounced.schedule(persistWrite);
			};
			/** Load content for one tab (text or image data URL, or git diff). */
			const loadContent = async (root, id) => {
				const tab = handle.getSnapshot().tabs.find((item) => item.id === id);
				if (tab === void 0 || tab.content !== null || tab.loading) return;
				handle.update((prev) => ({
					...prev,
					tabs: prev.tabs.map((item) => item.id === id ? {
						...item,
						loading: true,
						error: null
					} : item)
				}));
				if (tab.contentType === "pdf") {
					handle.update((prev) => {
						if (prev.root !== root) return prev;
						return {
							...prev,
							tabs: prev.tabs.map((item) => item.id === id ? {
								...item,
								loading: false,
								content: pdfPreviewUrl(root, item.path, Date.now()),
								updated: false
							} : item)
						};
					});
					return;
				}
				const asImage = tab.contentType === "image";
				const result = tab.diff !== void 0 ? await api.gitDiff(root, tab.path, tab.diff.staged) : await api.read(root, tab.path, asImage);
				handle.update((prev) => {
					if (prev.root !== root) return prev;
					return {
						...prev,
						tabs: prev.tabs.map((item) => {
							if (item.id !== id) return item;
							if (!result.ok) return {
								...item,
								loading: false,
								error: result.error.message
							};
							if (item.dirty) return {
								...item,
								loading: false
							};
							const loaded = result.value;
							return {
								...item,
								loading: false,
								content: loaded.content,
								image: loaded.image,
								mtime: loaded.mtime,
								truncated: loaded.truncated ?? false,
								updated: false
							};
						})
					};
				});
			};
			/** Touch a tab's savedAt (LRU order within the scope). */
			const touch = (id) => {
				handle.update((prev) => ({
					...prev,
					tabs: prev.tabs.map((item) => item.id === id ? {
						...item,
						savedAt: Date.now()
					} : item)
				}));
			};
			/**
			* Re-fetch every loaded diff tab of the root in place (fs/git change
			* events). In-flight or not-yet-loaded tabs are skipped — the next load or
			* event covers them; landing guards keep a newer edit from being clobbered.
			*/
			const refreshDiffs = async (root) => {
				if (handle.getSnapshot().root !== root) return;
				const diffs = handle.getSnapshot().tabs.filter((tab) => tab.diff !== void 0);
				await Promise.all(diffs.map(async (tab) => {
					if (tab.content === null || tab.loading) return;
					const result = await api.gitDiff(root, tab.path, tab.diff.staged);
					handle.update((prev) => {
						if (prev.root !== root) return prev;
						return {
							...prev,
							tabs: prev.tabs.map((item) => {
								if (item.id !== tab.id || !result.ok) return item;
								if (item.dirty || item.loading) return item;
								return {
									...item,
									content: result.value.content,
									error: null
								};
							})
						};
					});
				}));
			};
			const store = Object.assign(handle, {
				setRoot(root) {
					handle.update((prev) => {
						if (prev.root === root) return prev;
						const tabs = readPreviewTabs(root).map((meta) => ({
							id: meta.id,
							title: meta.title,
							root: meta.root,
							path: meta.path,
							contentType: meta.contentType,
							diff: meta.diff,
							content: null,
							dirty: false,
							updated: false,
							loading: false,
							truncated: false,
							error: null,
							savedAt: meta.savedAt
						}));
						const activeTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
						return {
							...prev,
							root,
							tabs,
							activeTabId,
							open: tabs.length > 0
						};
					});
					const state = handle.getSnapshot();
					if (state.activeTabId !== null) loadContent(root, state.activeTabId);
				},
				openFile(root, path) {
					const type = detectContentType(path);
					const id = tabIdOf(root, path, type);
					if (handle.getSnapshot().tabs.find((tab) => tab.id === id) !== void 0) {
						handle.update((prev) => ({
							...prev,
							root,
							open: true,
							activeTabId: id,
							tabs: prev.tabs.map((tab) => tab.id === id ? {
								...tab,
								savedAt: Date.now()
							} : tab)
						}));
						loadContent(root, id);
						schedulePersist(handle.getSnapshot());
						return;
					}
					handle.update((prev) => {
						if (prev.root !== root) return prev;
						const tab = {
							id,
							title: path.split("/").pop() ?? path,
							root,
							path,
							contentType: type,
							content: null,
							dirty: false,
							updated: false,
							loading: false,
							truncated: false,
							error: null,
							savedAt: Date.now()
						};
						return {
							...prev,
							open: true,
							tabs: [...prev.tabs, tab],
							activeTabId: id
						};
					});
					loadContent(root, id);
					schedulePersist(handle.getSnapshot());
				},
				openDiff(root, path, staged) {
					const id = `scm-diff:${staged ? "s" : "u"}\u0000${root}\u0000${path}`;
					if (handle.getSnapshot().tabs.find((tab) => tab.id === id) !== void 0) {
						handle.update((prev) => ({
							...prev,
							root,
							open: true,
							activeTabId: id,
							tabs: prev.tabs.map((tab) => tab.id === id ? {
								...tab,
								savedAt: Date.now()
							} : tab)
						}));
						loadContent(root, id);
						schedulePersist(handle.getSnapshot());
						return;
					}
					handle.update((prev) => {
						if (prev.root !== root) return prev;
						const tab = {
							id,
							title: path.split("/").pop() ?? path,
							root,
							path,
							contentType: "diff",
							diff: { staged },
							content: null,
							dirty: false,
							updated: false,
							loading: false,
							truncated: false,
							error: null,
							savedAt: Date.now()
						};
						return {
							...prev,
							open: true,
							tabs: [...prev.tabs, tab],
							activeTabId: id
						};
					});
					loadContent(root, id);
					schedulePersist(handle.getSnapshot());
				},
				switchTab(id) {
					const state = handle.getSnapshot();
					if (state.activeTabId === id) return;
					handle.update((prev) => ({
						...prev,
						activeTabId: id
					}));
					touch(id);
					const tab = handle.getSnapshot().tabs.find((item) => item.id === id);
					if (tab !== void 0 && tab.content === null) loadContent(state.root, id);
					schedulePersist(handle.getSnapshot());
				},
				closeTabs(ids) {
					const state = handle.getSnapshot();
					const remaining = state.tabs.filter((tab) => !ids.includes(tab.id));
					const activeTabId = remaining.some((tab) => tab.id === state.activeTabId) ? state.activeTabId : remaining.length > 0 ? remaining[Math.min(state.tabs.findIndex((tab) => tab.id === state.activeTabId), remaining.length - 1)]?.id ?? remaining[remaining.length - 1].id : null;
					handle.update((prev) => ({
						...prev,
						tabs: remaining,
						activeTabId,
						open: remaining.length > 0 ? prev.open : false
					}));
					schedulePersist(handle.getSnapshot());
				},
				updateContent(id, content) {
					handle.update((prev) => ({
						...prev,
						tabs: prev.tabs.map((tab) => tab.id === id ? {
							...tab,
							content,
							dirty: true,
							updated: false
						} : tab)
					}));
				},
				async saveTab(id) {
					const state = handle.getSnapshot();
					const tab = state.tabs.find((item) => item.id === id);
					if (tab === void 0 || tab.content === null || !isTextType(tab.contentType) || tab.diff !== void 0) return;
					const sentContent = tab.content;
					handle.update((prev) => ({
						...prev,
						tabs: prev.tabs.map((item) => item.id === id ? {
							...item,
							loading: true,
							error: null
						} : item)
					}));
					const result = await api.write(state.root, tab.path, tab.content, tab.mtime);
					handle.update((prev) => {
						if (prev.root !== state.root) return prev;
						return {
							...prev,
							tabs: prev.tabs.map((item) => {
								if (item.id !== id) return item;
								if (!result.ok) return {
									...item,
									loading: false,
									error: result.error.code === "write-conflict" ? "文件已在磁盘上被修改，保存冲突：请刷新后重试" : result.error.message
								};
								if (item.content !== sentContent) return {
									...item,
									loading: false,
									mtime: result.value.mtime,
									error: null
								};
								return {
									...item,
									loading: false,
									dirty: false,
									mtime: result.value.mtime,
									error: null
								};
							})
						};
					});
				},
				async reloadTab(id) {
					const state = handle.getSnapshot();
					const tab = state.tabs.find((item) => item.id === id);
					if (tab === void 0) return;
					if (tab.contentType === "url") {
						handle.update((prev) => ({
							...prev,
							tabs: prev.tabs.map((item) => item.id === id ? {
								...item,
								reloadNonce: (item.reloadNonce ?? 0) + 1
							} : item)
						}));
						return;
					}
					if (tab.contentType === "pdf") {
						handle.update((prev) => ({
							...prev,
							tabs: prev.tabs.map((item) => item.id === id ? {
								...item,
								content: pdfPreviewUrl(state.root, item.path, Date.now()),
								updated: false,
								error: null
							} : item)
						}));
						return;
					}
					handle.update((prev) => ({
						...prev,
						tabs: prev.tabs.map((item) => item.id === id ? {
							...item,
							loading: true
						} : item)
					}));
					const result = tab.diff !== void 0 ? await api.gitDiff(state.root, tab.path, tab.diff.staged) : await api.read(state.root, tab.path, tab.contentType === "image");
					handle.update((prev) => {
						if (prev.root !== state.root) return prev;
						return {
							...prev,
							tabs: prev.tabs.map((item) => {
								if (item.id !== id) return item;
								if (!result.ok) return {
									...item,
									loading: false,
									error: result.error.message
								};
								const loaded = result.value;
								return {
									...item,
									loading: false,
									content: loaded.content,
									image: loaded.image,
									mtime: loaded.mtime,
									truncated: loaded.truncated ?? false,
									updated: false,
									dirty: false,
									error: null
								};
							})
						};
					});
				},
				setOpen(open) {
					handle.update((prev) => prev.open === open ? prev : {
						...prev,
						open
					});
				},
				async handleFsChange() {
					const state = handle.getSnapshot();
					if (state.root === "") return;
					if (previewFsInFlight) {
						if (previewFsScheduled === void 0) previewFsScheduled = setTimeout(() => {
							previewFsScheduled = void 0;
							this.handleFsChange();
						}, 200);
						return;
					}
					previewFsInFlight = true;
					try {
						handle.update((prev) => ({
							...prev,
							version: prev.version + 1
						}));
						await refreshDiffs(state.root);
						const active = handle.getSnapshot().tabs.find((tab) => tab.id === handle.getSnapshot().activeTabId);
						if (active === void 0 || active.content === null || active.dirty || active.diff !== void 0 || !isTextType(active.contentType)) return;
						const result = await api.read(state.root, active.path, false);
						handle.update((prev) => {
							if (prev.root !== state.root) return prev;
							return {
								...prev,
								tabs: prev.tabs.map((tab) => {
									if (tab.id !== active.id || tab.dirty) return tab;
									if (!result.ok) return tab;
									return {
										...tab,
										updated: tab.mtime !== void 0 && result.value.mtime > tab.mtime + 1
									};
								})
							};
						});
					} finally {
						previewFsInFlight = false;
					}
				},
				async handleGitChange(root) {
					await refreshDiffs(root);
				}
			});
			store[FLUSH_PERSIST] = flushPersist;
			return store;
		}
		/** Create the full store bundle. */
		function createPanelStores(api) {
			const layout = createLayoutStore();
			const explorer = createExplorerStore(api);
			const scm = createScmStore(api);
			const preview = createPreviewStore(api);
			const flushNow = () => {
				for (const store of [
					explorer,
					scm,
					preview
				]) {
					const flush = store[FLUSH_PERSIST];
					if (typeof flush === "function") flush();
				}
			};
			return {
				layout,
				explorer,
				scm,
				preview,
				flushNow
			};
		}
		/**
		* The five grid tracks while one panel is maximized: shell sidebar, chat,
		* shell details and the other panel all collapse to 0px; the target column
		* takes the whole measured frame width. Tracks are the same string shape the
		* shell's own inline style uses (px + fr), so nothing else needs to change.
		*/
		function maximizedGridTracks(target, frameWidth) {
			const wide = `${Math.max(0, Math.round(frameWidth))}px`;
			return target === "explorer" ? `0px 0px 0px 0px ${wide}` : `0px 0px 0px ${wide} 0px`;
		}
		/** Whether the maximized panel should render as a fixed full-screen overlay. */
		function maximizedOverlay(availableWidth) {
			return availableWidth > 0 && availableWidth < 640;
		}
		/** The WCO titlebar height when visible; 0 in a plain browser tab. */
		function titlebarAreaHeight() {
			const wco = navigator.windowControlsOverlay;
			if (wco === void 0 || !wco.visible || wco.getTitlebarAreaRect === void 0) return 0;
			try {
				const height = wco.getTitlebarAreaRect()?.height ?? 0;
				return height > 0 ? Math.round(height) : 0;
			} catch {
				return 0;
			}
		}
		/** Clamp a requested top px into the usable vertical range. */
		function clampFloatingTop(top, viewportHeight, buttonHeight, titlebar) {
			const min = titlebar + 6;
			const max = Math.max(min, viewportHeight - buttonHeight - 6);
			if (!Number.isFinite(top)) return min;
			return Math.min(max, Math.max(min, top));
		}
		/** The default top: aligned with the collapse chevron at the top-right. */
		function topAlignedFloatingTop(viewportHeight, buttonHeight, titlebar) {
			return clampFloatingTop(titlebar + 6, viewportHeight, buttonHeight, titlebar);
		}
		//#endregion
		//#region src/client/layout.ts
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
		/** The frame grid element (portals target it). */
		let frameElement = null;
		/**
		* Locate the frame grid element the two panel columns append into. The web-ui
		* aggregate's compat shim stamps `data-dsh-frame` onto the grid, but a
		* STANDALONE install of this package has no shim (the attribute never
		* appears), so the panel would wait forever and never mount (issue #56). Fall
		* back to the rc.6-native structure: the frame grid is the parent of the
		* sidebar column, exactly the element the shim would stamp.
		*/
		function findFrame() {
			const stamped = document.querySelector("[data-dsh-frame]");
			if (stamped !== null) return stamped;
			return document.querySelector("[class*=\"sidebarCol\"]")?.parentElement ?? null;
		}
		/**
		* Parse an inline grid-template-columns string into its tracks. Handles
		* "minmax(0, 1fr)" (spaces inside parens must not split). Empty on failure.
		*/
		function parseGridTracks(input) {
			const tracks = [];
			let depth = 0;
			let current = "";
			for (const char of input) {
				if (char === "(") depth += 1;
				if (char === ")") depth = Math.max(0, depth - 1);
				if (char === " " && depth === 0) {
					if (current !== "") {
						tracks.push(current);
						current = "";
					}
					continue;
				}
				current += char;
			}
			if (current !== "") tracks.push(current);
			return tracks;
		}
		/** Extract a px width from one track (0 for fr/minmax/non-px tracks). */
		function trackPx(track) {
			const match = /^(-?[\d.]+)px$/.exec(track.trim());
			return match === null ? 0 : Number(match[1]);
		}
		/**
		* Drag target width: apply the hard px bounds (the same min/max the handle
		* always enforced), then the store's ordered container-aware clamp so the
		* grid never re-clamps a width the drag showed.
		*/
		function dragTargetWidth(kind, startWidth, deltaX, snapshot) {
			const requested = startWidth + deltaX;
			if (kind === "explorer") return clampExplorerWidth(Math.min(500, Math.max(220, requested)), snapshot.availableWidth, snapshot.previewOpen);
			return clampPreviewWidth(Math.min(MAX_PREVIEW_REGION_PX, Math.max(340, requested)), snapshot.availableWidth, snapshot.explorerWidth);
		}
		/** The layout controller: frame sync, handles, floating button, width math. */
		var PanelLayoutController = class {
			layout;
			frame = null;
			previewCol = null;
			explorerCol = null;
			explorerHandle = null;
			previewHandle = null;
			floatingButton = null;
			styleObserver = null;
			sizeObserver = null;
			waitObserver = null;
			frameWidth = 0;
			/** Cached shell details handle (re-resolved when the shell rebuilds it). */
			detailsHandle = null;
			/** The shell's own 3 tracks (sidebar, center, details) — mirror of its inline style. */
			shellTracks = [];
			instantTimer;
			disposers = [];
			constructor(layout) {
				this.layout = layout;
			}
			/** Start watching for the frame and attach once it appears. */
			mount() {
				const tryAttach = () => {
					if (this.frame !== null) return;
					const frame = findFrame();
					if (frame === null) return;
					this.attach(frame);
				};
				this.waitObserver = new MutationObserver(() => {
					tryAttach();
				});
				this.waitObserver.observe(document.body, {
					childList: true,
					subtree: true
				});
				tryAttach();
			}
			/** Attach to the frame: columns, handles, observers, store subscription. */
			attach(frame) {
				this.frame = frame;
				frameElement = frame;
				this.waitObserver?.disconnect();
				this.waitObserver = null;
				this.detailsHandle = null;
				const previewCol = document.createElement("div");
				previewCol.dataset.filemgrPreviewCol = "";
				previewCol.className = "filemgr-preview-col";
				previewCol.style.minWidth = "0";
				previewCol.style.overflow = "hidden";
				previewCol.style.display = "flex";
				previewCol.style.flexDirection = "column";
				previewCol.style.borderLeft = "1px solid var(--aion-bg-3, #e5e6eb)";
				const explorerCol = document.createElement("div");
				explorerCol.dataset.filemgrExplorerCol = "";
				explorerCol.className = "filemgr-explorer-col";
				explorerCol.style.minWidth = "0";
				explorerCol.style.overflow = "hidden";
				explorerCol.style.display = "flex";
				explorerCol.style.flexDirection = "column";
				explorerCol.style.borderLeft = "1px solid var(--aion-bg-3, #e5e6eb)";
				frame.appendChild(previewCol);
				frame.appendChild(explorerCol);
				this.previewCol = previewCol;
				this.explorerCol = explorerCol;
				this.explorerHandle = this.createHandle("filemgr-explorer-handle", 12, true, "explorer");
				this.previewHandle = this.createHandle("filemgr-preview-handle", 20, true, "preview");
				frame.appendChild(this.explorerHandle);
				frame.appendChild(this.previewHandle);
				this.floatingButton = document.createElement("button");
				this.floatingButton.type = "button";
				this.floatingButton.className = "filemgr-floating-expand";
				this.floatingButton.setAttribute("aria-label", "Expand explorer");
				this.floatingButton.innerHTML = "<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 3l5 5-5 5\"/></svg>";
				this.floatingButton.addEventListener("click", () => {
					this.toggleExplorer();
				});
				document.body.appendChild(this.floatingButton);
				const overlay = navigator.windowControlsOverlay;
				if (overlay !== void 0) {
					const onGeometryChange = () => {
						this.positionFloatingButton();
					};
					overlay.addEventListener("geometrychange", onGeometryChange);
					this.disposers.push(() => overlay.removeEventListener("geometrychange", onGeometryChange));
				}
				const onKeyDown = (event) => {
					if (event.key !== "Escape") return;
					const target = event.target instanceof Element ? event.target : null;
					if (target !== null && target.closest("input, textarea, [contenteditable=\"true\"]") !== null) return;
					this.layout.update((prev) => prev.maximized === null ? prev : {
						...prev,
						maximized: null
					});
				};
				window.addEventListener("keydown", onKeyDown);
				this.disposers.push(() => window.removeEventListener("keydown", onKeyDown));
				const syncGrid = () => {
					const el = this.frame;
					if (el === null) return;
					const inline = el.style.gridTemplateColumns;
					if (inline === "") return;
					const tracks = parseGridTracks(inline);
					if (tracks.length >= 2 && tracks.length <= 3) {
						this.shellTracks = tracks;
						this.applyGrid();
						return;
					}
					if (tracks.length === 5 && this.shellTracks.length === 3) return;
				};
				this.styleObserver = new MutationObserver(syncGrid);
				this.styleObserver.observe(frame, {
					attributes: true,
					attributeFilter: ["style"]
				});
				const measure = () => {
					if (this.frame === null) return;
					this.frameWidth = this.frame.getBoundingClientRect().width;
					const sidebar = this.shellTracks.length >= 1 ? trackPx(this.shellTracks[0]) : 0;
					const details = this.shellTracks.length >= 3 ? trackPx(this.shellTracks[2]) : 0;
					const available = Math.max(0, this.frameWidth - sidebar - details);
					const state = this.layout.getSnapshot();
					if (Math.abs(state.availableWidth - available) > .5) this.layout.update((prev) => ({
						...prev,
						availableWidth: available
					}));
					this.layout.shrinkToFit(this.layout.getSnapshot());
				};
				this.sizeObserver = new ResizeObserver(() => {
					measure();
					this.applyGrid();
				});
				this.sizeObserver.observe(frame);
				this.disposers.push(this.layout.subscribe(() => this.applyGrid()));
				const initial = frame.style.gridTemplateColumns;
				if (initial !== "") {
					const tracks = parseGridTracks(initial);
					if (tracks.length >= 2 && tracks.length <= 3) this.shellTracks = tracks;
					else if (tracks.length === 5 && trackPx(tracks[0]) > 0) this.shellTracks = tracks.slice(0, 3);
				}
				measure();
				this.applyGrid();
			}
			/** Create one drag handle element with its pointer wiring. */
			createHandle(className, hitWidth, reverse, kind) {
				const el = document.createElement("div");
				el.className = className;
				el.style.position = "absolute";
				el.style.top = "0";
				el.style.bottom = "0";
				el.style.zIndex = "30";
				el.style.cursor = "col-resize";
				el.style.width = `${hitWidth}px`;
				if (reverse) el.style.marginLeft = `-${hitWidth}px`;
				el.addEventListener("pointerdown", (event) => {
					const isExplorer = kind === "explorer";
					handlePointerDragStart(event, el, {
						reverse,
						getStartWidth: () => {
							const state = this.layout.getSnapshot();
							return isExplorer ? state.explorerWidth : state.previewWidth;
						},
						compute: (startWidth, deltaX) => dragTargetWidth(isExplorer ? "explorer" : "preview", startWidth, deltaX, this.layout.getSnapshot()),
						onFrame: (width) => {
							this.layout.update((prev) => isExplorer ? {
								...prev,
								explorerWidth: width
							} : {
								...prev,
								previewWidth: width
							});
						},
						onEnd: (width) => {
							writeStoredNumber(isExplorer ? KEY_EXPLORER_WIDTH : KEY_PREVIEW_WIDTH, width);
						}
					});
				});
				el.addEventListener("dblclick", () => {
					this.instant(() => {
						const width = kind === "explorer" ? 260 : 480;
						this.layout.update((prev) => kind === "explorer" ? {
							...prev,
							explorerWidth: width
						} : {
							...prev,
							previewWidth: width
						});
						writeStoredNumber(kind === "explorer" ? KEY_EXPLORER_WIDTH : KEY_PREVIEW_WIDTH, width);
						this.applyGrid();
					});
				});
				return el;
			}
			/** Toggle explorer collapse (width 0, kept mounted; no transition). */
			toggleExplorer() {
				const state = this.layout.getSnapshot();
				const next = !state.explorerCollapsed;
				this.instant(() => {
					this.layout.update((prev) => ({
						...prev,
						explorerCollapsed: next
					}));
					try {
						localStorage.setItem(`project-panel-collapse:${state.root}`, next ? "collapsed" : "expanded");
					} catch {}
					this.applyGrid();
				});
			}
			/** Toggle the preview region (open = tabs exist; close keeps tabs). */
			setPreviewOpen(open) {
				this.instant(() => {
					this.layout.update((prev) => ({
						...prev,
						previewOpen: open
					}));
					this.applyGrid();
				});
			}
			/**
			* Locate the shell conversation header: its bottom border is the
			* horizontal divider under the "Session log" row the button should
			* sit below. Resolved per call (the shell may mount it late); null when
			* the shell has no header (standalone installs, desktop variants).
			*/
			findHeaderBottom() {
				const frame = this.frame;
				if (frame === null) return null;
				const header = frame.querySelector("[data-pane=\"conversation\"] header, [class*=\"centerCol\"] header");
				if (header === null) return null;
				const bottom = header.getBoundingClientRect().bottom;
				return Number.isFinite(bottom) ? bottom : null;
			}
			/** Position the floating button: docked at the top-right corner, just
			* below the shell header's bottom divider (fallback: the chevron row). */
			positionFloatingButton() {
				const el = this.floatingButton;
				if (el === null) return;
				const height = window.innerHeight;
				const titlebar = titlebarAreaHeight();
				const headerBottom = this.findHeaderBottom();
				const top = headerBottom !== null ? clampFloatingTop(headerBottom + 8, height, 24, titlebar) : topAlignedFloatingTop(height, 24, titlebar);
				el.style.top = `${Math.round(top)}px`;
				el.style.transform = "none";
			}
			/** Apply one store update with transitions disabled for exactly one frame. */
			instant(fn) {
				const frame = this.frame;
				if (frame === null) {
					fn();
					return;
				}
				frame.setAttribute("data-filemgr-instant", "");
				if (this.instantTimer !== void 0) clearTimeout(this.instantTimer);
				this.instantTimer = setTimeout(() => {
					this.instantTimer = void 0;
					frame.removeAttribute("data-filemgr-instant");
				}, 0);
				fn();
			}
			/** Re-write the frame grid and reposition handles + floating button. */
			applyGrid() {
				const frame = this.frame;
				if (frame === null) return;
				if (this.shellTracks.length !== 3) return;
				const state = this.layout.getSnapshot();
				const width = this.frameWidth > 0 ? this.frameWidth : frame.getBoundingClientRect().width;
				if (state.maximized !== null) {
					this.applyMaximized(frame, state.maximized, width);
					return;
				}
				this.clearMaximizedChrome();
				const explorer = this.layout.explorerWidthPx(state);
				const preview = this.layout.previewWidthPx(state);
				frame.style.gridTemplateColumns = `${this.shellTracks[0]} minmax(0, 1fr) ${this.shellTracks[2]} ${Math.round(preview)}px ${Math.round(explorer)}px`;
				if (this.explorerCol !== null) this.explorerCol.style.visibility = explorer > 0 ? "visible" : "hidden";
				if (this.previewCol !== null) this.previewCol.style.visibility = preview > 0 ? "visible" : "hidden";
				if (this.explorerHandle !== null) {
					const left = Math.round(width - explorer);
					this.explorerHandle.style.left = `${left}px`;
					this.explorerHandle.style.marginLeft = `${-12 / 2}px`;
					this.explorerHandle.style.display = explorer > 0 && state.root !== "" ? "block" : "none";
				}
				if (this.previewHandle !== null) {
					const left = Math.round(width - explorer - preview);
					this.previewHandle.style.left = `${left}px`;
					this.previewHandle.style.display = preview > 0 && state.root !== "" ? "block" : "none";
				}
				const detailsTrack = trackPx(this.shellTracks[2]);
				if (this.detailsHandle === null || !this.detailsHandle.isConnected) this.detailsHandle = frame.querySelector("[data-side=\"details\"]");
				if (this.detailsHandle !== null) this.detailsHandle.style.left = `${Math.round(width - detailsTrack - preview - explorer)}px`;
				if (this.floatingButton !== null) {
					const show = state.root !== "" && state.explorerCollapsed;
					this.floatingButton.style.display = show ? "flex" : "none";
					this.positionFloatingButton();
				}
			}
			/**
			* Maximize layout: the target column takes over the whole frame row (the
			* other tracks collapse to 0px). On narrow viewports the takeover grid is
			* skipped and the column renders as a fixed full-screen overlay instead
			* (issue #315). Everything stays mounted — only geometry changes.
			*/
			applyMaximized(frame, target, width) {
				const overlay = maximizedOverlay(this.layout.getSnapshot().availableWidth);
				if (!overlay) frame.style.gridTemplateColumns = maximizedGridTracks(target, width);
				if (this.explorerCol !== null) {
					this.explorerCol.style.visibility = target === "explorer" ? "visible" : "hidden";
					this.explorerCol.classList.toggle("filemgr-maximized", target === "explorer" && overlay);
				}
				if (this.previewCol !== null) {
					this.previewCol.style.visibility = target === "preview" ? "visible" : "hidden";
					this.previewCol.classList.toggle("filemgr-maximized", target === "preview" && overlay);
				}
				if (this.explorerHandle !== null) this.explorerHandle.style.display = "none";
				if (this.previewHandle !== null) this.previewHandle.style.display = "none";
				if (this.floatingButton !== null) this.floatingButton.style.display = "none";
			}
			/** Remove the narrow-screen overlay class from both columns. */
			clearMaximizedChrome() {
				this.explorerCol?.classList.remove("filemgr-maximized");
				this.previewCol?.classList.remove("filemgr-maximized");
			}
			/** Detach everything (plugin unload). */
			dispose() {
				this.waitObserver?.disconnect();
				this.styleObserver?.disconnect();
				this.sizeObserver?.disconnect();
				for (const dispose of this.disposers) dispose();
				this.previewCol?.remove();
				this.explorerCol?.remove();
				this.explorerHandle?.remove();
				this.previewHandle?.remove();
				this.floatingButton?.remove();
				if (this.instantTimer !== void 0) clearTimeout(this.instantTimer);
				if (frameElement === this.frame) frameElement = null;
				this.frame = null;
			}
		};
		//#endregion
		//#region src/client/locales.ts
		/**
		* Locale strings for the panel surfaces (zh/en). The client registers the
		* dictionary through the locale service like the sibling plugins; copy is
		* deliberately short and technical.
		* @module dsh-filemgr/client/locales
		*/
		const zh = {
			"explorer.tabs.files": "文件",
			"explorer.tabs.changes": "变更",
			"explorer.search.placeholder": "按文件名搜索",
			"explorer.search.searching": "搜索中…",
			"explorer.search.empty": "没有匹配的文件",
			"explorer.search.error": "搜索失败",
			"explorer.search.truncated": "结果过多，仅显示前 {count} 条",
			"explorer.tree.empty": "项目为空",
			"explorer.collapse": "收起面板",
			"explorer.expand": "展开面板",
			"explorer.maximize": "最大化文件面板",
			"explorer.restore": "还原面板",
			"explorer.openPreview": "打开预览",
			"explorer.drag.dropHint": "松手插入文件路径",
			"scm.repositories": "存储库",
			"scm.changes": "变更",
			"scm.staged": "已暂存",
			"scm.unstaged": "变更",
			"scm.untracked": "未跟踪",
			"scm.conflicted": "冲突",
			"scm.stage": "暂存",
			"scm.unstage": "取消暂存",
			"scm.discard": "放弃更改",
			"scm.stageAll": "全部暂存",
			"scm.discardAll": "全部放弃",
			"scm.empty": "没有更改",
			"scm.notRepo": "当前目录不是 git 仓库",
			"scm.gitMissing": "未检测到 git，请先安装 git 后重试",
			"scm.loading": "读取状态中…",
			"scm.failed": "操作失败",
			"scm.viewList": "列表视图",
			"scm.viewTree": "树视图",
			"scm.discardConfirmTracked": "放弃对 {count} 个文件的更改？此操作不可恢复。",
			"scm.discardConfirmUntracked": "删除 {count} 个未跟踪文件？此操作不可恢复。",
			"preview.noTabs": "没有打开的预览",
			"preview.newUrlTab": "新建 URL 预览",
			"preview.collapsePanel": "收起预览面板",
			"preview.maximize": "最大化预览面板",
			"preview.restore": "还原面板",
			"preview.source": "源码",
			"preview.preview": "预览",
			"preview.editor": "编辑器",
			"preview.split": "分屏",
			"preview.refresh": "刷新",
			"preview.refresh.updated": "文件已在磁盘更新",
			"preview.save": "保存",
			"preview.download": "下载",
			"preview.copyCode": "复制代码",
			"preview.copyCodeDone": "已复制",
			"preview.openExternal": "在系统应用中打开",
			"preview.dirty": "未保存的更改",
			"preview.closeLeft": "关闭左侧",
			"preview.closeRight": "关闭右侧",
			"preview.closeOthers": "关闭其他",
			"preview.closeAll": "关闭全部",
			"preview.closeConfirmTitle": "关闭未保存的标签页",
			"preview.closeConfirmBody": "{count} 个标签页有未保存的更改，关闭将丢失这些更改。",
			"preview.saved": "已保存",
			"preview.saveConflict": "文件已在磁盘上被修改，保存冲突：请刷新后重试",
			"preview.errorOversized": "文件过大，仅加载前 80,000 字符",
			"preview.unsupported": "此格式暂不支持预览",
			"preview.downloadHint": "可在系统应用中打开或下载查看",
			"preview.url.placeholder": "输入网址，回车打开",
			"preview.url.hint": "按 Esc 还原",
			"common.cancel": "取消",
			"common.confirm": "确定",
			"common.close": "关闭",
			"common.delete": "删除",
			"common.copyPath": "复制路径",
			"common.copied": "已复制",
			"explorer.menu.copyPath": "复制路径",
			"explorer.menu.copyName": "复制名称",
			"explorer.menu.reveal": "在文件管理器中显示",
			"explorer.menu.openWithDefault": "用默认应用打开",
			"explorer.menu.rename": "重命名",
			"explorer.menu.newFile": "新建文件",
			"explorer.menu.newFolder": "新建文件夹",
			"explorer.menu.delete": "删除",
			"explorer.rename.title": "重命名",
			"explorer.newFile.title": "新建文件",
			"explorer.newFolder.title": "新建文件夹",
			"explorer.deleteConfirmTitle": "删除确认",
			"explorer.deleteConfirmBody": "确定要删除「{name}」吗？此操作不可恢复。",
			"explorer.opFailed": "操作失败",
			"explorer.refToInput": "引用到输入框",
			"settings.title": "右侧面板",
			"settings.description": "Explorer / Preview 与 SCM 变更面板的总开关。",
			"settings.enabled": "启用右侧面板",
			"settings.enabledHint": "关闭后不再挂载右侧文件树与预览列、不显示浮动展开按钮、不注册 /filemgr 路由，也不做工作区监视与 git 轮询；聚合包其余插件不受影响。",
			"settings.overridden": "已覆盖",
			"settings.reset": "恢复默认",
			"settings.notExposed": "当前 DSH 版本未向设置页暴露本插件的配置命名空间，表单不可用。可编辑 ~/.dsh/settings.yaml 直接配置，或为 dsh-host-apiproxy 的 WEB_SETTINGS_NAMESPACES 白名单补充本命名空间后重启。",
			"settings.readOnly": "当前部署的设置只读。",
			"settings.inherit": "继承",
			"settings.on": "开",
			"settings.off": "关",
			"settings.expand": "展开设置",
			"settings.collapse": "收起设置",
			"settings.save": "保存",
			"settings.saving": "保存中…",
			"settings.discard": "放弃",
			"settings.unsaved": "未保存",
			"settings.saveFailed": "部署未接受这些值，已保留供你修改。",
			"settings.invalidNumber": "请输入数字，留空则使用默认值。"
		};
		const en = {
			"explorer.tabs.files": "Files",
			"explorer.tabs.changes": "Changes",
			"explorer.search.placeholder": "Search file names",
			"explorer.search.searching": "Searching…",
			"explorer.search.empty": "No matching files",
			"explorer.search.error": "Search failed",
			"explorer.search.truncated": "Too many results, showing first {count}",
			"explorer.tree.empty": "The project is empty",
			"explorer.collapse": "Collapse panel",
			"explorer.expand": "Expand panel",
			"explorer.maximize": "Maximize files panel",
			"explorer.restore": "Restore panel",
			"explorer.openPreview": "Open preview",
			"explorer.drag.dropHint": "Release to insert the file path",
			"scm.repositories": "Repositories",
			"scm.changes": "Changes",
			"scm.staged": "Staged",
			"scm.unstaged": "Changes",
			"scm.untracked": "Untracked",
			"scm.conflicted": "Conflict",
			"scm.stage": "Stage",
			"scm.unstage": "Unstage",
			"scm.discard": "Discard",
			"scm.stageAll": "Stage all",
			"scm.discardAll": "Discard all",
			"scm.empty": "No changes",
			"scm.notRepo": "Not a git repository",
			"scm.gitMissing": "Git is not installed. Install git and reload to use the changes panel",
			"scm.loading": "Loading status…",
			"scm.failed": "Operation failed",
			"scm.viewList": "List view",
			"scm.viewTree": "Tree view",
			"scm.discardConfirmTracked": "Discard changes in {count} files? This cannot be undone.",
			"scm.discardConfirmUntracked": "Delete {count} untracked files? This cannot be undone.",
			"preview.noTabs": "No open previews",
			"preview.newUrlTab": "New URL preview",
			"preview.collapsePanel": "Collapse preview panel",
			"preview.maximize": "Maximize preview panel",
			"preview.restore": "Restore panel",
			"preview.source": "Source",
			"preview.preview": "Preview",
			"preview.editor": "Editor",
			"preview.split": "Split",
			"preview.refresh": "Refresh",
			"preview.refresh.updated": "File updated on disk",
			"preview.save": "Save",
			"preview.download": "Download",
			"preview.copyCode": "Copy code",
			"preview.copyCodeDone": "Copied",
			"preview.openExternal": "Open in system app",
			"preview.dirty": "Unsaved changes",
			"preview.closeLeft": "Close left",
			"preview.closeRight": "Close right",
			"preview.closeOthers": "Close others",
			"preview.closeAll": "Close all",
			"preview.closeConfirmTitle": "Close unsaved tabs",
			"preview.closeConfirmBody": "{count} tabs have unsaved changes. Closing will lose them.",
			"preview.saved": "Saved",
			"preview.saveConflict": "File changed on disk. Save conflict: refresh and retry",
			"preview.errorOversized": "File too large, only the first 80,000 characters loaded",
			"preview.unsupported": "Preview not supported for this format",
			"preview.downloadHint": "Open in a system app or download to view",
			"preview.url.placeholder": "Enter a URL and press Enter",
			"preview.url.hint": "Press Esc to revert",
			"common.cancel": "Cancel",
			"common.confirm": "OK",
			"common.close": "Close",
			"common.delete": "Delete",
			"common.copyPath": "Copy path",
			"common.copied": "Copied",
			"explorer.menu.copyPath": "Copy path",
			"explorer.menu.copyName": "Copy name",
			"explorer.menu.reveal": "Reveal in file manager",
			"explorer.menu.openWithDefault": "Open with default app",
			"explorer.menu.rename": "Rename",
			"explorer.menu.newFile": "New file",
			"explorer.menu.newFolder": "New folder",
			"explorer.menu.delete": "Delete",
			"explorer.rename.title": "Rename",
			"explorer.newFile.title": "New file",
			"explorer.newFolder.title": "New folder",
			"explorer.deleteConfirmTitle": "Confirm delete",
			"explorer.deleteConfirmBody": "Delete \"{name}\"? This cannot be undone.",
			"explorer.opFailed": "Operation failed",
			"explorer.refToInput": "Reference to input",
			"settings.title": "Right panel",
			"settings.description": "Master switch for the Explorer / Preview and SCM changes panels.",
			"settings.enabled": "Enable the right panel",
			"settings.enabledHint": "When off, the Explorer and Preview columns are not mounted, the floating expand button disappears, the /filemgr routes are not registered, and workspace watching and git polling stop. The rest of the family bundle is unaffected.",
			"settings.overridden": "Overridden",
			"settings.reset": "Reset",
			"settings.notExposed": "This DSH version does not expose this plugin's settings namespace; the form is unavailable. Edit ~/.dsh/settings.yaml directly, or add the namespace to the WEB_SETTINGS_NAMESPACES allowlist of dsh-host-apiproxy and restart.",
			"settings.readOnly": "Settings are read-only in this deployment.",
			"settings.inherit": "Inherit",
			"settings.on": "On",
			"settings.off": "Off",
			"settings.expand": "Expand settings",
			"settings.collapse": "Collapse settings",
			"settings.save": "Save",
			"settings.saving": "Saving…",
			"settings.discard": "Discard",
			"settings.unsaved": "Unsaved",
			"settings.saveFailed": "The deployment rejected these values; your edits are kept.",
			"settings.invalidNumber": "Enter a number, or leave it empty to use the default."
		};
		/** The dictionary namespace this plugin owns. */
		const NS = "filemgr";
		/** Format one copy string with {name} placeholders. */
		function format(template, params) {
			return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
		}
		/** Simple dictionary access (zh/en by a global flag the client sets). */
		const dictionaries = {
			zh,
			en
		};
		let currentLanguage = "zh";
		/** Set the active language (the client mirrors the locale service). */
		function setLanguage(language) {
			currentLanguage = language === "en" ? "en" : "zh";
		}
		/** Translate one key with optional params. */
		function t(key, params) {
			const template = (dictionaries[currentLanguage] ?? zh)[key] ?? zh[key];
			return params === void 0 ? template : format(template, params);
		}
		//#endregion
		//#region src/client/hooks/useStore.ts
		/**
		* React bindings for the framework-free stores: useSyncExternalStore with a
		* stable snapshot (the stores return immutable snapshots, so selector-free
		* subscription is safe), plus a stable-callback helper for event handlers.
		* @module dsh-filemgr/client/hooks/useStore
		*/
		/** Subscribe a component to one store (full snapshot). */
		function useStore(store) {
			return (0, react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getSnapshot);
		}
		//#endregion
		//#region src/client/components/icons.tsx
		const base = (size) => ({
			width: size,
			height: size,
			viewBox: "0 0 16 16",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 1.3,
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": true
		});
		function FolderIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 3.5h4l1.5 2H14a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" })
			});
		}
		function FolderOpenIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 3.5h4l1.5 2H14a1 1 0 0 1 1 1v1H3.5a1 1 0 0 0-.96.72L1 13.5V4.5a1 1 0 0 1 1-1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.8 11.5 4 7.5h11l-1.4 4a1 1 0 0 1-.96.72H3.76a1 1 0 0 1-.96-.72Z" })]
			});
		}
		function FileIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 2h5l3 3v9H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 2v3h3" })]
			});
		}
		function FileCodeIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 2h5l3 3v9H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 2v3h3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6.2 8.6-1.4 1.4 1.4 1.4M9.8 8.6l1.4 1.4-1.4 1.4" })
				]
			});
		}
		function FileImageIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 2h5l3 3v9H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 2v3h3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "6.2",
						cy: "6.8",
						r: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 11 1.8-1.8 1.4 1.4 1.3-1.3L12 12" })
				]
			});
		}
		function FileTextIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 2h5l3 3v9H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 2v3h3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 9h4M6 11.2h4" })
				]
			});
		}
		function ChevronRightIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6 3.5 4.5 4.5L6 12.5" })
			});
		}
		function ChevronDownIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3.5 6 4.5 4.5L12.5 6" })
			});
		}
		function CloseIcon({ size = 12, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3.5 3.5 9 9M12.5 3.5l-9 9" })
			});
		}
		function PlusIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 3v10M3 8h10" })
			});
		}
		function MinusIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 8h10" })
			});
		}
		function UndoIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 3.5 2.5 6 5 8.5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 6h8a3.5 3.5 0 0 1 0 7h-3" })]
			});
		}
		function RefreshIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13 8a5 5 0 1 1-1.6-3.65" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.5 2v2.8h-2.8" })]
			});
		}
		function SplitIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "2",
					y: "2.5",
					width: "12",
					height: "11",
					rx: "1"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.5v11" })]
			});
		}
		function CodeIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5.5 4.5-4 3.5 4 3.5M10.5 4.5l4 3.5-4 3.5" })
			});
		}
		function EyeIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "2"
				})]
			});
		}
		function SaveIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 2.5h8l2.5 2.5v8.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 2.5v3.5h4.5V2.5M5 13.5V9.5h6v4" })]
			});
		}
		function DownloadIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2v7.5M4.5 6.5 8 10l3.5-3.5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 13h11" })]
			});
		}
		function SearchIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "7",
					cy: "7",
					r: "4.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m10.5 10.5 3 3" })]
			});
		}
		function BranchIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "4",
						cy: "3.5",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "4",
						cy: "12.5",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "6.5",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 5v5M4 10.5c0-2 2-2.5 4-2.5s4-.5 4-1.5" })
				]
			});
		}
		function ListIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 4h11M2.5 8h11M2.5 12h11" })
			});
		}
		function TreeIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 3.5h6M8.5 8h5M2.5 8h2" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3.5v7" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11 8v4.5h-2.5" })
				]
			});
		}
		function ShrinkIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 14 10 10M10 14v-4h4" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 2l4 4M6 2v4H2" })]
			});
		}
		function ExpandRightIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3.5 11.5 8 6 12.5" })
			});
		}
		function MaximizeIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...base(size),
				className,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "3",
					width: "10",
					height: "10",
					rx: "1"
				})
			});
		}
		function RestoreIcon({ size = 14, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...base(size),
				className,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3",
					y: "5",
					width: "8",
					height: "8",
					rx: "1"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6.5 3.5h5a1 1 0 0 1 1 1V10" })]
			});
		}
		//#endregion
		//#region src/client/components/FileIcon.tsx
		/** The icon for one tree entry (16x16, currentColor). */
		function FileTypeIcon({ name, isDir, expanded, className }) {
			if (isDir) return expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderOpenIcon, {
				size: 16,
				className
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, {
				size: 16,
				className
			});
			switch (detectContentType(name)) {
				case "image": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileImageIcon, {
					size: 16,
					className
				});
				case "markdown":
				case "text": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTextIcon, {
					size: 16,
					className
				});
				case "code":
				case "diff":
				case "csv":
				case "html": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileCodeIcon, {
					size: 16,
					className
				});
				default: return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, {
					size: 16,
					className
				});
			}
		}
		//#endregion
		//#region src/client/components/overlay.tsx
		/**
		* Minimal overlay primitives for the panel: a toast and a context menu,
		* rendered through plain DOM + portals so they can live outside the grid
		* columns (fixed positioning, high z-index).
		* @module dsh-filemgr/client/components/overlay
		*/
		/** One transient toast message. */
		function toast(message) {
			const el = document.createElement("div");
			el.className = "filemgr-toast";
			el.textContent = message;
			document.body.appendChild(el);
			setTimeout(() => {
				el.style.opacity = "0";
				el.style.transition = "opacity 0.2s ease";
			}, 1800);
			setTimeout(() => el.remove(), 2100);
		}
		/** The shared context-menu portal host (one at a time). */
		function ContextMenu({ state, onClose }) {
			const [position, setPosition] = (0, react.useState)(null);
			(0, react.useLayoutEffect)(() => {
				if (state === null) {
					setPosition(null);
					return;
				}
				const width = 180;
				const height = state.entries.length * 28 + 12;
				setPosition({
					x: Math.min(state.x, window.innerWidth - width - 8),
					y: Math.min(state.y, window.innerHeight - height - 8)
				});
			}, [state]);
			(0, react.useEffect)(() => {
				if (state === null) return;
				const close = (event) => {
					if (event.target instanceof Element && event.target.closest("[data-menu-root]") !== null) return;
					onClose();
				};
				const key = (event) => {
					if (event.key === "Escape") onClose();
				};
				window.addEventListener("pointerdown", close, { capture: true });
				window.addEventListener("blur", onClose);
				window.addEventListener("keydown", key);
				window.addEventListener("contextmenu", onClose);
				return () => {
					window.removeEventListener("pointerdown", close, { capture: true });
					window.removeEventListener("blur", onClose);
					window.removeEventListener("keydown", key);
					window.removeEventListener("contextmenu", onClose);
				};
			}, [state, onClose]);
			if (state === null || position === null) return null;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "filemgr-menu",
				"data-menu-root": "",
				style: {
					left: position.x,
					top: position.y
				},
				onPointerDown: (event) => event.stopPropagation(),
				onContextMenu: (event) => event.preventDefault(),
				children: state.entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: entry.label === "---" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "filemgr-menu-sep" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: `filemgr-menu-item${entry.disabled === true ? " filemgr-menu-item-disabled" : ""}`,
					onClick: () => {
						if (entry.disabled === true) return;
						onClose();
						entry.onSelect?.();
					},
					role: "menuitem",
					children: entry.label
				}) }, entry.key))
			}), document.body);
		}
		/** A single-text-input dialog (rename, new file / new folder). */
		function PromptDialog({ title, initialValue, confirmLabel, onConfirm, onCancel }) {
			const [value, setValue] = (0, react.useState)(initialValue ?? "");
			const inputRef = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				inputRef.current?.focus();
				inputRef.current?.select();
			}, []);
			const commit = () => {
				const trimmed = value.trim();
				if (trimmed === "") return;
				onConfirm(trimmed);
			};
			(0, react.useEffect)(() => {
				const key = (event) => {
					if (event.key === "Escape") onCancel();
				};
				window.addEventListener("keydown", key);
				return () => window.removeEventListener("keydown", key);
			}, [onCancel]);
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "filemgr-overlay",
				onPointerDown: onCancel,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "filemgr-dialog",
					onPointerDown: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "filemgr-dialog-title",
							children: title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "filemgr-dialog-body",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: inputRef,
								className: "filemgr-input",
								value,
								placeholder: initialValue ?? "",
								"aria-label": title,
								onChange: (event) => setValue(event.target.value),
								onKeyDown: (event) => {
									if (event.key === "Enter") commit();
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "filemgr-dialog-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "filemgr-btn",
								onClick: onCancel,
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "filemgr-btn filemgr-btn-primary",
								disabled: value.trim() === "",
								onClick: commit,
								children: confirmLabel ?? t("common.confirm")
							})]
						})
					]
				})
			}), document.body);
		}
		/** A confirmation dialog (dirty-close confirm, discard confirm). */
		function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onCancel }) {
			(0, react.useEffect)(() => {
				const key = (event) => {
					if (event.key === "Escape") onCancel();
				};
				window.addEventListener("keydown", key);
				return () => window.removeEventListener("keydown", key);
			}, [onCancel]);
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "filemgr-overlay",
				onPointerDown: onCancel,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "filemgr-dialog",
					onPointerDown: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "filemgr-dialog-title",
							children: title
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "filemgr-dialog-body",
							children: body
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "filemgr-dialog-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "filemgr-btn",
								onClick: onCancel,
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `filemgr-btn ${danger === true ? "filemgr-btn-danger" : "filemgr-btn-primary"}`,
								onClick: onConfirm,
								children: confirmLabel ?? t("common.confirm")
							})]
						})
					]
				})
			}), document.body);
		}
		//#endregion
		//#region src/client/components/a11y.ts
		/**
		* Keyboard activation parity for focusable rows/divs styled as buttons
		* (role="button" + tabIndex={0}): Enter and Space trigger the same action as
		* a click, and events bubbling out of nested interactive elements (a row's
		* inline action buttons, a tab's close control) are ignored so they never
		* double-activate the row.
		* @param handler - the activation handler (the element's click action).
		* @returns a keydown handler for the focusable element.
		*/
		function activateOnKey(handler) {
			return (event) => {
				if (event.target !== event.currentTarget) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					handler();
				}
			};
		}
		//#endregion
		//#region \0dsh-css:src/client/styles/scm.module.css.mjs
		const css$6 = ".rZ5r5q_panel{flex-direction:column;height:100%;min-height:0;display:flex}.rZ5r5q_section{flex-direction:column;flex-shrink:0;min-height:0;display:flex}.rZ5r5q_sectionHeader{cursor:pointer;user-select:none;background:var(--aion-bg-1);flex-shrink:0;align-items:center;gap:6px;height:24px;padding:0 8px;display:flex}.rZ5r5q_sectionHeader:hover{background:var(--aion-bg-hover)}.rZ5r5q_sectionHeader:active{background:var(--aion-bg-active)}.rZ5r5q_sectionHeader:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.rZ5r5q_sectionTitle{color:var(--aion-text-primary);text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:12px;font-weight:600;overflow:hidden}.rZ5r5q_sectionChevron{color:var(--aion-text-secondary);align-items:center;transition:transform .15s cubic-bezier(.4,0,.2,1);display:flex}.rZ5r5q_sectionChevronOpen{transform:rotate(90deg)}.rZ5r5q_sectionAction{width:22px;height:22px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;padding:0;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.rZ5r5q_sectionAction:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.rZ5r5q_sectionAction:active{background:var(--aion-bg-active)}.rZ5r5q_sectionAction:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.rZ5r5q_sectionAction:disabled{opacity:.4;cursor:default}.rZ5r5q_sectionAction:disabled:hover{color:var(--aion-text-secondary);background:0 0}.rZ5r5q_sectionBody{flex-shrink:1;min-height:0;overflow:hidden auto}.rZ5r5q_branchRow{height:26px;color:var(--aion-text-primary);align-items:center;gap:6px;padding:0 8px 0 12px;font-size:13px;display:flex}.rZ5r5q_branchName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.rZ5r5q_changeRow{cursor:pointer;white-space:nowrap;align-items:center;gap:6px;height:26px;padding:0 8px 0 12px;transition:background-color .12s;display:flex}.rZ5r5q_changeRow:hover{background:var(--aion-fill-2)}.rZ5r5q_changeRow:active{background:var(--aion-bg-active)}.rZ5r5q_changeRow:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.rZ5r5q_changeRowSelected,.rZ5r5q_changeRowSelected:hover{background:var(--aion-fill-3)}.rZ5r5q_badge{width:16px;height:16px;font-size:11px;font-weight:600;font-family:var(--aion-font-mono);border-radius:3px;flex-shrink:0;justify-content:center;align-items:center;display:flex}.rZ5r5q_badgeCreated{color:var(--aion-success);background:color-mix(in srgb, var(--aion-success) 14%, transparent)}.rZ5r5q_badgeModified{color:var(--aion-warning);background:color-mix(in srgb, var(--aion-warning) 14%, transparent)}.rZ5r5q_badgeDeleted{color:var(--aion-danger);background:color-mix(in srgb, var(--aion-danger) 14%, transparent)}.rZ5r5q_badgeConflicted{color:var(--aion-danger);background:color-mix(in srgb, var(--aion-danger) 18%, transparent);border:1px solid var(--aion-danger)}.rZ5r5q_badgeUntracked{color:var(--aion-text-tertiary);background:var(--aion-fill-2)}.rZ5r5q_changeName{text-overflow:ellipsis;color:var(--aion-text-primary);flex:1;min-width:0;font-size:13px;overflow:hidden}.rZ5r5q_changeDir{text-overflow:ellipsis;color:var(--aion-text-tertiary);flex-shrink:1;min-width:0;font-size:11px;overflow:hidden}.rZ5r5q_rowActions{opacity:0;flex-shrink:0;align-items:center;gap:2px;transition:opacity .15s cubic-bezier(.4,0,.2,1);display:flex}.rZ5r5q_changeRow:hover .rZ5r5q_rowActions,.rZ5r5q_changeRow:focus-within .rZ5r5q_rowActions,.rZ5r5q_rowActionsVisible{opacity:1}.rZ5r5q_rowAction{width:22px;height:22px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:4px;justify-content:center;align-items:center;padding:0;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.rZ5r5q_rowAction:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.rZ5r5q_rowAction:active{background:var(--aion-bg-active)}.rZ5r5q_rowAction:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.rZ5r5q_rowAction:disabled{opacity:.4;cursor:default}.rZ5r5q_rowAction:disabled:hover{color:var(--aion-text-secondary);background:0 0}.rZ5r5q_rowFailed{color:var(--aion-danger)}.rZ5r5q_groupTitle{height:22px;color:var(--aion-text-tertiary);background:var(--aion-bg-2);flex-shrink:0;align-items:center;gap:6px;padding:0 8px 0 12px;font-size:11px;font-weight:600;display:flex}.rZ5r5q_groupAction{width:18px;height:18px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:3px;justify-content:center;align-items:center;padding:0;display:flex}.rZ5r5q_groupAction:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.rZ5r5q_groupAction:active{background:var(--aion-bg-active)}.rZ5r5q_groupAction:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.rZ5r5q_groupAction:disabled{opacity:.4;cursor:default}.rZ5r5q_groupAction:disabled:hover{color:var(--aion-text-secondary);background:0 0}.rZ5r5q_dirRow{cursor:pointer;white-space:nowrap;align-items:center;gap:4px;height:26px;transition:background-color .12s;display:flex}.rZ5r5q_dirRow:hover{background:var(--aion-fill-2)}.rZ5r5q_dirRow:active{background:var(--aion-bg-active)}.rZ5r5q_dirRow:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.rZ5r5q_dirArrow{color:var(--aion-text-tertiary);align-items:center;transition:transform .15s cubic-bezier(.4,0,.2,1);display:flex}.rZ5r5q_dirArrowOpen{transform:rotate(90deg)}.rZ5r5q_empty,.rZ5r5q_loading{color:var(--aion-text-tertiary);padding:16px 12px;font-size:12px}.rZ5r5q_notRepo{color:var(--aion-text-tertiary);padding:16px 12px;font-size:12px;line-height:1.6}";
		const tagId$6 = "@lijian-ui/dsh-file-manager/scm.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var scm_module_css_default = {
			"badge": "rZ5r5q_badge",
			"badgeConflicted": "rZ5r5q_badgeConflicted",
			"badgeCreated": "rZ5r5q_badgeCreated",
			"badgeDeleted": "rZ5r5q_badgeDeleted",
			"badgeModified": "rZ5r5q_badgeModified",
			"badgeUntracked": "rZ5r5q_badgeUntracked",
			"branchName": "rZ5r5q_branchName",
			"branchRow": "rZ5r5q_branchRow",
			"changeDir": "rZ5r5q_changeDir",
			"changeName": "rZ5r5q_changeName",
			"changeRow": "rZ5r5q_changeRow",
			"changeRowSelected": "rZ5r5q_changeRowSelected",
			"dirArrow": "rZ5r5q_dirArrow",
			"dirArrowOpen": "rZ5r5q_dirArrowOpen",
			"dirRow": "rZ5r5q_dirRow",
			"empty": "rZ5r5q_empty",
			"groupAction": "rZ5r5q_groupAction",
			"groupTitle": "rZ5r5q_groupTitle",
			"loading": "rZ5r5q_loading",
			"notRepo": "rZ5r5q_notRepo",
			"panel": "rZ5r5q_panel",
			"rowAction": "rZ5r5q_rowAction",
			"rowActions": "rZ5r5q_rowActions",
			"rowActionsVisible": "rZ5r5q_rowActionsVisible",
			"rowFailed": "rZ5r5q_rowFailed",
			"section": "rZ5r5q_section",
			"sectionAction": "rZ5r5q_sectionAction",
			"sectionBody": "rZ5r5q_sectionBody",
			"sectionChevron": "rZ5r5q_sectionChevron",
			"sectionChevronOpen": "rZ5r5q_sectionChevronOpen",
			"sectionHeader": "rZ5r5q_sectionHeader",
			"sectionTitle": "rZ5r5q_sectionTitle"
		};
		//#endregion
		//#region src/client/components/ScmPanel.tsx
		/**
		* The Changes (SCM) panel: per-repo working-tree status grouped into staged /
		* unstaged / untracked, with stage/unstage/discard actions on every row and
		* bulk actions in the section header. The host status is the only truth — no
		* optimistic rows; a failed batch surfaces its paths and the next refresh
		* clears the flag. Discard confirms with copy split by recoverability
		* (untracked = delete vs tracked = irreversible restore).
		*
		* FileManager ScmPanel behavior (Apache-2.0, re-implemented): window focus
		* refreshes (external editors write without git events), unknown states
		* render as a quiet '?', conflicted rows are visually distinct AND have no
		* actions.
		* @module dsh-filemgr/client/components/ScmPanel
		*/
		/** Minimum gap between window-focus SCM refreshes (ms). */
		const FOCUS_REFRESH_MIN_MS = 5e3;
		/** Badge letter + color class per state. */
		const BADGE = {
			created: {
				letter: "A",
				className: scm_module_css_default.badgeCreated
			},
			modified: {
				letter: "M",
				className: scm_module_css_default.badgeModified
			},
			deleted: {
				letter: "D",
				className: scm_module_css_default.badgeDeleted
			},
			renamed: {
				letter: "R",
				className: scm_module_css_default.badgeCreated
			},
			conflicted: {
				letter: "!",
				className: scm_module_css_default.badgeConflicted
			},
			untracked: {
				letter: "?",
				className: scm_module_css_default.badgeUntracked
			},
			unknown: {
				letter: "?",
				className: scm_module_css_default.badgeUntracked
			}
		};
		/** The parent dir of a path ('' for root-level). */
		function dirOf$1(path) {
			const idx = path.lastIndexOf("/");
			return idx > 0 ? path.slice(0, idx) : "";
		}
		/** Build a display-only directory tree from rows. */
		function buildTree(rows) {
			const byDir = /* @__PURE__ */ new Map();
			for (const row of rows) {
				const dir = dirOf$1(row.path);
				const list = byDir.get(dir);
				if (list === void 0) byDir.set(dir, [row]);
				else list.push(row);
			}
			return byDir;
		}
		/** The SCM tab body.
		* @param stores - the panel store bundle.
		*/
		function ScmPanel({ stores }) {
			const scm = stores.scm;
			const preview = stores.preview;
			const state = useStore(scm);
			const [discardTargets, setDiscardTargets] = (0, react.useState)(null);
			const lastFocusRefresh = (0, react.useRef)(-Infinity);
			(0, react.useEffect)(() => {
				const onFocus = () => {
					const now = Date.now();
					if (now - lastFocusRefresh.current < FOCUS_REFRESH_MIN_MS) return;
					lastFocusRefresh.current = now;
					scm.refresh();
				};
				window.addEventListener("focus", onFocus);
				return () => window.removeEventListener("focus", onFocus);
			}, [scm]);
			const status = state.status;
			const changesSectionOpen = state.sectionCollapsed["changes"] !== true;
			const requestDiscard = (rows) => {
				if (rows.length === 0) return;
				setDiscardTargets(rows);
			};
			const confirmDiscard = () => {
				if (discardTargets === null) return;
				scm.discard(discardTargets.map((row) => row.path));
				setDiscardTargets(null);
			};
			if (state.loading && status === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `filemgr-root ${scm_module_css_default.panel}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: scm_module_css_default.loading,
					children: t("scm.loading")
				})
			});
			if (state.gitMissing) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `filemgr-root ${scm_module_css_default.panel}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: scm_module_css_default.notRepo,
					children: t("scm.gitMissing")
				})
			});
			if (status === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `filemgr-root ${scm_module_css_default.panel}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: scm_module_css_default.notRepo,
					children: t("scm.notRepo")
				})
			});
			const staged = status.staged;
			const unstaged = status.unstaged;
			const untracked = status.untracked;
			const hasChanges = staged.length + unstaged.length + untracked.length > 0;
			const allUntracked = discardTargets !== null && discardTargets.every((row) => row.state === "untracked");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `filemgr-root ${scm_module_css_default.panel}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: scm_module_css_default.section,
					style: {
						flex: changesSectionOpen ? 1 : void 0,
						maxHeight: changesSectionOpen ? void 0 : 24
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: scm_module_css_default.sectionHeader,
						onClick: () => scm.setSectionCollapsed("changes", changesSectionOpen),
						onKeyDown: activateOnKey(() => {
							scm.setSectionCollapsed("changes", changesSectionOpen);
						}),
						role: "button",
						tabIndex: 0,
						"aria-expanded": changesSectionOpen,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${scm_module_css_default.sectionChevron}${changesSectionOpen ? ` ${scm_module_css_default.sectionChevronOpen}` : ""}`,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronRightIcon, { size: 13 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: scm_module_css_default.sectionTitle,
								children: t("scm.changes")
							}),
							status.branch !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: scm_module_css_default.branchName,
								style: {
									fontSize: 11,
									color: "var(--aion-text-tertiary)",
									display: "flex",
									alignItems: "center",
									gap: 4
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BranchIcon, { size: 12 }), status.branch]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 2,
									marginLeft: "auto"
								},
								onClick: (event) => event.stopPropagation(),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: scm_module_css_default.sectionAction,
										title: t("scm.stageAll"),
										onClick: () => void scm.stage(unstaged.map((row) => row.path)),
										disabled: unstaged.length === 0,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, { size: 13 })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: scm_module_css_default.sectionAction,
										title: t("scm.discardAll"),
										onClick: () => requestDiscard([...unstaged, ...untracked]),
										disabled: unstaged.length + untracked.length === 0,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UndoIcon, { size: 13 })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: scm_module_css_default.sectionAction,
										title: t("scm.viewList"),
										style: { color: state.viewMode === "list" ? "var(--aion-brand)" : void 0 },
										onClick: () => scm.setViewMode("list"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListIcon, { size: 13 })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: scm_module_css_default.sectionAction,
										title: t("scm.viewTree"),
										style: { color: state.viewMode === "tree" ? "var(--aion-brand)" : void 0 },
										onClick: () => scm.setViewMode("tree"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeIcon, { size: 13 })
									})
								]
							})
						]
					}), changesSectionOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: scm_module_css_default.sectionBody,
						children: [
							!hasChanges && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: scm_module_css_default.empty,
								children: t("scm.empty")
							}),
							hasChanges && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Group, {
								scm,
								preview,
								title: staged.length > 0 ? t("scm.staged") : void 0,
								rows: staged,
								bulkLabel: t("scm.unstage"),
								onBulk: (rows) => void scm.unstage(rows.map((row) => row.path)),
								onDiscard: requestDiscard
							}),
							hasChanges && unstaged.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Group, {
								scm,
								preview,
								rows: unstaged,
								bulkLabel: t("scm.stage"),
								onBulk: (rows) => void scm.stage(rows.map((row) => row.path)),
								onDiscard: requestDiscard
							}),
							untracked.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Group, {
								scm,
								preview,
								title: t("scm.untracked"),
								rows: untracked,
								bulkLabel: t("scm.stage"),
								onBulk: (rows) => void scm.stage(rows.map((row) => row.path)),
								onDiscard: requestDiscard
							})
						]
					})]
				}), discardTargets !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
					title: t("scm.discard"),
					body: allUntracked ? format(t("scm.discardConfirmUntracked"), { count: discardTargets.length }) : format(t("scm.discardConfirmTracked"), { count: discardTargets.length }),
					confirmLabel: t("common.delete"),
					danger: true,
					onConfirm: confirmDiscard,
					onCancel: () => setDiscardTargets(null)
				})]
			});
		}
		/** One change group (staged / unstaged / untracked) with list or tree body. */
		function Group({ scm, preview, rows, title, bulkLabel, onBulk, onDiscard }) {
			const state = useStore(scm);
			const tree = (0, react.useMemo)(() => buildTree(rows), [rows]);
			const viewTree = state.viewMode === "tree";
			const allActionable = rows.filter((row) => row.state !== "conflicted");
			const busySet = (0, react.useMemo)(() => new Set(state.busy), [state.busy]);
			const failedSet = (0, react.useMemo)(() => new Set(state.failed), [state.failed]);
			const expandedSet = (0, react.useMemo)(() => new Set(state.treeExpanded), [state.treeExpanded]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [title !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: scm_module_css_default.groupTitle,
				children: [title, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: scm_module_css_default.groupAction,
					title: bulkLabel,
					onClick: () => onBulk(allActionable),
					disabled: allActionable.length === 0,
					children: bulkLabel === t("scm.unstage") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MinusIcon, { size: 12 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, { size: 12 })
				})]
			}), viewTree ? [...tree.entries()].map(([dir, dirRows]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DirNode, {
				dir,
				rows: dirRows,
				depth: 0,
				state,
				expandedSet,
				busySet,
				failedSet,
				scm,
				preview,
				onDiscard
			}, dir === "" ? "\0" : dir)) : rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChangeRow, {
				row,
				state,
				busy: busySet.has(row.path),
				failed: failedSet.has(row.path),
				scm,
				preview,
				onDiscard
			}, `${row.staged ? "s" : "u"}:${row.path}`))] });
		}
		/** Tree-view directory node (expandable). */
		function DirNode({ dir, rows, depth, state, expandedSet, busySet, failedSet, scm, preview, onDiscard }) {
			const expanded = expandedSet.has(dir);
			const label = dir === "" ? "/" : dir.split("/").pop() ?? dir;
			const toggleExpanded = () => {
				const next = expanded ? state.treeExpanded.filter((item) => item !== dir) : [...state.treeExpanded, dir];
				scm.setTreeExpanded(next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: scm_module_css_default.dirRow,
				style: { paddingLeft: 12 + depth * 12 },
				title: dir,
				role: "button",
				tabIndex: 0,
				"aria-expanded": expanded,
				onClick: toggleExpanded,
				onKeyDown: activateOnKey(toggleExpanded),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `${scm_module_css_default.dirArrow}${expanded ? ` ${scm_module_css_default.dirArrowOpen}` : ""}`,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronRightIcon, { size: 13 })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTypeIcon, {
						name: label,
						isDir: true,
						expanded
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 13,
							color: "var(--aion-text-primary)"
						},
						children: label
					})
				]
			}), expanded && rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChangeRow, {
				row,
				state,
				busy: busySet.has(row.path),
				failed: failedSet.has(row.path),
				scm,
				preview,
				onDiscard,
				indent: depth + 1,
				hideDir: true
			}, `${row.staged ? "s" : "u"}:${row.path}`))] });
		}
		/** One change row: badge + name + dimmed dir + hover actions.
		* Clicking the row opens the path's diff in the preview panel (every state
		* has a diff — deleted rows show the removal, untracked rows a new-file diff).
		*/
		function ChangeRow({ row, state, busy, failed, scm, preview, onDiscard, indent = 0, hideDir = false }) {
			const badge = BADGE[row.state] ?? BADGE.unknown;
			const conflicted = row.state === "conflicted";
			const displayName = row.oldPath !== void 0 ? `${row.oldPath.split("/").pop()} -> ${row.path.split("/").pop()}` : row.path.split("/").pop() ?? row.path;
			const dir = dirOf$1(row.path);
			const openInPreview = () => {
				scm.select(row.path);
				preview.openDiff(state.root, row.path, row.staged);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `${scm_module_css_default.changeRow}${state.selected === row.path ? ` ${scm_module_css_default.changeRowSelected}` : ""}${failed ? ` ${scm_module_css_default.rowFailed}` : ""}`,
				style: { paddingLeft: 12 + indent * 12 },
				title: row.path,
				onClick: openInPreview,
				onKeyDown: activateOnKey(openInPreview),
				role: "button",
				tabIndex: 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `${scm_module_css_default.badge} ${badge.className}`,
						children: badge.letter
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: scm_module_css_default.changeName,
						children: displayName
					}),
					!hideDir && dir !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: scm_module_css_default.changeDir,
						children: dir
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `${scm_module_css_default.rowActions}${busy || failed ? ` ${scm_module_css_default.rowActionsVisible}` : ""}`,
						children: conflicted ? null : row.staged ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: scm_module_css_default.rowAction,
							title: t("scm.unstage"),
							disabled: busy,
							onClick: (event) => {
								event.stopPropagation();
								scm.unstage([row.path]);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MinusIcon, { size: 13 })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: scm_module_css_default.rowAction,
							title: t("scm.discard"),
							disabled: busy,
							onClick: (event) => {
								event.stopPropagation();
								onDiscard([row]);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UndoIcon, { size: 13 })
						})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: scm_module_css_default.rowAction,
							title: t("scm.stage"),
							disabled: busy,
							onClick: (event) => {
								event.stopPropagation();
								scm.stage([row.path]);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, { size: 13 })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: scm_module_css_default.rowAction,
							title: t("scm.discard"),
							disabled: busy,
							onClick: (event) => {
								event.stopPropagation();
								onDiscard([row]);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UndoIcon, { size: 13 })
						})] })
					})
				]
			});
		}
		//#endregion
		//#region src/client/drag/file-drag.ts
		/**
		* Pure drag-to-composer helpers shared by the explorer rows (the drag
		* source) and the composer dock inlay (the drop target): the custom MIME
		* type, the drag-state detector, and the draft-splicing rule. Deliberately
		* framework-free so the splicing math is unit-testable in isolation.
		*
		* The composer host only accepts OS image drops (its document-level drop
		* handler checks `dataTransfer.types` for `Files` and routes through the
		* image pipeline), so a workspace file needs its own MIME. A plain relative
		* path is inserted into the draft — the agent reads the file through its
		* existing tools without any prefix grammar.
		* @module dsh-filemgr/client/drag/file-drag
		*/
		/** Custom MIME carrying a workspace-relative file path. */
		const FILE_DRAG_MIME = "application/x-dsh-file";
		/**
		* Whether a drag event carries our file payload.
		* @param types - the live `dataTransfer.types` list (read-only during drag).
		* @returns true when our MIME is present.
		*/
		function hasFileDrag(types) {
			return types !== void 0 && types.includes("application/x-dsh-file");
		}
		/**
		* Whether a drop payload is a plausible workspace-relative path. The custom
		* MIME only proves the drag carries *some* string — a foreign page can set it
		* too, so the payload itself is validated before it reaches the draft:
		* relative POSIX shape only; no absolute paths, no '..' segments, no
		* backslashes, no control characters, and a sane length.
		* @param path - the raw payload from dataTransfer.
		* @returns true when the payload is safe to splice into the draft.
		*/
		function isValidFileDragPayload(path) {
			if (path === "" || path.length > 512) return false;
			if (path.startsWith("/") || path.includes("\\")) return false;
			if (/[\x00-\x1f\x7f]/.test(path)) return false;
			if (path.split("/").some((segment) => segment === "..")) return false;
			return true;
		}
		/**
		* Splice a workspace-relative path into a composer draft at the caret.
		*
		* Separator rule: one space is added before the path unless the caret sits
		* at the start of the draft or right after whitespace; one space is added
		* after the path unless the caret sits at the end of the draft or right
		* before whitespace. Empty path or an out-of-range caret are no-ops.
		*
		* @param draft - the current draft text.
		* @param path - the relative path to insert.
		* @param caret - insertion offset (default: the end of the draft).
		* @returns the next draft; the caller owns writing it through the input
		* facade.
		*/
		function insertPathIntoDraft(draft, path, caret) {
			if (path === "") return draft;
			const at = caret === void 0 ? draft.length : Math.min(Math.max(caret, 0), draft.length);
			const before = draft.slice(0, at);
			const after = draft.slice(at);
			const needBefore = before !== "" && !/\s$/.test(before);
			const needAfter = after !== "" && !/^\s/.test(after);
			return before + (needBefore ? " " : "") + path + (needAfter ? " " : "") + after;
		}
		//#endregion
		//#region \0dsh-css:src/client/styles/explorer.module.css.mjs
		const css$5 = ".glSFuW_tabBar{z-index:30;border-bottom:1px solid var(--aion-bg-3);background:var(--aion-bg-1);flex-shrink:0;align-items:center;gap:4px;padding:4px 8px 4px 12px;display:flex;position:relative}.glSFuW_tabBtn{height:28px;color:var(--aion-text-secondary);font-size:13px;font-family:var(--aion-font-sans);cursor:pointer;white-space:nowrap;background:0 0;border:none;border-radius:2px;padding:0 8px;transition:background-color .15s cubic-bezier(.4,0,.2,1)}.glSFuW_tabBtn:hover{background:var(--aion-fill-2)}.glSFuW_tabBtn:active{background:var(--aion-bg-active)}.glSFuW_tabBtn:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.glSFuW_tabBtnActive{background:var(--aion-bg-2);height:28px;color:var(--aion-text-primary);font-size:13px;font-family:var(--aion-font-sans);cursor:pointer;white-space:nowrap;border:none;border-radius:2px;padding:0 8px;font-weight:500;transition:background-color .15s cubic-bezier(.4,0,.2,1)}.glSFuW_tabBtnActive:active{background:var(--aion-bg-active)}.glSFuW_tabBtnActive:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.glSFuW_tabIconBtn{width:24px;height:24px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:4px;justify-content:center;align-items:center;margin-right:4px;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.glSFuW_tabIconBtn:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.glSFuW_tabIconBtn:active{background:var(--aion-bg-active)}.glSFuW_tabIconBtn:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.glSFuW_searchArea{flex-shrink:0;padding:8px 8px 4px 12px}.glSFuW_searchBox{background:var(--aion-bg-base);border:1px solid #0000;border-radius:2px;align-items:center;gap:6px;height:28px;padding:0 8px;transition:border-color .15s cubic-bezier(.4,0,.2,1);display:flex}.glSFuW_searchBoxFocus{border-color:var(--aion-primary)}.glSFuW_searchBox:focus-within{box-shadow:0 0 0 2px transparent, 0 0 0 4px var(--aion-primary)}.glSFuW_searchIcon{color:var(--aion-text-secondary);flex-shrink:0;align-items:center;display:flex}.glSFuW_searchInput{min-width:0;height:100%;color:var(--aion-text-primary);font-size:13px;font-family:var(--aion-font-sans);background:0 0;border:none;outline:none;flex:1}.glSFuW_searchInput::placeholder{color:var(--aion-text-tertiary)}.glSFuW_searchClear{width:16px;height:16px;color:var(--aion-text-tertiary);cursor:pointer;background:0 0;border:none;border-radius:2px;justify-content:center;align-items:center;padding:0;display:none}.glSFuW_searchClear:hover{color:var(--aion-text-primary);background:var(--aion-fill-2)}.glSFuW_searchClear:active{background:var(--aion-bg-active)}.glSFuW_searchClear:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.glSFuW_searchAreaFocus .glSFuW_searchClear{display:flex}.glSFuW_scrollArea{flex:1;min-height:0;overflow:hidden auto}.glSFuW_tree{user-select:none;padding:2px 0 8px 12px}.glSFuW_treeRow{cursor:pointer;white-space:nowrap;border-radius:0;align-items:center;gap:4px;min-width:0;height:34px;padding-right:8px;transition:background-color .12s;display:flex}.glSFuW_treeRow:hover{background-color:var(--aion-fill-2)}.glSFuW_treeRow:active{background-color:var(--aion-bg-active)}.glSFuW_treeRowDragging{cursor:grabbing;opacity:.55}.glSFuW_treeRow:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.glSFuW_treeRowSelected,.glSFuW_treeRowSelected:hover{background-color:var(--aion-fill-3)}.glSFuW_treeArrow{width:14px;height:14px;color:var(--aion-text-tertiary);flex-shrink:0;justify-content:center;align-items:center;transition:transform .15s cubic-bezier(.4,0,.2,1);display:flex}.glSFuW_treeArrowOpen{transform:rotate(90deg)}.glSFuW_treeArrowEmpty{visibility:hidden}.glSFuW_treeName{text-overflow:ellipsis;color:var(--aion-text-primary);font-size:13px;overflow:hidden}.glSFuW_refBtn{width:20px;height:20px;color:var(--aion-text-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;margin-left:4px;padding:0;font-size:13px;line-height:1;transition:background-color .12s,color .12s;display:none}.glSFuW_treeRow:hover .glSFuW_refBtn,.glSFuW_refBtn:focus-visible{display:flex}.glSFuW_refBtn:hover{background:var(--aion-bg-3);color:var(--aion-primary)}.glSFuW_refBtn:active{background:var(--aion-bg-active)}.glSFuW_refBtn:focus-visible{outline:2px solid var(--aion-primary);outline-offset:1px}.glSFuW_treeRowSelected .glSFuW_treeName{color:var(--aion-text-primary)}.glSFuW_treeMeta{color:var(--aion-text-tertiary);flex-shrink:0;margin-left:auto;padding-right:4px;font-size:11px}.glSFuW_resultRow{cursor:pointer;white-space:nowrap;align-items:center;gap:6px;height:30px;padding:0 8px 0 12px;transition:background-color .12s;display:flex}.glSFuW_resultRow:hover{background-color:var(--aion-fill-2)}.glSFuW_resultRow:active{background-color:var(--aion-bg-active)}.glSFuW_resultRow:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.glSFuW_resultName{text-overflow:ellipsis;color:var(--aion-text-primary);font-size:13px;overflow:hidden}.glSFuW_resultPath{text-overflow:ellipsis;color:var(--aion-text-tertiary);flex-shrink:1;min-width:0;font-size:11px;overflow:hidden}.glSFuW_resultMeta{color:var(--aion-text-tertiary);flex-shrink:0;font-size:11px}.glSFuW_searchStatus{color:var(--aion-text-tertiary);padding:12px;font-size:12px}.glSFuW_emptyState{color:var(--aion-text-tertiary);text-align:center;padding:24px 16px;font-size:12px}";
		const tagId$5 = "@lijian-ui/dsh-file-manager/explorer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var explorer_module_css_default = {
			"emptyState": "glSFuW_emptyState",
			"refBtn": "glSFuW_refBtn",
			"resultMeta": "glSFuW_resultMeta",
			"resultName": "glSFuW_resultName",
			"resultPath": "glSFuW_resultPath",
			"resultRow": "glSFuW_resultRow",
			"scrollArea": "glSFuW_scrollArea",
			"searchArea": "glSFuW_searchArea",
			"searchAreaFocus": "glSFuW_searchAreaFocus",
			"searchBox": "glSFuW_searchBox",
			"searchBoxFocus": "glSFuW_searchBoxFocus",
			"searchClear": "glSFuW_searchClear",
			"searchIcon": "glSFuW_searchIcon",
			"searchInput": "glSFuW_searchInput",
			"searchStatus": "glSFuW_searchStatus",
			"tabBar": "glSFuW_tabBar",
			"tabBtn": "glSFuW_tabBtn",
			"tabBtnActive": "glSFuW_tabBtnActive",
			"tabIconBtn": "glSFuW_tabIconBtn",
			"tree": "glSFuW_tree",
			"treeArrow": "glSFuW_treeArrow",
			"treeArrowEmpty": "glSFuW_treeArrowEmpty",
			"treeArrowOpen": "glSFuW_treeArrowOpen",
			"treeMeta": "glSFuW_treeMeta",
			"treeName": "glSFuW_treeName",
			"treeRow": "glSFuW_treeRow",
			"treeRowDragging": "glSFuW_treeRowDragging",
			"treeRowSelected": "glSFuW_treeRowSelected"
		};
		//#endregion
		//#region \0dsh-css:src/client/styles/tokens.module.css.mjs
		const css$4 = ":root{--aion-bg-base:#fff;--aion-bg-1:#f9fafb;--aion-bg-2:#f2f3f5;--aion-bg-3:#e5e6eb;--aion-bg-hover:#f3f4f6;--aion-bg-active:#e5e6eb;--aion-text-primary:#000;--aion-text-secondary:#454d5f;--aion-text-tertiary:#86909c;--aion-text-disabled:#c9cdd4;--aion-primary:#165dff;--aion-success:#00b42a;--aion-warning:#ff7d00;--aion-danger:#f53f3f;--aion-brand:#7583b2;--aion-aou-1:#eff0f6;--aion-aou-2:#e5e7f0;--aion-aou-3:#d1d5e5;--aion-aou-4:#b5bcd6;--aion-aou-5:#97a0c5;--aion-aou-6:#7583b2;--aion-fill-2:#f2f3f5;--aion-fill-3:#e5e6eb;--aion-border-base:#e5e6eb;--aion-overlay-shadow:0 8px 24px #0f172a1f;--aion-font-sans:-apple-system, \"system-ui\", \"Segoe UI\", Roboto, \"Helvetica Neue\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif;--aion-font-mono:ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace}body[data-ds-dark-theme]{--aion-bg-base:#0e0e0e;--aion-bg-1:#1a1a1a;--aion-bg-2:#262626;--aion-bg-3:#333;--aion-bg-hover:#1f1f1f;--aion-bg-active:#2d2d2d;--aion-text-primary:#fff;--aion-text-secondary:#ced3da;--aion-text-tertiary:#737373;--aion-text-disabled:#737373;--aion-primary:#4d9fff;--aion-success:#23c343;--aion-warning:#ff9a2e;--aion-danger:#f76560;--aion-brand:#a1aacb;--aion-aou-1:#2a2a2a;--aion-aou-2:#3d4150;--aion-aou-3:#525a77;--aion-aou-4:#6a749b;--aion-aou-5:#838fba;--aion-aou-6:#a1aacb;--aion-fill-2:#ffffff14;--aion-fill-3:#ffffff1f;--aion-border-base:#333;--aion-overlay-shadow:0 12px 32px #00000073;color-scheme:dark}.filemgr-root{font-family:var(--aion-font-sans);color:var(--aion-text-primary);background-color:var(--aion-bg-1);font-size:13px}.filemgr-root *,.filemgr-root :before,.filemgr-root :after{box-sizing:border-box}.filemgr-root ::-webkit-scrollbar{width:8px;height:8px}.filemgr-root ::-webkit-scrollbar-thumb{background:var(--aion-bg-3);border-radius:4px}.filemgr-root ::-webkit-scrollbar-thumb:hover{background:var(--aion-bg-4,#c9cdd4)}.filemgr-root ::-webkit-scrollbar-track{background:0 0}@media (prefers-reduced-motion:reduce){.filemgr-root *,.filemgr-root :before,.filemgr-root :after{transition:none!important;animation:none!important}}[data-dsh-frame][data-filemgr-instant]{transition:none!important}.filemgr-preview-col,.filemgr-explorer-col{background-color:var(--aion-bg-1);z-index:30;flex-direction:column;min-width:0;display:flex;overflow:hidden}.filemgr-preview-col{border-left:1px solid var(--aion-bg-3)}.filemgr-preview-col.filemgr-maximized,.filemgr-explorer-col.filemgr-maximized{z-index:60;inset:0;position:fixed!important}.filemgr-explorer-col{border-left:1px solid var(--aion-bg-3)}.filemgr-preview-col.filemgr-preview-enter{animation:.25s cubic-bezier(.4,0,.2,1) aPVr2q_filemgr-preview-enter}@keyframes aPVr2q_filemgr-preview-enter{0%{opacity:0;transform:translate(20px)}to{opacity:1;transform:translate(0)}}.filemgr-explorer-handle,.filemgr-preview-handle{touch-action:none}.filemgr-explorer-handle:after,.filemgr-preview-handle:after{content:\"\";background-color:var(--aion-bg-3);opacity:.9;pointer-events:none;border-radius:9999px;width:2px;transition:width .15s cubic-bezier(.4,0,.2,1),background-color .15s cubic-bezier(.4,0,.2,1);position:absolute;top:0;bottom:0;left:0}.filemgr-explorer-handle:hover:after,.filemgr-explorer-handle:active:after,.filemgr-preview-handle:hover:after,.filemgr-preview-handle:active:after{background-color:var(--aion-brand);width:6px}.filemgr-preview-handle:after{opacity:.3;left:auto;right:0}.filemgr-preview-handle:hover:after,.filemgr-preview-handle:active:after{opacity:1}.filemgr-floating-expand{top:calc(6px + env(aPVr2q_titlebar-area-height,0px));background-color:var(--aion-bg-2);width:24px;height:24px;color:var(--aion-text-secondary);cursor:pointer;z-index:100;border:none;border-radius:4px;justify-content:center;align-items:center;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:none;position:fixed;right:8px;box-shadow:0 2px 8px #0000001f}.filemgr-floating-expand:hover{background-color:var(--aion-bg-3);color:var(--aion-text-primary)}.filemgr-floating-expand:active{background-color:var(--aion-bg-active)}.filemgr-floating-expand:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.filemgr-collapse-chevron{top:calc(6px + env(aPVr2q_titlebar-area-height,0px));z-index:30;width:24px;height:24px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:4px;justify-content:center;align-items:center;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex;position:absolute;right:8px}.filemgr-collapse-chevron:hover{background-color:var(--aion-bg-3);color:var(--aion-text-primary)}.filemgr-collapse-chevron:active{background-color:var(--aion-bg-active)}.filemgr-collapse-chevron:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.filemgr-overlay{z-index:1000;background:#00000059;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.filemgr-dialog{background:var(--aion-bg-base);width:400px;max-width:calc(100vw - 48px);box-shadow:var(--aion-overlay-shadow);font-family:var(--aion-font-sans);border-radius:16px;overflow:hidden}.filemgr-dialog-title{color:var(--aion-text-primary);padding:16px 20px 8px;font-size:14px;font-weight:600}.filemgr-dialog-body{color:var(--aion-text-secondary);padding:0 20px;font-size:13px;line-height:1.6}.filemgr-dialog-actions{justify-content:flex-end;gap:8px;padding:16px 20px 20px;display:flex}.filemgr-btn{border:1px solid var(--aion-bg-3);background:var(--aion-bg-base);height:28px;color:var(--aion-text-primary);cursor:pointer;border-radius:4px;padding:0 14px;font-size:13px;transition:background-color .15s cubic-bezier(.4,0,.2,1)}.filemgr-btn:hover{background:var(--aion-bg-hover)}.filemgr-btn:active{background:var(--aion-bg-active)}.filemgr-btn:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.filemgr-btn-primary{background:var(--aion-primary);border-color:var(--aion-primary);color:#fff}.filemgr-btn-primary:hover{background:var(--aion-primary);opacity:.9}.filemgr-btn-primary:active{opacity:.75;filter:saturate(.9)}.filemgr-btn-danger{background:var(--aion-danger);border-color:var(--aion-danger);color:#fff}.filemgr-btn-danger:hover{opacity:.9}.filemgr-btn-danger:active{opacity:.75}.filemgr-menu{z-index:1100;background:var(--aion-bg-base);min-width:160px;box-shadow:var(--aion-overlay-shadow);border:1px solid var(--aion-bg-3);font-family:var(--aion-font-sans);border-radius:8px;padding:4px;position:fixed}.filemgr-menu-item{height:28px;color:var(--aion-text-primary);cursor:pointer;white-space:nowrap;border-radius:4px;align-items:center;padding:0 10px;font-size:13px;display:flex}.filemgr-menu-item:hover{background:var(--aion-fill-2)}.filemgr-menu-item:focus-visible{outline:2px solid var(--aion-primary);outline-offset:-2px}.filemgr-menu-item-disabled{color:var(--aion-text-disabled);cursor:default}.filemgr-menu-item-disabled:hover{background:0 0}.filemgr-menu-sep{background:var(--aion-bg-3);height:1px;margin:4px 8px}.filemgr-input{border:1px solid var(--aion-bg-3);background:var(--aion-bg-base);width:100%;height:32px;color:var(--aion-text-primary);font-size:13px;font-family:var(--aion-font-sans);box-sizing:border-box;border-radius:6px;outline:none;padding:0 10px}.filemgr-input:focus{border-color:var(--aion-primary)}.filemgr-toast{z-index:1200;background:var(--aion-bg-base);max-width:70vw;color:var(--aion-text-primary);font-size:13px;font-family:var(--aion-font-sans);box-shadow:var(--aion-overlay-shadow);border:1px solid var(--aion-bg-3);border-radius:6px;padding:8px 14px;animation:.2s cubic-bezier(.4,0,.2,1) aPVr2q_filemgr-toast-in;position:fixed;bottom:32px;left:50%;transform:translate(-50%)}@keyframes aPVr2q_filemgr-toast-in{0%{opacity:0;transform:translate(-50%)translateY(8px)}to{opacity:1;transform:translate(-50%)translateY(0)}}";
		const tagId$4 = "@lijian-ui/dsh-file-manager/tokens.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/components/ExplorerPanel.tsx
		/**
		* The Explorer column: Files/Changes tab bar (37px), the persistent filename
		* search at the top of the Files tab (150ms debounced; a hit click REVEALS
		* the file in the tree — expand ancestors + select — never opens preview),
		* the lazy file tree (34px rows, full-row expand/collapse, 16px icons), and
		* the in-column collapse chevron.
		*
		* FileManager Explorer behavior (Apache-2.0, re-implemented): row click toggles
		* folders (no need to hit the arrow), search results are reveal-only, and
		* clicking a file opens it in the preview panel (dedup focuses the tab).
		* @module dsh-filemgr/client/components/ExplorerPanel
		*/
		/** Row indent step per tree depth (px). */
		const INDENT_STEP = 16;
		/**
		* The whole explorer column content.
		* @param stores - the panel store bundle.
		* @param onToggleCollapse - collapse the column (host chrome).
		*/
		function ExplorerPanel({ stores, onToggleCollapse, onReference }) {
			const state = useStore(stores.explorer);
			const maximizedExplorer = useStore(stores.layout).maximized === "explorer";
			const [searchFocus, setSearchFocus] = (0, react.useState)(false);
			const [menu, setMenu] = (0, react.useState)(null);
			const [prompt, setPrompt] = (0, react.useState)(null);
			const [deleteTarget, setDeleteTarget] = (0, react.useState)(null);
			/** Absolute path of one entry (root + rel), for copy/reveal. */
			const absolutePath = (entry) => {
				const basePath = state.root.replace(/[\\/]+$/, "");
				const sep = state.root.includes("\\") ? "\\" : "/";
				return entry.path === "" ? basePath : `${basePath}${sep}${entry.path.split("/").join(sep)}`;
			};
			const copyText = async (text) => {
				try {
					await navigator.clipboard.writeText(text);
					toast(t("common.copied"));
				} catch {
					toast(t("explorer.opFailed"));
				}
			};
			/**
			* Open the file-tree context menu. Stable across re-renders (useCallback
			* on root + stores) so the memoized tree rows do not re-render when the
			* panel state changes.
			*/
			const openMenu = (0, react.useCallback)((event, entry) => {
				event.preventDefault();
				event.stopPropagation();
				const explorerStore = stores.explorer;
				explorerStore.select(entry.path);
				const parent = parentRel(entry.path);
				const createTarget = entry.isDir ? entry.path : parent;
				const entries = [
					{
						key: "copy-path",
						label: t("explorer.menu.copyPath"),
						onSelect: () => void copyText(absolutePath(entry))
					},
					{
						key: "copy-name",
						label: t("explorer.menu.copyName"),
						onSelect: () => void copyText(entry.name)
					},
					{
						key: "sep-1",
						label: "---"
					},
					{
						key: "reveal",
						label: t("explorer.menu.reveal"),
						onSelect: () => {
							explorerStore.revealInFileManager(entry.path).then((ok) => {
								if (!ok) toast(t("explorer.opFailed"));
							});
						}
					}
				];
				if (!entry.isDir) entries.push({
					key: "open-with-default",
					label: t("explorer.menu.openWithDefault"),
					onSelect: () => {
						explorerStore.openWithDefaultApp(entry.path).then((ok) => {
							if (!ok) toast(t("explorer.opFailed"));
						});
					}
				});
				entries.push({
					key: "sep-2",
					label: "---"
				}, {
					key: "rename",
					label: t("explorer.menu.rename"),
					onSelect: () => setPrompt({
						kind: "rename",
						targetRel: entry.path,
						initialValue: entry.name
					})
				}, {
					key: "new-file",
					label: t("explorer.menu.newFile"),
					onSelect: () => setPrompt({
						kind: "newFile",
						targetRel: createTarget,
						initialValue: ""
					})
				}, {
					key: "new-folder",
					label: t("explorer.menu.newFolder"),
					onSelect: () => setPrompt({
						kind: "newFolder",
						targetRel: createTarget,
						initialValue: ""
					})
				}, {
					key: "sep-3",
					label: "---"
				}, {
					key: "delete",
					label: t("explorer.menu.delete"),
					danger: true,
					onSelect: () => setDeleteTarget(entry)
				});
				setMenu({
					x: event.clientX,
					y: event.clientY,
					entries
				});
			}, [state.root, stores]);
			const submitPrompt = (value) => {
				if (prompt === null) return;
				const { kind, targetRel } = prompt;
				const name = value.trim();
				if (name === "") return;
				(kind === "rename" ? stores.explorer.renameEntry(prompt.targetRel, name) : kind === "newFolder" ? stores.explorer.createDir(targetRel === "" ? name : `${targetRel}/${name}`) : stores.explorer.createFile(targetRel === "" ? name : `${targetRel}/${name}`)).then((ok) => {
					if (!ok) toast(t("explorer.opFailed"));
				});
				setPrompt(null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "filemgr-root",
				style: {
					display: "flex",
					flexDirection: "column",
					height: "100%",
					minHeight: 0
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: explorer_module_css_default.tabBar,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: state.activeTab === "files" ? explorer_module_css_default.tabBtnActive : explorer_module_css_default.tabBtn,
								onClick: () => stores.explorer.setActiveTab("files"),
								children: t("explorer.tabs.files")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: state.activeTab === "changes" ? explorer_module_css_default.tabBtnActive : explorer_module_css_default.tabBtn,
								onClick: () => stores.explorer.setActiveTab("changes"),
								children: t("explorer.tabs.changes")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: explorer_module_css_default.tabIconBtn,
								style: { marginLeft: "auto" },
								onClick: () => {
									stores.layout.update((prev) => ({
										...prev,
										maximized: maximizedExplorer ? null : "explorer"
									}));
								},
								title: t(maximizedExplorer ? "explorer.restore" : "explorer.maximize"),
								"aria-label": t(maximizedExplorer ? "explorer.restore" : "explorer.maximize"),
								children: maximizedExplorer ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RestoreIcon, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MaximizeIcon, { size: 14 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "filemgr-collapse-chevron",
								onClick: onToggleCollapse,
								title: t("explorer.collapse"),
								"aria-label": t("explorer.collapse"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExpandRightIcon, { size: 16 })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: state.activeTab === "files" ? "flex" : "none",
							flexDirection: "column",
							flex: 1,
							minHeight: 0
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchArea, {
							stores,
							searchFocus,
							onFocusChange: setSearchFocus
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTree, {
							stores,
							onContextMenu: openMenu,
							onReference
						})]
					}),
					state.activeTab === "changes" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScmPanel, { stores }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ContextMenu, {
						state: menu,
						onClose: () => setMenu(null)
					}),
					prompt !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PromptDialog, {
						title: t(prompt.kind === "rename" ? "explorer.rename.title" : prompt.kind === "newFolder" ? "explorer.newFolder.title" : "explorer.newFile.title"),
						initialValue: prompt.initialValue,
						onConfirm: submitPrompt,
						onCancel: () => setPrompt(null)
					}),
					deleteTarget !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
						title: t("explorer.deleteConfirmTitle"),
						body: t("explorer.deleteConfirmBody", { name: deleteTarget.name }),
						danger: true,
						onConfirm: () => {
							const target = deleteTarget;
							setDeleteTarget(null);
							stores.explorer.deleteEntry(target.path).then((ok) => {
								if (!ok) toast(t("explorer.opFailed"));
							});
						},
						onCancel: () => setDeleteTarget(null)
					})
				]
			});
		}
		/** The search box + results (the tree stays mounted underneath). */
		function SearchArea({ stores, searchFocus, onFocusChange }) {
			const explorer = stores.explorer;
			const search = useStore(explorer).search;
			const active = search.query !== "";
			const inputRef = (0, react.useRef)(null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					minHeight: 0,
					flex: active ? 1 : void 0
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: explorer_module_css_default.searchArea,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${explorer_module_css_default.searchBox}${searchFocus ? ` ${explorer_module_css_default.searchAreaFocus}` : ""}`,
						style: { borderColor: searchFocus ? "var(--aion-primary)" : void 0 },
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: explorer_module_css_default.searchIcon,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchIcon, { size: 14 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: inputRef,
								className: explorer_module_css_default.searchInput,
								value: search.query,
								placeholder: t("explorer.search.placeholder"),
								"aria-label": t("explorer.search.placeholder"),
								onFocus: () => onFocusChange(true),
								onBlur: () => onFocusChange(false),
								onChange: (event) => explorer.setSearchQuery(event.target.value)
							}),
							search.query !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: explorer_module_css_default.searchClear,
								onClick: () => {
									explorer.cancelSearch();
									inputRef.current?.focus();
								},
								"aria-label": t("common.close"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 12 })
							})
						]
					})
				}), active ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchResults, { stores }) : null]
			});
		}
		/** The flat search-result stream (click = reveal in tree). */
		function SearchResults({ stores }) {
			const explorer = stores.explorer;
			const search = useStore(explorer).search;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: explorer_module_css_default.scrollArea,
				children: [
					search.status === "searching" && search.hits.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.searchStatus,
						children: t("explorer.search.searching")
					}),
					search.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.searchStatus,
						children: t("explorer.search.error")
					}),
					search.status === "done" && search.hits.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.searchStatus,
						children: t("explorer.search.empty")
					}),
					search.hits.map((hit) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: explorer_module_css_default.resultRow,
						role: "button",
						tabIndex: 0,
						title: hit.path,
						onClick: () => {
							explorer.reveal(hit.path);
						},
						onKeyDown: activateOnKey(() => {
							explorer.reveal(hit.path);
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTypeIcon, {
								name: hit.name,
								isDir: hit.isDir,
								expanded: false
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: explorer_module_css_default.resultName,
								children: hit.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: explorer_module_css_default.resultPath,
								children: parentRel(hit.path)
							})
						]
					}, hit.path)),
					search.truncated && search.hits.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.searchStatus,
						children: t("explorer.search.truncated", { count: search.hits.length })
					})
				]
			});
		}
		/** The lazy file tree. */
		function FileTree({ stores, onContextMenu, onReference }) {
			const explorer = stores.explorer;
			stores.preview;
			const state = useStore(explorer);
			const root = state.root;
			const expandedSet = (0, react.useMemo)(() => new Set(state.expanded), [state.expanded]);
			if (root === "") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: explorer_module_css_default.emptyState,
				children: t("explorer.tree.empty")
			});
			const entries = state.dirs[""];
			if (entries === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: explorer_module_css_default.searchStatus,
				children: t("scm.loading")
			});
			if (entries.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: explorer_module_css_default.emptyState,
				children: t("explorer.tree.empty")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `${explorer_module_css_default.scrollArea} ${explorer_module_css_default.tree}`,
				children: entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeRow, {
					entry,
					depth: 0,
					expanded: expandedSet,
					selected: state.selected,
					dirs: state.dirs,
					root: state.root,
					stores,
					onContextMenu,
					onReference
				}, entry.path))
			});
		}
		/** One tree row (recursive for children). */
		function TreeRowBase({ entry, depth, expanded, selected, dirs, root, stores, onContextMenu, onReference }) {
			const explorer = stores.explorer;
			const preview = stores.preview;
			const isExpanded = expanded.has(entry.path);
			const isSelected = selected === entry.path;
			const children = entry.isDir ? dirs[entry.path] : void 0;
			const [draggingRow, setDraggingRow] = (0, react.useState)(false);
			const handleClick = () => {
				if (entry.isDir) {
					explorer.toggleDir(entry.path);
					return;
				}
				explorer.select(entry.path);
				preview.openFile(root, entry.path);
			};
			const onDragStart = (event) => {
				if (entry.isDir) return;
				event.dataTransfer.setData(FILE_DRAG_MIME, entry.path);
				event.dataTransfer.setData("text/plain", entry.path);
				event.dataTransfer.effectAllowed = "copy";
				setDraggingRow(true);
			};
			const onDragEnd = () => {
				setDraggingRow(false);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `${explorer_module_css_default.treeRow}${isSelected ? ` ${explorer_module_css_default.treeRowSelected}` : ""}${draggingRow ? ` ${explorer_module_css_default.treeRowDragging}` : ""}`,
				style: { paddingLeft: 20 + depth * INDENT_STEP },
				onClick: handleClick,
				onKeyDown: activateOnKey(handleClick),
				onContextMenu: (event) => onContextMenu(event, entry),
				onDoubleClick: (event) => {
					event.stopPropagation();
				},
				draggable: !entry.isDir,
				onDragStart,
				onDragEnd,
				role: "button",
				tabIndex: 0,
				"aria-expanded": entry.isDir ? isExpanded : void 0,
				title: entry.path,
				children: [
					entry.isDir ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `${explorer_module_css_default.treeArrow}${isExpanded ? ` ${explorer_module_css_default.treeArrowOpen}` : ""}`,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronRightIcon, { size: 13 })
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: explorer_module_css_default.treeArrowEmpty }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTypeIcon, {
						name: entry.name,
						isDir: entry.isDir,
						expanded: isExpanded
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: explorer_module_css_default.treeName,
						children: entry.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: explorer_module_css_default.refBtn,
						title: t("explorer.refToInput"),
						"aria-label": t("explorer.refToInput"),
						onClick: (event) => {
							event.stopPropagation();
							event.preventDefault();
							onReference(entry.path, entry.isDir);
						},
						onMouseDown: (event) => event.stopPropagation(),
						children: "@"
					})
				]
			}), entry.isDir && isExpanded && children !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeRow, {
				entry: child,
				depth: depth + 1,
				expanded,
				selected,
				dirs,
				root,
				stores,
				onContextMenu,
				onReference
			}, child.path)) })] });
		}
		/**
		* A memoized tree row so the whole tree does not re-render on every explorer
		* state change (search keystrokes, tab switches, fs version bumps). The row
		* takes the `state` fields it actually reads as individual props — `expanded`,
		* `selected`, `dirs` — whose references only change when the corresponding
		* data changed, so the default shallow comparison skips rows whose own entry,
		* ancestor, expansion or selection are unaffected. A `dirs` re-fetch (an fs
		* event that relists the expanded dirs) still re-renders the rows under those
		* dirs — the unavoidable O(open-dirs) cost — but transient UI state no longer
		* invalidates the tree.
		*/
		const TreeRow = (0, react.memo)(TreeRowBase, (prev, next) => prev.expanded.has(prev.entry.path) === next.expanded.has(next.entry.path) && prev.entry === next.entry && prev.depth === next.depth && prev.selected === next.selected && prev.dirs === next.dirs && prev.root === next.root && prev.stores === next.stores && prev.onContextMenu === next.onContextMenu && prev.onReference === next.onReference);
		//#endregion
		//#region \0dsh-css:src/client/styles/preview.module.css.mjs
		const css$3 = ".Jov5oa_panel{background:var(--aion-bg-1);flex-direction:column;height:100%;min-height:0;display:flex}.Jov5oa_tabBar{z-index:30;background:var(--aion-bg-2);border-bottom:1px solid var(--aion-bg-3);flex-shrink:0;align-items:stretch;height:36px;display:flex;position:relative}.Jov5oa_tabScroll{scrollbar-width:none;flex:1;align-items:stretch;min-width:0;display:flex;overflow:auto hidden}.Jov5oa_tabScroll::-webkit-scrollbar{display:none}.Jov5oa_tab{cursor:pointer;user-select:none;border-right:1px solid #0000;flex-shrink:0;align-items:center;gap:6px;max-width:180px;height:100%;padding:0 10px;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.Jov5oa_tabActive{background:var(--aion-bg-1);color:var(--aion-text-primary)}.Jov5oa_tabInactive{color:var(--aion-text-secondary)}.Jov5oa_tabInactive:hover{background:var(--aion-bg-3)}.Jov5oa_tab:active{background:var(--aion-bg-active)}.Jov5oa_tab:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.Jov5oa_tabTitle{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:12px;overflow:hidden}.Jov5oa_tabFavicon{object-fit:contain;border-radius:2px;flex-shrink:0;width:12px;height:12px}.Jov5oa_tabDot{border-radius:9999px;flex-shrink:0;width:6px;height:6px}.Jov5oa_tabDotDirty{background:var(--aion-primary);border-radius:9999px;flex-shrink:0;width:6px;height:6px}.Jov5oa_tabDotAgent{background:var(--aion-success);border-radius:9999px;flex-shrink:0;width:6px;height:6px;animation:1.6s ease-in-out infinite Jov5oa_filemgr-pulse}@keyframes Jov5oa_filemgr-pulse{0%,to{opacity:1}50%{opacity:.4}}.Jov5oa_tabClose{width:16px;height:16px;color:var(--aion-text-secondary);border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.Jov5oa_tabClose:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.Jov5oa_tabClose:active{background:var(--aion-bg-active)}.Jov5oa_tabClose:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.Jov5oa_tabPlus{width:24px;height:24px;color:var(--aion-text-secondary);cursor:pointer;border-radius:4px;flex-shrink:0;justify-content:center;align-self:center;align-items:center;margin:0 4px;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.Jov5oa_tabPlus:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.Jov5oa_tabPlus:active{background:var(--aion-bg-active)}.Jov5oa_tabPlus:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.Jov5oa_tabBarRight{flex-shrink:0;align-items:center;gap:6px;padding:0 10px;display:flex}.Jov5oa_panelCollapse,.Jov5oa_panelMaximize{width:20px;height:20px;color:var(--aion-text-secondary);cursor:pointer;border-radius:4px;justify-content:center;align-items:center;transition:background-color .15s cubic-bezier(.4,0,.2,1);display:flex}.Jov5oa_panelCollapse:hover,.Jov5oa_panelMaximize:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.Jov5oa_panelCollapse:active,.Jov5oa_panelMaximize:active{background:var(--aion-bg-active)}.Jov5oa_panelCollapse:focus-visible,.Jov5oa_panelMaximize:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.Jov5oa_tabFade{pointer-events:none;z-index:2;width:32px;position:absolute;top:0;bottom:0}.Jov5oa_tabFadeLeft{pointer-events:none;z-index:2;background:linear-gradient(90deg, var(--aion-bg-2) 0%, transparent 100%);width:32px;position:absolute;top:0;bottom:0;left:0}.Jov5oa_tabFadeRight{pointer-events:none;z-index:2;background:linear-gradient(270deg, var(--aion-bg-2) 0%, transparent 100%);width:32px;position:absolute;top:0;bottom:0;right:0}.Jov5oa_noTabs{color:var(--aion-text-tertiary);flex:1;align-items:center;padding:0 10px;font-size:12px;display:flex}.Jov5oa_toolbar{background:var(--aion-bg-2);border-bottom:1px solid var(--aion-bg-3);scrollbar-width:none;flex-shrink:0;align-items:center;gap:2px;height:32px;padding:0 10px;display:flex;overflow-x:auto}.Jov5oa_toolbar::-webkit-scrollbar{display:none}.Jov5oa_toolbarSpacer{flex:1}.Jov5oa_toolbarBtn{height:24px;color:var(--aion-text-secondary);font-size:12px;font-family:var(--aion-font-sans);cursor:pointer;white-space:nowrap;background:0 0;border:none;border-radius:4px;flex-shrink:0;align-items:center;gap:4px;padding:0 8px;transition:background-color .15s cubic-bezier(.4,0,.2,1),color .15s cubic-bezier(.4,0,.2,1);display:flex}.Jov5oa_toolbarBtn:hover{background:var(--aion-bg-3);color:var(--aion-text-primary)}.Jov5oa_toolbarBtn:active{background:var(--aion-bg-active);color:var(--aion-text-primary)}.Jov5oa_toolbarBtn:focus-visible{outline:2px solid var(--aion-primary);outline-offset:2px}.Jov5oa_toolbarBtn:disabled{opacity:.4;cursor:default}.Jov5oa_toolbarBtn:disabled:hover{color:var(--aion-text-secondary);background:0 0}.Jov5oa_toolbarBtnActive{color:var(--aion-brand);background:var(--aion-aou-2);border-bottom:4px solid var(--aion-brand)}.Jov5oa_toolbarBtnWarn{color:var(--aion-warning)}.Jov5oa_content{flex-direction:column;flex:1;min-height:0;display:flex;position:relative}.Jov5oa_mdViewer{min-height:0;color:var(--aion-text-primary);word-wrap:break-word;flex:1;padding:16px 20px 32px;font-size:15px;line-height:1.7;overflow:hidden auto}.Jov5oa_mdViewer h1{border-bottom:1px solid var(--aion-bg-3);margin:24px 0 12px;padding-bottom:8px;font-size:24px;font-weight:600;line-height:1.3}.Jov5oa_mdViewer h1:first-child{margin-top:4px}.Jov5oa_mdViewer h2{margin:22px 0 10px;font-size:20px;font-weight:600;line-height:1.3}.Jov5oa_mdViewer h3{margin:18px 0 8px;font-size:17px;font-weight:600;line-height:1.3}.Jov5oa_mdViewer h4,.Jov5oa_mdViewer h5,.Jov5oa_mdViewer h6{margin:14px 0 6px;font-size:15px;font-weight:600;line-height:1.3}.Jov5oa_mdViewer p{margin:8px 0}.Jov5oa_mdViewer ul,.Jov5oa_mdViewer ol{margin:8px 0;padding-left:24px}.Jov5oa_mdViewer li{margin:3px 0}.Jov5oa_mdViewer code{font-family:var(--aion-font-mono);background:var(--aion-bg-2);color:var(--aion-text-primary);border-radius:3px;padding:1px 5px;font-size:.9em}.Jov5oa_mdViewer pre{background:var(--aion-bg-2);border-radius:6px;margin:10px 0;padding:12px 14px;line-height:1.5;overflow-x:auto}.Jov5oa_mdViewer pre code{color:var(--aion-text-primary);background:0 0;padding:0;font-size:13px}.Jov5oa_mermaidBlock{background:var(--aion-bg-2);border:1px solid var(--aion-bg-3);text-align:center;border-radius:6px;margin:10px 0;padding:12px 14px;overflow-x:auto}.Jov5oa_mermaidBlock svg{max-width:100%;height:auto}.Jov5oa_mermaidBlock[data-mermaid-state=pending],.Jov5oa_mermaidBlock[data-mermaid-state=rendering]{opacity:.6;min-height:40px}.Jov5oa_mdViewer blockquote{border-left:3px solid var(--aion-bg-3);color:var(--aion-text-secondary);margin:10px 0;padding:4px 14px}.Jov5oa_mdViewer blockquote p{margin:4px 0}.Jov5oa_mdViewer a{color:var(--aion-primary);text-decoration:none}.Jov5oa_mdViewer a:hover{text-decoration:underline}.Jov5oa_mdViewer hr{border:none;border-top:1px solid var(--aion-bg-3);margin:20px 0}.Jov5oa_mdViewer table{border-collapse:collapse;width:100%;margin:10px 0;font-size:14px}.Jov5oa_mdViewer th,.Jov5oa_mdViewer td{border:1px solid var(--aion-bg-3);text-align:left;padding:6px 10px}.Jov5oa_mdViewer th{background:var(--aion-bg-2);font-weight:600}.Jov5oa_mdViewer img{border-radius:4px;max-width:100%}.Jov5oa_addToChat{z-index:1000;background:var(--aion-primary);color:#fff;font-size:13px;font-weight:500;font-family:var(--aion-font-sans);cursor:pointer;box-shadow:var(--aion-overlay-shadow);user-select:none;white-space:nowrap;border-radius:6px;padding:6px 12px;position:fixed}.Jov5oa_addToChat:hover{filter:brightness(1.1)}.Jov5oa_codeShell{flex:1;align-items:stretch;min-height:0;display:flex;overflow:auto}.Jov5oa_lineGutter{z-index:2;background:var(--aion-bg-1);border-right:1px solid var(--aion-border-base);text-align:right;user-select:none;font-family:var(--aion-font-mono);color:var(--aion-text-tertiary);flex:none;padding:10px 10px 10px 12px;font-size:12px;line-height:1.6;position:sticky;left:0}.Jov5oa_lineNo{height:1.6em;line-height:1.6em}.Jov5oa_codeBody{flex:1;min-width:0;display:flex}.Jov5oa_codeBody .Jov5oa_codeViewer{flex:1;min-width:0;position:relative;overflow:visible}.Jov5oa_codeBody .Jov5oa_codeViewer>div:first-child{z-index:3;position:absolute;top:6px;right:8px}.Jov5oa_codeBody pre{font-family:var(--aion-font-mono)!important;background:0 0!important;border-radius:0!important;margin:0!important;padding:10px 12px!important;font-size:12px!important;line-height:1.6!important}.Jov5oa_codeViewer{flex:1;min-height:0;padding:0;overflow:auto}.Jov5oa_diffViewer{min-height:0;font-family:var(--aion-font-mono);flex:1;padding:4px 0 16px;font-size:12.5px;line-height:1.55;overflow:auto}.Jov5oa_diffLine{white-space:pre;min-height:20px;padding:0 12px;display:flex}.Jov5oa_diffLineAdd{background:color-mix(in srgb, var(--aion-success) 12%, transparent);color:var(--aion-text-primary)}.Jov5oa_diffLineDel{background:color-mix(in srgb, var(--aion-danger) 12%, transparent);color:var(--aion-text-primary)}.Jov5oa_diffLineHunk{background:color-mix(in srgb, var(--aion-primary) 10%, transparent);color:var(--aion-text-secondary)}.Jov5oa_diffLineMeta{color:var(--aion-text-tertiary)}.Jov5oa_csvViewer{flex:1;min-height:0;padding:12px;overflow:auto}.Jov5oa_csvTable{border-collapse:collapse;font-size:13px;font-family:var(--aion-font-mono)}.Jov5oa_csvTable th,.Jov5oa_csvTable td{border:1px solid var(--aion-bg-3);white-space:nowrap;text-overflow:ellipsis;max-width:480px;padding:4px 10px;overflow:hidden}.Jov5oa_csvTable th{background:var(--aion-bg-2);font-weight:600;position:sticky;top:0}.Jov5oa_imageViewer{background:var(--aion-bg-base);flex:1;justify-content:center;align-items:center;min-height:0;padding:16px;display:flex;overflow:auto}.Jov5oa_imageViewer img{object-fit:contain;border-radius:2px;max-width:100%;max-height:100%}.Jov5oa_imageMeta{color:var(--aion-text-tertiary);background:var(--aion-bg-2);border-radius:9999px;padding:2px 10px;font-size:11px;position:absolute;bottom:12px;left:50%;transform:translate(-50%)}.Jov5oa_pdfViewer{background:var(--aion-bg-base);border:none;flex:1;min-height:0}.Jov5oa_urlBar{background:var(--aion-bg-2);border-bottom:1px solid var(--aion-bg-3);flex-shrink:0;align-items:center;gap:6px;height:32px;padding:0 10px;display:flex}.Jov5oa_urlInput{background:var(--aion-bg-base);min-width:0;height:24px;color:var(--aion-text-primary);font-size:12px;font-family:var(--aion-font-sans);border:none;border-radius:4px;outline:none;flex:1;padding:0 8px}.Jov5oa_urlInput:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.Jov5oa_urlFrame{background:var(--aion-bg-base);border:none;flex:1;width:100%;min-height:0}.Jov5oa_placeholder{min-height:0;color:var(--aion-text-secondary);text-align:center;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:8px;padding:24px;font-size:13px;display:flex}.Jov5oa_placeholderTitle{color:var(--aion-text-primary);font-size:14px;font-weight:500}.Jov5oa_placeholderMeta{color:var(--aion-text-tertiary);font-size:12px}.Jov5oa_placeholderError{color:var(--aion-danger);font-size:12px}.Jov5oa_splitPane{flex:1;min-height:0;display:flex;position:relative;overflow:hidden}.Jov5oa_splitPaneLeft,.Jov5oa_splitPaneRight{flex-direction:column;min-width:0;height:100%;display:flex}.Jov5oa_splitHeader{background:var(--aion-bg-2);height:40px;color:var(--aion-text-secondary);border-bottom:1px solid var(--aion-bg-3);flex-shrink:0;align-items:center;padding:0 12px;font-size:12px;display:flex}.Jov5oa_splitBody{flex:1;min-height:0;overflow:hidden}.Jov5oa_splitHandle{z-index:20;cursor:col-resize;touch-action:none;width:12px;position:absolute;top:0;bottom:0}.Jov5oa_splitHandle:after{content:\"\";background:var(--aion-bg-3);opacity:.9;pointer-events:none;border-radius:9999px;width:2px;transition:width .15s cubic-bezier(.4,0,.2,1),background-color .15s cubic-bezier(.4,0,.2,1);position:absolute;top:0;bottom:0;left:50%;transform:translate(-50%)}.Jov5oa_splitHandle:hover:after,.Jov5oa_splitHandle:active:after{background:var(--aion-brand);width:6px}.Jov5oa_textEditor{resize:none;background:var(--aion-bg-base);width:100%;height:100%;color:var(--aion-text-primary);font-family:var(--aion-font-mono);tab-size:2;border:none;outline:none;padding:12px 14px;font-size:13px;line-height:1.6}.Jov5oa_textEditor:focus-visible{box-shadow:inset 0 0 0 2px var(--aion-primary)}.Jov5oa_saveBanner{z-index:5;background:var(--aion-bg-2);border:1px solid var(--aion-bg-3);color:var(--aion-text-secondary);text-overflow:ellipsis;white-space:nowrap;border-radius:4px;max-width:60%;padding:4px 10px;font-size:12px;position:absolute;top:8px;right:12px;overflow:hidden}.Jov5oa_saveBannerError{color:var(--aion-danger);border-color:var(--aion-danger)}.Jov5oa_truncatedNote{color:var(--aion-warning);background:color-mix(in srgb, var(--aion-warning) 10%, transparent);flex-shrink:0;padding:6px 20px;font-size:12px}";
		const tagId$3 = "@lijian-ui/dsh-file-manager/preview.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var preview_module_css_default = {
			"addToChat": "Jov5oa_addToChat",
			"codeBody": "Jov5oa_codeBody",
			"codeShell": "Jov5oa_codeShell",
			"codeViewer": "Jov5oa_codeViewer",
			"content": "Jov5oa_content",
			"csvTable": "Jov5oa_csvTable",
			"csvViewer": "Jov5oa_csvViewer",
			"diffLine": "Jov5oa_diffLine",
			"diffLineAdd": "Jov5oa_diffLineAdd",
			"diffLineDel": "Jov5oa_diffLineDel",
			"diffLineHunk": "Jov5oa_diffLineHunk",
			"diffLineMeta": "Jov5oa_diffLineMeta",
			"diffViewer": "Jov5oa_diffViewer",
			"filemgr-pulse": "Jov5oa_filemgr-pulse",
			"imageMeta": "Jov5oa_imageMeta",
			"imageViewer": "Jov5oa_imageViewer",
			"lineGutter": "Jov5oa_lineGutter",
			"lineNo": "Jov5oa_lineNo",
			"mdViewer": "Jov5oa_mdViewer",
			"mermaidBlock": "Jov5oa_mermaidBlock",
			"noTabs": "Jov5oa_noTabs",
			"panel": "Jov5oa_panel",
			"panelCollapse": "Jov5oa_panelCollapse",
			"panelMaximize": "Jov5oa_panelMaximize",
			"pdfViewer": "Jov5oa_pdfViewer",
			"placeholder": "Jov5oa_placeholder",
			"placeholderError": "Jov5oa_placeholderError",
			"placeholderMeta": "Jov5oa_placeholderMeta",
			"placeholderTitle": "Jov5oa_placeholderTitle",
			"saveBanner": "Jov5oa_saveBanner",
			"saveBannerError": "Jov5oa_saveBannerError",
			"splitBody": "Jov5oa_splitBody",
			"splitHandle": "Jov5oa_splitHandle",
			"splitHeader": "Jov5oa_splitHeader",
			"splitPane": "Jov5oa_splitPane",
			"splitPaneLeft": "Jov5oa_splitPaneLeft",
			"splitPaneRight": "Jov5oa_splitPaneRight",
			"tab": "Jov5oa_tab",
			"tabActive": "Jov5oa_tabActive",
			"tabBar": "Jov5oa_tabBar",
			"tabBarRight": "Jov5oa_tabBarRight",
			"tabClose": "Jov5oa_tabClose",
			"tabDot": "Jov5oa_tabDot",
			"tabDotAgent": "Jov5oa_tabDotAgent",
			"tabDotDirty": "Jov5oa_tabDotDirty",
			"tabFade": "Jov5oa_tabFade",
			"tabFadeLeft": "Jov5oa_tabFadeLeft",
			"tabFadeRight": "Jov5oa_tabFadeRight",
			"tabFavicon": "Jov5oa_tabFavicon",
			"tabInactive": "Jov5oa_tabInactive",
			"tabPlus": "Jov5oa_tabPlus",
			"tabScroll": "Jov5oa_tabScroll",
			"tabTitle": "Jov5oa_tabTitle",
			"textEditor": "Jov5oa_textEditor",
			"toolbar": "Jov5oa_toolbar",
			"toolbarBtn": "Jov5oa_toolbarBtn",
			"toolbarBtnActive": "Jov5oa_toolbarBtnActive",
			"toolbarBtnWarn": "Jov5oa_toolbarBtnWarn",
			"toolbarSpacer": "Jov5oa_toolbarSpacer",
			"truncatedNote": "Jov5oa_truncatedNote",
			"urlBar": "Jov5oa_urlBar",
			"urlFrame": "Jov5oa_urlFrame",
			"urlInput": "Jov5oa_urlInput"
		};
		/** Fade indicator width. */
		const FADE_WIDTH = 32;
		/** The tab strip. */
		function PreviewTabs({ tabs, activeTabId, onSwitch, onClose, onContextMenu, onNewUrlTab, onClosePanel, maximized, onMaximize }) {
			const scrollRef = (0, react.useRef)(null);
			const [fade, setFade] = (0, react.useState)({
				left: false,
				right: false
			});
			(0, react.useEffect)(() => {
				const el = scrollRef.current;
				if (el === null) return;
				const update = () => {
					const next = {
						left: el.scrollLeft > 1,
						right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
					};
					setFade((prev) => prev.left === next.left && prev.right === next.right ? prev : next);
				};
				const observer = new ResizeObserver(update);
				observer.observe(el);
				el.addEventListener("scroll", update, { passive: true });
				window.addEventListener("resize", update);
				update();
				return () => {
					observer.disconnect();
					el.removeEventListener("scroll", update);
					window.removeEventListener("resize", update);
				};
			}, [tabs.length]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.tabBar,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: scrollRef,
						className: preview_module_css_default.tabScroll,
						children: [
							tabs.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: preview_module_css_default.noTabs,
								children: t("preview.noTabs")
							}),
							tabs.map((tab) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `${preview_module_css_default.tab}${tab.id === activeTabId ? ` ${preview_module_css_default.tabActive}` : ` ${preview_module_css_default.tabInactive}`}`,
								style: { maxWidth: 180 },
								role: "button",
								tabIndex: 0,
								title: tab.path,
								"aria-label": tab.title,
								onClick: () => onSwitch(tab.id),
								onKeyDown: activateOnKey(() => {
									onSwitch(tab.id);
								}),
								onContextMenu: (event) => onContextMenu(event, tab),
								onAuxClick: (event) => {
									if (event.button !== 1) return;
									event.preventDefault();
									event.stopPropagation();
									onClose(tab.id);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: preview_module_css_default.tabTitle,
										title: tab.path,
										children: tab.title
									}),
									tab.dirty && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: preview_module_css_default.tabDotDirty,
										title: t("preview.dirty")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: preview_module_css_default.tabClose,
										role: "button",
										tabIndex: 0,
										title: t("common.close"),
										"aria-label": t("common.close"),
										onClick: (event) => {
											event.stopPropagation();
											onClose(tab.id);
										},
										onKeyDown: activateOnKey(() => {
											onClose(tab.id);
										}),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 12 })
									})
								]
							}, tab.id)),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: preview_module_css_default.tabPlus,
								role: "button",
								tabIndex: 0,
								onClick: onNewUrlTab,
								onKeyDown: activateOnKey(onNewUrlTab),
								title: t("preview.newUrlTab"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PlusIcon, { size: 14 })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: preview_module_css_default.tabBarRight,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.panelMaximize,
							role: "button",
							tabIndex: 0,
							onClick: onMaximize,
							onKeyDown: activateOnKey(onMaximize),
							title: t(maximized ? "preview.restore" : "preview.maximize"),
							"aria-label": t(maximized ? "preview.restore" : "preview.maximize"),
							children: maximized ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RestoreIcon, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MaximizeIcon, { size: 14 })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.panelCollapse,
							role: "button",
							tabIndex: 0,
							onClick: onClosePanel,
							onKeyDown: activateOnKey(onClosePanel),
							title: t("preview.collapsePanel"),
							"aria-label": t("preview.collapsePanel"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ShrinkIcon, { size: 14 })
						})]
					}),
					fade.left && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.tabFadeLeft,
						style: { width: FADE_WIDTH }
					}),
					fade.right && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.tabFadeRight,
						style: { width: FADE_WIDTH }
					})
				]
			});
		}
		//#endregion
		//#region src/client/preview/PreviewToolbar.tsx
		/** Derive the refresh state for one tab. */
		function refreshStateFor(contentType, hasContent, loading, updated) {
			if (contentType === "url") return "idle";
			if (contentType === "word" || contentType === "excel" || contentType === "ppt" || contentType === "unsupported" || contentType === "image") return "hidden";
			if (!hasContent || loading) return "disabled";
			return updated ? "updated" : "idle";
		}
		/** Download the current tab's content as a file. */
		function downloadTab(tab) {
			if (tab.content === null) return;
			const isDataUrl = tab.content.startsWith("data:");
			const isRouteUrl = tab.content.startsWith("/filemgr/raw");
			const href = isDataUrl || isRouteUrl ? tab.content : URL.createObjectURL(new Blob([tab.content], { type: "text/plain;charset=utf-8" }));
			const anchor = document.createElement("a");
			anchor.href = href;
			anchor.download = tab.title;
			anchor.style.display = "none";
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			if (!isDataUrl && !isRouteUrl) setTimeout(() => URL.revokeObjectURL(href), 1e4);
		}
		/** The toolbar. */
		function PreviewToolbar({ contentType, hasContent, loading, dirty, updated, viewMode, canToggleView, split, canSplit, onViewModeChange, onSplitChange, onRefresh, onSave, onDownload }) {
			const refreshState = refreshStateFor(contentType, hasContent, loading, updated);
			const editable = isEditableType(contentType);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.toolbar,
				children: [
					canToggleView && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `${preview_module_css_default.toolbarBtn}${viewMode === "source" ? ` ${preview_module_css_default.toolbarBtnActive}` : ""}`,
						onClick: () => onViewModeChange("source"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeIcon, { size: 13 }), t("preview.source")]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `${preview_module_css_default.toolbarBtn}${viewMode === "preview" ? ` ${preview_module_css_default.toolbarBtnActive}` : ""}`,
						onClick: () => onViewModeChange("preview"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EyeIcon, { size: 13 }), t("preview.preview")]
					})] }),
					canSplit && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `${preview_module_css_default.toolbarBtn}${split ? ` ${preview_module_css_default.toolbarBtnActive}` : ""}`,
						title: t("preview.split"),
						onClick: () => onSplitChange(!split),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SplitIcon, { size: 13 }), t("preview.split")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: preview_module_css_default.toolbarBtn,
						title: t("preview.download"),
						disabled: !hasContent,
						onClick: onDownload,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DownloadIcon, { size: 13 })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: preview_module_css_default.toolbarSpacer }),
					refreshState !== "hidden" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `${preview_module_css_default.toolbarBtn}${refreshState === "updated" ? ` ${preview_module_css_default.toolbarBtnWarn}` : ""}`,
						title: refreshState === "updated" ? t("preview.refresh.updated") : t("preview.refresh"),
						disabled: refreshState === "disabled",
						onClick: onRefresh,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, { size: 13 }), t("preview.refresh")]
					}),
					editable && dirty && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: preview_module_css_default.toolbarBtn,
						onClick: onSave,
						disabled: loading,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SaveIcon, { size: 13 }), t("preview.save")]
					})
				]
			});
		}
		//#endregion
		//#region src/client/hooks/useResizableSplit.ts
		/**
		* The panel system's single drag engine hook — a thin React wrapper over the
		* framework-free machinery in drag.ts (FileManager's useResizableSplit
		* architecture, re-implemented): px or ratio units, range-validated
		* localStorage persistence, double-click reset to the default width.
		* @module dsh-filemgr/client/hooks/useResizableSplit
		*/
		/**
		* Resizable-split engine.
		* @param options - width contract + persistence key.
		* @returns current width, the committed setter, handle props, and the clamp.
		*/
		function useResizableSplit(options = {}) {
			const { defaultWidth = 50, minWidth = 20, maxWidth = 80, storageKey, unit = "ratio" } = options;
			const isPx = unit === "px";
			const [width, setWidthState] = (0, react.useState)(() => storageKey === void 0 ? defaultWidth : readStoredNumber(storageKey, minWidth, maxWidth, defaultWidth));
			const widthRef = (0, react.useRef)(width);
			(0, react.useEffect)(() => {
				widthRef.current = width;
			}, [width]);
			/** The committed setter: state + storage (validated) + resize event. */
			const setWidth = (0, react.useCallback)((value) => {
				setWidthState(value);
				if (storageKey !== void 0) writeStoredNumber(storageKey, value);
				try {
					window.dispatchEvent(new CustomEvent("preview-panel-resize", { detail: { width: value } }));
				} catch {}
			}, [storageKey]);
			const clamp = (0, react.useCallback)((value) => {
				return Math.min(maxWidth, Math.max(minWidth, value));
			}, [minWidth, maxWidth]);
			return {
				width,
				setWidth,
				handleProps: {
					onPointerDown: (0, react.useCallback)((event) => {
						const el = event.currentTarget;
						handlePointerDragStart(event.nativeEvent, el, {
							reverse: el.dataset.reverse === "true",
							getStartWidth: () => widthRef.current,
							compute: (startWidth, deltaX) => clamp(startWidth + deltaX),
							onFrame: (value) => setWidthState(value),
							onEnd: (value) => setWidth(value)
						});
					}, [clamp, setWidth]),
					onDoubleClick: (0, react.useCallback)(() => {
						setWidth(defaultWidth);
					}, [defaultWidth, setWidth])
				},
				clamp,
				isPx
			};
		}
		//#endregion
		//#region src/client/preview/markdown.ts
		/**
		* A compact markdown renderer for the preview panel: headings, paragraphs,
		* fenced + inline code, bold/italic, links/images, lists, blockquotes, hr,
		* and tables. All HTML is escaped before transformation — the output only
		* ever contains the renderer's own tags. Pure and exported for tests.
		* @module dsh-filemgr/client/preview/markdown
		*/
		/** Escape HTML special characters. */
		function escapeHtml(text) {
			return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
		}
		/** Directory of a workspace-relative file path ('' when at the root). */
		function dirOf(filePath) {
			const slash = filePath.lastIndexOf("/");
			return slash === -1 ? "" : filePath.slice(0, slash);
		}
		/** Collapse . and .. segments; null when .. escapes the base. */
		function normalizeRelPath(rel) {
			const out = [];
			for (const part of rel.split("/")) {
				if (part === "" || part === ".") continue;
				if (part === "..") {
					if (out.length === 0) return null;
					out.pop();
					continue;
				}
				out.push(part);
			}
			return out.join("/");
		}
		/** Percent-decode a path portion (best effort; never throws). */
		function decodePathPart(raw) {
			try {
				return decodeURIComponent(raw);
			} catch {
				return raw;
			}
		}
		/**
		* Resolve one markdown image src against the markdown file's location:
		* - Absolute URLs (http/https/data:/...) and fragment-only srcs are left to
		*   the browser ('absolute').
		* - Root-relative srcs (/img.png) resolve from the project root; other
		*   relative srcs resolve against the file's directory. `..` escaping the
		*   project root is rejected ('escape').
		* - The path portion is percent-decoded (markdown authors encode spaces in
		*   filenames) and any ?query#fragment suffix is preserved verbatim, so
		*   cache-busting srcs like ./img.png?v=2 still fetch img.png.
		*/
		function resolveMarkdownImage(filePath, src) {
			const trimmed = src.trim();
			if (trimmed === "" || trimmed.startsWith("#")) return { kind: "absolute" };
			if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return { kind: "absolute" };
			const decoded = decodePathPart(trimmed);
			const q = decoded.indexOf("?");
			const h = decoded.indexOf("#");
			let cut = decoded.length;
			if (q !== -1) cut = Math.min(cut, q);
			if (h !== -1) cut = Math.min(cut, h);
			const pathPart = decoded.slice(0, cut);
			const suffix = decoded.slice(cut);
			const base = pathPart.startsWith("/") ? "" : dirOf(filePath);
			const normalized = normalizeRelPath(base === "" ? pathPart : `${base}/${pathPart}`);
			if (normalized === null) return { kind: "escape" };
			return {
				kind: "relative",
				path: normalized,
				suffix
			};
		}
		/**
		* Guard a raw link/image target against dangerous protocols. Returns the
		* (trimmed) raw string when safe, else null. Only these schemes are allowed:
		* http:, https:, mailto: and fragment anchors (#...). Scheme-less relative
		* paths (./ ../ / and plain filenames) pass through unchanged. Anything with
		* a scheme outside the allow-list — javascript:, data:, vbscript:, etc. —
		* is rejected so the value never reaches dangerouslySetInnerHTML.
		*/
		function safeUrl(raw) {
			const trimmed = raw.trim();
			if (trimmed === "") return null;
			if (trimmed.startsWith("#")) return trimmed;
			const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
			if (scheme === null) return trimmed;
			const name = scheme[1].toLowerCase();
			return name === "http" || name === "https" || name === "mailto" ? trimmed : null;
		}
		/** Inline pass: code spans, bold, italic, images, links. */
		function renderInline(text, options) {
			let out = "";
			let i = 0;
			const n = text.length;
			while (i < n) {
				const char = text[i];
				if (char === "`") {
					const end = text.indexOf("`", i + 1);
					if (end !== -1) {
						out += `<code>${escapeHtml(text.slice(i + 1, end))}</code>`;
						i = end + 1;
						continue;
					}
				}
				if (char === "!" && text[i + 1] === "[") {
					const close = text.indexOf("](", i + 2);
					if (close !== -1) {
						const parenEnd = text.indexOf(")", close + 2);
						if (parenEnd !== -1) {
							const alt = text.slice(i + 2, close);
							const safe = safeUrl(text.slice(close + 2, parenEnd));
							if (safe === null) out += escapeHtml(alt);
							else {
								let target = safe;
								if (options?.resolveImageSrc !== void 0) target = options.resolveImageSrc(safe);
								if (target === null) out += escapeHtml(alt);
								else {
									const srcEsc = escapeHtml(target).replace(/\s+/g, "%20");
									out += `<img alt="${escapeHtml(alt)}" src="${srcEsc}" />`;
								}
							}
							i = parenEnd + 1;
							continue;
						}
					}
				}
				if (char === "[") {
					const close = text.indexOf("](", i + 1);
					if (close !== -1) {
						const parenEnd = text.indexOf(")", close + 2);
						if (parenEnd !== -1) {
							const label = text.slice(i + 1, close);
							const safe = safeUrl(text.slice(close + 2, parenEnd));
							if (safe === null) out += renderInline(label, options);
							else out += `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${renderInline(label, options)}</a>`;
							i = parenEnd + 1;
							continue;
						}
					}
				}
				if (char === "*" && text[i + 1] === "*") {
					const end = text.indexOf("**", i + 2);
					if (end !== -1) {
						out += `<strong>${renderInline(text.slice(i + 2, end), options)}</strong>`;
						i = end + 2;
						continue;
					}
				}
				if (char === "*" && text[i - 1] !== "*" && text[i + 1] !== "*") {
					const end = text.indexOf("*", i + 1);
					if (end !== -1 && text[end + 1] !== "*") {
						out += `<em>${renderInline(text.slice(i + 1, end), options)}</em>`;
						i = end + 1;
						continue;
					}
				}
				if (char === "~" && text[i + 1] === "~") {
					const end = text.indexOf("~~", i + 2);
					if (end !== -1) {
						out += `<del>${renderInline(text.slice(i + 2, end), options)}</del>`;
						i = end + 2;
						continue;
					}
				}
				out += escapeHtml(char);
				i += 1;
			}
			return out;
		}
		/** Render a markdown document to HTML (block pass). */
		function renderMarkdown(source, options) {
			const lines = source.replace(/\r\n/g, "\n").split("\n");
			const out = [];
			let i = 0;
			const n = lines.length;
			const flushParagraph = (buffer) => {
				if (buffer.length === 0) return;
				out.push(`<p>${renderInline(buffer.join("\n"), options)}</p>`);
				buffer.length = 0;
			};
			let paragraph = [];
			while (i < n) {
				const line = lines[i];
				const fence = /^```([\w+-]*)\s*$/.exec(line);
				if (fence !== null) {
					flushParagraph(paragraph);
					const lang = fence[1] ?? "";
					i += 1;
					const code = [];
					while (i < n && !/^```\s*$/.test(lines[i])) {
						code.push(lines[i]);
						i += 1;
					}
					i += 1;
					const langAttr = lang === "" ? "" : ` class="language-${escapeHtml(lang)}"`;
					out.push(`<pre${langAttr}><code>${escapeHtml(code.join("\n"))}</code></pre>`);
					continue;
				}
				const heading = /^(#{1,6})\s+(.*)$/.exec(line);
				if (heading !== null) {
					flushParagraph(paragraph);
					const level = heading[1].length;
					out.push(`<h${level}>${renderInline(heading[2] ?? "", options)}</h${level}>`);
					i += 1;
					continue;
				}
				if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
					flushParagraph(paragraph);
					out.push("<hr />");
					i += 1;
					continue;
				}
				if (line.includes("|") && i + 1 < n && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
					flushParagraph(paragraph);
					const headerCells = splitTableRow(line);
					i += 2;
					const rows = [];
					while (i < n && lines[i].includes("|")) {
						rows.push(splitTableRow(lines[i]));
						i += 1;
					}
					out.push("<table>");
					out.push(`<thead><tr>${headerCells.map((cell) => `<th>${renderInline(cell, options)}</th>`).join("")}</tr></thead>`);
					if (rows.length > 0) out.push(`<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, options)}</td>`).join("")}</tr>`).join("")}</tbody>`);
					out.push("</table>");
					continue;
				}
				if (/^>\s?(.*)$/.exec(line) !== null) {
					flushParagraph(paragraph);
					const body = [];
					while (i < n) {
						const q = /^>\s?(.*)$/.exec(lines[i]);
						if (q === null) break;
						body.push(q[1] ?? "");
						i += 1;
					}
					out.push(`<blockquote><p>${body.map((line) => renderInline(line, options)).join("<br />")}</p></blockquote>`);
					continue;
				}
				if (/^\s*([-*+])\s+(.*)$/.exec(line) !== null) {
					flushParagraph(paragraph);
					const items = [];
					while (i < n) {
						const item = /^\s*([-*+])\s+(.*)$/.exec(lines[i]);
						if (item === null) break;
						items.push(`<li>${renderInline(item[2] ?? "", options)}</li>`);
						i += 1;
					}
					out.push(`<ul>${items.join("")}</ul>`);
					continue;
				}
				if (/^\s*\d+[.)]\s+(.*)$/.exec(line) !== null) {
					flushParagraph(paragraph);
					const items = [];
					while (i < n) {
						const item = /^\s*\d+[.)]\s+(.*)$/.exec(lines[i]);
						if (item === null) break;
						items.push(`<li>${renderInline(item[1] ?? "", options)}</li>`);
						i += 1;
					}
					out.push(`<ol>${items.join("")}</ol>`);
					continue;
				}
				if (line.trim() === "") {
					flushParagraph(paragraph);
					i += 1;
					continue;
				}
				paragraph.push(line);
				i += 1;
			}
			flushParagraph(paragraph);
			return out.join("\n");
		}
		/** Split one table row into cells (respecting the leading/trailing pipes). */
		function splitTableRow(line) {
			const trimmed = line.trim();
			const inner = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
			return (inner.endsWith("|") ? inner.slice(0, -1) : inner).split("|").map((cell) => cell.trim());
		}
		//#endregion
		//#region src/client/preview/mermaid.ts
		/** Host-served mermaid IIFE bundle (lib/assets/mermaid.min.js behind the route). */
		const MERMAID_VENDOR_URL = "/filemgr/vendor/mermaid.js";
		/** Lifecycle state stamped on diagram containers (`pending`/`rendering`/`done`). */
		const DATA_STATE = "data-mermaid-state";
		/** State stamped on a code block once its container exists (`claimed`). */
		const DATA_CLAIMED = "data-mermaid-claimed";
		/** The verbatim diagram source kept on the container for theme re-renders. */
		const DATA_SOURCE = "data-mermaid-source";
		/** Marker the preview viewer stamps on its own subtree (chat enhancement skips it). */
		const DATA_MD_SCOPE = "data-filemgr-md-scope";
		let loadPromise;
		/**
		* Resolve the mermaid global left by the vendor IIFE bundle, or null while
		* absent. Narrow and defensive: the bundle is a third-party artifact.
		*/
		function mermaidGlobal() {
			const candidate = globalThis.mermaid;
			if (typeof candidate !== "object" || candidate === null) return null;
			const checked = candidate;
			if (typeof checked.initialize !== "function" || typeof checked.render !== "function") return null;
			return checked;
		}
		/**
		* Load the mermaid runtime once per page: injects a <script> for the host
		* vendor route and resolves with the runtime. Concurrent callers share one
		* injection; a failure clears the cache so a later surface can retry.
		*/
		function loadMermaidLibrary() {
			const existing = mermaidGlobal();
			if (existing !== null) return Promise.resolve(existing);
			if (loadPromise !== void 0) return loadPromise;
			loadPromise = new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = MERMAID_VENDOR_URL;
				script.async = true;
				script.onload = () => {
					const runtime = mermaidGlobal();
					if (runtime === null) {
						loadPromise = void 0;
						reject(/* @__PURE__ */ new Error("mermaid vendor script loaded but window.mermaid is missing"));
						return;
					}
					resolve(runtime);
				};
				script.onerror = () => {
					loadPromise = void 0;
					reject(/* @__PURE__ */ new Error(`failed to load ${MERMAID_VENDOR_URL}`));
				};
				document.head.appendChild(script);
			});
			return loadPromise;
		}
		/** Mermaid theme name for the shell theme marker (`default` or `dark`). */
		function mermaidTheme(isDark) {
			return isDark ? "dark" : "default";
		}
		/** Whether the shell currently carries the dark marker attribute. */
		function shellIsDark() {
			return document.body.hasAttribute("data-ds-dark-theme");
		}
		/** Monotonic id source for render calls (mermaid keys its <svg> by id). */
		let renderSeq = 0;
		/**
		* Configure the mermaid runtime for the current theme. Called once per
		* render batch (enhance or retheme), not per diagram, so a surface with
		* many diagrams initializes the runtime a single time.
		*/
		function initializeRuntime(runtime, theme) {
			runtime.initialize({
				startOnLoad: false,
				theme,
				securityLevel: "strict",
				fontFamily: "\"trebuchet ms\", verdana, arial, sans-serif"
			});
		}
		/** Render one diagram source to SVG with the already-initialized runtime. */
		async function renderSvg(runtime, source) {
			const { svg } = await runtime.render(`filemgr-mermaid-${renderSeq += 1}`, source);
			return svg;
		}
		/** Disallowed elements removed from mermaid SVG output before innerHTML. */
		const DISALLOWED_ELEMENTS = [
			"script",
			"foreignObject",
			"iframe",
			"object",
			"embed"
		];
		/** Whether an attribute name is an { on* } event-handler (case-insensitive). */
		function isEventHandler(name) {
			return /^on/i.test(name);
		}
		/** Whether an href/xlink:href value carries an executable javascript: URL. */
		function isDangerousHref(value) {
			return /^javascript:/i.test(value.trim());
		}
		/**
		* Application-level defense-in-depth on top of mermaid's own strict-mode
		* escaping: parse the rendered SVG in a detached container, remove disallowed
		* elements and dangerous attributes, and return the serialized cleaned markup.
		* Throws when the input cannot be parsed as markup or still carries dangerous
		* raw tokens, so callers fall back to their failure path.
		*/
		function sanitizeSvg(svg) {
			const template = document.createElement("template");
			template.innerHTML = svg;
			const root = template.content;
			for (let found = true; found;) {
				found = false;
				for (const el of Array.from(root.querySelectorAll("*"))) if (DISALLOWED_ELEMENTS.some((tag) => el.tagName.toLowerCase() === tag.toLowerCase())) {
					el.remove();
					found = true;
				}
			}
			for (const el of Array.from(root.querySelectorAll("*"))) for (const attr of Array.from(el.attributes)) if (isEventHandler(attr.name) || isDangerousHref(attr.value)) el.removeAttribute(attr.name);
			const cleaned = template.innerHTML;
			const lower = cleaned.toLowerCase();
			if (lower.includes("<script") || lower.includes("javascript:")) throw new Error("mermaid SVG still contains dangerous tokens after sanitization");
			return cleaned;
		}
		/**
		* Collect the still-unclaimed fenced mermaid code blocks under one scope.
		* Both shapes are found: the panel renderer's `pre.language-mermaid` and
		* the chat renderer's `pre > code.language-mermaid` (the claim always
		* targets the <pre>). Empty blocks and blocks another driver already
		* claimed are skipped. Pure (DOM-read only) so tests can drive it in jsdom.
		*/
		function findMermaidCodeBlocks(scope) {
			const found = [];
			const seen = /* @__PURE__ */ new Set();
			for (const el of Array.from(scope.querySelectorAll("pre.language-mermaid, code.language-mermaid"))) {
				const pre = el instanceof HTMLPreElement ? el : el.parentElement;
				if (pre === null || !(pre instanceof HTMLPreElement)) continue;
				if (seen.has(pre)) continue;
				seen.add(pre);
				if (pre.hasAttribute(DATA_CLAIMED)) continue;
				if ((pre.textContent ?? "").trim() === "") continue;
				found.push(pre);
			}
			return found;
		}
		/**
		* Swap one code block for a diagram container. The original <pre> stays in
		* the tree (hidden once the render lands) so a failure can restore it
		* verbatim; the container carries the source for theme re-renders.
		*/
		function claimBlock(pre, className) {
			pre.setAttribute(DATA_CLAIMED, "1");
			const container = document.createElement("div");
			container.className = className;
			container.setAttribute(DATA_STATE, "pending");
			container.setAttribute(DATA_SOURCE, pre.textContent ?? "");
			pre.insertAdjacentElement("afterend", container);
			return container;
		}
		/**
		* Render every unclaimed ```mermaid block under `scope` into an inline SVG
		* diagram. Idempotent per block across drivers (claimed blocks are skipped);
		* failures restore the original code block. Never rejects.
		*/
		async function enhanceMermaidBlocks(scope, options) {
			let runtime;
			try {
				runtime = await loadMermaidLibrary();
			} catch {
				return;
			}
			initializeRuntime(runtime, options.theme);
			const jobs = [];
			for (const pre of findMermaidCodeBlocks(scope)) {
				if (options.skip?.(pre) === true) continue;
				const container = claimBlock(pre, options.className);
				jobs.push((async () => {
					try {
						container.setAttribute(DATA_STATE, "rendering");
						const source = container.getAttribute(DATA_SOURCE) ?? "";
						const svg = await renderSvg(runtime, source);
						container.innerHTML = sanitizeSvg(svg);
						container.setAttribute(DATA_STATE, "done");
						pre.style.display = "none";
					} catch {
						container.remove();
						pre.removeAttribute(DATA_CLAIMED);
					}
				})());
			}
			await Promise.all(jobs);
		}
		/**
		* Re-render every completed diagram container under `scope` after a theme
		* flip (stored sources re-render with the new theme). Containers not in the
		* `done` state are skipped; a failure keeps the previous render.
		*/
		async function rethemeMermaidBlocks(scope, options) {
			const runtime = mermaidGlobal();
			if (runtime === null) return;
			initializeRuntime(runtime, options.theme);
			const containers = Array.from(scope.querySelectorAll("[data-mermaid-state=\"done\"]"));
			await Promise.all(containers.map(async (container) => {
				const source = container.getAttribute(DATA_SOURCE) ?? "";
				try {
					container.innerHTML = sanitizeSvg(await renderSvg(runtime, source));
				} catch {}
			}));
		}
		/**
		* One dark-marker watcher per surface: fires on body attribute flips so the
		* caller can retheme. Returns the disposer.
		*/
		function watchShellTheme(onChange) {
			const observer = new MutationObserver(() => {
				onChange(shellIsDark());
			});
			observer.observe(document.body, {
				attributes: true,
				attributeFilter: ["data-ds-dark-theme"]
			});
			return () => {
				observer.disconnect();
			};
		}
		//#endregion
		//#region src/client/preview/content.tsx
		/**
		* Preview content routing: the renderers for every content type plus the
		* split-screen editor|preview layout. View mode (source/preview) resets to
		* preview when the displayed FILE changes (keyed on path+type, not tab id —
		* FileManager contract), and the split ratio is persisted under
		* preview-panel-split-ratio with a 20..80 clamp.
		* @module dsh-filemgr/client/preview/content
		*/
		/** Split-ratio persistence key (FileManager contract). */
		const KEY_SPLIT_RATIO = "preview-panel-split-ratio";
		/** The rendered content of one tab (viewMode/split are controlled by the panel). */
		function TabContent({ tab, viewMode, split, onContentChange, onSave }) {
			if (tab.error !== null) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.placeholder,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.placeholderTitle,
					children: tab.title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.placeholderError,
					children: tab.error
				})]
			});
			const editable = tab.contentType === "markdown" || tab.contentType === "html" || tab.contentType === "code" || tab.contentType === "csv" || tab.contentType === "text";
			if (split && editable) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SplitPane, {
				tab,
				onContentChange,
				onSave
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.content,
				children: [
					tab.truncated && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.truncatedNote,
						children: t("preview.errorOversized")
					}),
					tab.contentType === "markdown" && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownViewer, {
						content: tab.content,
						root: tab.root,
						path: tab.path,
						sourceMode: viewMode === "source",
						onContentChange
					}),
					tab.contentType === "html" && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HtmlViewer, {
						content: tab.content,
						sourceMode: viewMode === "source",
						onContentChange
					}),
					(tab.contentType === "code" || tab.contentType === "text") && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeViewer, {
						content: tab.content,
						language: tab.title.split(".").pop() ?? ""
					}),
					tab.contentType === "csv" && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CsvViewer, { content: tab.content }),
					tab.contentType === "diff" && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffViewer, { content: tab.content }),
					tab.contentType === "image" && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImageViewer, {
						src: tab.content,
						meta: `${tab.image?.width ?? ""}${tab.image ? " x " : ""}${tab.image?.height ?? ""}`
					}),
					tab.contentType === "pdf" && tab.content !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PdfViewer, {
						dataUrl: tab.content,
						title: tab.title
					}),
					tab.contentType === "url" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UrlViewer, { tab }),
					(tab.contentType === "word" || tab.contentType === "excel" || tab.contentType === "ppt" || tab.contentType === "unsupported") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnsupportedViewer, { tab }),
					tab.content === null && !tab.loading && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: preview_module_css_default.placeholder,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.placeholderTitle,
							children: tab.title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.placeholderMeta,
							children: t("preview.downloadHint")
						})]
					}),
					tab.loading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.placeholder,
						children: t("scm.loading")
					})
				]
			});
		}
		/** Split screen: textarea editor | rendered preview, ratio persisted. */
		function SplitPane({ tab, onContentChange, onSave }) {
			const { width: splitRatio, handleProps } = useResizableSplit({
				unit: "ratio",
				defaultWidth: 50,
				minWidth: 20,
				maxWidth: 80,
				storageKey: KEY_SPLIT_RATIO
			});
			const content = tab.content ?? "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.splitPane,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: preview_module_css_default.splitPaneLeft,
						style: { width: `${splitRatio}%` },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.splitHeader,
							children: t("preview.editor")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.splitBody,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: preview_module_css_default.textEditor,
								value: content,
								spellCheck: false,
								onChange: (event) => onContentChange(event.target.value),
								onKeyDown: (event) => {
									if ((event.metaKey || event.ctrlKey) && event.key === "s") {
										event.preventDefault();
										onSave();
									}
								}
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.splitHandle,
						"data-reverse": "false",
						style: { left: `calc(${splitRatio}% - 6px)` },
						...handleProps
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: preview_module_css_default.splitPaneRight,
						style: { width: `${100 - splitRatio}%` },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: preview_module_css_default.splitHeader,
							children: t("preview.preview")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: preview_module_css_default.splitBody,
							children: [
								tab.contentType === "markdown" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownViewer, {
									content,
									root: tab.root,
									path: tab.path
								}),
								tab.contentType === "html" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HtmlViewer, { content }),
								tab.contentType === "csv" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CsvViewer, { content }),
								tab.contentType === "code" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeViewer, {
									content,
									language: tab.title.split(".").pop() ?? ""
								})
							]
						})]
					})
				]
			});
		}
		/** Markdown viewer with an optional source mode (textarea). */
		function MarkdownViewer({ content, root, path, sourceMode = false, onContentChange }) {
			const resolveImageSrc = (0, react.useCallback)((src) => {
				if (root === "" || path === "") return null;
				const resolution = resolveMarkdownImage(path, src);
				if (resolution.kind === "absolute") return src;
				if (resolution.kind === "escape") return null;
				return `/filemgr/raw?root=${encodeURIComponent(root)}&path=${encodeURIComponent(resolution.path)}${resolution.suffix}`;
			}, [root, path]);
			const html = (0, react.useMemo)(() => renderMarkdown(content, { resolveImageSrc }), [content, resolveImageSrc]);
			if (sourceMode && onContentChange !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: preview_module_css_default.content,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					className: preview_module_css_default.textEditor,
					value: content,
					spellCheck: false,
					onChange: (event) => onContentChange(event.target.value)
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MermaidAwareMarkdown, { html });
		}
		/**
		* Rendered markdown body plus the mermaid enhancement lifecycle: fresh
		* blocks render once per html, completed diagrams re-render on shell theme
		* flips. The scope marker lets the chat-transcript enhancer skip this
		* subtree (each surface owns its blocks).
		*/
		function MermaidAwareMarkdown({ html }) {
			const ref = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const el = ref.current;
				if (el === null) return void 0;
				enhanceMermaidBlocks(el, {
					className: preview_module_css_default.mermaidBlock,
					theme: mermaidTheme(shellIsDark())
				});
				return watchShellTheme((isDark) => {
					rethemeMermaidBlocks(el, { theme: mermaidTheme(isDark) });
				});
			}, [html]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref,
				className: preview_module_css_default.mdViewer,
				[DATA_MD_SCOPE]: "1",
				dangerouslySetInnerHTML: { __html: html }
			});
		}
		/** HTML viewer: sandboxed iframe (scripts off) or source textarea. */
		function HtmlViewer({ content, sourceMode = false, onContentChange }) {
			const srcDoc = (0, react.useMemo)(() => {
				return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:-apple-system,"system-ui","Segoe UI",Roboto,"PingFang SC",sans-serif;color:#1d2129}@media (prefers-color-scheme:dark){body{color:rgba(255,255,255,0.9)}}</style></head><body>${content}</body></html>`;
			}, [content]);
			if (sourceMode && onContentChange !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: preview_module_css_default.content,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					className: preview_module_css_default.textEditor,
					value: content,
					spellCheck: false,
					onChange: (event) => onContentChange(event.target.value)
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
				className: preview_module_css_default.pdfViewer,
				srcDoc,
				sandbox: "",
				title: "html preview"
			});
		}
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
		function CodeViewer({ content, language }) {
			const shellRef = (0, react.useRef)(null);
			const [gutterStyle, setGutterStyle] = (0, react.useState)(null);
			const lineCount = (0, react.useMemo)(() => {
				const trimmed = content.endsWith("\n") ? content.slice(0, -1) : content;
				return trimmed === "" ? 1 : trimmed.split("\n").length;
			}, [content]);
			const numbers = (0, react.useMemo)(() => {
				const rows = [];
				for (let i = 1; i <= lineCount; i += 1) rows.push(i);
				return rows;
			}, [lineCount]);
			(0, react.useEffect)(() => {
				const shell = shellRef.current;
				if (shell === null) return;
				const measure = () => {
					const pre = shell.querySelector("pre");
					if (pre === null) {
						setGutterStyle(null);
						return;
					}
					const shellRect = shell.getBoundingClientRect();
					const preRect = pre.getBoundingClientRect();
					const preStyle = getComputedStyle(pre);
					const lineHeight = parseFloat(preStyle.lineHeight);
					const padTop = parseFloat(preStyle.paddingTop);
					const offsetTop = preRect.top - shellRect.top;
					setGutterStyle({
						paddingTop: (Number.isFinite(offsetTop) ? offsetTop : 0) + (Number.isFinite(padTop) ? padTop : 0),
						lineHeight: Number.isFinite(lineHeight) ? lineHeight : 19.2
					});
				};
				measure();
				const observer = new MutationObserver(measure);
				observer.observe(shell, {
					childList: true,
					subtree: true
				});
				return () => observer.disconnect();
			}, [content]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.codeShell,
				ref: shellRef,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.lineGutter,
					"aria-hidden": "true",
					style: gutterStyle !== null ? { paddingTop: gutterStyle.paddingTop } : void 0,
					children: numbers.map((number) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.lineNo,
						style: gutterStyle !== null ? {
							height: gutterStyle.lineHeight,
							lineHeight: `${gutterStyle.lineHeight}px`
						} : void 0,
						children: number
					}, number))
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.codeBody,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
						code: content,
						lang: language === "" ? void 0 : language,
						className: preview_module_css_default.codeViewer,
						copyLabel: t("preview.copyCode"),
						copiedLabel: t("preview.copyCodeDone")
					})
				})]
			});
		}
		/**
		* One memoized CSV row. The cells array reference is stable (it comes from the
		* memoized parsed rows), so an untouched row skips re-rendering when a sibling
		* cell changes or the panel re-renders for another reason.
		*/
		const CsvRow = (0, react.memo)(function CsvRow({ cells, isHeader }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: cells.map((cell, cellIndex) => isHeader ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: cell }, cellIndex) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: cell }, cellIndex)) });
		});
		/**
		* Stable, content-derived key for a CSV row. Rows have no ids, so the cell
		* content (JSON, occurrence-disambiguated for duplicates) anchors the key
		* instead of the array position — a reordered or shifted table keeps stable
		* React identities instead of reusing DOM nodes by index.
		* @param row - the raw row cells.
		* @param occurrence - how many identical rows were already keyed.
		*/
		function csvRowKey(row, occurrence) {
			return `${JSON.stringify(row)}\u0000${occurrence}`;
		}
		/** CSV table. */
		function CsvViewer({ content }) {
			const rows = (0, react.useMemo)(() => parseCsv(content), [content]);
			const keyedRows = (0, react.useMemo)(() => {
				const counts = /* @__PURE__ */ new Map();
				return rows.map((row) => {
					const seen = counts.get(JSON.stringify(row)) ?? 0;
					counts.set(JSON.stringify(row), seen + 1);
					return {
						cells: row,
						key: csvRowKey(row, seen)
					};
				});
			}, [rows]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: preview_module_css_default.csvViewer,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("table", {
					className: preview_module_css_default.csvTable,
					children: keyedRows.map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CsvRow, {
						cells: entry.cells,
						isHeader: index === 0
					}, entry.key))
				})
			});
		}
		/** Parse CSV lines (quoted cells with escaped quotes). */
		function parseCsv(text) {
			const rows = [];
			let row = [];
			let cell = "";
			let inQuotes = false;
			for (let i = 0; i < text.length; i += 1) {
				const char = text[i];
				if (inQuotes) {
					if (char === "\"") if (text[i + 1] === "\"") {
						cell += "\"";
						i += 1;
					} else inQuotes = false;
					else cell += char;
					continue;
				}
				if (char === "\"") {
					inQuotes = true;
					continue;
				}
				if (char === ",") {
					row.push(cell);
					cell = "";
					continue;
				}
				if (char === "\n") {
					row.push(cell);
					rows.push(row);
					row = [];
					cell = "";
					continue;
				}
				if (char !== "\r") cell += char;
			}
			row.push(cell);
			if (row.length > 1 || row[0] !== "") rows.push(row);
			return rows;
		}
		/** Unified diff viewer. */
		function DiffViewer({ content }) {
			const lines = content.split("\n");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: preview_module_css_default.diffViewer,
				children: lines.map((line, index) => {
					let className = preview_module_css_default.diffLineMeta;
					if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("diff ") || line.startsWith("index ")) className = preview_module_css_default.diffLineMeta;
					else if (line.startsWith("@@")) className = preview_module_css_default.diffLineHunk;
					else if (line.startsWith("+")) className = preview_module_css_default.diffLineAdd;
					else if (line.startsWith("-")) className = preview_module_css_default.diffLineDel;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className,
						children: line === "" ? " " : line
					}, index);
				})
			});
		}
		/** Image viewer. */
		function ImageViewer({ src, meta }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.content,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.imageViewer,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src,
						alt: ""
					})
				}), meta.trim() !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.imageMeta,
					children: meta
				})]
			});
		}
		/** PDF viewer: streamed route URL (iframe src) or a legacy data URL (blob). */
		function PdfViewer({ dataUrl, title }) {
			const [url, setUrl] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (!dataUrl.startsWith("data:")) {
					setUrl(dataUrl === "" ? null : dataUrl);
					return;
				}
				const blob = dataUrlToBlob(dataUrl);
				if (blob === null) {
					setUrl(null);
					return;
				}
				const objectUrl = URL.createObjectURL(blob);
				setUrl(objectUrl);
				return () => URL.revokeObjectURL(objectUrl);
			}, [dataUrl]);
			return url === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: preview_module_css_default.placeholder,
				children: t("preview.unsupported")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
				className: preview_module_css_default.pdfViewer,
				src: url,
				title
			});
		}
		/** Convert a data URL to a Blob (null on failure). */
		function dataUrlToBlob(dataUrl) {
			const comma = dataUrl.indexOf(",");
			if (comma === -1) return null;
			const meta = dataUrl.slice(0, comma);
			const mime = /data:([^;]+)/.exec(meta)?.[1] ?? "application/octet-stream";
			try {
				const binary = atob(dataUrl.slice(comma + 1));
				const bytes = new Uint8Array(binary.length);
				for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
				return new Blob([bytes], { type: mime });
			} catch {
				return null;
			}
		}
		/** URL tab: address bar + iframe. */
		function UrlViewer({ tab }) {
			const [input, setInput] = (0, react.useState)(tab.content ?? "");
			const [url, setUrl] = (0, react.useState)(() => normalizeUrl(tab.content ?? ""));
			const frameRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				setInput(tab.content ?? "");
				setUrl(normalizeUrl(tab.content ?? ""));
			}, [tab.id, tab.content]);
			const guardFrameNavigation = () => {
				const frame = frameRef.current;
				if (frame === null) return;
				try {
					const href = frame.contentWindow?.location.href;
					if (href !== void 0 && !href.startsWith("about:") && new URL(href).origin === window.location.origin) frame.src = "about:blank";
				} catch {}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.content,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: preview_module_css_default.urlBar,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: preview_module_css_default.urlInput,
						value: input,
						placeholder: t("preview.url.placeholder"),
						spellCheck: false,
						onChange: (event) => setInput(event.target.value),
						onKeyDown: (event) => {
							if (event.key === "Enter") setUrl(normalizeUrl(input));
							if (event.key === "Escape") {
								setInput(tab.content ?? "");
								setUrl(normalizeUrl(tab.content ?? ""));
							}
						},
						onFocus: (event) => event.currentTarget.select()
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("iframe", {
					ref: frameRef,
					className: preview_module_css_default.urlFrame,
					src: url,
					title: tab.title,
					sandbox: "allow-scripts allow-forms allow-popups",
					allow: "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write",
					allowFullScreen: true,
					onLoad: guardFrameNavigation
				}, `${url}\u0000${tab.reloadNonce ?? 0}`)]
			});
		}
		/** Bare domains get https://; whitespace queries go to a search engine. */
		function normalizeUrl(input) {
			const trimmed = input.trim();
			if (trimmed === "") return "about:blank";
			if (/\s/.test(trimmed)) return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
			const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
			if (typeof window !== "undefined") try {
				if (new URL(candidate).origin === window.location.origin) return "about:blank";
			} catch {}
			return candidate;
		}
		/** Office / unsupported placeholder. */
		function UnsupportedViewer({ tab }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: preview_module_css_default.placeholder,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.placeholderTitle,
						children: tab.title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.placeholderMeta,
						children: t("preview.unsupported")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.placeholderMeta,
						children: t("preview.downloadHint")
					})
				]
			});
		}
		//#endregion
		//#region src/client/preview/selection.ts
		/** Content types that map cleanly to line-based references. */
		const LINE_BASED_CONTENT_TYPES = /* @__PURE__ */ new Set([
			"code",
			"text",
			"markdown",
			"diff"
		]);
		/** Number the 1-based line of `offset` within `text` (counting newlines before it). */
		function lineOf(text, offset) {
			const upto = text.length === 0 ? "" : text.slice(0, Math.max(0, Math.min(offset, text.length)));
			let line = 1;
			for (let i = 0; i < upto.length; i += 1) if (upto.charCodeAt(i) === 10) line += 1;
			return line;
		}
		/** Return the character offset of (node, offset) measured from the start of `pre`. */
		function offsetInPre(pre, node, offset) {
			if (node === null) return null;
			try {
				const range = document.createRange();
				range.setStart(pre, 0);
				range.setEnd(node, offset);
				return range.toString().length;
			} catch {
				return null;
			}
		}
		/**
		* Build a FileReferenceSelection from a browser selection if it points to a
		* supported preview's `<pre>`. Returns null otherwise (image / pdf / url /
		* non-line content, or a selection that lives outside any code block).
		*/
		function findFileReferenceSelection(anchorElement, selection, tab) {
			if (anchorElement === null) return null;
			if (tab === null || tab.content === null) return null;
			if (!LINE_BASED_CONTENT_TYPES.has(tab.contentType)) return null;
			const pre = anchorElement.closest("pre");
			if (pre === null) return null;
			const startInPre = offsetInPre(pre, selection.anchorNode, selection.anchorOffset);
			const endInPre = offsetInPre(pre, selection.focusNode, selection.focusOffset);
			if (startInPre === null || endInPre === null) return null;
			const start = Math.min(startInPre, endInPre);
			const end = Math.max(startInPre, endInPre);
			if (start === end) return null;
			const text = pre.textContent ?? "";
			return {
				path: tab.path,
				startLine: lineOf(text, start),
				endLine: lineOf(text, end)
			};
		}
		//#endregion
		//#region src/client/preview/PreviewPanel.tsx
		/**
		* The preview panel root: tab strip + toolbar + content router, the tab
		* context menu (close left/right/others/all), the dirty-close confirmation
		* (the single entry for every batch close — middle-click included), and the
		* panel collapse button. View mode and split live here so the toolbar and the
		* content share one source; both reset when the displayed file changes.
		* @module dsh-filemgr/client/preview/PreviewPanel
		*/
		/** The preview panel (mounted in the preview grid column). */
		function PreviewPanel({ stores, onAddFileReference }) {
			const preview = stores.preview;
			const state = useStore(preview);
			const maximizedPreview = useStore(stores.layout).maximized === "preview";
			const [menu, setMenu] = (0, react.useState)(null);
			const [closingIds, setClosingIds] = (0, react.useState)(null);
			const [viewMode, setViewMode] = (0, react.useState)("preview");
			const [split, setSplit] = (0, react.useState)(false);
			const lastDirtyCheck = (0, react.useRef)(/* @__PURE__ */ new Set());
			const panelRef = (0, react.useRef)(null);
			/** The "add selection to the composer" floating action. */
			const [addToChat, setAddToChat] = (0, react.useState)(null);
			const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId) ?? null;
			(0, react.useEffect)(() => {
				setViewMode("preview");
				setSplit(false);
			}, [activeTab === null ? "" : `${activeTab.path}\u0000${activeTab.contentType}`]);
			(0, react.useEffect)(() => {
				const onSelectionChange = () => {
					const selection = window.getSelection();
					if (selection === null || selection.isCollapsed || selection.rangeCount === 0) {
						setAddToChat(null);
						return;
					}
					const node = selection.anchorNode;
					const el = node instanceof Element ? node : node?.parentElement;
					if (el === void 0 || panelRef.current === null || !panelRef.current.contains(el)) {
						setAddToChat(null);
						return;
					}
					const ref = findFileReferenceSelection(el, selection, activeTab);
					if (ref === null) {
						setAddToChat(null);
						return;
					}
					const rect = selection.getRangeAt(0).getBoundingClientRect();
					setAddToChat({
						x: rect.left,
						y: rect.bottom + 8,
						ref
					});
				};
				const onPointerDown = (event) => {
					if (addToChat === null) return;
					if (event.target.closest(`.${preview_module_css_default.addToChat}`) === null) setAddToChat(null);
				};
				document.addEventListener("selectionchange", onSelectionChange);
				document.addEventListener("mousedown", onPointerDown);
				return () => {
					document.removeEventListener("selectionchange", onSelectionChange);
					document.removeEventListener("mousedown", onPointerDown);
				};
			}, [addToChat, activeTab]);
			const handleAddToChat = () => {
				if (addToChat === null) return;
				if (onAddFileReference(addToChat.ref)) setAddToChat(null);
			};
			/** Close a batch; dirty tabs route through the confirmation first. */
			const requestClose = (ids) => {
				const dirty = state.tabs.filter((tab) => ids.includes(tab.id) && tab.dirty);
				if (dirty.length === 0) {
					preview.closeTabs(ids);
					return;
				}
				lastDirtyCheck.current = new Set(dirty.map((tab) => tab.id));
				setClosingIds(ids);
			};
			const closeMenuFor = (event, tab) => {
				event.preventDefault();
				event.stopPropagation();
				const index = state.tabs.findIndex((item) => item.id === tab.id);
				setMenu({
					x: event.clientX,
					y: event.clientY,
					entries: [
						{
							key: "close-left",
							label: t("preview.closeLeft"),
							disabled: index <= 0,
							onSelect: () => requestClose(state.tabs.slice(0, index).map((item) => item.id))
						},
						{
							key: "close-right",
							label: t("preview.closeRight"),
							disabled: index >= state.tabs.length - 1,
							onSelect: () => requestClose(state.tabs.slice(index + 1).map((item) => item.id))
						},
						{
							key: "sep-1",
							label: "---",
							onSelect: () => {}
						},
						{
							key: "close-others",
							label: t("preview.closeOthers"),
							disabled: state.tabs.length <= 1,
							onSelect: () => requestClose(state.tabs.filter((item) => item.id !== tab.id).map((item) => item.id))
						},
						{
							key: "close-all",
							label: t("preview.closeAll"),
							onSelect: () => requestClose(state.tabs.map((item) => item.id))
						}
					]
				});
			};
			/** A fresh url tab (empty address; the viewer owns the input). */
			const newUrlTab = () => {
				const stamp = Date.now();
				const tab = {
					id: `url:${stamp}`,
					title: "new tab",
					root: state.root,
					path: `url:${stamp}`,
					contentType: "url",
					content: "",
					dirty: false,
					updated: false,
					loading: false,
					truncated: false,
					error: null,
					savedAt: Date.now()
				};
				preview.update((prev) => ({
					...prev,
					open: true,
					tabs: [...prev.tabs, tab],
					activeTabId: tab.id
				}));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: panelRef,
				className: `filemgr-root ${preview_module_css_default.panel}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewTabs, {
						tabs: state.tabs,
						activeTabId: state.activeTabId,
						onSwitch: (id) => preview.switchTab(id),
						onClose: (id) => requestClose([id]),
						onContextMenu: closeMenuFor,
						onNewUrlTab: newUrlTab,
						onClosePanel: () => preview.setOpen(false),
						maximized: maximizedPreview,
						onMaximize: () => {
							stores.layout.update((prev) => ({
								...prev,
								maximized: maximizedPreview ? null : "preview"
							}));
						}
					}),
					activeTab !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewToolbar, {
						contentType: activeTab.contentType,
						hasContent: activeTab.content !== null,
						loading: activeTab.loading,
						dirty: activeTab.dirty,
						updated: activeTab.updated,
						viewMode,
						canToggleView: activeTab.contentType === "markdown" || activeTab.contentType === "html",
						split,
						canSplit: isEditableType(activeTab.contentType) && activeTab.content !== null,
						onViewModeChange: setViewMode,
						onSplitChange: setSplit,
						onRefresh: () => void preview.reloadTab(activeTab.id),
						onSave: () => void preview.saveTab(activeTab.id),
						onDownload: () => downloadTab(activeTab)
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabContent, {
						tab: activeTab,
						viewMode,
						split,
						onContentChange: (content) => preview.updateContent(activeTab.id, content),
						onSave: () => void preview.saveTab(activeTab.id)
					})] }),
					menu !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ContextMenu, {
						state: menu,
						onClose: () => setMenu(null)
					}),
					addToChat !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: preview_module_css_default.addToChat,
						style: {
							left: addToChat.x,
							top: addToChat.y
						},
						onClick: handleAddToChat,
						role: "button",
						tabIndex: -1,
						children: "添加到对话"
					}),
					closingIds !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
						title: t("preview.closeConfirmTitle"),
						body: format(t("preview.closeConfirmBody"), { count: lastDirtyCheck.current.size }),
						confirmLabel: t("common.close"),
						danger: true,
						onConfirm: () => {
							preview.closeTabs(closingIds);
							setClosingIds(null);
						},
						onCancel: () => setClosingIds(null)
					})
				]
			});
		}
		//#endregion
		//#region src/client/mount.tsx
		/**
		* DOM mounting: two React roots rendered into the panel columns the layout
		* controller appends to the frame grid. The roots wait for their columns
		* (the shell mounts asynchronously), and everything is wrapped so a DOM
		* failure degrades the panels, never the GUI boot.
		* @module dsh-filemgr/client/mount
		*/
		const EXPLORER_COL_SELECTOR = "[data-filemgr-explorer-col]";
		const PREVIEW_COL_SELECTOR = "[data-filemgr-preview-col]";
		/** Wait for one selector (the shell/frame mounts after boot settlement). */
		function waitForElement(selector, onFound) {
			let disposed = false;
			let observer;
			const tryFind = () => {
				if (disposed) return;
				const el = document.querySelector(selector);
				if (el !== null) {
					observer?.disconnect();
					onFound(el);
				}
			};
			observer = new MutationObserver(() => {
				tryFind();
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
			tryFind();
			return () => {
				disposed = true;
				observer?.disconnect();
			};
		}
		/**
		* Mount both panel roots.
		* @param stores - the panel store bundle.
		* @param onToggleExplorer - collapse toggle (owned by the layout controller).
		* @param onReference - insert a file-reference chip into the draft for a file
		*   (the Explorer row @-reference button); folders should call a different
		*   helper because the chip has no line concept for them.
		* @param onAddFileReference - insert a file-reference chip into the draft for
		*   a preview selection (path + start/end line).
		* @returns a disposer unmounting both trees.
		*/
		function mountPanels(stores, onToggleExplorer, onReference, onAddFileReference) {
			let explorerRoot;
			let previewRoot;
			const disposers = [];
			disposers.push(waitForElement(EXPLORER_COL_SELECTOR, (el) => {
				explorerRoot = (0, react_dom_client.createRoot)(el);
				explorerRoot.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExplorerPanel, {
					stores,
					onToggleCollapse: onToggleExplorer,
					onReference
				}));
			}));
			disposers.push(waitForElement(PREVIEW_COL_SELECTOR, (el) => {
				previewRoot = (0, react_dom_client.createRoot)(el);
				previewRoot.render(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewPanel, {
					stores,
					onAddFileReference
				}));
			}));
			return () => {
				for (const dispose of disposers) dispose();
				explorerRoot?.unmount();
				previewRoot?.unmount();
			};
		}
		//#endregion
		//#region \0dsh-css:src/client/styles/drag.module.css.mjs
		const css$2 = "._7Ae4ba_strip{box-sizing:border-box;width:100%;max-width:var(--dsh-composer-card-max-width,720px);border:1px dashed var(--aion-primary);color:var(--aion-text-primary);background-color:color-mix(in srgb, var(--aion-primary) 10%, transparent);border-radius:8px;justify-content:center;align-items:center;margin:0 auto;display:none}._7Ae4ba_stripActive{height:26px;display:flex}._7Ae4ba_stripText{font-size:12px;line-height:18px}";
		const tagId$2 = "@lijian-ui/dsh-file-manager/drag.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var drag_module_css_default = {
			"strip": "_7Ae4ba_strip",
			"stripActive": "_7Ae4ba_stripActive",
			"stripText": "_7Ae4ba_stripText"
		};
		//#endregion
		//#region src/client/drag/DragFileInlay.tsx
		/**
		* Composer dock inlay: the drop target for explorer file drags. It mounts
		* in the official `conversation.input.dock` band (a session-scoped list
		* slot declared by the shipped ui-conversation rc.6 shell), so it stacks
		* with the git-graph chip above the composer card. While a file row is
		* dragged over the page it shows a hint strip; on drop it splices the
		* workspace-relative path into the active session's draft through the
		* conversation input facade.
		*
		* The document-level listeners only claim drags carrying our custom MIME —
		* the composer host's own drop handling (OS image files) is untouched. The
		* host's `dragover` refuses every drop it does not claim, so this inlay
		* must `preventDefault` its own drags to make the drop land.
		* @module dsh-filemgr/client/drag/DragFileInlay
		*/
		/**
		* The composer dock entry: a zero-height anchor that shows a hint strip
		* while a file row is dragged over the page and inserts the path on drop.
		* @param props - the composed dock entry props.
		*/
		function DragFileInlay(props) {
			const [active, setActive] = (0, react.useState)(false);
			const depth = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				const reset = () => {
					depth.current = 0;
					setActive(false);
				};
				const onDragOver = (event) => {
					if (!hasFileDrag(event.dataTransfer?.types)) return;
					event.preventDefault();
					depth.current += 1;
					setActive(true);
				};
				const onDragLeave = (event) => {
					if (!hasFileDrag(event.dataTransfer?.types)) return;
					depth.current = Math.max(0, depth.current - 1);
					if (depth.current === 0) setActive(false);
				};
				const onDrop = (event) => {
					if (!hasFileDrag(event.dataTransfer?.types)) return;
					event.preventDefault();
					const path = event.dataTransfer?.getData("application/x-dsh-file") ?? "";
					reset();
					if (isValidFileDragPayload(path)) props.insertPath(path);
				};
				const onDragEnd = () => reset();
				document.addEventListener("dragover", onDragOver);
				document.addEventListener("dragleave", onDragLeave);
				document.addEventListener("drop", onDrop);
				window.addEventListener("dragend", onDragEnd);
				return () => {
					document.removeEventListener("dragover", onDragOver);
					document.removeEventListener("dragleave", onDragLeave);
					document.removeEventListener("drop", onDrop);
					window.removeEventListener("dragend", onDragEnd);
				};
			}, [props.insertPath]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: active ? `${drag_module_css_default.strip} ${drag_module_css_default.stripActive}` : drag_module_css_default.strip,
				"data-testid": "filemgr-drag-inlay",
				"aria-live": "polite",
				children: active ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: drag_module_css_default.stripText,
					children: t("explorer.drag.dropHint")
				}) : null
			});
		}
		//#endregion
		//#region src/client/chat/mermaid-chat.tsx
		/**
		* Chat-transcript mermaid enhancement: the core conversation renderer emits
		* fenced code as `pre > code.language-mermaid`, and the shell has no slot
		* for message-body post-processing — so this component rides the
		* conversation input dock as a zero-render sentinel and observes the
		* document for mermaid blocks the transcript mounts. Blocks inside the
		* preview panel's own subtree are excluded (each surface owns its blocks).
		*
		* Streaming awareness: an assistant message re-renders continuously, so a
		* diagram fence is often incomplete mid-stream. Renders that fail restore
		* the block and the next mutation retries it — once the fence closes the
		* diagram lands. Mutations are debounced to one rAF so long transcripts do
		* not re-scan the whole document: each batch is mapped to the minimal
		* mutated subtrees and scoped per-frame while the first scheduled pass scans
		* the body once. The observer is disconnected on unmount.
		* @module dsh-filemgr/client/chat/mermaid-chat
		*/
		/**
		* Map a mutation batch to the minimal scan scopes that may contain new
		* mermaid fences. Each record contributes its target and its added nodes
		* (an added element directly; otherwise that node's parentElement), deduped
		* by identity. Disconnected nodes and removed-only records yield nothing —
		* removal never introduces a fence. Pure (DOM-read only) so tests can drive
		* it in jsdom.
		*/
		function enhanceScopesFor(records) {
			const scopes = /* @__PURE__ */ new Set();
			for (const record of records) {
				if (record.addedNodes.length === 0) continue;
				if (record.target instanceof Element && record.target.isConnected) scopes.add(record.target);
				for (const node of record.addedNodes) {
					const element = node instanceof Element ? node : node.parentElement;
					if (element !== null && element.isConnected) scopes.add(element);
				}
			}
			return Array.from(scopes);
		}
		/** Hidden sentinel: renders nothing, owns the transcript observer. */
		function MermaidChatEnhancer() {
			(0, react.useEffect)(() => {
				let scheduled = false;
				let pendingFrame = 0;
				let firstPass = true;
				let pendingRecords = [];
				const run = () => {
					scheduled = false;
					const records = pendingRecords;
					pendingRecords = [];
					const scopes = enhanceScopesFor(records);
					if (firstPass) {
						firstPass = false;
						enhanceMermaidBlocks(document.body, {
							className: preview_module_css_default.mermaidBlock,
							theme: mermaidTheme(shellIsDark()),
							skip: (pre) => pre.closest(`[${DATA_MD_SCOPE}]`) !== null
						});
						return;
					}
					for (const scope of scopes) enhanceMermaidBlocks(scope, {
						className: preview_module_css_default.mermaidBlock,
						theme: mermaidTheme(shellIsDark()),
						skip: (pre) => pre.closest(`[${DATA_MD_SCOPE}]`) !== null
					});
				};
				const schedule = () => {
					if (scheduled) return;
					scheduled = true;
					pendingFrame = requestAnimationFrame(run);
				};
				const observer = new MutationObserver((records) => {
					pendingRecords = pendingRecords.concat(records);
					schedule();
				});
				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
				schedule();
				const disposeTheme = watchShellTheme((isDark) => {
					rethemeMermaidBlocks(document.body, { theme: mermaidTheme(isDark) });
				});
				return () => {
					observer.disconnect();
					disposeTheme();
					cancelAnimationFrame(pendingFrame);
				};
			}, []);
			return null;
		}
		//#endregion
		//#region src/client/chat/placeholder-hint.tsx
		/**
		* Composer placeholder hint: the shell owns the input-bar placeholder
		* ("给智能体发消息") and exposes no override seam (the composer bar is a
		* single slot owned by ui-conversation, and its locale namespace rejects
		* duplicate registration), so this zero-render sentinel — riding the same
		* `conversation.input.dock` band as the mermaid enhancer — rewrites the
		* placeholder attribute in the DOM. It re-applies on any placeholder
		* attribute change or node insert, which covers React re-renders that
		* reset the attribute to the shell default. English UI is left untouched
		* (exact-match on the Chinese string only).
		* @module dsh-filemgr/client/chat/placeholder-hint
		*/
		const OLD_PLACEHOLDER = "给智能体发消息";
		const NEW_PLACEHOLDER = "给智能体发消息。@引用项目文件，/ 调用技能与指令";
		/** Rewrite every composer input whose placeholder matches the shell default. */
		function apply$1() {
			for (const el of document.querySelectorAll("textarea, input[type=\"text\"]")) if (el.placeholder === OLD_PLACEHOLDER) el.placeholder = NEW_PLACEHOLDER;
		}
		/** Hidden sentinel: renders nothing, owns the placeholder rewriting observer. */
		function PlaceholderHint() {
			(0, react.useEffect)(() => {
				apply$1();
				const observer = new MutationObserver((records) => {
					if (records.some((record) => record.type === "attributes" || record.addedNodes.length > 0)) apply$1();
				});
				observer.observe(document.body, {
					attributes: true,
					attributeFilter: ["placeholder"],
					childList: true,
					subtree: true
				});
				return () => {
					observer.disconnect();
				};
			}, []);
			return null;
		}
		//#endregion
		//#region src/client/picker/file-picker.ts
		/** Framework-free singleton store backing the modal. */
		var FilePickerBridge = class {
			state = {
				open: false,
				req: null
			};
			listeners = /* @__PURE__ */ new Set();
			/** Current snapshot (stable reference until the next open/close). */
			getSnapshot() {
				return this.state;
			}
			/** Subscribe to open/close transitions. */
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			/** Open the picker anchored to one `@` token. */
			open(req) {
				this.state = {
					open: true,
					req
				};
				this.emit();
			}
			/** Close the picker without inserting anything. */
			close() {
				if (!this.state.open) return;
				this.state = {
					open: false,
					req: null
				};
				this.emit();
			}
			emit() {
				for (const listener of this.listeners) listener(this.state);
			}
		};
		/** The shared singleton instance. */
		const filePicker = new FilePickerBridge();
		//#endregion
		//#region src/client/reference.ts
		/** Basename of a `/`-separated relative path ('' when empty). */
		function basenameOf(rel) {
			const idx = rel.lastIndexOf("/");
			return idx >= 0 ? rel.slice(idx + 1) : rel;
		}
		/** Directory of a `/`-separated relative path ('' when none). */
		function dirnameOf(rel) {
			const idx = rel.lastIndexOf("/");
			return idx > 0 ? rel.slice(0, idx) : "";
		}
		/**
		* The chip label: basename, or `basename - dir` when the basename is
		* ambiguous across the workspace (matches the reference screenshot: a short
		* name plus the line range, never the full path).
		*/
		function formatRefLabel(ref) {
			const basename = basenameOf(ref.path);
			const dirname = dirnameOf(ref.path);
			const name = dirname === "" ? basename : `${basename} - ${dirname}`;
			return ref.endLine > ref.startLine ? `${name} ${ref.startLine}-${ref.endLine}` : `${name} ${ref.startLine}`;
		}
		/** The `@path:lines` model form (what the codec serializes to on submit). */
		function formatFileRefToken(ref) {
			const range = ref.endLine > ref.startLine ? `${ref.startLine}-${ref.endLine}` : `${ref.startLine}`;
			return `@${ref.path}:${range}`;
		}
		/** Append `text` to the session's composer draft (plain text — no chip). */
		function appendToDraft(ctx, sessionId, text) {
			try {
				if (sessionId === void 0) return false;
				const actx = ctx.sessions.scope(sessionId);
				if (actx === void 0) return false;
				const conversation = ctx.conversation;
				if (conversation === void 0) return false;
				const input = conversation.input.for(actx);
				const draft = input.state.getSnapshot().draft;
				input.setDraft(draft.trim() === "" ? text : `${draft} ${text}`);
				return true;
			} catch (error) {
				console.warn("[dsh-filemgr] draft insert failed:", error);
				return false;
			}
		}
		/**
		* Insert a file-reference chip into the composer draft at `span`, replacing
		* its range with an occurrence the machine renders as a `</> name N-M`
		* pill. The model text (`@path:lines`) is serialized on submit by the `file`
		* source's codec (file-source.ts) — never the clipboard text.
		*
		* @returns true when the bail was accepted (CAS will still reject on
		*   stale draftRev — caller can re-read draft after).
		*/
		function insertFileReference(ctx, sessionId, ref, span) {
			try {
				if (sessionId === void 0) return false;
				const actx = ctx.sessions.scope(sessionId);
				if (actx === void 0) return false;
				const reference = {
					source: "file",
					ref: formatFileRefToken(ref),
					label: formatRefLabel(ref),
					clipboardText: formatFileRefToken(ref)
				};
				return actx.bail(actx, "slash/input-insert-reference", {
					reference,
					span
				});
			} catch (error) {
				console.warn("[dsh-filemgr] file-reference insert failed:", error);
				return false;
			}
		}
		/**
		* Append a file-reference chip at the end of the current draft (the explorer
		* `@` button and the preview "添加到对话" action path). Reads the latest
		* draft + draftRev from the conversation shell and inserts a zero-length chip
		* there, so the chip lands after whatever the user has already typed.
		*
		* @returns true on success.
		*/
		function appendFileReferenceChip(ctx, sessionId, ref) {
			if (sessionId === void 0) return false;
			const actx = ctx.sessions.scope(sessionId);
			if (actx === void 0) return false;
			const conversation = ctx.conversation;
			if (conversation === void 0) return false;
			const snap = conversation.input.for(actx).state.getSnapshot();
			return insertFileReference(ctx, sessionId, ref, {
				start: snap.draft.length,
				end: snap.draft.length,
				draftRev: snap.draftRev
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/styles/picker.module.css.mjs
		const css$1 = ".P3QwHG_overlay{z-index:9000;background:#00000073;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.P3QwHG_modal{background:var(--aion-bg-base);border:1px solid var(--aion-border-base);width:520px;max-width:92vw;max-height:76vh;font-family:var(--aion-font-sans);color:var(--aion-text-primary);border-radius:10px;flex-direction:column;display:flex;overflow:hidden;box-shadow:0 12px 40px #00000059}.P3QwHG_header{border-bottom:1px solid var(--aion-border-base);flex-direction:column;flex:none;gap:8px;padding:12px 14px;display:flex}.P3QwHG_titleRow{justify-content:space-between;align-items:center;display:flex}.P3QwHG_title{font-size:14px;font-weight:600}.P3QwHG_closeBtn{width:26px;height:26px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;display:inline-flex}.P3QwHG_closeBtn:hover{background:var(--aion-bg-hover);color:var(--aion-text-primary)}.P3QwHG_searchWrap{background:var(--aion-bg-1);border:1px solid var(--aion-border-base);border-radius:8px;align-items:center;gap:6px;height:34px;padding:0 8px;display:flex}.P3QwHG_searchWrap:focus-within{border-color:var(--aion-primary)}.P3QwHG_searchIcon{color:var(--aion-text-secondary);flex-shrink:0;display:inline-flex}.P3QwHG_searchInput{min-width:0;color:var(--aion-text-primary);font-size:13px;font-family:var(--aion-font-sans);background:0 0;border:none;outline:none;flex:1}.P3QwHG_searchInput::placeholder{color:var(--aion-text-tertiary)}.P3QwHG_searchClear{width:20px;height:20px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;display:inline-flex}.P3QwHG_searchClear:hover{background:var(--aion-bg-hover)}.P3QwHG_rootPath{color:var(--aion-text-tertiary);font-size:11px;font-family:var(--aion-font-mono);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.P3QwHG_body{flex-direction:column;flex:1;gap:2px;min-height:0;padding:6px;display:flex;overflow-y:auto}.P3QwHG_row{cursor:pointer;user-select:none;height:30px;color:var(--aion-text-primary);border-radius:4px;align-items:center;gap:6px;padding-right:8px;display:flex}.P3QwHG_row:hover{background:var(--aion-bg-hover)}.P3QwHG_rowSelected{background:#165dff1f}.P3QwHG_rowSelected:hover{background:#165dff2e}.P3QwHG_chev{width:18px;height:18px;color:var(--aion-text-secondary);border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;display:inline-flex}.P3QwHG_chev:hover{color:var(--aion-text-primary);background:var(--aion-bg-active)}.P3QwHG_chevSpacer{flex-shrink:0;width:18px}.P3QwHG_icon{color:var(--aion-text-secondary);flex-shrink:0;justify-content:center;align-items:center;display:inline-flex}.P3QwHG_name{white-space:nowrap;text-overflow:ellipsis;flex-direction:column;flex:1;gap:1px;min-width:0;font-size:13px;display:flex;overflow:hidden}.P3QwHG_subpath{color:var(--aion-text-tertiary);font-size:10px;font-family:var(--aion-font-mono)}.P3QwHG_check{border:1px solid var(--aion-border-base);color:#fff;background:0 0;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;width:16px;height:16px;display:inline-flex}.P3QwHG_checkOn{background:var(--aion-primary);border-color:var(--aion-primary)}.P3QwHG_note{color:var(--aion-text-tertiary);padding:4px 8px;font-size:12px}.P3QwHG_footer{border-top:1px solid var(--aion-border-base);flex-direction:column;flex:none;gap:10px;padding:10px 14px;display:flex}.P3QwHG_chips{flex-wrap:wrap;align-items:center;gap:6px;min-height:24px;display:flex}.P3QwHG_chipsEmpty{color:var(--aion-text-tertiary);font-size:12px}.P3QwHG_chip{background:var(--aion-bg-hover);border:1px solid var(--aion-border-base);max-width:260px;height:24px;color:var(--aion-text-primary);font-size:12px;font-family:var(--aion-font-mono);border-radius:999px;align-items:center;gap:4px;padding:0 4px 0 8px;display:inline-flex}.P3QwHG_chip span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.P3QwHG_chipX{width:16px;height:16px;color:var(--aion-text-secondary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;display:inline-flex}.P3QwHG_chipX:hover{color:var(--aion-text-primary);background:#0000001f}.P3QwHG_footerActions{justify-content:flex-end;gap:8px;display:flex}.P3QwHG_cancelBtn{border:1px solid var(--aion-border-base);height:32px;color:var(--aion-text-secondary);cursor:pointer;font-size:13px;font-family:var(--aion-font-sans);background:0 0;border-radius:6px;padding:0 16px}.P3QwHG_cancelBtn:hover{background:var(--aion-bg-hover);color:var(--aion-text-primary)}.P3QwHG_insertBtn{background:var(--aion-primary);color:#fff;cursor:pointer;height:32px;font-size:13px;font-weight:500;font-family:var(--aion-font-sans);border:none;border-radius:6px;padding:0 16px}.P3QwHG_insertBtn:hover:not(:disabled){filter:brightness(1.1)}.P3QwHG_insertBtn:disabled{opacity:.4;cursor:default}";
		const tagId$1 = "@lijian-ui/dsh-file-manager/picker.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var picker_module_css_default = {
			"body": "P3QwHG_body",
			"cancelBtn": "P3QwHG_cancelBtn",
			"check": "P3QwHG_check",
			"checkOn": "P3QwHG_checkOn",
			"chev": "P3QwHG_chev",
			"chevSpacer": "P3QwHG_chevSpacer",
			"chip": "P3QwHG_chip",
			"chipX": "P3QwHG_chipX",
			"chips": "P3QwHG_chips",
			"chipsEmpty": "P3QwHG_chipsEmpty",
			"closeBtn": "P3QwHG_closeBtn",
			"footer": "P3QwHG_footer",
			"footerActions": "P3QwHG_footerActions",
			"header": "P3QwHG_header",
			"icon": "P3QwHG_icon",
			"insertBtn": "P3QwHG_insertBtn",
			"modal": "P3QwHG_modal",
			"name": "P3QwHG_name",
			"note": "P3QwHG_note",
			"overlay": "P3QwHG_overlay",
			"rootPath": "P3QwHG_rootPath",
			"row": "P3QwHG_row",
			"rowSelected": "P3QwHG_rowSelected",
			"searchClear": "P3QwHG_searchClear",
			"searchIcon": "P3QwHG_searchIcon",
			"searchInput": "P3QwHG_searchInput",
			"searchWrap": "P3QwHG_searchWrap",
			"subpath": "P3QwHG_subpath",
			"title": "P3QwHG_title",
			"titleRow": "P3QwHG_titleRow"
		};
		//#endregion
		//#region src/client/picker/FilePickerModal.tsx
		/**
		* File-picker modal: a pi-desktop-style multi-select tree browser for '@'
		* file/folder references.
		*
		* Trigger: typing `@` (with nothing after it) in the composer opens this
		* modal directly — no inline trigger menu (the shell's trigger menu is a
		* flat candidate list that cannot host a tree). The modal owns a recursive
		* tree with lazy expansion, a workspace filename search, per-row checkboxes
		* for multi-selection, and a chip row of the picked paths.
		*
		* Insertion replaces the `@` token the picker was opened from with the
		* picked references joined by spaces (`@a.ts @src/ @b.md`); cancel drops
		* the stray `@`.
		* @module dsh-filemgr/client/picker/FilePickerModal
		*/
		/** Debounce for the workspace search box. */
		const SEARCH_DEBOUNCE_MS = 200;
		/** Split a relative path into its ancestor chain ('' when empty). */
		function ancestors(rel) {
			const out = [];
			let acc = "";
			for (const part of rel.split("/")) {
				if (part === "") continue;
				acc = acc === "" ? part : `${acc}/${part}`;
				out.push(acc);
			}
			return out;
		}
		/** The modal surface (portal target; renders only while open). */
		function FilePickerModal({ state, api, onInsert, onClose }) {
			const req = state.req;
			const root = req?.root ?? "";
			const [expanded, setExpanded] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [dirs, setDirs] = (0, react.useState)({});
			const [loading, setLoading] = (0, react.useState)({});
			const [selected, setSelected] = (0, react.useState)(/* @__PURE__ */ new Map());
			const [search, setSearch] = (0, react.useState)("");
			const [searchResults, setSearchResults] = (0, react.useState)(null);
			const [searching, setSearching] = (0, react.useState)(false);
			const searchSeq = (0, react.useRef)(0);
			/** Load one directory listing into the tree cache (guarded). */
			const loadDir = (dir) => {
				if (dirs[dir] !== void 0 || loading[dir]) return;
				setLoading((prev) => ({
					...prev,
					[dir]: true
				}));
				api.list(root, dir).then((result) => {
					setLoading((prev) => ({
						...prev,
						[dir]: false
					}));
					if (result.ok) setDirs((prev) => ({
						...prev,
						[dir]: result.value.entries
					}));
				});
			};
			/** Prime the tree: root + the initial directory's ancestor chain. */
			(0, react.useEffect)(() => {
				setExpanded(/* @__PURE__ */ new Set());
				setDirs({});
				setLoading({});
				setSelected(/* @__PURE__ */ new Map());
				setSearch("");
				setSearchResults(null);
				if (root === "") return;
				loadDir("");
				if (req !== null && req.initialDir !== "") for (const dir of ancestors(req.initialDir)) {
					setExpanded((prev) => new Set(prev).add(dir));
					loadDir(dir);
				}
			}, [root, req?.initialDir]);
			(0, react.useEffect)(() => {
				const q = search.trim();
				if (q === "") {
					searchSeq.current += 1;
					setSearchResults(null);
					setSearching(false);
					return;
				}
				const seq = ++searchSeq.current;
				setSearching(true);
				const timer = setTimeout(() => {
					api.search(root, q).then((result) => {
						if (searchSeq.current !== seq) return;
						setSearching(false);
						setSearchResults(result.ok ? result.value.hits : []);
					});
				}, SEARCH_DEBOUNCE_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [
				search,
				root,
				api
			]);
			const toggleDir = (dir) => {
				setExpanded((prev) => {
					const next = new Set(prev);
					if (next.has(dir)) next.delete(dir);
					else {
						next.add(dir);
						loadDir(dir);
					}
					return next;
				});
			};
			/** Toggle one path in the multi-selection (checkbox semantics). */
			const toggleSelect = (path, isDir) => {
				setSelected((prev) => {
					const next = new Map(prev);
					if (next.has(path)) next.delete(path);
					else next.set(path, isDir);
					return next;
				});
			};
			(0, react.useEffect)(() => {
				if (!state.open) return;
				const onKey = (e) => {
					if (e.key === "Escape") onClose();
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [state.open, onClose]);
			const tree = (0, react.useMemo)(() => {
				const renderNode = (entry, depth) => {
					const isDir = entry.isDir;
					const isOpen = expanded.has(entry.path);
					const isSel = selected.has(entry.path);
					const children = dirs[entry.path] ?? [];
					const isLoading = loading[entry.path] === true;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${picker_module_css_default.row}${isSel ? ` ${picker_module_css_default.rowSelected}` : ""}`,
						style: { paddingLeft: 8 + depth * 16 },
						onClick: () => toggleSelect(entry.path, isDir),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: picker_module_css_default.chev,
								role: "button",
								tabIndex: -1,
								onClick: (e) => {
									if (!isDir) return;
									e.stopPropagation();
									toggleDir(entry.path);
								},
								children: isDir ? isOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronDownIcon, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronRightIcon, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: picker_module_css_default.chevSpacer })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: picker_module_css_default.icon,
								children: isDir ? isOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderOpenIcon, { size: 15 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, { size: 15 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 15 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: picker_module_css_default.name,
								title: entry.path,
								children: entry.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `${picker_module_css_default.check}${isSel ? ` ${picker_module_css_default.checkOn}` : ""}`,
								onClick: (e) => {
									e.stopPropagation();
									toggleSelect(entry.path, isDir);
								},
								children: isSel ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 12 }) : null
							})
						]
					}), isDir && isOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: isLoading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: picker_module_css_default.note,
						style: { paddingLeft: 8 + (depth + 1) * 16 },
						children: "加载中…"
					}) : children.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: picker_module_css_default.note,
						style: { paddingLeft: 8 + (depth + 1) * 16 },
						children: "（空目录）"
					}) : children.map((child) => renderNode(child, depth + 1)) })] }, entry.path);
				};
				return renderNode;
			}, [
				expanded,
				dirs,
				loading,
				selected,
				toggleDir,
				toggleSelect
			]);
			if (!state.open || req === null) return null;
			const rootEntries = dirs[""] ?? [];
			const rootLoading = loading[""] === true;
			const selectedList = Array.from(selected.entries()).map(([path, isDir]) => ({
				path,
				isDir
			}));
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: picker_module_css_default.overlay,
				onMouseDown: (e) => {
					if (e.target === e.currentTarget) onClose();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: picker_module_css_default.modal,
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: picker_module_css_default.header,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: picker_module_css_default.titleRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: picker_module_css_default.title,
										children: "引用项目文件"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: picker_module_css_default.closeBtn,
										onClick: onClose,
										"aria-label": "关闭",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 16 })
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: picker_module_css_default.searchWrap,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: picker_module_css_default.searchIcon,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchIcon, { size: 14 })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											className: picker_module_css_default.searchInput,
											placeholder: "搜索工作区文件…",
											value: search,
											onChange: (e) => setSearch(e.target.value),
											autoFocus: true
										}),
										search !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: picker_module_css_default.searchClear,
											onClick: () => setSearch(""),
											"aria-label": "清空",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 13 })
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: picker_module_css_default.rootPath,
									title: root,
									children: root
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: picker_module_css_default.body,
							children: searchResults !== null ? searching ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: picker_module_css_default.note,
								children: "搜索中…"
							}) : searchResults.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: picker_module_css_default.note,
								children: "没有匹配的文件"
							}) : searchResults.map((hit) => {
								const isSel = selected.has(hit.path);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: `${picker_module_css_default.row}${isSel ? ` ${picker_module_css_default.rowSelected}` : ""}`,
									onClick: () => toggleSelect(hit.path, false),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: picker_module_css_default.chevSpacer }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: picker_module_css_default.icon,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, { size: 15 })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: picker_module_css_default.name,
											title: hit.path,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: hit.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: picker_module_css_default.subpath,
												children: hit.path
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: `${picker_module_css_default.check}${isSel ? ` ${picker_module_css_default.checkOn}` : ""}`,
											onClick: (e) => {
												e.stopPropagation();
												toggleSelect(hit.path, false);
											},
											children: isSel ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 12 }) : null
										})
									]
								}, hit.path);
							}) : rootLoading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: picker_module_css_default.note,
								children: "加载中…"
							}) : rootEntries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: picker_module_css_default.note,
								children: "（空目录）"
							}) : rootEntries.map((entry) => tree(entry, 0))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: picker_module_css_default.footer,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: picker_module_css_default.chips,
								children: selectedList.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: picker_module_css_default.chipsEmpty,
									children: "选择文件或目录（可多选）"
								}) : selectedList.map((pick) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: picker_module_css_default.chip,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										"@",
										pick.path,
										pick.isDir ? "/" : ""
									] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: picker_module_css_default.chipX,
										onClick: () => toggleSelect(pick.path, pick.isDir),
										"aria-label": "移除",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, { size: 11 })
									})]
								}, pick.path))
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: picker_module_css_default.footerActions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: picker_module_css_default.cancelBtn,
									onClick: onClose,
									children: "取消"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: picker_module_css_default.insertBtn,
									disabled: selectedList.length === 0,
									onClick: () => onInsert(selectedList),
									children: ["插入", selectedList.length > 0 ? ` (${selectedList.length})` : ""]
								})]
							})]
						})
					]
				})
			}), document.body);
		}
		/** Minimal inline check glyph (avoids an extra icon import cycle). */
		function CheckIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 12 12",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M2.5 6.2 4.8 8.5 9.5 3.5",
					stroke: "currentColor",
					strokeWidth: "1.6",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		/** Active `@` mention candidate in the draft (mimics pi-desktop's getActiveMention). */
		function findAtMention(value, caret) {
			const before = value.slice(0, caret);
			const at = before.lastIndexOf("@");
			if (at < 0) return null;
			if (at > 0 && !/[\s,;.!?()[\]{}"'/\\]/.test(before[at - 1])) return null;
			return {
				start: at,
				query: before.slice(at + 1)
			};
		}
		/**
		* The picker host: watches the composer textarea for a bare `@` (opening the
		* modal directly, pi-desktop style — no inline trigger menu), subscribes to
		* the bridge, and renders the modal. Insertion replaces the `@` token span
		* with the picked references joined by spaces; cancel drops the stray `@`.
		*/
		function FilePickerHost({ ctx, api }) {
			const [state, setState] = (0, react.useState)(filePicker.getSnapshot());
			(0, react.useEffect)(() => filePicker.subscribe(setState), []);
			(0, react.useEffect)(() => {
				if (!state.open || state.req === null) return;
				try {
					const actx = ctx.sessions.scope(state.req.sessionId);
					if (actx === void 0) return;
					ctx.get("inputTriggers")?.sessionOf(actx).dismiss();
				} catch {}
			}, [
				state.open,
				state.req,
				ctx
			]);
			(0, react.useEffect)(() => {
				const watched = /* @__PURE__ */ new WeakSet();
				const onInput = (e) => {
					if (filePicker.getSnapshot().open) return;
					const ta = e.target;
					const caret = ta.selectionStart ?? ta.value.length;
					const mention = findAtMention(ta.value, caret);
					if (mention === null || mention.query !== "") return;
					const snapshot = ctx.sessions.list.getSnapshot();
					const sessionId = snapshot.current;
					if (sessionId === void 0) return;
					const cwd = snapshot.byId[sessionId]?.cwd;
					const root = typeof cwd === "string" && cwd !== "" ? cwd : "";
					if (root === "") return;
					filePicker.open({
						sessionId,
						root,
						initialDir: "",
						span: {
							start: mention.start,
							end: mention.start + 1
						}
					});
				};
				const attach = () => {
					for (const ta of document.querySelectorAll("textarea")) {
						if (watched.has(ta)) continue;
						watched.add(ta);
						ta.addEventListener("input", onInput);
					}
				};
				attach();
				const observer = new MutationObserver(attach);
				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
				return () => {
					observer.disconnect();
					for (const ta of document.querySelectorAll("textarea")) ta.removeEventListener("input", onInput);
				};
			}, [ctx]);
			/**
			* Insert the picked references into the composer draft as file-reference
			* chips (one `slash/input-insert-reference` bail per file; the `file`
			* source codec serializes each to `@path:lines` on submit). Folders fall
			* back to plain `@path/ ` text since the chip has no line concept.
			* Multiple selections land as adjacent chips.
			*/
			const insert = async (paths) => {
				const current = filePicker.getSnapshot();
				if (!current.open || current.req === null || paths.length === 0) return;
				const { sessionId, root, span } = current.req;
				try {
					const actx = ctx.sessions.scope(sessionId);
					if (actx === void 0) return;
					const conversation = ctx.conversation;
					if (conversation === void 0) return;
					const shell = conversation.input.for(actx);
					const lineCounts = await Promise.all(paths.map(async (pick) => {
						if (pick.isDir) return {
							pick,
							lines: null
						};
						const result = await api.read(root, pick.path, false);
						if (!result.ok) return {
							pick,
							lines: null
						};
						const text = result.value.content;
						const trimmed = text.endsWith("\n") ? text.slice(0, -1) : text;
						return {
							pick,
							lines: trimmed === "" ? 1 : trimmed.split("\n").length
						};
					}));
					let cursor = span.end;
					let firstSpan = true;
					for (const { pick, lines } of lineCounts) {
						if (pick.isDir) {
							appendToDraft(ctx, sessionId, `@${pick.path}/ `);
							continue;
						}
						if (lines === null) continue;
						const snap = shell.state.getSnapshot();
						const currentSpan = firstSpan ? {
							start: span.start,
							end: span.end,
							draftRev: snap.draftRev
						} : {
							start: cursor,
							end: cursor,
							draftRev: snap.draftRev
						};
						if (insertFileReference(ctx, sessionId, {
							path: pick.path,
							startLine: 1,
							endLine: lines
						}, currentSpan)) {
							firstSpan = false;
							cursor += 2;
						}
					}
					filePicker.close();
				} catch (error) {
					console.warn("[dsh-filemgr] picker insert failed:", error);
				}
			};
			/** Cancel: drop the stray `@` the picker was opened from. */
			const close = () => {
				const current = filePicker.getSnapshot();
				if (current.open && current.req !== null) {
					const { sessionId, span } = current.req;
					try {
						const actx = ctx.sessions.scope(sessionId);
						const conversation = ctx.conversation;
						if (actx !== void 0 && conversation !== void 0) {
							const shell = conversation.input.for(actx);
							const draft = shell.state.getSnapshot().draft;
							if (draft.slice(span.start, span.end).startsWith("@")) shell.setDraft(draft.slice(0, span.start) + draft.slice(span.end));
						}
					} catch {}
				}
				filePicker.close();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePickerModal, {
				state,
				api,
				onInsert: insert,
				onClose: close
			});
		}
		//#endregion
		//#region src/client/chat/file-ref.ts
		/** Longest candidate text (arbitrary safety cap against huge code spans). */
		const MAX_REF_LENGTH = 512;
		/** Normalize both separators to '/'. */
		function normalizeSlashes(value) {
			return value.replace(/\\/g, "/");
		}
		/**
		* Interpret a code span's text as a workspace path. Returns the workspace
		* RELATIVE path ('' = the root itself), or null when the text is not a
		* recognizable in-workspace path. Never resolves above the root: `..`
		* segments, absolute outside paths, URLs and whitespace/multi-line text all
		* fall back to null so the transcript keeps its normal behavior.
		*/
		function pathFromText(text, root) {
			const raw = text.trim();
			if (raw === "" || raw.length > MAX_REF_LENGTH) return null;
			if (/[\r\n]/.test(raw)) return null;
			if (raw.includes("://")) return null;
			const normalized = normalizeSlashes(raw);
			const rootNorm = normalizeSlashes(root).replace(/\/+$/, "");
			if (rootNorm === "") return null;
			if (normalized.startsWith("/")) {
				if (normalized === rootNorm) return "";
				if (!normalized.startsWith(rootNorm + "/")) return null;
				const rel = normalized.slice(rootNorm.length).replace(/^\/+/, "");
				return validRelative(rel) ? rel : null;
			}
			if (/^[a-zA-Z]:/.test(normalized)) {
				const lower = normalized.toLowerCase();
				const lowerRoot = rootNorm.toLowerCase();
				if (lower === lowerRoot) return "";
				if (!lower.startsWith(lowerRoot + "/")) return null;
				const rel = normalized.slice(rootNorm.length).replace(/^\/+/, "");
				return validRelative(rel) ? rel : null;
			}
			const rel = normalized.startsWith("./") ? normalized.slice(2) : normalized;
			return validRelative(rel) ? rel : null;
		}
		/** Validate a relative path: no escapes, no whitespace, looks path-like. */
		function validRelative(rel) {
			if (rel === "" || rel.length > MAX_REF_LENGTH) return false;
			if (/\s/.test(rel)) return false;
			const segments = rel.split("/");
			if (segments.length < 2) return /^[^/]*\.[^/]+$/.test(rel);
			for (const segment of segments) if (segment === "" || segment === "." || segment === "..") return false;
			return true;
		}
		/** The `code` element a click targets, when it is a candidate file ref. */
		function fileRefElement(target) {
			if (!(target instanceof Element)) return null;
			const code = target.closest("code");
			if (code === null) return null;
			if (code.closest("a") !== null) return null;
			if (code.closest(".filemgr-root") !== null) return null;
			if (code.closest("[data-filemgr-preview-col], [data-filemgr-explorer-col]") !== null) return null;
			return code;
		}
		/**
		* Locate a workspace-relative path from the transcript: Files tab + expand
		* ancestors + select; directories stay reveal-only, files also open in the
		* Preview panel (dedup focuses the existing tab). The parent listing is
		* consulted to classify the node; unknown paths keep the reveal and never
		* issue a preview request.
		*/
		async function locateFileRef(stores, api, rel) {
			const explorer = stores.explorer;
			explorer.setActiveTab("files");
			if (rel !== "") explorer.reveal(rel);
			const root = stores.layout.getSnapshot().root;
			if (root === "" || rel === "") return;
			const name = rel.split("/").pop() ?? "";
			const parent = parentRel(rel);
			let entry = explorer.getSnapshot().dirs[parent]?.find((item) => item.name === name);
			if (entry === void 0) {
				const result = await api.list(root, parent);
				if (result.ok) entry = result.value.entries.find((item) => item.name === name);
			}
			if (entry !== void 0 && !entry.isDir) stores.preview.openFile(root, rel);
		}
		/** Document-level click handler: locate recognized chat file references. */
		function handleFileRefClick(stores, api, event) {
			if (event.defaultPrevented || event.button !== 0) return;
			const code = fileRefElement(event.target);
			if (code === null) return;
			const root = stores.layout.getSnapshot().root;
			if (root === "") return;
			const rel = pathFromText(code.textContent ?? "", root);
			if (rel === null) return;
			if (stores.layout.getSnapshot().explorerCollapsed) {
				stores.layout.update((prev) => ({
					...prev,
					explorerCollapsed: false
				}));
				try {
					localStorage.setItem(`project-panel-collapse:${root}`, "expanded");
				} catch {}
			}
			locateFileRef(stores, api, rel);
		}
		//#endregion
		//#region src/client/file-source.ts
		/** The roster name the chip occurrences address (see reference.ts). */
		const FILE_SOURCE_NAME = "file";
		/**
		* Register the inert `file` reference source (codec only). Safe to call
		* multiple times (each call returns a disposer; the roster rejects a
		* duplicate (trigger, name) seat, so guard with a module flag).
		*/
		function registerFileReferenceSource(ctx) {
			const inputTriggers = ctx.get("inputTriggers");
			if (inputTriggers === void 0) return () => {};
			const source = {
				trigger: "@",
				name: FILE_SOURCE_NAME,
				candidates: async () => [],
				onPick: () => void 0,
				codec: {
					clipboardText: (ref) => ref,
					serialize: (ref, _signal) => Promise.resolve(ref)
				}
			};
			try {
				return inputTriggers.registerSource(source);
			} catch (error) {
				console.warn("[dsh-filemgr] file reference source already registered:", error);
				return () => {};
			}
		}
		//#endregion
		//#region \0dsh-css:src/client/styles/chip.module.css.mjs
		const css = "[data-decoration=chip]{background:#0f172a0f;border-radius:6px}body[data-ds-dark-theme] [data-decoration=chip]{background:#ffffff1a}[data-decoration=chip]>span:before{content:\"</>\";color:var(--aion-success,#16a34a);font-family:var(--aion-font-mono,ui-monospace, Menlo, Consolas, monospace);letter-spacing:-.5px;margin-right:4px;font-size:.85em;font-weight:700}";
		const tagId = "@lijian-ui/dsh-file-manager/chip.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lijian-ui/dsh-file-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* FileManager right-panel system — browser half: mounts the explorer and preview
		* columns into the web shell's frame grid (through the layout controller),
		* binds the four stores to the live client runtime (the active session's cwd
		* is the project root), subscribes to the host change stream (fs + git), and
		* follows the shell's dark marker (body[data-ds-dark-theme]) via CSS only.
		*
		* Failure policy: every DOM/runtime wiring failure is logged, never thrown —
		* the web shell fails the whole boot when a plugin apply throws.
		*
		* FileManager right-panel design (Apache-2.0, iOfficeAI/FileManager) — re-implemented
		* from measured behavior and architecture, not copied code.
		* @module dsh-filemgr/client
		*/
		/** Required services: sessions for the project root, locale for the copy, the settings scope for the master switch, and conversation for the composer draft edits (picker insert / @ button). */
		const inject = [
			"sessions",
			"locale",
			"settingsScope",
			"conversation"
		];
		/** Shared, stateless fs client (the PanelApi only wraps fetch calls). */
		const panelApi = new PanelApi();
		/** Apply the browser half. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, dictionaries), "dsh-filemgr: dictionaries");
			ctx.effect(() => registerFileReferenceSource(ctx), "dsh-filemgr: file reference source");
			ctx.inject([
				"slots",
				"conversation",
				"sessions"
			], (scope) => {
				const sessions = scope.sessions;
				const conversation = scope.conversation;
				scope.slots.inject("conversation.input.dock", () => scope.slots.register({
					name: "conversation.input.dock",
					id: "filemgr-drag-file",
					order: 90,
					locale: NS,
					inject: (sessionId) => ({ insertPath: (path) => {
						if (sessionId === void 0) return false;
						const actx = sessions.scope(sessionId);
						if (actx === void 0) return false;
						const input = conversation.input;
						if (input === void 0) return false;
						const shell = input.for(actx);
						const draft = shell.state.getSnapshot().draft;
						shell.setDraft(insertPathIntoDraft(draft, path));
						return true;
					} })
				}, DragFileInlay));
			});
			ctx.inject(["slots"], (scope) => {
				scope.slots.inject("conversation.input.dock", () => scope.slots.register({
					name: "conversation.input.dock",
					id: "filemgr-mermaid-chat",
					order: 91
				}, MermaidChatEnhancer));
			});
			ctx.inject(["slots"], (scope) => {
				scope.slots.inject("conversation.input.dock", () => scope.slots.register({
					name: "conversation.input.dock",
					id: "filemgr-placeholder-hint",
					order: 92
				}, PlaceholderHint));
			});
			ctx.inject(["slots", "settingsScope"], (settingsCtx) => {
				const settingsCard = new FileManagerSettingsCardController((settingsCtx.get("webUiSettings") ?? settingsCtx.settingsScope).bind({ namespace: NS }));
				settingsCtx.slots.inject("web-ui.plugin.item", () => {
					const unregister = settingsCtx.slots.register({
						name: "web-ui.plugin.item",
						id: "filemgr",
						order: 110,
						locale: NS,
						inject: () => settingsCard.inject()
					}, FileManagerSettingsCard);
					return () => {
						settingsCard.dispose();
						unregister();
					};
				});
			});
			ctx.effect(() => {
				let panelScope;
				try {
					const binder = ctx.get("webUiSettings") ?? ctx.settingsScope;
					if (binder !== void 0) panelScope = binder.bind({ namespace: NS });
				} catch (error) {
					panelScope = void 0;
				}
				const enabled = () => panelScope?.getSnapshot().value?.enabled ?? true;
				let disposeUi;
				/**
				* Mount the whole panel UI (columns, handles, floating button, change
				* stream, persists) and return its teardown. A fresh lifecycle per
				* enable keeps toggling idempotent (the layout controller cannot be
				* reused after dispose).
				*/
				const mountUi = () => {
					const stores = createPanelStores(panelApi);
					const layout = new PanelLayoutController(stores.layout);
					const disposers = [];
					let disposeGitEvents;
					let currentRoot = "";
					let lastPreviewOpen = false;
					const onReference = (path, isDir) => {
						const sessionId = ctx.sessions.list.getSnapshot().current;
						if (sessionId === void 0) {
							console.warn("[dsh-filemgr] @ 引用插入失败：没有活动会话");
							return;
						}
						if (isDir) {
							appendToDraft(ctx, sessionId, `@${path}/ `);
							return;
						}
						panelApi.read(currentRoot, path, false).then((result) => {
							if (!result.ok) {
								appendToDraft(ctx, sessionId, `@${path} `);
								return;
							}
							const text = result.value.content;
							const trimmed = text.endsWith("\n") ? text.slice(0, -1) : text;
							const lines = trimmed === "" ? 1 : trimmed.split("\n").length;
							appendFileReferenceChip(ctx, sessionId, {
								path,
								startLine: 1,
								endLine: lines
							});
						});
					};
					const onAddFileReference = (selection) => {
						const sessionId = ctx.sessions.list.getSnapshot().current;
						return appendFileReferenceChip(ctx, sessionId, selection);
					};
					const bindRoot = () => {
						const snapshot = ctx.sessions.list.getSnapshot();
						const sessionId = snapshot.current;
						const cwd = sessionId === void 0 ? void 0 : snapshot.byId[sessionId]?.cwd;
						const root = typeof cwd === "string" && cwd !== "" ? cwd : "";
						if (root === currentRoot) return;
						currentRoot = root;
						disposeGitEvents?.();
						disposeGitEvents = void 0;
						const previewOpen = stores.preview.getSnapshot().open;
						lastPreviewOpen = previewOpen;
						layoutSetRoot(stores.layout, root, previewOpen);
						stores.explorer.setRoot(root);
						stores.scm.setRoot(root);
						stores.preview.setRoot(root);
						syncGitSubscription();
					};
					/**
					* Keep the git change stream in lockstep with SCM-tab visibility:
					* opening the changes tab starts the subscription (and fetches status
					* once immediately — the host poll only ticks on its own cadence);
					* switching away closes it, so git polling happens only while the SCM
					* panel is actually on screen. Idempotent — explorer state changes
					* (expansion, selection) call it and it no-ops unless the tab flipped.
					*/
					const syncGitSubscription = () => {
						const root = currentRoot;
						const want = root !== "" && stores.explorer.getSnapshot().activeTab === "changes";
						if (want && disposeGitEvents === void 0) {
							stores.scm.refresh();
							disposeGitEvents = subscribePanelEvents(root, (event) => {
								if (event.kind === "git") {
									stores.scm.update((prev) => prev.root !== root ? prev : {
										...prev,
										status: event.status,
										loading: false
									});
									stores.preview.handleGitChange(root);
								}
								if (event.kind === "gitUnavailable") stores.scm.update((prev) => prev.root !== root ? prev : {
									...prev,
									status: null,
									loading: false,
									gitMissing: true
								});
							});
						} else if (!want && disposeGitEvents !== void 0) {
							disposeGitEvents();
							disposeGitEvents = void 0;
						}
					};
					disposers.push(ctx.sessions.list.subscribe(bindRoot));
					disposers.push(stores.explorer.subscribe(syncGitSubscription));
					bindRoot();
					const onToggleFile = () => layout.toggleExplorer();
					window.addEventListener("dsh-dock:toggle-filepanel", onToggleFile);
					const unsubFileState = stores.layout.subscribe(() => {
						window.dispatchEvent(new CustomEvent("dsh-dock:filepanel-state", { detail: !stores.layout.getSnapshot().explorerCollapsed }));
					});
					window.dispatchEvent(new CustomEvent("dsh-dock:filepanel-state", { detail: !stores.layout.getSnapshot().explorerCollapsed }));
					const mirrorPreviewOpen = () => {
						const open = stores.preview.getSnapshot().open;
						if (open === lastPreviewOpen) return;
						lastPreviewOpen = open;
						stores.layout.update((prev) => ({
							...prev,
							previewOpen: open
						}));
						if (open) {
							const col = document.querySelector("[data-filemgr-preview-col]");
							col?.classList.add("filemgr-preview-enter");
							setTimeout(() => col?.classList.remove("filemgr-preview-enter"), 300);
						}
					};
					disposers.push(stores.preview.subscribe(mirrorPreviewOpen));
					let langObserver;
					const syncLanguage = () => {
						setLanguage(document.documentElement.lang?.startsWith("zh") ? "zh" : "en");
					};
					langObserver = new MutationObserver(syncLanguage);
					langObserver.observe(document.documentElement, {
						attributes: true,
						attributeFilter: ["lang"]
					});
					syncLanguage();
					try {
						layout.mount();
						mountPanels(stores, () => layout.toggleExplorer(), onReference, onAddFileReference);
					} catch (error) {
						console.error("[dsh-filemgr] mount failed:", error);
					}
					const pickerHostEl = document.createElement("div");
					document.body.appendChild(pickerHostEl);
					const pickerRoot = (0, react_dom_client.createRoot)(pickerHostEl);
					pickerRoot.render((0, react.createElement)(FilePickerHost, {
						ctx,
						api: panelApi
					}));
					const onFileRefClick = (event) => {
						try {
							handleFileRefClick(stores, panelApi, event);
						} catch (error) {
							console.error("[dsh-filemgr] file ref locate failed:", error);
						}
					};
					document.addEventListener("click", onFileRefClick);
					const flushOnHide = () => stores.flushNow();
					const onVisibilityChange = () => {
						if (document.visibilityState === "hidden") flushOnHide();
					};
					window.addEventListener("pagehide", flushOnHide);
					document.addEventListener("visibilitychange", onVisibilityChange);
					return () => {
						flushOnHide();
						window.removeEventListener("pagehide", flushOnHide);
						window.removeEventListener("dsh-dock:toggle-filepanel", onToggleFile);
						unsubFileState();
						document.removeEventListener("visibilitychange", onVisibilityChange);
						document.removeEventListener("click", onFileRefClick);
						disposeGitEvents?.();
						langObserver?.disconnect();
						pickerRoot.unmount();
						pickerHostEl.remove();
						for (const dispose of disposers) dispose();
						layout.dispose();
					};
				};
				const syncUi = () => {
					if (enabled() && disposeUi === void 0) disposeUi = mountUi();
					else if (!enabled() && disposeUi !== void 0) {
						disposeUi();
						disposeUi = void 0;
					}
				};
				syncUi();
				const unsubscribeSettings = panelScope?.subscribe(syncUi);
				return () => {
					unsubscribeSettings?.();
					if (disposeUi !== void 0) {
						disposeUi();
						disposeUi = void 0;
					}
				};
			}, "dsh-filemgr: wiring");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map