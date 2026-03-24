// --- Nutrition Engine (Analysis Logic) ---
const FOOD_DATABASE = {
  'apple': { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'pizza': { kcal: 266, protein: 11, carbs: 33, fat: 10 },
  'chicken': { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  'salad': { kcal: 15, protein: 1, carbs: 3, fat: 0.1 },
  'rice': { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'egg': { kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  'bread': { kcal: 265, protein: 9, carbs: 49, fat: 3.2 },
  'milk': { kcal: 42, protein: 3.4, carbs: 5, fat: 1 },
  'banana': { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'burger': { kcal: 250, protein: 13, carbs: 31, fat: 9 },
};

class NutritionEngine {
  static async analyzeImage(canvas) {
    // Simulate complex vision processing
    return new Promise(resolve => {
      setTimeout(() => {
        const keys = Object.keys(FOOD_DATABASE);
        const randomFood = keys[Math.floor(Math.random() * keys.length)];
        const data = FOOD_DATABASE[randomFood];
        resolve({
          name: `Image Scan: ${randomFood.charAt(0).toUpperCase() + randomFood.slice(1)}`,
          ...data,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        });
      }, 1800);
    });
  }

  static analyzeText(text) {
    const tokens = text.toLowerCase().split(/\W+/);
    let matched = null;
    for (const token of tokens) {
      if (FOOD_DATABASE[token]) {
        matched = { name: token.charAt(0).toUpperCase() + token.slice(1), ...FOOD_DATABASE[token] };
        break;
      }
    }

    if (!matched) {
      // Fallback AI simulation
      const randomKcal = Math.floor(Math.random() * 400) + 50;
      matched = { 
        name: text || 'Unknown Dish', 
        kcal: randomKcal, 
        protein: (randomKcal * 0.05).toFixed(1), 
        carbs: (randomKcal * 0.1).toFixed(1), 
        fat: (randomKcal * 0.03).toFixed(1) 
      };
    }

    return {
      ...matched,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
  }
}

// --- Web Components ---

class CalorieApp extends HTMLElement {
  constructor() {
    super();
    this.state = {
      currentResult: null,
      history: JSON.parse(localStorage.getItem('nutrition_history') || '[]'),
      isAnalyzing: false
    };
  }

  connectedCallback() {
    this.render();
    this.addEventListener('analyze-start', () => {
      this.state.isAnalyzing = true;
      this.render();
    });
    this.addEventListener('analyze-complete', (e) => {
      this.state.isAnalyzing = false;
      this.state.currentResult = e.detail;
      this.state.history.unshift(e.detail);
      this.state.history = this.state.history.slice(0, 15);
      localStorage.setItem('nutrition_history', JSON.stringify(this.state.history));
      this.render();
    });
  }

  render() {
    this.innerHTML = `
      <header style="padding: 2.5rem 1rem; text-align: center;">
        <h1 style="font-size: 2.75rem; font-weight: 800; color: var(--primary); letter-spacing: -1.5px; line-height: 1;">Smart Calorie AI</h1>
        <p style="color: var(--text-dim); margin-top: 0.5rem; font-weight: 600;">Vision-powered nutrition tracking</p>
      </header>

      <main class="main-grid">
        <vision-input ${this.state.isAnalyzing ? 'disabled' : ''}></vision-input>
        
        ${this.state.currentResult ? `
          <div class="animate-pop">
            <nutrition-result data-result='${JSON.stringify(this.state.currentResult)}'></nutrition-result>
          </div>
        ` : ''}

        <section>
          <h2 style="font-size: 1.25rem; margin-bottom: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--primary);">●</span> Recent Meals
          </h2>
          <recent-meals data-history='${JSON.stringify(this.state.history)}'></recent-meals>
        </section>
      </main>

      <footer style="padding: 3rem; text-align: center; color: var(--text-dim); font-size: 0.875rem;">
        Powered by FoodVision Engine &copy; 2026
      </footer>
    `;
  }
}

class VisionInput extends HTMLElement {
  constructor() {
    super();
    this.mode = 'camera'; // 'camera' or 'text'
  }

  connectedCallback() {
    this.render();
  }

  async setupCamera() {
    const video = this.querySelector('#camera-preview');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
    } catch (err) {
      console.error(err);
      this.mode = 'text';
      this.render();
    }
  }

  async handleAnalyze() {
    this.dispatchEvent(new CustomEvent('analyze-start', { bubbles: true }));
    
    let result;
    if (this.mode === 'camera') {
      const video = this.querySelector('#camera-preview');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      result = await NutritionEngine.analyzeImage(canvas);
    } else {
      const text = this.querySelector('#meal-text').value;
      result = NutritionEngine.analyzeText(text);
    }

    this.dispatchEvent(new CustomEvent('analyze-complete', {
      bubbles: true,
      detail: result
    }));
  }

  render() {
    const isDisabled = this.hasAttribute('disabled');
    this.innerHTML = `
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-main); padding: 0.35rem; border-radius: 100px;">
          <button class="mode-btn ${this.mode === 'camera' ? 'active' : ''}" data-mode="camera" 
            style="flex: 1; border-radius: 100px; padding: 0.6rem; font-weight: 700;">📸 Camera Scan</button>
          <button class="mode-btn ${this.mode === 'text' ? 'active' : ''}" data-mode="text" 
            style="flex: 1; border-radius: 100px; padding: 0.6rem; font-weight: 700;">✍️ Text Input</button>
        </div>

        <div id="input-container">
          ${this.mode === 'camera' ? `
            <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; background: #000; aspect-ratio: 4/3; margin-bottom: 1.5rem; box-shadow: inset 0 0 40px rgba(0,0,0,0.5);">
              <video id="camera-preview" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
              <div style="position: absolute; inset: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; pointer-events: none;"></div>
            </div>
          ` : `
            <textarea id="meal-text" class="input-field" placeholder="Describe your meal (e.g., A large green salad with chicken)" 
              style="width: 100%; min-height: 120px; margin-bottom: 1.5rem; padding: 1.25rem; border-radius: var(--radius-md); border: 2px solid var(--bg-main); font-family: inherit; resize: none;"></textarea>
          `}
        </div>

        <button id="analyze-btn" class="btn btn-primary" style="width: 100%;" ${isDisabled ? 'disabled' : ''}>
          ${isDisabled ? '✨ Scanning Food...' : (this.mode === 'camera' ? 'Capture & Analyze' : 'Analyze Meal')}
        </button>
      </div>

      <style>
        .mode-btn { background: transparent; color: var(--text-dim); transition: all 0.3s ease; border: none; cursor: pointer; }
        .mode-btn.active { background: var(--bg-surface); color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      </style>
    `;

    this.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => {
        if (isDisabled) return;
        this.mode = btn.dataset.mode;
        this.render();
        if (this.mode === 'camera') this.setupCamera();
      };
    });

    this.querySelector('#analyze-btn').onclick = () => this.handleAnalyze();
    if (this.mode === 'camera' && !isDisabled) this.setupCamera();
  }
}

class NutritionResult extends HTMLElement {
  connectedCallback() {
    const data = JSON.parse(this.dataset.result);
    this.render(data);
  }

  render(data) {
    this.innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, var(--primary), oklch(0.6 0.25 155)); color: white; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
          <div>
            <span style="font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Detected Meal</span>
            <h3 style="font-size: 1.75rem; font-weight: 800;">${data.name}</h3>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 3rem; font-weight: 800; line-height: 1;">${data.kcal}</div>
            <div style="font-size: 0.875rem; font-weight: 700; opacity: 0.9;">Total Calories</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: var(--radius-md); text-align: center; backdrop-filter: blur(8px);">
            <div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">Protein</div>
            <div style="font-size: 1.25rem; font-weight: 800;">${data.protein}g</div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: var(--radius-md); text-align: center; backdrop-filter: blur(8px);">
            <div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">Carbs</div>
            <div style="font-size: 1.25rem; font-weight: 800;">${data.carbs}g</div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: var(--radius-md); text-align: center; backdrop-filter: blur(8px);">
            <div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">Fat</div>
            <div style="font-size: 1.25rem; font-weight: 800;">${data.fat}g</div>
          </div>
        </div>
      </div>
    `;
  }
}

class RecentMeals extends HTMLElement {
  connectedCallback() {
    const history = JSON.parse(this.dataset.history);
    this.render(history);
  }

  render(history) {
    if (history.length === 0) {
      this.innerHTML = `<div class="card" style="text-align: center; color: var(--text-dim); padding: 3rem;">No recent meals logged yet.</div>`;
      return;
    }

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${history.map(meal => `
          <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; background: var(--bg-main); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                ${meal.name.includes('Scan') ? '📸' : '✍️'}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem;">${meal.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">${new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 1.15rem; color: var(--primary);">${meal.kcal} <span style="font-size: 0.75rem; font-weight: 600;">kcal</span></div>
              <div style="font-size: 0.7rem; color: var(--text-dim); font-weight: 700;">${meal.protein}P / ${meal.carbs}C / ${meal.fat}F</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('calorie-app', CalorieApp);
customElements.define('vision-input', VisionInput);
customElements.define('nutrition-result', NutritionResult);
customElements.define('recent-meals', RecentMeals);
