// @ts-check
/**
 * Core control panel: theme picker, layout edit mode, add widget, reset,
 * backup export/import, and the generated per-widget settings dialog.
 *
 * Styled only with tokens (core/tokens.css), so it fits every theme automatically.
 */
import { h } from "./dom.js";
import { resolveSettings } from "./contracts.js";

/**
 * @typedef {import("./registry.js").Registry} Registry
 * @typedef {import("./contracts.js").WidgetDef} WidgetDef
 */

/**
 * @param {{
 *   registry: Registry, hidden: boolean,
 *   currentThemeId: () => string, isEditing: () => boolean,
 *   onTheme: (id: string) => void, onEdit: (on: boolean) => void, onAddWidget: (type: string) => void,
 *   onResetLayout: () => void, onExport: () => void, onImport: () => void,
 * }} o
 */
export function createUI(o) {
  const toastEl = h("div", { class: "ui-toast", role: "status" });
  document.body.append(toastEl);

  /** @param {string} msg */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(/** @type {any} */ (toastEl)._t);
    /** @type {any} */ (toastEl)._t = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  const panel = h("aside", { class: "ui-panel", hidden: true, "aria-label": "Home page settings" });
  const fab = h("button", { class: "ui-fab", title: "Customize (Alt+C)", "aria-label": "Customize", text: "✦" });
  const doneBtn = h("button", { class: "ui-done", hidden: true, text: "Done editing", onclick: () => setEdit(false) });

  /** @param {boolean} on */
  function setEdit(on) {
    o.onEdit(on);
    doneBtn.hidden = !on;
    if (panel.hidden === false) renderPanel();
  }

  async function renderPanel() {
    const [themes, widgets] = await Promise.all([o.registry.allThemes(), o.registry.allWidgets()]);
    const active = o.currentThemeId();
    panel.replaceChildren(
      h("header", {}, [h("b", { text: "Customize" }), h("button", { class: "ui-x", title: "Close", text: "✕", onclick: close })]),

      h("h4", { text: "Theme" }),
      h("div", { class: "ui-themes" }, themes.map(t => h("button", {
        class: "ui-theme" + (t.id === active ? " on" : ""),
        title: t.description ?? t.name,
        onclick: async () => { await o.onTheme(t.id); renderPanel(); },
      }, [
        h("span", { class: "ui-swatch", style: { background: t.tokens["--bg"], borderColor: t.tokens["--border"] } }, [
          h("i", { style: { background: t.tokens["--accent"] } }), h("i", { style: { background: t.tokens["--surface"] } }),
        ]),
        h("span", { text: t.name }),
      ]))),

      h("h4", { text: "Layout" }),
      h("div", { class: "ui-row" }, [
        h("button", { class: "ui-btn" + (o.isEditing() ? " on" : ""), text: o.isEditing() ? "Stop editing" : "Edit layout", onclick: () => setEdit(!o.isEditing()) }),
        h("button", { class: "ui-btn", text: "Reset to theme default", onclick: () => { if (confirm("Reset this theme's layout to its default? Your widget data (to-dos, notes…) is kept.")) o.onResetLayout(); } }),
      ]),
      o.isEditing() && h("div", { class: "ui-add" }, [
        h("small", { text: "Add a widget:" }),
        ...widgets.map(w => h("button", {
          class: "ui-chip",
          title: w.description ?? "",
          text: w.name + (w.bestWith?.length ? ` · best with ${w.bestWith.join(", ")}` : ""),
          onclick: () => o.onAddWidget(w.id),
        })),
      ]),

      h("h4", { text: "Backup" }),
      h("div", { class: "ui-row" }, [
        h("button", { class: "ui-btn", text: "Export", onclick: o.onExport }),
        h("button", { class: "ui-btn", text: "Import", onclick: o.onImport }),
      ]),
    );
  }

  function open() { panel.hidden = false; renderPanel(); }
  function close() { panel.hidden = true; }

  fab.addEventListener("click", () => (panel.hidden ? open() : close()));
  addEventListener("keydown", e => {
    if (e.altKey && e.key.toLowerCase() === "c") { e.preventDefault(); panel.hidden ? open() : close(); }
    if (e.key === "Escape") { if (!panel.hidden) close(); else if (o.isEditing()) setEdit(false); }
  });

  if (!o.hidden) document.body.append(fab, panel, doneBtn);

  /**
   * Settings form generated from a widget's `settings` declaration.
   * @param {WidgetDef} def @param {Record<string, any>} saved
   * @returns {Promise<Record<string, any> | null>} new settings, or null if cancelled
   */
  function editSettings(def, saved) {
    const values = resolveSettings(def, saved);
    return new Promise(resolve => {
      const fields = (def.settings ?? []).map(s => {
        const id = `set-${s.key}`;
        /** @type {HTMLElement} */
        let input;
        if (s.type === "toggle") input = h("input", { id, type: "checkbox", checked: !!values[s.key] });
        else if (s.type === "textarea") input = h("textarea", { id, rows: 6, text: values[s.key] ?? "" });
        else if (s.type === "select") input = h("select", { id }, (s.options ?? []).map(op => h("option", { value: op.value, text: op.label, selected: op.value === values[s.key] })));
        else input = h("input", { id, type: s.type === "number" ? "number" : "text", value: values[s.key] ?? "" });
        return { s, input, row: h("label", { class: "ui-field", for: id }, [h("span", { text: s.label }), input]) };
      });

      const dlg = /** @type {HTMLDialogElement} */ (h("dialog", { class: "ui-dialog" }));
      const form = h("form", { method: "dialog" }, [
        h("h3", { text: `${def.name} settings` }),
        ...(fields.length ? fields.map(f => f.row) : [h("p", { text: "This widget has no settings." })]),
        h("div", { class: "ui-row" }, [
          h("button", { class: "ui-btn", value: "cancel", text: "Cancel" }),
          fields.length > 0 && h("button", { class: "ui-btn on", value: "save", text: "Save" }),
        ]),
      ]);
      dlg.append(form);
      document.body.append(dlg);
      dlg.addEventListener("close", () => {
        if (dlg.returnValue === "save") {
          /** @type {Record<string, any>} */
          const out = {};
          for (const { s, input } of fields) {
            const el = /** @type {HTMLInputElement} */ (input);
            out[s.key] = s.type === "toggle" ? el.checked : s.type === "number" ? Number(el.value) : el.value;
          }
          resolve(out);
        } else resolve(null);
        dlg.remove();
      });
      dlg.showModal();
    });
  }

  return { toast, editSettings, open, close };
}
