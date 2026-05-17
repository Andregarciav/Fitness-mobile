# Gerar APK — AtesFitness Mobile

**Bundle ID:** `com.atesfitness.app` · **App name:** `AtesFitness` · **RN:** 0.72.7

> A pasta `android/` **não está no repositório** — ela é gerada a partir do template RN 0.72.7.
> Após gerar o template, rode `scripts/patch-android-brand.sh` para aplicar o bundle ID e nome corretos.

---

## Fluxo completo (WSL recomendado)

```bash
# 1. Clonar e instalar deps
cd /mnt/c/Users/papit/Documents/GitHub/Fitness-mobile
npm install

# 2. Gerar o template Android (só na primeira vez, ou ao limpar)
npx react-native@0.72.7 init TempRN --version 0.72.7
cp -R TempRN/android ./android
cp -R TempRN/ios     ./ios
rm -rf TempRN

# 3. Aplicar branding AtesFitness (bundle ID, app name, splash)
chmod +x scripts/patch-android-brand.sh
./scripts/patch-android-brand.sh ./android

# 4. Buildar APK release
cd android
./gradlew assembleRelease
```

APK gerado em: `android/app/build/outputs/apk/release/app-release.apk`

---

## API de produção

O app usa `https://api.fitness.ates-g.com/api/v1` (definido em `src/config.ts`).

Para dev local com Metro, editar `src/config.ts` e substituir pelo IP da máquina na rede:
```ts
export const API_BASE_URL_PROD = 'http://192.168.x.x:8080/api/v1';
```

---

## APK debug rápido (dispositivo USB)

```bash
npx react-native run-android
```

---

## APK release assinado

### 1 · Gerar keystore (uma única vez — guardar em local seguro)

```bash
cd android/app
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore atesfitness-release.keystore \
  -alias atesfitness \
  -keyalg RSA -keysize 2048 -validity 10000
```

> ⚠️ Nunca commitar o `.keystore` no git. Ele fica em `android/app/` (ignorado pelo `.gitignore`).

### 2 · Configurar `android/gradle.properties`

```properties
MYAPP_RELEASE_STORE_FILE=atesfitness-release.keystore
MYAPP_RELEASE_KEY_ALIAS=atesfitness
MYAPP_RELEASE_STORE_PASSWORD=SUA_SENHA
MYAPP_RELEASE_KEY_PASSWORD=SUA_SENHA
```

### 3 · Build

```bash
cd android
./gradlew assembleRelease
```

---

## Requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | 18+ |
| Java | 17 |
| Android SDK | API 33 |
| Docker Desktop (WSL) | ≥ 4 GB RAM |
