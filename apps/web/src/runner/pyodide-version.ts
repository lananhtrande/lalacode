// Ghim phiên bản Pyodide (docs/conventions.md §Phụ thuộc).
// Phải khớp với dependency `pyodide` trong apps/web/package.json —
// scripts/copy-pyodide.mjs kiểm tra điều đó mỗi lần build.
export const PYODIDE_VERSION = '314.0.7';

/** Thư mục tự host; có số phiên bản nên cache vĩnh viễn được. */
export const PYODIDE_BASE_URL = `/pyodide/${PYODIDE_VERSION}/`;
