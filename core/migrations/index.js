// @ts-check
/**
 * Data migrations. User data must NEVER be lost across versions.
 *
 * Rules:
 *  - CURRENT_SCHEMA is the version the code expects.
 *  - MIGRATIONS[n] turns a version-n document into a version-(n+1) document.
 *  - Migrations are pure functions (no I/O), never edited after release, and each gets a test.
 *  - To change the data shape: bump CURRENT_SCHEMA, append a migration, add a test,
 *    and update the State typedef + docs/CONTRACTS.md.
 */

/**
 * @typedef {object} LayoutItem
 * @property {string} id        unique instance id
 * @property {string} widget    widget type id (registry id)
 * @property {number} x         column, 0-based
 * @property {number} y         row, 0-based
 * @property {number} w         width in columns
 * @property {number} h         height in rows
 * @property {boolean} [locked] theme-defined slot the user cannot move/remove
 * @property {Record<string, any>} [settings] per-instance settings
 */

/**
 * @typedef {object} State
 * @property {number} schemaVersion
 * @property {{ themeId: string }} settings
 * @property {Record<string, LayoutItem[]>} layouts     themeId -> layout (absent = use theme default)
 * @property {Record<string, any>} widgetData           widget type -> data shared by all its instances, in all themes
 * @property {Record<string, any>} themeState           themeId -> private theme data (e.g. RPG xp/gold)
 */

export const CURRENT_SCHEMA = 1;

/** @returns {State} */
export function emptyState() {
  return { schemaVersion: CURRENT_SCHEMA, settings: { themeId: "default" }, layouts: {}, widgetData: {}, themeState: {} };
}

/** @type {Array<(doc: any) => any>} index n migrates v(n) -> v(n+1) */
export const MIGRATIONS = [
  // 0 -> 1: no data / pre-release data -> first real schema
  doc => ({ ...emptyState(), ...(doc && typeof doc === "object" ? doc : {}), schemaVersion: 1 }),
];

/**
 * Bring any stored document up to CURRENT_SCHEMA.
 * @param {any} doc
 * @returns {{ state: State, migrated: boolean }}
 */
export function migrate(doc) {
  let version = Number.isInteger(doc?.schemaVersion) ? doc.schemaVersion : 0;
  if (version > CURRENT_SCHEMA) {
    // Data from a NEWER version of the extension (e.g. after a downgrade). Do not touch it.
    throw new Error(`Stored data is schema v${version}, this build only understands up to v${CURRENT_SCHEMA}.`);
  }
  let out = doc;
  const from = version;
  while (version < CURRENT_SCHEMA) {
    out = MIGRATIONS[version](structuredClone(out ?? null));
    version++;
    out.schemaVersion = version;
  }
  return { state: /** @type {State} */ (out), migrated: version !== from };
}
