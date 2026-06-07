# Como gerar o APK — Arq Luz Entregas

## Pré-requisitos (instalar uma única vez)

### 1. Node.js
- Baixar em: https://nodejs.org (versão LTS)
- Instalar normalmente, marcar "Add to PATH"

### 2. Android Studio
- Baixar em: https://developer.android.com/studio
- Durante a instalação, aceitar tudo (SDK, emulator, etc.)
- Ao abrir, ir em: More Actions → SDK Manager → SDK Tools → marcar "Android SDK Command-line Tools" → Apply

### 3. Java (JDK 17)
- Baixar em: https://adoptium.net
- Instalar normalmente

---

## Gerando o APK (passo a passo)

### Passo 1 — Clonar o repositório
```bash
git clone https://github.com/leonardopavao/arqluz-entregas.git
cd arqluz-entregas
```

### Passo 2 — Instalar dependências
```bash
npm install
```

### Passo 3 — Adicionar plataforma Android
```bash
npx cap add android
```

### Passo 4 — Sincronizar arquivos web para o Android
```bash
npx cap sync android
```

### Passo 5 — Abrir no Android Studio
```bash
npx cap open android
```

### Passo 6 — Gerar o APK no Android Studio
1. Menu superior: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Aguardar compilação (3-5 minutos na primeira vez)
3. Clicar em **"locate"** na notificação que aparece no canto inferior direito
4. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

### Passo 7 — Instalar no tablet/celular
1. Copiar o `app-debug.apk` para o dispositivo (WhatsApp, cabo USB, Google Drive, etc.)
2. No Android: Configurações → Segurança → Fontes desconhecidas → Permitir
3. Abrir o arquivo APK → Instalar
4. Pronto! Ícone "Arq Luz Entregas" aparece na gaveta de apps

---

## Atualizar o app no futuro

Quando fizer mudanças no `index.html`:
```bash
npx cap sync android
```
Depois gerar novo APK no Android Studio (passo 6).

---

## Observações importantes

- O APK gerado é **debug** — funciona perfeitamente para uso interno
- Não precisa de Play Store
- Firebase Firestore com persistência ativa = funciona offline
- Dados sincronizam automaticamente quando internet voltar
- Service Worker faz cache de todos os arquivos JS/CSS
