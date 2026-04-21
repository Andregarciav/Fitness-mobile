# Gerar APK para teste (AtesFitness Mobile)

**Padrão do projeto:** usar **Docker no WSL** para gerar o APK (sempre que possível).

## Build via Docker no WSL (recomendado)

No WSL, na raiz do projeto:

```bash
cd /mnt/c/Users/papit/Desktop/app
chmod +x scripts/build-apk-docker-wsl.sh
./scripts/build-apk-docker-wsl.sh
```

Ou no PowerShell (Windows):

```powershell
cd c:\Users\papit\Desktop\app
.\scripts\build-apk-docker.ps1
```

O APK será gerado em **`mobile/apk-output/app-release.apk`**. É um build **release** com o bundle JavaScript **incluído** no APK, ou seja, o app funciona no celular **sem precisar do Metro nem de um PC conectado**. (Antes o script gerava `app-debug.apk`, que exige Metro e causa "Unable to load script" no dispositivo.)

A pasta `android/` é criada automaticamente dentro do container se não existir (a partir do template React Native 0.72.7). O script define **minSdkVersion 21** (Android 5.0+) para dar suporte a dispositivos mais antigos.

**Requisito:** Docker Desktop com **pelo menos 4 GB de RAM** (Settings → Resources → Memory). O script usa `--memory=4g` no container. Se o build falhar com "Gradle build daemon disappeared", aumente a memória do Docker para 6 GB ou 8 GB e tente novamente.

O app em **produção** usa a API em **São André (Tailscale)**: `http://andre-1.tailb2d965.ts.net:8080/api/v1` (definido em `mobile/src/config.ts`).

---

## Build local (alternativa)

O app mobile é React Native 0.72. Para gerar um APK de teste **sem Docker** você precisa:

1. **Node.js 18+** e **npm** instalados
2. **Android Studio** (ou SDK Android) com:
   - Android SDK (API 33 recomendado)
   - Variável de ambiente `ANDROID_HOME` apontando para o SDK
3. **Java 17** (recomendado para RN 0.72)

## Se a pasta `android/` não existir

O template React Native inclui a pasta `android/` ao criar o projeto. Se no seu repositório ela não existir, crie a partir de um projeto novo:

```bash
# Na pasta do projeto (c:\Users\papit\Desktop\app)
cd mobile

# Criar projeto temporário com a mesma versão do RN
npx react-native@0.72.7 init TempRN --version 0.72.7

# Copiar a pasta android para o nosso app
# Windows (PowerShell):
Copy-Item -Recurse TempRN\android .\android
# Linux/Mac/WSL:
# cp -R TempRN/android ./android

# Ajustar o nome do app no Android (opcional)
# Editar android/settings.gradle: rootProject.name = 'AtesFitness'
# Editar android/app/build.gradle: applicationId "com.atesfitness"

# Remover o projeto temporário
Remove-Item -Recurse TempRN
```

## Instalar dependências

```bash
cd mobile
npm install
```

## Configurar URL da API para release

No arquivo `mobile/src/services/api.ts`, a variável `API_BASE_URL` em produção está como `https://your-api-domain.com/api/v1`. Para teste, você pode:

- Usar o IP da sua máquina na rede (ex.: `http://192.168.1.10:8080/api/v1`) e alterar antes do build, ou
- Manter um build de debug que usa `__DEV__` (localhost no emulador; no dispositivo use o IP do PC).

## Gerar APK de debug (rápido para teste)

```bash
cd mobile
npx react-native run-android --mode=debug
```

Ou apenas buildar o APK sem instalar:

```bash
cd mobile/android
./gradlew assembleDebug
```

O APK estará em: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

## Gerar APK de release (assinado)

1. Gerar keystore (uma vez):

```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore atesfitness-release.keystore -alias atesfitness -keyalg RSA -keysize 2048 -validity 10000
```

2. Criar `mobile/android/gradle.properties` (ou editar) e adicionar:

```properties
MYAPP_RELEASE_STORE_FILE=atesfitness-release.keystore
MYAPP_RELEASE_KEY_ALIAS=atesfitness
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

3. Configurar `android/app/build.gradle` para signing config release (ver documentação React Native).

4. Buildar:

```bash
cd mobile/android
./gradlew assembleRelease
```

APK em: `mobile/android/app/build/outputs/apk/release/app-release.apk`

## Resumo rápido (após ter a pasta android)

```bash
cd c:\Users\papit\Desktop\app\mobile
npm install
cd android
.\gradlew assembleDebug
```

Abra `app\build\outputs\apk\debug\app-debug.apk` e copie para o celular ou instale via USB.
