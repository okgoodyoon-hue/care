// Mock data for calorie estimation
const FOOD_DATABASE = {
  'apple': { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'banana': { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'pizza': { kcal: 266, protein: 11, carbs: 33, fat: 10 },
  'burger': { kcal: 250, protein: 13, carbs: 31, fat: 9 },
  'chicken': { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  'rice': { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'salad': { kcal: 15, protein: 1, carbs: 3, fat: 0.1 },
  'egg': { kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  'bread': { kcal: 265, protein: 9, carbs: 49, fat: 3.2 },
  'milk': { kcal: 42, protein: 3.4, carbs: 5, fat: 1 },
};

class FoodAnalyzer {
  static analyzeText(text) {
    const tokens = text.toLowerCase().split(/\W+/);
    const results = [];
    let totalKcal = 0;
    
    tokens.forEach(token => {
      if (FOOD_DATABASE[token]) {
        results.push({ name: token, ...FOOD_DATABASE[token] });
        totalKcal += FOOD_DATABASE[token].kcal;
      }
    });

    if (results.length === 0) {
      // Return a random estimate if no matches found to simulate AI
      const randomKcal = Math.floor(Math.random() * 300) + 100;
      return {
        items: [{ name: text || 'Unknown Meal', kcal: randomKcal, protein: 10, carbs: 20, fat: 5 }],
        totalKcal: randomKcal
      };
    }

    return { items: results, totalKcal };
  }

  static async analyzeImage(canvas) {
    // In a real app, this would send the image to a Vision API
    // Here we simulate analysis delay and return a random result
    return new Promise(resolve => {
      setTimeout(() => {
        const foodKeys = Object.keys(FOOD_DATABASE);
        const randomFood = foodKeys[Math.floor(Math.random() * foodKeys.length)];
        const result = FOOD_DATABASE[randomFood];
        resolve({
          items: [{ name: `Detected ${randomFood}`, ...result }],
          totalKcal: result.kcal
        });
      }, 1500);
    });
  }
}

// --- Web Components ---

class FoodApp extends HTMLElement {
  constructor() {
    super();
    this.state = {
      currentResult: null,
      history: JSON.parse(localStorage.getItem('food_history') || '[]'),
      isAnalyzing: false
    };
  }

  connectedCallback() {
    this.render();
    this.addEventListener('food-analyzed', (e) => this.handleAnalysis(e.detail));
  }

  handleAnalysis(result) {
    this.state.currentResult = result;
    this.state.history.unshift({ ...result, timestamp: new Date().toISOString() });
    this.state.history = this.state.history.slice(0, 10); // Keep last 10
    localStorage.setItem('food_history', JSON.stringify(this.state.history));
    this.render();
  }

  render() {
    this.innerHTML = `
      <header style="margin-bottom: 2rem; text-align: center;">
        <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">Smart Calorie AI</h1>
        <p style="color: var(--text-muted);">Track your nutrition with a snap or a text.</p>
      </header>
      
      <main style="max-width: 800px; margin: 0 auto; width: 100%;">
        <food-input></food-input>
        
        ${this.state.currentResult ? `
          <div style="margin-top: 2rem; animation: slideUp 0.5s ease-out;">
            <calorie-result data-result='${JSON.stringify(this.state.currentResult)}'></calorie-result>
          </div>
        ` : ''}

        <div style="margin-top: 3rem;">
          <h2 style="margin-bottom: 1rem; font-size: 1.25rem;">Recent Logs</h2>
          <food-history data-history='${JSON.stringify(this.state.history)}'></food-history>
        </div>
      </main>

      <style>
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `;
  }
}

class FoodInput extends HTMLElement {
  constructor() {
    super();
    this.activeTab = 'text'; // 'camera' or 'text'
  }

  connectedCallback() {
    this.render();
  }

  async setupCamera() {
    const video = this.querySelector('#camera-feed');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert('Camera access denied or not available.');
    }
  }

  async handleAction() {
    const btn = this.querySelector('#action-btn');
    btn.disabled = true;
    btn.textContent = 'Analyzing...';

    let result;
    if (this.activeTab === 'text') {
      const text = this.querySelector('#food-text').value;
      result = FoodAnalyzer.analyzeText(text);
    } else {
      const video = this.querySelector('#camera-feed');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      result = await FoodAnalyzer.analyzeImage(canvas);
    }

    this.dispatchEvent(new CustomEvent('food-analyzed', {
      bubbles: true,
      detail: result
    }));

    btn.disabled = false;
    btn.textContent = this.activeTab === 'text' ? 'Analyze Meal' : 'Capture & Analyze';
  }

  render() {
    this.innerHTML = `
      <div class="card" style="padding: 1rem;">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-main); padding: 0.25rem; border-radius: var(--radius-md);">
          <button class="tab-btn ${this.activeTab === 'text' ? 'active' : ''}" data-tab="text" style="flex: 1; padding: 0.5rem; border-radius: var(--radius-sm);">Text Input</button>
          <button class="tab-btn ${this.activeTab === 'camera' ? 'active' : ''}" data-tab="camera" style="flex: 1; padding: 0.5rem; border-radius: var(--radius-sm);">Camera Vision</button>
        </div>

        <div id="input-content">
          ${this.activeTab === 'text' ? `
            <textarea id="food-text" placeholder="What did you eat? (e.g., A slice of pizza and a salad)" 
              style="width: 100%; min-height: 120px; padding: 1rem; border-radius: var(--radius-md); border: 1px solid oklch(0 0 0 / 0.1); font-family: inherit; margin-bottom: 1rem; resize: none;"></textarea>
          ` : `
            <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; background: #000; aspect-ratio: 4/3; margin-bottom: 1rem;">
              <video id="camera-feed" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
            </div>
          `}
        </div>

        <button id="action-btn" class="btn-primary" style="width: 100%;">
          ${this.activeTab === 'text' ? 'Analyze Meal' : 'Capture & Analyze'}
        </button>
      </div>

      <style>
        .tab-btn { background: transparent; color: var(--text-muted); font-weight: 600; }
        .tab-btn.active { background: var(--surface); color: var(--primary); box-shadow: var(--shadow-sm); }
      </style>
    `;

    this.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeTab = btn.dataset.tab;
        this.render();
        if (this.activeTab === 'camera') this.setupCamera();
      };
    });

    this.querySelector('#action-btn').onclick = () => this.handleAction();
  }
}

class CalorieResult extends HTMLElement {
  connectedCallback() {
    const result = JSON.parse(this.dataset.result);
    this.render(result);
  }

  render(result) {
    this.innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, var(--primary), oklch(0.6 0.2 160)); color: white; container-type: inline-size;">
        <div class="result-grid" style="display: grid; gap: 1.5rem;">
          <div>
            <h3 style="opacity: 0.9; font-weight: 400;">Total Calories</h3>
            <div style="font-size: 3.5rem; font-weight: 800; line-height: 1;">${result.totalKcal} <span style="font-size: 1rem; font-weight: 400;">kcal</span></div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: oklch(1 0 0 / 0.1); padding: 1rem; border-radius: var(--radius-md); backdrop-filter: blur(4px);">
            <div style="text-align: center;">
              <div style="font-size: 0.75rem; opacity: 0.8;">Protein</div>
              <div style="font-weight: 700;">${result.items.reduce((s, i) => s + (i.protein || 0), 0).toFixed(1)}g</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.75rem; opacity: 0.8;">Carbs</div>
              <div style="font-weight: 700;">${result.items.reduce((s, i) => s + (i.carbs || 0), 0).toFixed(1)}g</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.75rem; opacity: 0.8;">Fat</div>
              <div style="font-weight: 700;">${result.items.reduce((s, i) => s + (i.fat || 0), 0).toFixed(1)}g</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; border-top: 1px solid oklch(1 0 0 / 0.2); padding-top: 1rem;">
          <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem; opacity: 0.9;">Items Detected:</h4>
          <ul style="list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${result.items.map(item => `
              <li style="background: oklch(1 0 0 / 0.2); padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.75rem; text-transform: capitalize;">
                ${item.name} (${item.kcal} kcal)
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

class FoodHistory extends HTMLElement {
  connectedCallback() {
    const history = JSON.parse(this.dataset.history);
    this.render(history);
  }

  render(history) {
    if (history.length === 0) {
      this.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent logs yet.</p>`;
      return;
    }

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${history.map(entry => `
          <div class="card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; background: var(--surface);">
            <div>
              <div style="font-weight: 600; text-transform: capitalize;">${entry.items[0].name}${entry.items.length > 1 ? ` +${entry.items.length - 1}` : ''}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(entry.timestamp).toLocaleTimeString()}</div>
            </div>
            <div style="font-weight: 800; color: var(--primary); font-size: 1.25rem;">
              ${entry.totalKcal} <span style="font-size: 0.75rem; font-weight: 400;">kcal</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('food-app', FoodApp);
customElements.define('food-input', FoodInput);
customElements.define('calorie-result', CalorieResult);
customElements.define('food-history', FoodHistory);
