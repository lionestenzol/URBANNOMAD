# Urban Nomad App — Full System Audit Report

**Date:** March 8, 2026
**Auditor:** Automated Code Audit (Claude)
**Scope:** Full codebase review — architecture, code quality, security, performance, maintainability

---

## 1. Executive Summary

Urban Nomad is a client-side single-page application (SPA) built with vanilla HTML/CSS/JavaScript targeting urban nomads and van dwellers. The app provides zone tracking, vehicle maintenance logging, gear inventory, resource discovery, and survival budgeting.

**Overall Assessment: MVP-functional, but has significant gaps that must be addressed before production use or scaling.**

### Severity Overview

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 6 |
| Medium | 8 |
| Low | 5 |

---

## 2. Architecture Review

### 2.1 Current Structure

```
URBANNOMAD/
├── index.html           # Monolithic file: HTML + CSS + JS (~1,119 lines)
├── vercel.json          # Vercel deployment config
└── js/
    ├── resources.js     # Static resource database (110 lines)
    ├── geo.js           # Haversine distance calc (16 lines)
    ├── resourceEngine.js # Resource filtering (11 lines)
    ├── spotEngine.js    # Spot reporting system (32 lines)
    └── survivalEngine.js # Budget calculator (10 lines)
```

### 2.2 Architectural Concerns

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| A1 | **Monolithic index.html** | High | 1,119 lines mixing HTML structure, 420+ lines of CSS, and 490+ lines of JS in one file. This is unmaintainable at scale. CSS and JS should be extracted into separate files. |
| A2 | **No module system** | Medium | JS files use global scope (`function`, `const` at top level). No ES modules (`import`/`export`), no bundler. All functions and variables pollute the global namespace, risking collisions. |
| A3 | **No build pipeline** | Medium | No package.json, no bundler, no minification, no linting, no formatting. This means no automated quality checks exist. |
| A4 | **No testing infrastructure** | High | Zero test files. No test runner configured. No unit, integration, or end-to-end tests of any kind. |
| A5 | **No backend** | Medium | `syncWithServer()` is a dead stub (lines 1091-1113). All data lives in-memory and is lost on page refresh. The `safeStorage` wrapper exists but stores to an in-memory object, not localStorage. |

---

## 3. Security Audit

### 3.1 Critical — Cross-Site Scripting (XSS)

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| S1 | **DOM-based XSS via innerHTML** | Critical | `index.html:774` — `updateZoneLogsUI()` |
| S2 | **DOM-based XSS via innerHTML** | Critical | `index.html:1007-1011` — `loadResources()` |
| S3 | **DOM-based XSS via innerHTML** | Critical | `index.html:1080-1084` — `updateSpotStatus()` |

**Detail:** User input is inserted directly into the DOM using `innerHTML` without any sanitization or escaping.

**Example — Zone logging (line 774):**
```javascript
item.innerHTML = `
    <div class="item-title">${log.location}</div>  // ← User-controlled input
    <div class="item-subtitle">${log.time}</div>
`;
```

If a user enters `<img src=x onerror=alert(1)>` as a zone name, it will execute arbitrary JavaScript. This applies to:
- Zone name input (`location-input`)
- Spot name input (`spot-name-input`)
- Resource names (currently hardcoded, but a risk if data ever comes from an API)

**Remediation:** Use `textContent` for user data, or create a sanitization helper:
```javascript
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### 3.2 Other Security Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| S4 | **No input validation** | High | Number inputs (`mileage`, `fuel`, `money`, etc.) accept negative values, zero, or extremely large numbers. `Number()` returns `NaN` for non-numeric strings but this isn't checked in all paths. |
| S5 | **No Content Security Policy** | Medium | No CSP meta tag or headers. If deployed, inline scripts would need `unsafe-inline`, but a CSP should still be added to restrict resource loading. |
| S6 | **Inline event handlers** | Medium | `onclick` attributes in HTML (lines 552-556, 568-573, 591) mix behavior with markup and bypass CSP `script-src` policies. |

---

## 4. Data & State Management

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| D1 | **No data persistence** | High | `safeStorage` writes to an in-memory `memoryStorage` object (line 656), not localStorage. All user data (zone logs, vehicle logs, spot reports) is lost on every page refresh. |
| D2 | **safeStorage never reads saved data** | High | `loadData()` (line 677) hardcodes demo data instead of reading from `safeStorage`. Even if storage worked, saved data would be overwritten on every load. |
| D3 | **Spot reports are fully ephemeral** | Medium | `spotReports` array in `spotEngine.js` is never persisted anywhere — not even through `safeStorage`. |
| D4 | **Dark mode preference not loaded** | Low | `darkMode` is hardcoded to `false` on line 712. The saved value from `safeStorage` is never read back. |
| D5 | **Geolocation fallback is (0, 0)** | Low | When geolocation fails or is denied, coords default to `{lat: 0, lng: 0}` (Null Island, Gulf of Guinea). This causes resource distances to be wildly incorrect rather than showing an error message. |

---

## 5. Code Quality Issues

### 5.1 Bugs

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| B1 | **MPG calculation is misleading** | Medium | `calculateMPG()` at line 929 divides miles driven by gallons added. This only works if the user fills the tank completely each time. No guidance or validation enforces this assumption. |
| B2 | **Survival calculator double-spends money** | Medium | `calculateSurvival()` calculates food days as `money / dailyFood` AND fuel range as `(money / gasPrice) * mpg`. It treats the entire budget as available for food AND fuel separately, giving an unrealistic picture. |
| B3 | **Resource finder has no radius filter** | Low | `findNearbyResources()` returns ALL resources of a type sorted by distance, even if they're hundreds of km away. Should filter to a practical radius. |
| B4 | **submitSpotReport clears input prematurely** | Low | Line 1067 clears the spot name input after one tag report. If the user wants to report multiple tags for the same spot, they must re-type the name each time. |

### 5.2 Code Smells

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| C1 | **Variable shadowing** | Low | `initZonesList()` line 837 — inner loop variable `i` shadows the outer `forEach` callback parameter `i` on line 829. |
| C2 | **Inconsistent data property names** | Low | Geolocation uses `lng` everywhere in app code, but `resources.js` also uses `lng`. However, `getDistance()` in `geo.js` uses parameter names `lon1`/`lon2`. This inconsistency can cause confusion. |
| C3 | **Dead code** | Low | `syncWithServer()` (lines 1091-1113) and the commented-out `setInterval` (line 1116) are unreachable dead code. |
| C4 | **No error boundaries** | Medium | If any rendering function throws (e.g., accessing `.toFixed()` on undefined), the entire UI breaks with no recovery path and no user-facing error message. |

---

## 6. Performance

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| P1 | **Full DOM re-render on every change** | Medium | `updateZoneLogsUI()` and `updateVehicleLogsUI()` clear `innerHTML` and re-create all DOM elements on every single log entry. For small datasets this is fine; at 100+ entries it will cause visible jank. |
| P2 | **No lazy loading** | Low | All 5 tabs render their content on page load even though only one is visible. Minor issue at current scale. |
| P3 | **No asset optimization** | Low | No minification, no compression, no image optimization. CSS is 420+ lines inline. Acceptable for MVP but should be addressed for production. |

---

## 7. Accessibility

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| AC1 | **No ARIA attributes** | Medium | Tabs, buttons, and interactive elements lack `role`, `aria-selected`, `aria-label`, and `aria-controls` attributes. Screen readers cannot navigate the tab interface. |
| AC2 | **No keyboard navigation** | Medium | Tab switching and zone selection only work via mouse click. No `keydown` handlers for Enter/Space on interactive elements. No visible focus indicators beyond browser defaults. |
| AC3 | **Color-only status indicators** | Low | MPG status (green vs amber) and category items rely solely on color to convey meaning. Users with color vision deficiency cannot distinguish these. |
| AC4 | **No skip navigation** | Low | No mechanism to skip the tab bar and jump to content. |

---

## 8. Deployment & DevOps

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| DO1 | **No CI/CD pipeline** | Medium | No GitHub Actions, no automated tests, no lint checks on PR. Code goes from commit straight to production with zero gates. |
| DO2 | **No environment configuration** | Low | No `.env` files, no environment-specific settings. The API endpoint in `syncWithServer()` is hardcoded to `/api/sync`. |
| DO3 | **SPA routing may cause 404s** | Low | `vercel.json` rewrites all routes to `index.html`, but the app has no client-side router. Direct URL access works only because everything is on one page. |

---

## 9. Recommendations — Priority Order

### Immediate (Before Any Users)

1. **Fix XSS vulnerabilities (S1-S3).** Replace all `innerHTML` usage with `textContent` for user-supplied data, or implement an HTML escaping utility. This is a security blocker.

2. **Fix data persistence (D1-D2).** Switch `safeStorage` to actually use `localStorage` with a `try/catch` fallback. Update `loadData()` to read from storage instead of hardcoding demo data.

3. **Add input validation (S4).** Validate all numeric inputs (positive numbers, reasonable ranges). Sanitize all text inputs before storage and display.

### Short Term (Next Sprint)

4. **Extract CSS and JS from index.html (A1).** Move inline styles to `css/styles.css` and inline scripts to `js/app.js`. Reduces file from 1,119 lines to ~200 lines of clean HTML.

5. **Fix the survival calculator (B2).** The calculator should let users allocate budget between food and fuel, not pretend the full amount is available for both.

6. **Add basic error handling (C4).** Wrap rendering functions in try/catch. Show user-friendly error messages. Handle geolocation denial gracefully with an actual message instead of defaulting to (0, 0).

7. **Remove inline event handlers (S6).** Move all `onclick` attributes to `addEventListener` calls in the JS initialization block for consistency and CSP compatibility.

### Medium Term (Next Month)

8. **Set up a build pipeline (A3).** Add `package.json`, a linter (ESLint), formatter (Prettier), and a simple bundler (Vite or esbuild). Add pre-commit hooks.

9. **Add tests (A4).** Start with unit tests for pure functions (`calculateMPG`, `calculateSurvival`, `getDistance`, `findNearbyResources`). Add basic DOM tests for tab switching and log rendering.

10. **Implement ES modules (A2).** Convert JS files to use `import`/`export`. Load the main script with `<script type="module">`. Eliminates global namespace pollution.

11. **Add accessibility (AC1-AC4).** Add ARIA roles to tabs, keyboard navigation, focus management, and non-color status indicators.

12. **Add CI/CD (DO1).** Set up GitHub Actions with lint, test, and deploy steps.

### Long Term (Roadmap)

13. **Build the backend.** Implement the `/api/sync` endpoint. Add user authentication. Enable cross-device data sync and community spot reporting.

14. **Replace hardcoded resources.** Integrate with a real API (Google Places, Overpass/OSM) for dynamic resource discovery based on actual user location.

15. **Add offline support.** Implement a Service Worker for offline capability — critical for the target user base who may have intermittent connectivity.

---

## 10. File-by-File Summary

| File | Lines | Role | Issues Found |
|------|-------|------|-------------|
| `index.html` | 1,119 | Monolithic app (HTML + CSS + JS) | XSS (x3), no persistence, no validation, no accessibility, inline handlers |
| `js/resources.js` | 110 | Static resource database | Hardcoded data, SF-only, no dynamic loading |
| `js/geo.js` | 16 | Haversine distance calculation | Correct implementation, parameter naming inconsistency |
| `js/resourceEngine.js` | 11 | Resource filtering/sorting | No radius limit, returns all results |
| `js/spotEngine.js` | 32 | Spot reporting system | No persistence, in-memory only |
| `js/survivalEngine.js` | 10 | Budget calculator | Double-counts budget across food and fuel |
| `vercel.json` | 8 | Deployment config | Functional, no issues |

---

## 11. Positive Observations

- **Clean, readable code.** Functions are well-named and focused. The codebase is easy to understand.
- **Good UI/UX design.** Dark mode, responsive layout, card-based design, and the color system are well-implemented.
- **Correct Haversine implementation.** `geo.js` is mathematically sound.
- **Modular JS files.** The separation of `geo.js`, `resourceEngine.js`, `spotEngine.js`, and `survivalEngine.js` shows good instincts toward modularity.
- **Zero dependencies.** No supply chain risk. Fast load times. No dependency maintenance burden.
- **Pragmatic scope.** The feature set is focused and useful for the target audience.

---

*End of audit report.*
