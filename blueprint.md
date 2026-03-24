# Smart Food Calorie AI - Blueprint (Vision-First)

## Overview
A high-impact web application that leverages vision-based analysis to help users track their caloric intake from food photos. It features a modern, energetic design and a robust set of input options.

## Features
- **Vision-First Input:** Primary interface for capturing or uploading food photos.
- **Text Analysis Fallback:** Clean text input for manual meal description.
- **Smart Calorie & Macro Breakdown:** High-impact "Nutrition Cards" with calories, protein, carbs, and fat.
- **Meal History:** Persistent list of recently analyzed meals using `localStorage`.
- **Modern UI:** Healthy/Energetic color palette, vibrant animations, and responsive Glassmorphism effects.

## Technical Stack
- **Web Components:** `<calorie-app>`, `<vision-input>`, `<nutrition-result>`, `<recent-meals>`.
- **Modern CSS:** Cascade Layers (`@layer`), `oklch`, `container-type`, and `:has()`.
- **Vanilla JavaScript:** ES Modules, `getUserMedia` for camera access, and `localStorage` for state persistence.

## Implementation Plan
1. **Infrastructure:** Define "Healthy & Energetic" palette (Greens/Yellows).
2. **Web Components:**
   - `<vision-input>`: Interactive camera capture and file upload fallback.
   - `<nutrition-result>`: Visual macro/calorie breakdown.
   - `<recent-meals>`: History feed.
3. **Core Logic:** Mock AI engine for image/text analysis and state management.
4. **Polishing:** Result entry animations and mobile responsive layout.
5. **Validation:** Verify camera capture and history persistence.
