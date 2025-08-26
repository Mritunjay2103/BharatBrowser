# Overview

This is an Electron-based desktop browser application called "Chromium AI Browser" that combines traditional web browsing with AI-powered features and consent management. The application provides a tabbed browsing interface with integrated AI copilot functionality, consent management system, digital identity verification, and UPI payment capabilities. Built using Electron for desktop deployment and React for the user interface, it aims to create a privacy-conscious browsing experience with advanced AI assistance and Indian digital infrastructure integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Desktop Application Framework
The application is built on **Electron** with a main process handling window management and IPC communications. The main entry point (`main.js`) creates a BrowserWindow with security configurations including context isolation and disabled node integration. The preload script (`preload.js`) exposes a secure API bridge between the main and renderer processes using `contextBridge`.

## Frontend Architecture
The user interface is built with **React** using the UMD build loaded via CDN, along with Bootstrap for styling. The application follows a component-based architecture with a main App component managing the overall state and sidebar navigation. Key components include:
- **Browser**: Handles tabbed browsing functionality with webview management
- **AICopilot**: Provides AI-powered page analysis and chat interface
- **ConsentManager**: Manages user consent preferences and logging
- **DigitalIdentity**: Handles Aadhaar and DigiLocker integration
- **UPIPayments**: Manages UPI payment flows with external app integration

## State Management
The application uses React's built-in state management with hooks (`useState`, `useEffect`) for component-level state. Global state is managed through the main App component which coordinates between different sidebar components. Consent data is persisted using localStorage for client-side storage.

## Inter-Process Communication
Communication between the main Electron process and renderer is handled through IPC (Inter-Process Communication) with a secure preload script that exposes limited APIs. Menu actions and external integrations are routed through this IPC bridge to maintain security boundaries.

## AI Services Integration
The AI functionality is designed with a service layer (`aiService.js`) that abstracts AI provider interactions. Currently implemented with mock responses for demonstration, but structured to easily integrate with actual AI APIs like OpenAI. The service handles page summarization, content analysis, and chat responses.

## Security Architecture
The application implements Electron security best practices including disabled node integration, enabled context isolation, and secure IPC communication. External website loading is enabled for the webview component while maintaining isolation from the main application context.

# External Dependencies

## Core Framework Dependencies
- **Electron**: Desktop application framework for cross-platform deployment
- **Express**: HTTP server framework (included but not actively used in current implementation)

## Frontend Libraries
- **React**: UI framework loaded via CDN (UMD build)
- **Bootstrap**: CSS framework for responsive design and components
- **Font Awesome**: Icon library for UI elements

## Planned External Integrations
- **AI Service Providers**: OpenAI API or similar for actual AI functionality (currently mocked)
- **Aadhaar Authentication**: UIDAI APIs for identity verification
- **DigiLocker**: Government digital document service integration
- **UPI Payment Apps**: Deep link integration with PhonePe, Google Pay, and Paytm

## System Integration Points
- **Native OS**: File system access for consent log exports and application data
- **External Applications**: UPI payment apps through deep linking protocols
- **Web Services**: External website loading through Electron webview for browsing functionality