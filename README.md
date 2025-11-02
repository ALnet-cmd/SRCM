# 🏁 Sim Racing Championship Manager (SRCM)

Webapp completa per la gestione di campionati sim racing con sistema di ruoli, database persistente e personalizzazione grafica.

## ✨ Funzionalità

- 🔐 **Sistema di autenticazione a 3 livelli** (Admin, Editor, Viewer)
- 🏆 **Gestione Campionati** - Crea e gestisci tornei e stagioni
- 👥 **Gestione Piloti** - Anagrafica completa con team, numero e nazione
- 🏁 **Gestione Gare** - Calendario con circuito, data e numero giri
- 📊 **Inserimento Risultati** - Posizioni e punteggi per ogni gara
- 🏅 **Classifica Automatica** - Calcolo punti totali e ranking in tempo reale
- 🎨 **Personalizzazione Tema** - Colori custom o 5 temi predefiniti (Ferrari, Mercedes, McLaren, Red Bull, Racing Red)
- 💾 **Database Cloud** - Salvataggio persistente con Supabase

## 🎮 Credenziali Demo

- **Admin**: `admin` / `admin123` (accesso completo + gestione tema)
- **Editor**: `editor` / `editor123` (può creare e modificare dati)
- **Viewer**: `viewer` / `viewer123` (solo visualizzazione)

## 🚀 Tecnologie

- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icone**: Lucide React
- **Hosting**: Vercel

## 📦 Installazione Locale
```bash
# Clona il repository
git clone https://github.com/TUO_USERNAME/SRCM.git
cd SRCM

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
# Crea un file .env.local e aggiungi:
# VITE_SUPABASE_URL=tuo_supabase_url
# VITE_SUPABASE_ANON_KEY=tua_supabase_anon_key

# Avvia il server di sviluppo
npm run dev
```

## 🏗️ Build per produzione
```bash
npm run build
```

## 📝 Licenza

MIT

---

Sviluppato con ❤️ per la community sim racing
```

6. Scorri in basso
7. Nel campo "Commit message" scrivi: `Add README.md`
8. Clicca **"Commit new file"**

---

## 🎊 **COMPLIMENTI! Hai creato tutti i 9 file!**

### **Struttura finale del progetto:**
```
SRCM/
├── package.json
├── .env.local
├── .gitignore
├── index.html
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── supabaseClient.js
    └── App.jsx
