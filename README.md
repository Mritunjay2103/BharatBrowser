# BharatBrowser — Chromium AI Browser

An **Electron-based desktop browser** that blends traditional web browsing with **AI-powered assistance**, **consent management**, and **Indian digital infrastructure** (Aadhaar, DigiLocker, UPI).  

🚀 Built with **Electron** (desktop) + **React** (UI) + **Bootstrap** (styling).

---

## ✨ Features

- 🧠 **AI Copilot**
  - Summarizes web pages
  - Provides AI-powered chat and content analysis
- 🔐 **Consent Manager**
  - Manage and log user consent
  - Export logs securely
- 🪪 **Digital Identity**
  - Aadhaar authentication (UIDAI APIs – planned)
  - DigiLocker document integration
- 💰 **UPI Payments**
  - Deep-link integration with PhonePe, Google Pay, Paytm
- 🌐 **Tabbed Browsing**
  - Chromium-based webview
  - Multiple tabs with navigation controls

---

## 🏗 System Architecture

### 🔹 Desktop Application (Electron)
- **Main process** (`main.js`)  
  Handles window management, menu actions, IPC.
- **Preload script** (`preload.js`)  
  Provides a **secure bridge** between main and renderer using `contextBridge`.

### 🔹 Frontend (React + Bootstrap)
- `App.js` → Root component managing state & sidebar
- `Browser.js` → Webview-based tabbed browsing
- `AICopilot.js` → AI assistant
- `ConsentManager.js` → Consent settings & logs
- `DigitalIdentity.js` → Aadhaar + DigiLocker UI
- `UPIPayments.js` → Payment integration

### 🔹 State Management
- Local component state with `useState` + `useEffect`
- Global sidebar state managed in `App.js`
- Consent preferences persisted in **`localStorage`**

---

## 🔄 Inter-Process Communication

- **Main ↔ Renderer** → via **IPC**  
- Menu actions (AI, Consent, Identity, UPI) → sent to React via preload API
- Secure channel with **context isolation** & **no Node.js in renderer**

---

## 🤖 AI Service Integration

- Service layer: `aiService.js`
- Provides **mock AI responses** (summarization, word count, reading time)
- Can be extended to real APIs:
  - [OpenAI](https://platform.openai.com/)
  - Other LLM providers

---

## 🛡 Security

- ✅ Disabled Node integration in renderer  
- ✅ Context isolation enabled  
- ✅ Secure IPC APIs via preload  
- ✅ Controlled external navigation in `webContents`  

---

## 📦 Tech Stack

### Core
- [Electron](https://www.electronjs.org/) — desktop framework  
- [React](https://react.dev/) — UI library  
- [Bootstrap](https://getbootstrap.com/) — CSS framework  
- [Font Awesome](https://fontawesome.com/) — icons  

### Planned External Integrations
- Aadhaar (UIDAI APIs)  
- DigiLocker (Govt. API)  
- UPI apps via deep linking  

---

## ⚙️ Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/yourusername/BharatBrowser.git
cd BharatBrowser
