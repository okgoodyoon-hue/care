// --- Pulse Store (State & Data Logic) ---
class PulseStore {
  static STORAGE_KEY = 'pulse_community_data';
  static TAGS = ['AI', 'Design', 'Crypto', 'Politics', 'Gaming', 'Music', 'Tech', 'Food', 'Travel', 'Health'];

  static getState() {
    const defaultData = {
      pulses: [
        { id: 1, nickname: 'VibeMaster', content: 'Design is not just what it looks like. It is how it works.', tags: ['Design', 'Tech'], timestamp: new Date(Date.now() - 3600000).toISOString(), hue: 200 },
        { id: 2, nickname: 'AIGuru', content: 'Prompt engineering is the new coding. Change my mind.', tags: ['AI', 'Tech'], timestamp: new Date(Date.now() - 7200000).toISOString(), hue: 140 },
        { id: 3, nickname: 'SoundWave', content: 'New vinyl arrived today. Pure analog warmth.', tags: ['Music'], timestamp: new Date(Date.now() - 10800000).toISOString(), hue: 300 }
      ],
      userProfile: {
        nickname: localStorage.getItem('pulse_last_nick') || '',
        interests: JSON.parse(localStorage.getItem('pulse_interests') || '[]')
      }
    };
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || JSON.stringify(defaultData));
  }

  static savePulse(nickname, content, tags) {
    const state = this.getState();
    const newPulse = {
      id: crypto.randomUUID(),
      nickname: nickname || 'Anonymous',
      content: content.substring(0, 100),
      tags,
      timestamp: new Date().toISOString(),
      hue: Math.floor(Math.random() * 360)
    };
    state.pulses.unshift(newPulse);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('pulse_last_nick', nickname);
    return newPulse;
  }

  static getMatches() {
    const state = this.getState();
    const myInterests = state.userProfile.interests;
    if (myInterests.length === 0) return [];

    // Simple matching: people who posted with at least one common interest tag
    const matches = new Map();
    state.pulses.forEach(p => {
      if (p.nickname === state.userProfile.nickname) return;
      const common = p.tags.filter(t => myInterests.includes(t));
      if (common.length > 0) {
        if (!matches.has(p.nickname)) {
          matches.set(p.nickname, { nickname: p.nickname, common, hue: p.hue });
        }
      }
    });
    return Array.from(matches.values());
  }
}

// --- Web Components ---

class PulseApp extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addEventListener('pulse-added', () => this.refresh());
    this.addEventListener('interests-updated', () => this.refresh());
  }

  refresh() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <header style="padding: 2.5rem 1rem; text-align: center;">
        <h1 style="font-size: 3rem; font-weight: 800; letter-spacing: -3px; line-height: 1; margin-bottom: 0.5rem;">
          100<span style="color: var(--primary);">PULSE</span>
        </h1>
        <p style="color: var(--text-dim); font-weight: 600; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase;">Micro-Community & Matching</p>
      </header>

      <main style="max-width: 650px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 2.5rem; padding-bottom: 5rem;">
        <pulse-editor></pulse-editor>
        
        <div style="display: grid; gap: 2rem;">
          <section>
            <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem; color: var(--accent);">● SMART MATCHES</h2>
            <match-view></match-view>
          </section>

          <section>
            <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem; color: var(--primary);">● COMMUNITY FEED</h2>
            <pulse-feed></pulse-feed>
          </section>
        </div>
      </main>
    `;
  }
}

class PulseEditor extends HTMLElement {
  constructor() {
    super();
    this.selectedTags = [];
    const state = PulseStore.getState();
    this.nickname = state.userProfile.nickname;
  }

  connectedCallback() {
    this.render();
  }

  handleTagClick(tag, el) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
      el.classList.remove('active');
    } else {
      this.selectedTags.push(tag);
      el.classList.add('active');
    }
    // Update global user interests for matching
    localStorage.setItem('pulse_interests', JSON.stringify(this.selectedTags));
    this.dispatchEvent(new CustomEvent('interests-updated', { bubbles: true }));
  }

  async submit() {
    const nick = this.querySelector('#nick-input').value;
    const content = this.querySelector('#content-input').value;
    const btn = this.querySelector('#post-btn');

    if (!content || content.length > 100) return;

    btn.disabled = true;
    btn.textContent = 'Pulsing...';

    await new Promise(r => setTimeout(r, 800));
    
    PulseStore.savePulse(nick, content, this.selectedTags);
    
    this.querySelector('#content-input').value = '';
    this.querySelector('#char-count').textContent = '0/100';
    btn.textContent = 'Send Pulse';
    btn.disabled = true;

    this.dispatchEvent(new CustomEvent('pulse-added', { bubbles: true }));
  }

  render() {
    this.innerHTML = `
      <div class="card animate-pulse-entry">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="text" id="nick-input" class="input-field" placeholder="Nickname" value="${this.nickname}" style="max-width: 220px;">
          
          <div style="position: relative;">
            <textarea id="content-input" class="input-field" placeholder="What's your pulse? (100 chars max)" 
              style="min-height: 100px; resize: none; border-radius: var(--radius-md); padding-bottom: 2rem;"></textarea>
            <div id="char-count" style="position: absolute; bottom: 0.75rem; right: 1rem; font-size: 0.75rem; font-weight: 800; color: var(--text-dim);">0/100</div>
          </div>

          <div>
            <p style="font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 0.5rem; text-transform: uppercase;">Select Interests</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${PulseStore.TAGS.map(t => `
                <span class="tag ${JSON.parse(localStorage.getItem('pulse_interests') || '[]').includes(t) ? 'active' : ''}" data-tag="${t}">${t}</span>
              `).join('')}
            </div>
          </div>

          <button id="post-btn" class="btn btn-primary" disabled style="justify-content: center; width: 100%;">Send Pulse</button>
        </div>
      </div>
    `;

    this.querySelectorAll('.tag').forEach(tagEl => {
      tagEl.onclick = () => this.handleTagClick(tagEl.dataset.tag, tagEl);
    });

    const contentInput = this.querySelector('#content-input');
    contentInput.oninput = (e) => {
      const len = e.target.value.length;
      this.querySelector('#char-count').textContent = `${len}/100`;
      this.querySelector('#char-count').style.color = len > 100 ? 'var(--accent)' : 'var(--text-dim)';
      this.querySelector('#post-btn').disabled = len === 0 || len > 100;
    };

    this.querySelector('#post-btn').onclick = () => this.submit();
  }
}

class PulseFeed extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const state = PulseStore.getState();
    if (state.pulses.length === 0) {
      this.innerHTML = `<p style="text-align: center; color: var(--text-dim); padding: 2rem;">Silence in the community... Start a pulse!</p>`;
      return;
    }

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${state.pulses.map(p => `
          <div class="card animate-pulse-entry" style="padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start;">
            <div style="width: 44px; height: 44px; min-width: 44px; border-radius: 12px; background: oklch(0.7 0.2 ${p.hue}); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; box-shadow: 0 4px 15px oklch(0.7 0.2 ${p.hue} / 0.3);">
              ${p.nickname.charAt(0).toUpperCase()}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <span style="font-weight: 800; font-size: 0.9rem;">${p.nickname}</span>
                <span style="font-size: 0.7rem; color: var(--text-dim);">${this.formatTime(p.timestamp)}</span>
              </div>
              <p style="font-size: 1rem; color: oklch(0.95 0 0); margin-bottom: 0.75rem; word-wrap: break-word;">${p.content}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                ${p.tags.map(t => `<span style="font-size: 0.65rem; font-weight: 800; color: var(--primary); background: oklch(0.65 0.25 280 / 0.1); padding: 0.2rem 0.6rem; border-radius: 100px;">#${t}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  formatTime(iso) {
    const diff = Math.floor((new Date() - new Date(iso)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return new Date(iso).toLocaleDateString();
  }
}

class MatchView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const matches = PulseStore.getMatches();
    const state = PulseStore.getState();
    const myInterests = state.userProfile.interests;

    if (myInterests.length === 0) {
      this.innerHTML = `
        <div class="card" style="padding: 1rem; text-align: center; font-size: 0.85rem; color: var(--text-dim);">
          Select interests above to see matches!
        </div>
      `;
      return;
    }

    if (matches.length === 0) {
      this.innerHTML = `
        <div class="card" style="padding: 1rem; text-align: center; font-size: 0.85rem; color: var(--text-dim);">
          Searching for similar pulses...
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; scroll-snap-type: x mandatory;">
        ${matches.map(m => `
          <div class="card" style="min-width: 180px; padding: 1.25rem; scroll-snap-align: start; flex-shrink: 0; text-align: center; background: linear-gradient(135deg, var(--bg-surface), oklch(0.16 0.04 280 / 0.8));">
            <div style="width: 50px; height: 50px; margin: 0 auto 0.75rem; border-radius: 50%; background: oklch(0.7 0.2 ${m.hue}); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; border: 3px solid var(--primary);">
              ${m.nickname.charAt(0).toUpperCase()}
            </div>
            <div style="font-weight: 800; font-size: 0.9rem; margin-bottom: 0.25rem;">${m.nickname}</div>
            <div style="font-size: 0.65rem; color: var(--primary); font-weight: 800; margin-bottom: 0.75rem;">
              Matches: ${m.common.join(', ')}
            </div>
            <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.75rem; width: 100%;">Connect</button>
          </div>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('pulse-app', PulseApp);
customElements.define('pulse-editor', PulseEditor);
customElements.define('pulse-feed', PulseFeed);
customElements.define('match-view', MatchView);
