#!/usr/bin/env bash
# patch-android-brand.sh
# Aplica o branding AtesFitness na pasta android/ gerada pelo template React Native.
# Executar APÓS o template ser gerado (ex: no build Docker, após "npx react-native init TempRN").
#
# Uso:
#   ./scripts/patch-android-brand.sh [ANDROID_DIR]
#   padrão: ./android

set -euo pipefail

ANDROID_DIR="${1:-./android}"
APP_NAME="AtesFitness"
APP_ID="com.atesfitness.app"
OLD_APP_ID="com.temprn"   # bundle ID gerado pelo template TempRN

echo "🔧  Aplicando branding AtesFitness em ${ANDROID_DIR} ..."

# ── 1. applicationId no build.gradle ────────────────────────────────────────
BUILD_GRADLE="${ANDROID_DIR}/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
  sed -i "s|applicationId \".*\"|applicationId \"${APP_ID}\"|g" "$BUILD_GRADLE"
  sed -i "s|versionName \".*\"|versionName \"1.0.0\"|g"         "$BUILD_GRADLE"
  sed -i "s|versionCode [0-9]*|versionCode 1|g"                 "$BUILD_GRADLE"
  echo "  ✅  build.gradle: applicationId=${APP_ID}"
fi

# ── 2. app_name em strings.xml ───────────────────────────────────────────────
STRINGS_XML="${ANDROID_DIR}/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_XML" ]; then
  sed -i "s|<string name=\"app_name\">.*</string>|<string name=\"app_name\">${APP_NAME}</string>|g" "$STRINGS_XML"
  echo "  ✅  strings.xml: app_name=${APP_NAME}"
fi

# ── 3. android:label no AndroidManifest.xml ──────────────────────────────────
MANIFEST="${ANDROID_DIR}/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  sed -i "s|android:label=\"[^\"]*\"|android:label=\"${APP_NAME}\"|g" "$MANIFEST"
  echo "  ✅  AndroidManifest.xml: label=${APP_NAME}"
fi

# ── 4. rootProject.name em settings.gradle ──────────────────────────────────
SETTINGS_GRADLE="${ANDROID_DIR}/../android/settings.gradle"
if [ ! -f "$SETTINGS_GRADLE" ]; then
  SETTINGS_GRADLE="${ANDROID_DIR}/settings.gradle"
fi
if [ -f "$SETTINGS_GRADLE" ]; then
  sed -i "s|rootProject.name = '.*'|rootProject.name = '${APP_NAME}'|g" "$SETTINGS_GRADLE"
  echo "  ✅  settings.gradle: rootProject.name=${APP_NAME}"
fi

# ── 5. MainActivity e MainApplication: mover package de com.temprn → com.atesfitness.app ─
JAVA_SRC="${ANDROID_DIR}/app/src/main/java"
if [ -d "$JAVA_SRC" ]; then
  # Substituir declarations de package
  find "$JAVA_SRC" -type f \( -name "*.java" -o -name "*.kt" \) | while read -r f; do
    sed -i "s|package ${OLD_APP_ID}|package ${APP_ID}|g" "$f"
    sed -i "s|import ${OLD_APP_ID}|import ${APP_ID}|g"   "$f"
  done

  # Mover para a estrutura de diretório correta
  OLD_PKG_DIR="${JAVA_SRC}/$(echo "$OLD_APP_ID" | tr '.' '/')"
  NEW_PKG_DIR="${JAVA_SRC}/$(echo "$APP_ID"     | tr '.' '/')"
  if [ -d "$OLD_PKG_DIR" ] && [ "$OLD_PKG_DIR" != "$NEW_PKG_DIR" ]; then
    mkdir -p "$(dirname "$NEW_PKG_DIR")"
    mv "$OLD_PKG_DIR" "$NEW_PKG_DIR"
    echo "  ✅  Java/Kotlin: package movido para ${APP_ID}"
  fi
fi

# ── 6. Cor do splash screen ──────────────────────────────────────────────────
COLORS_XML="${ANDROID_DIR}/app/src/main/res/values/colors.xml"
if [ -f "$COLORS_XML" ]; then
  # Fundo do splash: Charcoal do Brand Bible
  sed -i "s|<color name=\"primary\">.*</color>|<color name=\"primary\">#D94A0A</color>|g" "$COLORS_XML"
fi

# Criar splash background se não existir
SPLASH_XML="${ANDROID_DIR}/app/src/main/res/drawable/splash_background.xml"
if [ ! -f "$SPLASH_XML" ]; then
  mkdir -p "$(dirname "$SPLASH_XML")"
  cat > "$SPLASH_XML" << 'XML'
<?xml version="1.0" encoding="utf-8"?>
<!-- Splash screen AtesFitness — fundo Charcoal do Brand Bible -->
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#1A1A1A"/>
</shape>
XML
  echo "  ✅  splash_background.xml criado (#1A1A1A Charcoal)"
fi

echo ""
echo "✅  Branding AtesFitness aplicado com sucesso!"
echo "   Bundle ID : ${APP_ID}"
echo "   App name  : ${APP_NAME}"
echo "   Versão    : 1.0.0"
