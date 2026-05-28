# NovelScript Studio

NovelScript Studio is an Electron desktop app for long-form novel and script writing. It includes project management, chapters, outlines, characters, world settings, foreshadowing, revenue records, daily check-ins, storyboard notes, AI-assisted writing settings, and local backup/export tools.

## Requirements

- Node.js 22 LTS
- npm
- Windows 10/11 for local Windows packaging
- macOS for local Mac packaging

The app uses `better-sqlite3`, which has native binaries. If tests or packaging fail after switching between Node and Electron builds, run `npm ci` or rebuild the dependency for the target runtime.

## Development

```powershell
npm ci
npm run dev
```

Run checks before committing:

```powershell
npm run build
npm test
```

## Packaging

Build unpacked directories for quick smoke tests:

```powershell
npm run package:win:dir
npm run package:mac:dir
```

Build distributable packages:

```powershell
npm run package:win
npm run package:mac
```

Outputs are written to `release/`.

Windows packaging produces an NSIS installer and a portable build. Mac packaging produces DMG and ZIP packages. Mac packages built without an Apple Developer ID are unsigned; recipients may need to allow the app manually in macOS Privacy & Security. For public Mac distribution, use Apple Developer ID signing and notarization.

## GitHub Actions

The workflow in `.github/workflows/build.yml` runs:

- `npm ci`
- `npm run build`
- `npm test`
- Windows unpacked packaging
- Mac unpacked packaging

Artifacts can be downloaded from the workflow run page.

## Data

User data is stored under Electron's `userData` directory. Generated databases, logs, build outputs, and release artifacts are intentionally ignored by Git.
