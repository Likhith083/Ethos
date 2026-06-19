# Ethos 
<img width="104" height="104" alt="image" src="https://github.com/user-attachments/assets/58149842-1261-4e74-aeb2-d009ce043061" />


A minimal motivational quotes app for iOS and Android. One quote at a time, calm typography, and just enough customization — no accounts, ads, or social feeds.


## Features

- **Focused reading** — full-screen quote with author attribution
- **Swipe navigation** — left for next quote, right for previous (session history)
- **Tap anywhere** — opens share, copy, customize, and reminder options
- **Share as image** — exports your current theme, font, and layout as a PNG via the native share sheet
- **Copy as text** — plain `"quote"` + author to clipboard
- **Themes** — Paper, Midnight, Warm, and Mono with accent colors
- **Typography** — four curated fonts, three sizes, center/left alignment, flat or card background
- **Local reminders** — schedule one or more daily notification times
- **Offline-friendly** — quote queue cached locally with bundled fallbacks

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Expo SDK 54](https://docs.expo.dev/) + React Native |
| Language | TypeScript |
| Navigation | Expo Router (single screen) |
| Persistence | AsyncStorage |
| Quotes API | [ZenQuotes](https://zenquotes.io/) with local cache |
| Gestures | React Native Gesture Handler + Reanimated |
| Share image | react-native-view-shot + expo-sharing |

## Getting started

### Prerequisites

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) on a device, or Xcode / Android Studio for simulators

### Install and run

```powershell
npm install
npx expo start
```

Press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

Clear Metro cache if needed:

```powershell
npx expo start --clear
```

### Optional API key

ZenQuotes allows 5 requests per 30 seconds without a key. For heavier use, add a key:

```powershell
copy .env.example .env
```

Set `EXPO_PUBLIC_ZENQUOTES_API_KEY` in `.env`, then restart Expo.

## Project structure

```
app/                    Expo Router screens
  index.tsx             Home — quote display and gestures
  _layout.tsx           Fonts, providers, notification bootstrap

components/             UI building blocks
  QuoteDisplay.tsx      On-screen quote renderer
  QuoteCardContent.tsx  Shared layout for screen + export
  QuoteExportCanvas.tsx Off-screen WYSIWYG capture target
  SwipeableQuoteArea.tsx Tap + swipe gesture layer
  QuoteActionsSheet.tsx Share / copy / customize / reminders
  CustomizeSheet.tsx    Theme and typography picker
  NotificationSettingsSheet.tsx  Reminder schedule
  BottomSheet.tsx       In-app overlay (not RN Modal — required for iOS share)
  AppSettingsProvider.tsx  Theme state + AsyncStorage

hooks/
  useQuoteSession.ts    Quote loading, history, swipe navigation

lib/
  quotes/               Quote fetching, cache, formatting
  settings/             User preference types + storage
  notifications/        Local notification scheduling
  export/               PNG capture + native share

theme/                  Colors, presets, typography, motion tokens
```

## How it works

### Quotes

1. On launch, `quotesProvider` hydrates a local queue from AsyncStorage or fetches a batch from ZenQuotes.
2. Swiping left consumes the next cached quote and prefetches when the queue runs low.
3. Swiping right pops an in-memory history stack and restores the prior quote to the queue.
4. Stoic fallback quotes are used when offline or rate-limited.

### Share vs copy

| Action | Output |
|--------|--------|
| **Share** | 1080×1920 PNG with current theme — opens iOS/Android share sheet |
| **Copy** | Plain text: `"quote"` + `— author` |

The export canvas is rendered off-screen so the captured image matches what you see on screen.

### Notifications

Local daily notifications via `expo-notifications`. Multiple reminder times are supported.

> **Expo Go limitation:** Push/scheduled notifications have reduced support in Expo Go from SDK 53 onward. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) for full notification testing.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Start with iOS target |
| `npm run android` | Start with Android target |
| `npm run web` | Start web target |
| `npm run export:web` | Build static web export to `dist/` |

## Web demo (GitHub Pages)

The app is published at **[https://likhith083.github.io/JustDoIT/](https://likhith083.github.io/JustDoIT/)**.

Pushes to `master` automatically rebuild and deploy the static site to the `gh-pages` branch via GitHub Actions. To enable hosting:

1. Open **Settings → Pages** in the GitHub repository.
2. Set **Source** to **Deploy from a branch**.
3. Choose branch **`gh-pages`**, folder **`/` (root)**.
4. Save.

To deploy manually:

```powershell
npm run export:web
```

Then push the contents of `dist/` to the `gh-pages` branch.

## Attribution

Quotes provided by [zenquotes.io](https://zenquotes.io/).

## License

Private — all rights reserved.
