# Deployment Guide

## Deploying for a New Convention Year

### 1. Create the convention iteration config (`ef<YEAR>.ts`)

Add a new file at `src/config/convention/eurofurence/ef<YEAR>.ts` modelled after the previous year's file (e.g. `ef2026.ts`). It must define:

- **`AbstractEFGoodieWithoutVariants<YEAR>`** — `const enum` of all goodies that have no size/variant selection (coins, bags, pins, cups, etc.). Each member maps to a stable string value that is persisted in the backend.
- **`AbstractEFGoodieWithVariants<YEAR>`** — `const enum` of goodies that do have variants (currently only the T-Shirt). The enum value becomes the key prefix in the concrete value string.
- **`ConcreteEFGoodieValue<YEAR>`** — union type of all concrete goodie strings (no-variant enums + `tshirt_<YEAR>_<size>`).
- **`EFGoodieConfig<YEAR>`** — union of `GenericGoodieConfig` types used for type-safety throughout the UI.
- **`metadataRecordForGoodies<YEAR>`** — maps every enum member to a human-readable `label` (and `variants` list for the T-Shirt). These labels appear in the sponsor desk and runner UI.
- **`iterationEF<YEAR>`** — the main settings object:
  - `conDates.start` — convention start date (`new Date("YYYY-MM-DD")`).
  - `conDates.days` — number of convention days (cast as `ConDays`).
  - `vip.regNumberList` — array of registration numbers that receive VIP treatment (can be empty initially).
  - `goodies.forPackage` — maps each `GoodiesLevel` (`tshirt`, `sponsor`, `super_sponsor`) to the ordered list of goodie enum members attendees at that level receive.
  - `goodies.forFlag` — maps staff flags (`staff`, `director`) to their goodies list (typically critter benefits + staff coin).
  - `goodies.forRegNumber` — per-registration-number overrides (usually `{}`).

**Example goodie breakdown for EF 2026:**

| Package level  | Goodies |
|----------------|---------|
| T-Shirt        | T-Shirt |
| Sponsor        | T-Shirt, Pin, Paper Fan, 3 Festival Cups |
| Super Sponsor  | T-Shirt, Pin, Paper Fan, 3 Festival Cups, Messenger Bag |

| Flag      | Goodies |
|-----------|---------|
| Staff / Director | Postcard, Bookmark, Volunteer Pin, Stress Ball, Festival Cup, Festival Wristband, Staff Coin |

---

### 2. Register the new year in `convention.ts`

File: `src/config/convention/eurofurence/convention.ts`

- Import the new metadata record and all types from `ef<YEAR>.ts`.
- Add `AbstractEFGoodieWithoutVariants<YEAR>` to the `AbstractEFGoodieWithoutVariants` union type.
- Add `AbstractEFGoodieWithVariants<YEAR>` to the `AbstractEFGoodieWithVariants` union type.
- Add `ConcreteEFGoodieValue<YEAR>` to the `ConcreteEFGoodieValue` union type.
- Add `EFGoodieConfig<YEAR>` to the `EFGoodieConfig` union type.
- Spread `metadataRecordForGoodies<YEAR>` into `metadataRecordForGoodiesEF`.

---

### 3. Switch the active iteration in `convention.ts` (root)

File: `src/config/convention.ts`

- Change the import of `iterationEF<PREV_YEAR>` to `iterationEF<YEAR>`.
- Update `currentIterationSettings` to point to `iterationEF<YEAR>`.

---

### 4. Update the GitHub secret `ENVIRONMENT_REGLIVE_TS`

The secret `ENVIRONMENT_REGLIVE_TS` in the GitHub repository settings must be updated with the **API base path** for the new convention year before deploying. This value is injected at build time as the backend endpoint for the live registration environment.

Go to: **Repository → Settings → Secrets and variables → Actions → `ENVIRONMENT_REGLIVE_TS`**

---

### 5. Update libraries (optional but recommended)

Run `npm update` and commit the updated `package-lock.json` to keep dependencies current before go-live.
