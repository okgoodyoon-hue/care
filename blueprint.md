# Smart Food Calorie App - Blueprint

## Overview
A modern, AI-inspired web application that helps users track their caloric intake by either capturing a photo of their food or typing a description. Built using standard web technologies (HTML, CSS, JS) with a focus on Web Components and modern CSS features.

## Features
- **Dual Input Modes:**
  - **Vision Mode:** Capture or upload a photo of your meal.
  - **Text Mode:** Type in what you ate (e.g., "A large apple and a slice of cheese").
- **Smart Analysis (Simulated):** Parses text or images to identify food items and estimate calories.
- **Nutritional Breakdown:** Provides a breakdown of estimated calories, protein, carbs, and fats.
- **Recent History:** Saves your recent logs locally for quick reference.
- **Modern UI:** Responsive design with vibrant colors, smooth transitions, and a premium feel.

## Technical Stack
- **Web Components:** Encapsulated UI logic for inputs, cards, and results.
- **Modern CSS:** Container queries, cascade layers, `:has()` selector, and `oklch` color space.
- **Vanilla JavaScript:** ES modules, async/await for simulated AI processing.
- **Storage:** `localStorage` for persisting history.

## Implementation Plan
1. **Infrastructure:**
   - Define a consistent color palette and typography using CSS variables.
   - Set up the main layout with a focus on mobile-first responsiveness.
2. **Web Components:**
   - `<food-app>`: Root component managing application state.
   - `<food-input>`: Handles user input (Camera, Upload, Text).
   - `<calorie-result>`: Displays the results of the analysis.
   - `<food-history>`: Shows a list of recent entries.
3. **Core Logic:**
   - Implement `FoodAnalyzer` module to handle mock processing of text and images.
   - Add camera/file handling logic.
4. **Polishing:**
   - Add animations using CSS transitions and `@keyframes`.
   - Ensure accessibility with proper ARIA labels and keyboard navigation.
5. **Validation:**
   - Check for any runtime errors in the console.
   - Verify responsiveness across different screen sizes.
