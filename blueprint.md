# 100-Character Community App - Blueprint

## Overview
A minimalist micro-blogging community where users can share thoughts in 100 characters or less. Designed for high-impact, short-form communication with a modern "Pulse & Neon" aesthetic.

## Features
- **100-Char Limit:** Input area with real-time character counting (0/100).
- **Public Feed:** Vertical scrollable feed of all shared messages, newest first.
- **Nickname Profiles:** Simple nickname field to identify users.
- **Unique Avatars:** Each nickname gets a unique `oklch` color background.
- **Modern UI:** Glassmorphism effects, vibrant neon accents, and smooth entry animations.
- **Persistence:** Messages are saved to `localStorage` to simulate a live community feed.

## Technical Stack
- **Web Components:** Encapsulated logic for `<community-app>`, `<post-editor>`, `<message-feed>`, and `<message-card>`.
- **Modern CSS:** `@layer`, `oklch`, `:has()`, Glassmorphism, and responsive grid layouts.
- **Vanilla JavaScript:** ES modules, async/await for simulated network delays.
- **Storage:** `localStorage` for feed persistence.

## Implementation Plan
1. **Infrastructure & Theming:**
   - Define a "Pulse & Neon" palette using `oklch`.
   - Implement global Glassmorphism and animation styles.
2. **Web Components:**
   - `<post-editor>`: Max 100 char limit, character counter, nickname field.
   - `<message-feed>`: Feed display logic (reverse chronological).
   - `<message-card>`: Individual message UI with unique avatars.
3. **Core Logic:**
   - `CommunityStore` module for state management and `localStorage` sync.
   - Event-driven UI updates for real-time feel.
4. **Polishing:**
   - Add entry/exit animations for new messages.
   - Mobile-first responsive refinements.
5. **Validation:**
   - Verify char limit enforcement.
   - Check persistence across reloads.
