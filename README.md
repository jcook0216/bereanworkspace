# Handoff: Berean Workspace — apparatus honesty pass (ship after step 2)

## Overview
The Berean Workspace is a dark, scholarly Bible-study app: three panes (navigation / scripture / study apparatus) over API.Bible text, with commentaries, Treasury of Scripture Knowledge (TSK) cross-references, and a Strong's lexicon.

Four user-reported bugs turned out to share one root cause: **the app fabricates data when a corpus has no entry.** Commentaries generate prose attributed to real authors (Gill, Henry, JFB). TSK invents cross-references, including references that point at the verse in focus. Unknown Strong's numbers get a synthetic lexicon entry with an invented occurrence count. And `NASB` is aliased to the ASV Bible ID, so ASV text is labelled "New American Standard Bible (1995)" — which is what hid the other three (the app never looked empty, so the gaps never surfaced).

**Product policy for this pass, decided by the owner:** no substitute content, ever. Where a corpus has no entry, show an honest empty state that names what is missing and whether the module is installed. Unlicensed translations (NKJV, NLT) stay visible in the module manager but greyed and unselectable. NASB 2020 is licensed on the current API.Bible key and becomes the real default.

## Scope of this handoff — ship after step 2
Do BUG 7 and BUG 1/5/6 (delete fabricators + wire empty states) and the TSK import, then ship. The Strong's KJV underlay (BUG 4) and real commentary corpora come after the ship.

| Order | Work | Ship gate |
| --- | --- | --- |
| 1 | BUG 7 — resolve real Bible IDs; NASB 2020; drop NKJV/NLT aliases | ✅ in ship |
| 2 | BUG 1, 5, 6 — delete every fabricator; return null/empty; wire the empty states | ✅ in ship |
| 3 | TSK corpus import (real public-domain TSK into IndexedDB) | ✅ in ship |
| 4 | BUG 4 — Strong's-tagged KJV underlay + aligner | after ship |
| 5 | Real commentary corpora with scope indexing (BUG 3) | after ship |
| — | BUG 2, BUG 8, and the scrollIntoView note — small, take them with step 2 | ✅ in ship |

Rationale: an app that admits what it lacks is usable; one that invents commentary is not. Steps 1–3 make it honest and make TSK genuinely useful, which is the largest visible win per hour of work.

## About the design files
`Exposition Fix.dc.html` in this bundle is a **design reference written in HTML** — a prototype of the intended look and behaviour, not production code to copy. The task is to recreate these states inside the existing React + TypeScript + Zustand codebase using its established patterns (`src/components/StudyPane.tsx`, `NavigationPane.tsx`, `ScripturePane.tsx`, `src/store/useBereanStore.ts`). Open it in a browser; it is one page with labelled option cards.

The sample commentary/TSK/Strong's content shown in the prototype is **illustrative, so the layout reads** — it is not data to import. Real content comes from the corpora named below.

## Fidelity
**High fidelity.** Colours, type, spacing, and states in the prototype are final and should be matched. Values are listed under Design Tokens.

## Screens / views in the prototype

### 1a — App in situ, apparatus panes with real states
The full three-pane workspace at the focus verse (Ruth 1:1), showing the Exposition tab with:
- **Commentary card** — header row: source name (15px/600), then a **scope chip** reading `on Ruth 1:1` (verse), `on Ruth 1:1–5` (passage), or `on Ruth 1` (chapter). The chip is the fix for BUG 3: it tells the reader why a passage-scoped note is showing under a single verse. Chip: 11px/600, letter-spacing .04em, muted fg on a 1px border, radius 5px, padding 3px 7px.
- **Empty state** — used when the module is installed but has no entry for this verse. Names the source and the verse, states the nearest indexed verse if there is one, and offers no prose. Never a paragraph of generated text.
- **Not-installed state** — distinct from empty: names the module and offers an install action, in amber (`#fbbf24` fg, `rgba(245,158,11,.1)` bg, `rgba(245,158,11,.3)` border).
- The **"Study Apparatus" chip was removed** from the Focus header — do not reintroduce it.

### 1b — Module manager (Bibles / apparatus corpora)
A list in the navigation pane where each row is a translation or corpus with an explicit state: installed, available to download (with size), or **`license required` — greyed, unselectable** (NKJV, NLT). Selecting a greyed row must be impossible, not merely error-producing. Apparatus corpora (TSK, Strong's lexicon, Strong's-tagged KJV underlay, each commentary) appear as their own rows with the same state vocabulary.

### 2a — Strong's tab
Selected-term panel (lemma, transliteration, pronunciation, gloss, morphology, occurrence count) — **every value read from the lexicon module, none synthesised.** Below it, "Lexicon terms in this chapter": the distinct Strong's numbers actually present in the current chapter's underlay, sorted by frequency in that chapter, with real counts. On a lexicon miss: empty state naming the number that was not found plus the module's install state.

### 2b — TSK Refs tab
Cross-references for the focus verse, grouped by clause of the verse (TSK's own structure) with the clause text as a small caps-tracked group label. Each row: reference (600 weight) + preview text (muted). No `theme` line unless the source actually carries one. Empty state when the verse has no references.

### 2c — TSK popover
Opened from a verse number. Same clause grouping, condensed. **When the verse has no TSK references the popover does not open at all** — no popover of generic references.

## The fixes, verbatim

### BUG 1 — Commentaries invent content when no entry exists
`src/data/commentariesDataset.ts:201`

*Cause:* `getCommentaryForVerse()` falls through to a template generator ("Dr. John Gill examines this sacred passage in its canonical context…") whenever `COMMENTARIES_DATA` has no match. `COMMENTARIES_DATA` holds only 11 entries: Gen 1:1, Gen 1:2, John 1:1, John 3:16, Ps 23:1, Rom 8:28. Every other verse in the Bible — including the Ruth 1:1 in the screenshot — renders fabricated prose attributed to a real author.

*Fix:* Change the return type to `CommentaryEntry | null` and delete the generator branch entirely (the `let content = ''` block through the synthetic return). Return `null` on miss. Load real corpora from an indexed store instead of a TS array literal: an IndexedDB object store `commentaries` keyed `[source, book, chapter, verse]` with a second index on `[source, book, chapter, startVerse, endVerse]` for passage-scoped notes, populated from a downloaded module. Add `getCommentaryForRef(book, chapter, verse, source) → { entry, scope: 'verse' | 'passage' | null, coveredRange, nearestVerse, indexedVerses }`.

*Accept:* No string in the shipped bundle attributes generated text to Gill, Henry, or JFB. A verse with no entry renders the empty state in 1a, never prose.

### BUG 2 — Source filter says "All (4)" but there are three sources
`src/components/StudyPane.tsx` (commentary pills), `NavigationPane.tsx` (footer)

*Cause:* The pill labels are hardcoded: `'All (4)'`, `'John Gill (1)'`, `'M. Henry (2)'`, `'JFB (3)'`. The parenthetical is a keyboard-shortcut hint, but it reads as a result count, and "All (4)" implies a fourth commentary that does not exist. The footer hint "Hotkeys: [1-4] Commentary" and the floating pill "[1-4] Commentaries" say the same.

*Fix:* Derive the label list from `COMMENTARY_METADATA` keys. Render the shortcut as a visually distinct `<kbd>` rather than a parenthetical, and put the actual entry count for the current verse in the pill (e.g. "Gill · no entry", "Henry · 1"). Regenerate the two hotkey strings from the source count.

*Accept:* Source count in every label matches `COMMENTARY_METADATA.length`. No literal `'(4)'` remains.

### BUG 3 — Commentary granularity is invisible, so passage notes look like wrong answers
`src/data/commentariesDataset.ts`, `StudyPane.tsx`

*Cause:* `CommentaryEntry` has a single `verse: number`. Public-domain Gill is verse-indexed but Henry and JFB are largely passage- and chapter-scoped, so a Henry note on Ruth 1:1–5 either has to be duplicated onto five verse keys or dropped. Both look like bugs to the reader.

*Fix:* Extend the schema to `{ book, chapter, startVerse, endVerse, scope: 'verse' | 'passage' | 'chapter' }` and index on the range. In `StudyPane`, render a scope chip on every commentary card header — "on Ruth 1:1" for verse scope, "on Ruth 1:1–5" for passage, "on Ruth 1" for chapter (see 1a). A passage note stays visible while the focus verse is inside its range; the chip is what tells the user why.

*Accept:* Every commentary card shows a scope chip whose range contains the focus verse. Ruth 1:1 with a Henry passage note on vv. 1–5 shows the note with chip "on Ruth 1:1–5", not an empty state.

### BUG 4 — Strong's badges disappear as soon as live text loads
`src/services/apiBibleService.ts:60`, `ScripturePane.tsx` (`renderSegments`)

*Cause:* `fetchChapterVerses` maps API.Bible verses to `segments: [{ text: v.text }]` — one segment, no `strongs` field. `ScripturePane`'s local baseline (`getVersesForChapter`) does carry tagged segments, so badges paint for a frame and then vanish when the fetch resolves and `setPrimaryVerses` replaces them. The H/G# toggle stays lit, which makes it look like the toggle is broken.

*Fix:* Stop treating tagging as a property of the display text. Load a Strong's-tagged KJV underlay module (verse → `[{ word, strongs, morph }]`) and align it to the display translation per verse: render display words, and attach badges from the underlay by word index with a lenient aligner (normalise case/punctuation, skip supplied words). Keep the underlay in IndexedDB; key it `[book, chapter, verse]`. When no underlay row exists for a verse, render the text with no badges and **disable** the H/G# toggle for that chapter with a tooltip stating why.

*Accept:* Ruth 1:1 shows badges on judges/famine/sojourn with live API.Bible text loaded, and the toggle is disabled — not silently inert — where the underlay is missing.

### BUG 5 — Unknown Strong's numbers get a fabricated lexicon entry
`src/components/ScripturePane.tsx` (`handleStrongsClick`), `StudyPane.tsx`

*Cause:* On a lexicon miss, `handleStrongsClick` synthesises an entry with lemma `'עִבְרִית'` / `'Ἑλληνικά'` (literally the words "Hebrew"/"Greek"), pronunciation `'lexicon-ref'`, definition "Strong's Concordance term {n} in original canonical biblical manuscript", and `occurrences: 12` — a hardcoded number presented as data. Separately, "Lexicon terms in this Chapter" renders `Object.values(STRONGS_LEXICON).slice(0, 8)`, which is the first eight entries of the whole dictionary regardless of chapter.

*Fix:* Delete the synthetic entry. `setSelectedStrongs(null)` on a miss and render an empty state naming the number that was not found, with the lexicon module's install state. Replace the `slice(0, 8)` list with the distinct Strong's numbers actually present in the current chapter's underlay rows, sorted by frequency in that chapter, with real counts.

*Accept:* No entry in the Strong's tab has a value not read from the lexicon module. The chapter term list changes when you change chapter.

### BUG 6 — TSK fabricates cross-references, including self-references
`src/data/tskCrossReferences.ts:100`

*Cause:* `TSK_CROSS_REFERENCES` has ~18 verse keys. `getTskForVerse`'s fallback returns three invented rows: a self/previous-chapter reference built by string arithmetic (`` `${book} ${chapter > 1 ? chapter - 1 : chapter}:${verse}` `` — at Ruth 1:1 that yields the reference "Ruth 1:1" pointing at itself, with the preview text "Contextual study continuation from Ruth chapter 1."), plus a hardcoded Ps 119:105 and 2 Tim 3:16 for every verse in Scripture. The "Theme" line is likewise invented. Both the TSK Refs tab and the verse-number popover show these.

*Fix:* Return `TskReference[]` (possibly empty) and delete the fallback. Import the real public-domain TSK (31,102 verses, ~572k references) into IndexedDB keyed `[book, chapter, verse]`; drop the `theme` field or populate it only where the source has one. Render an empty state in the tab and suppress the popover entirely when a verse has no references. Also normalise book naming: keys use `'Psalms'` while ref strings say `'Psalm'`, and the popover's jump regex fails on names like "Song of Solomon" — resolve refs through the `BIBLE_BOOKS` table, not a regex.

*Accept:* No reference in the TSK tab points at the verse in focus. Clicking a verse number with no TSK data opens nothing rather than a popover of generic references.

### BUG 7 — NASB label does not match the text being served
`server.ts:78`, `src/data/scriptureDataset.ts:5` — **do this first**

*Cause:* `TRANSLATION_TO_BIBLE_ID` maps `'NASB'` → `'06125adad2d5898a-01'`, which is the ASV Bible ID (comment: "uses ASV as foundational text"). NKJV → KJV id, NLT → WEB id, same pattern. Meanwhile `TRANSLATION_CONFIG.NASB.name` says "New American Standard Bible (1995)" and `hasStrongs: true`, the chapter header prints that name, and `NavigationPane`'s copy says "ships with NASB pre-installed". So the workspace confidently labels ASV text as NASB 1995. That is the versioning bug.

*Fix:* The API.Bible key has NASB 2020 entitled, so serve it for real: resolve Bible IDs at boot by `GET /v1/bibles` and matching abbreviation (`NASB2020`), cache the id, and fail loudly — 502 with a clear message — rather than substituting another Bible when a requested translation has no id. Set `TRANSLATION_CONFIG.NASB.name` to "New American Standard Bible (2020)" and make NASB the default `primaryTranslation` in `useBereanStore`. Remove the NKJV → KJV and NLT → WEB aliases; keep those two listed in the module manager as greyed "license required" rows (see 1b) and refuse to select them. `hasStrongs` must be **false** for NASB — its badges come from the KJV underlay of BUG 4, not from the NASB text.

*Accept:* The chapter header's translation name is derived from the same id the text was fetched with. Requesting an unlicensed translation returns an error the UI surfaces; it never silently renders a different Bible. Default load is NASB 2020, labelled 2020.

### BUG 8 — Two competing keyboard handlers for the 1–4 shortcuts
`src/App.tsx` (global keydown), `src/components/StudyPane.tsx` (second keydown)

*Cause:* Both `App` and `StudyPane` register window keydown listeners that call `setActiveCommentarySource` for `'1'`–`'4'`. `StudyPane`'s copy also lacks the `e.preventDefault()` the App handler has for other keys. Harmless today because both set the same value, but it is a duplicate listener that will diverge the moment either changes — and the source list it maps to is the wrong length (BUG 2).

*Fix:* Delete the `StudyPane` `useEffect` and keep one handler in `App`, generated from the commentary source list rather than literal key checks.

*Accept:* One window keydown listener for commentary shortcuts.

### NOTE — `scrollIntoView` on every `activeVerse` change fights the user
`src/components/ScripturePane.tsx`

*Cause:* The effect on `[activeVerse, currentChapter, currentBook]` smooth-scrolls the focused verse to centre. Since clicking any verse sets `activeVerse`, clicking a verse you are already reading yanks the column. Not one of the four reported bugs, but it will read as one.

*Fix:* Only scroll when the verse change came from navigation (command palette, TSK jump, chapter change) — track the source of the change in the store rather than reacting to `activeVerse` itself.

*Accept:* Clicking a visible verse does not move the scroll position.

## Interactions & behaviour
- **Empty vs not-installed are different states.** Empty = module present, no entry for this ref (neutral, muted). Not-installed = module absent (amber, with an install action). Never collapse them into one message.
- **Greyed license rows** are non-interactive: no click, no hover lift, `cursor: default`, ~45% opacity on the label.
- **TSK popover** opens on verse-number click only when references exist; it closes on outside click and Escape.
- **H/G# toggle** is disabled (not inert) where no underlay row exists, with a tooltip stating why.
- **Commentary source shortcuts** — one listener, keys derived from the source list.
- All hover transitions 120ms ease; no motion beyond opacity/background changes.

## State management
Zustand (`src/store/useBereanStore.ts`). Needed:
- `primaryTranslation` (default `'NASB'`), resolved Bible id + resolution error state
- `activeVerse`, `currentBook`, `currentChapter`, plus **`verseChangeSource`** (`'click' | 'nav'`) to gate scrolling
- `selectedStrongs` (nullable — null on miss, no synthesis)
- `activeCommentarySource`, derived from `COMMENTARY_METADATA`
- `installedModules` map (translations + corpora) with `installed | available | licenseRequired`, download progress
- Corpora read through async IndexedDB accessors, not module-scope TS literals

## Data sources for the corpora
- **TSK** — public domain, 31,102 verses / ~572k references. Ship as a downloadable module, import into IndexedDB keyed `[book, chapter, verse]`.
- **Strong's lexicon + Strong's-tagged KJV underlay** — public domain. Underlay rows `[book, chapter, verse] → [{ word, strongs, morph }]`.
- **Commentaries** — Gill (verse-indexed), Matthew Henry and JFB (largely passage/chapter-scoped). Index by range with an explicit `scope`.
- **Translations** — API.Bible. NASB 2020 licensed on the current key; NKJV and NLT are not, and stay greyed.

## Design tokens
| Token | Value |
| --- | --- |
| Page background | `#0a0a0b` |
| Panel background | `#0F0F12` |
| Panel border | `#1e293b` |
| Divider (soft) | `rgba(30,41,59,.7)` |
| Primary text | `#f1f5f9` |
| Secondary text | `#94a3b8` |
| Muted text | `#64748b` |
| Accent (amber, install/attention) | `#f59e0b`, fg `#fbbf24`, bg `rgba(245,158,11,.1)`, border `rgba(245,158,11,.3)` |
| Radius | 5px chips/badges, 10px panels |
| Body type | 14px / 1.6 |
| Card title | 15px / 600 |
| Section heading | 20px / 600 |
| Label / chip | 11px / 600–700, letter-spacing .04em–.14em |
| Spacing scale | 8 / 14 / 22 / 28 / 32 px |

## Assets
None. All UI is type, rules, and colour — no images or icon files.

## Files in this bundle
- `Exposition Fix.dc.html` — the design reference (open in a browser). Option cards: 1a app in situ, 1b module manager, 1c the fix spec on screen, 2a Strong's tab, 2b TSK Refs tab, 2c TSK popover.
- `support.js` — runtime for the HTML prototype only. Not part of the app.
- `README.md` — this file.

## Repo
`jcook0216/bereanworkspace`, branch `main`. Screen → file map is in `github.md` at the project root.
