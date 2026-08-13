# UBL Bank Assets

Drop the following files in this folder:

- `logo.png` — header logo (recommended ~280x80)
- `logo-large.png` — login brand panel logo (recommended ~360x120)
- `favicon.png` — browser tab icon (32x32 or 64x64)
- `login-background.jpg` — full-screen login background (~1920x1080)

The colors used by the application for UBL are defined in `manifest.json`.
Update them there if you want to tweak the palette without touching code.

After dropping the files, open `public/asset/config/app-config.json` and set
`bankName` to `"UBL"`, then reload the browser. The full UI will swap to
the UBL theme.
