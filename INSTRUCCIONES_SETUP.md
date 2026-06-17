# ⚙️ Instrucciones de Configuración — Polla Mundialista CEISCOL

## Paso 1 — Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) con la cuenta `ceiscol.asistente@gmail.com`
2. Crea una nueva hoja de cálculo y llámala **"Polla Mundialista CEISCOL 2026"**
3. Copia el **ID** de la URL: `https://docs.google.com/spreadsheets/d/**[ESTE_ES_EL_ID]**/edit`

## Paso 2 — Configurar Google Apps Script

1. Ve a [script.google.com](https://script.google.com) (con la misma cuenta)
2. Clic en **"Nuevo proyecto"**
3. Borra el contenido por defecto y pega todo el contenido de `Code.gs`
4. Reemplaza `'TU_SHEET_ID_AQUI'` con el ID copiado en el paso 1
5. Guarda (Ctrl+S) y ponle nombre al proyecto: **"CEISCOL Polla Backend"**

## Paso 3 — Implementar como Aplicación Web

1. Clic en **"Implementar"** → **"Nueva implementación"**
2. Tipo: **Aplicación web**
3. Configurar:
   - **Ejecutar como:** Yo (ceiscol.asistente@gmail.com)
   - **Acceso:** Cualquier persona
4. Clic en **"Implementar"** → Autorizar permisos
5. **Copia la URL** que aparece (termina en `/exec`)

## Paso 4 — Conectar el formulario

1. Abre `index.html`
2. Busca la línea: `const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPLACEHOLDER/exec';`
3. Reemplaza la URL con la que copiaste en el Paso 3
4. Sube el `index.html` actualizado a GitHub Pages

## Paso 5 — Activar GitHub Pages

1. En el repositorio de GitHub → **Settings** → **Pages**
2. Source: **Deploy from a branch** → rama `main` → carpeta `/ (root)`
3. Guarda. Tu link estará disponible en: `https://biocolombiaplus-max.github.io/registro-evento/`

---

## 📱 Mensaje para compartir por WhatsApp

```
🇨🇴⚽ ¡POLLA MUNDIALISTA CEISCOL 2026!

¿Cuánto queda Colombia vs Portugal?
Registra tu pronóstico y participa.

👇 Ingresa aquí:
https://biocolombiaplus-max.github.io/registro-evento/

📋 Solo necesitas:
• Nombre de tu laboratorio
• Tu correo personal
• Tu marcador favorito 🎯

¡Vamos Colombia! 💛💛💙❤️
```
