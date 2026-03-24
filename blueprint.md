# 100-Pulse Community - Blueprint

## Overview
A minimalist micro-community where users share thoughts in 100 characters or less. It features an interest-based matching system to connect users with similar vibes and issues.

## Features
- **100-Char Pulses:** High-impact, short-form posts with character enforcement.
- **Interest Pulse Tags:** Users tag their posts with interests (e.g., #AI, #Music, #Issues).
- **Matching Engine (Simulated):** UI section that matches users based on common interest tags.
- **Vibrant Feed:** Vertical, real-time stream of community pulses.
- **Modern UI:** "Pulse & Glow" theme with Glassmorphism and Neon accents.
- **Persistence:** Local storage for user pulses and profile.

## Technical Stack
- **Web Components:** `<pulse-app>`, `<pulse-editor>`, `<pulse-feed>`, `<match-view>`.
- **Modern CSS:** Cascade Layers (`@layer`), `oklch`, Glassmorphism, and neon gradients.
- **Vanilla JavaScript:** ES Modules, custom events, and `localStorage` for data sync.

## Implementation Plan
1. **Infrastructure:** Define "Pulse & Glow" palette and layout layers.
2. **Web Components:**
   - `<pulse-editor>`: 100-char input with dynamic tag picker.
   - `<pulse-feed>`: Feed display with reverse chronological ordering.
   - `<match-view>`: Simulated matching logic for user connection.
3. **Core Logic:** `PulseStore` for managing posts, tags, and state.
4. **Polishing:** Neon entry animations and mobile responsive layout.
5. **Validation:** Verify 100-char enforcement and tag-based matching.
