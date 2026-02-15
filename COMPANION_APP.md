# Cosmic Horizon Companion App

Android companion app for Cosmic Horizon, built with Kotlin + Jetpack Compose.

Source: [cosmic-horizon-companion](../cosmic-horizon-companion/) (separate repo)

Production URL: `https://coho.mabus.ai`

---

## Server Setup

### 1. Environment

Copy the example and fill in real values:

```bash
cd server
cp ../.env.example .env
```

Edit `.env`:

```env
PORT=3105
CLIENT_URL=http://localhost:5973
SESSION_SECRET=<generate-a-random-string>
JWT_SECRET=<generate-a-different-random-string>
DATABASE_URL=postgres://coho:coho@localhost:5432/cosmic_horizon
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```

Generate random secrets:

```bash
openssl rand -base64 32
```

`JWT_SECRET` is used to sign tokens for the mobile app. `SESSION_SECRET` is for the web client's session cookies. Use different values for each.

### 2. Install and migrate

```bash
cd server
npm install
npm run migrate        # creates all tables including player_devices
npm run seed           # populates sectors, outposts, ship types (first run only)
```

### 3. Push notifications (Firebase)

The server sends push notifications for combat events (under attack, ship destroyed). To enable:

1. Go to [Firebase Console](https://console.firebase.google.com) > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save as `server/firebase-service-account.json` (gitignored)
4. Set `FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json` in `.env`

If this file is not present, push notifications are silently disabled — everything else works normally.

### 4. Run with PM2

```bash
cd server
npm run build
pm2 start dist/index.js --name cosmic-horizon
```

Server runs at `http://localhost:3105`. Health check: `GET /api/health`.

### 5. Web client

```bash
cd client
npm install

# Build with production API URL
VITE_API_URL=https://coho.mabus.ai npm run build

# Serve on port 5973 via PM2
pm2 start "npx vite preview --port 5973" --name cosmic-horizon-client
```

The `VITE_API_URL` is baked in at build time. It tells the client to send API requests to `https://coho.mabus.ai/api/*` instead of `http://localhost:3105`. Caddy then routes those to the server.

To rebuild after code changes:

```bash
cd client
VITE_API_URL=https://coho.mabus.ai npm run build
pm2 restart cosmic-horizon-client
```

To rebuild the server after code changes:

```bash
cd server
npm run build
pm2 restart cosmic-horizon
```

### 6. Caddyfile

The mobile app hits `https://coho.mabus.ai/api/*` and `https://coho.mabus.ai/socket.io/*`. Your current Caddyfile sends everything to the client on port 5973, so API requests from the mobile app would fail. Update to:

```
coho.mabus.ai {
    handle /api/* {
        reverse_proxy localhost:3105
    }
    handle /socket.io/* {
        reverse_proxy localhost:3105
    }
    handle {
        reverse_proxy localhost:5973
    }
}
```

This routes API and WebSocket traffic to the Node server, and everything else to the web client. The web client should also use `VITE_API_URL=https://coho.mabus.ai` so its requests go through the same Caddy routes (instead of hitting `localhost:3105` directly, which won't work from external browsers).

After updating, reload Caddy:

```bash
sudo systemctl reload caddy
```

---

## Building the Companion App for Google Play

### Prerequisites

- Android Studio (Hedgehog 2023.1+ or newer)
- JDK 17
- Google Play Developer account ($25 one-time fee)

### 1. Firebase setup (required)

The app uses Firebase Cloud Messaging for push notifications. Without this file, the build will fail.

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing — same project as the server-side key above)
3. Add an Android app with package name `com.cosmichorizon.companion`
4. Download `google-services.json`
5. Place it at `cosmic-horizon-companion/app/google-services.json`

This file is gitignored.

### 2. Gradle wrapper

The project needs a Gradle wrapper. Either:

- Open the project in Android Studio (it generates the wrapper automatically), or:

```bash
cd cosmic-horizon-companion
gradle wrapper --gradle-version 8.5
```

### 3. Launcher icons

The manifest references `@mipmap/ic_launcher` but no icons exist yet.

In Android Studio: right-click `app/src/main/res` > New > Image Asset

Or manually place PNGs in:
- `app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

### 4. API base URL

Both debug and release builds are configured to use `https://coho.mabus.ai`.

To change, edit `app/build.gradle.kts`:
- `defaultConfig` block: debug/default URL
- `release` block: production URL

### 5. Signing key

Generate a release signing key:

```bash
keytool -genkey -v -keystore cosmic-horizon.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias cosmic-horizon
```

Create `app/keystore.properties` (gitignored):

```properties
storeFile=../cosmic-horizon.jks
storePassword=your-password
keyAlias=cosmic-horizon
keyPassword=your-password
```

Then add a signing config to `app/build.gradle.kts`:

```kotlin
android {
    signingConfigs {
        create("release") {
            val props = java.util.Properties().apply {
                load(file("keystore.properties").inputStream())
            }
            storeFile = file(props["storeFile"] as String)
            storePassword = props["storePassword"] as String
            keyAlias = props["keyAlias"] as String
            keyPassword = props["keyPassword"] as String
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // ... existing config
        }
    }
}
```

### 6. Build

```bash
cd cosmic-horizon-companion

# Debug APK (for testing)
./gradlew assembleDebug

# Release AAB (for Play Store)
./gradlew bundleRelease
```

Output locations:
- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- Release AAB: `app/build/outputs/bundle/release/app-release.aab`

### 7. Google Play Console upload

1. Create a new app in [Google Play Console](https://play.google.com/console)
2. Fill in the store listing (title, description, screenshots, category)
3. Complete the content rating questionnaire
4. Add a privacy policy URL (required)
5. Set target audience and content settings
6. Upload the AAB under Release > Production > Create new release

---

## Architecture Overview

```
cosmic-horizon-companion/
  app/src/main/java/com/cosmichorizon/companion/
    data/
      auth/          TokenManager (encrypted JWT storage)
      local/         Room database, entities, DAOs
      remote/        ApiService (Ktor), SocketManager, DTOs
      repository/    Auth, Game, Planet, Trade repositories
    di/              Hilt modules (Network, Database)
    domain/model/    Domain models + DTO mappers
    service/         FCM push notification service
    ui/
      auth/          Login, Register screens + ViewModels
      dashboard/     Dashboard screen + components
      navigation/    Screen routes, NavGraph
      planets/       Planet list/detail screens
      quickactions/  Move/scan action bar
      trade/         Outpost screen, price/trade components
      theme/         Material3 dark space theme
```

Pattern: Single-activity Compose, MVVM, offline-first with Room caching, Hilt DI.
