// --- Community Store (State Management) ---
class CommunityStore {
  static STORAGE_KEY = 'community_feed_100';

  static getMessages() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  static saveMessage(nickname, content) {
    const messages = this.getMessages();
    const newMessage = {
      id: crypto.randomUUID(),
      nickname: nickname || 'Anonymous',
      content: content.substring(0, 100),
      timestamp: new Date().toISOString(),
      avatarHue: Math.floor(Math.random() * 360)
    };
    messages.unshift(newMessage);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages.slice(0, 50)));
    return newMessage;
  }
}

// --- Web Components ---

class CommunityApp extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addEventListener('new-message', () => this.updateFeed());
  }

  updateFeed() {
    const feed = this.querySelector('message-feed');
    if (feed) feed.render();
  }

  render() {
    this.innerHTML = `
      <header style="padding: 2rem 1rem; text-align: center;">
        <h1 style="font-size: 3rem; font-weight: 800; letter-spacing: -2px; line-height: 1;">
          100 <span style="color: var(--primary); font-size: 1.5rem; letter-spacing: 0;">&middot; Community</span>
        </h1>
        <p style="color: var(--text-dim); margin-top: 0.5rem; font-weight: 600;">Share a thought. Keep it short.</p>
      </header>

      <main style="max-width: 600px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 2rem; padding-bottom: 5rem;">
        <post-editor></post-editor>
        <message-feed></message-feed>
      </main>

      <footer style="padding: 2rem; text-align: center; color: var(--text-dim); font-size: 0.75rem;">
        &copy; 2026 Pulse Communities. 100 chars only.
      </footer>
    `;
  }
}

class PostEditor extends HTMLElement {
  constructor() {
    super();
    this.nickname = localStorage.getItem('last_nickname') || '';
    this.charLimit = 100;
  }

  connectedCallback() {
    this.render();
  }

  handleInput(e) {
    const content = e.target.value;
    const count = content.length;
    const counter = this.querySelector('#char-counter');
    const btn = this.querySelector('#post-btn');
    
    counter.textContent = `${count}/${this.charLimit}`;
    counter.style.color = count > this.charLimit ? 'var(--accent)' : 'var(--text-dim)';
    btn.disabled = count === 0 || count > this.charLimit;
  }

  async submit() {
    const nickInput = this.querySelector('#nick-input');
    const contentInput = this.querySelector('#content-input');
    const btn = this.querySelector('#post-btn');

    if (!contentInput.value || contentInput.value.length > this.charLimit) return;

    btn.disabled = true;
    btn.textContent = 'Sharing...';

    // Simulate delay
    await new Promise(r => setTimeout(r, 600));

    CommunityStore.saveMessage(nickInput.value, contentInput.value);
    localStorage.setItem('last_nickname', nickInput.value);

    contentInput.value = '';
    this.querySelector('#char-counter').textContent = `0/${this.charLimit}`;
    btn.textContent = 'Share Thought';
    
    this.dispatchEvent(new CustomEvent('new-message', { bubbles: true }));
  }

  render() {
    this.innerHTML = `
      <div class="card animate-entry">
        <div style="display: flex; gap: 0.75rem; flex-direction: column;">
          <input type="text" id="nick-input" class="input-field" placeholder="Nickname" value="${this.nickname}" style="max-width: 200px;">
          
          <div style="position: relative;">
            <textarea id="content-input" class="input-field" placeholder="What's on your mind?" 
              style="min-height: 100px; resize: none; border-radius: var(--radius-md); padding-bottom: 2rem;"></textarea>
            
            <div id="char-counter" class="char-count" style="position: absolute; bottom: 0.75rem; right: 1rem; color: var(--text-dim);">
              0/${this.charLimit}
            </div>
          </div>

          <button id="post-btn" class="btn btn-primary" disabled style="justify-content: center;">Share Thought</button>
        </div>
      </div>
    `;

    this.querySelector('#content-input').oninput = (e) => this.handleInput(e);
    this.querySelector('#post-btn').onclick = () => this.submit();
  }
}

class MessageFeed extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const messages = CommunityStore.getMessages();
    if (messages.length === 0) {
      this.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: var(--text-dim);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
          <p>Be the first to share a thought in the community.</p>
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${messages.map(msg => `
          <message-card data-msg='${JSON.stringify(msg)}' class="animate-entry"></message-card>
        `).join('')}
      </div>
    `;
  }
}

class MessageCard extends HTMLElement {
  connectedCallback() {
    const msg = JSON.parse(this.dataset.msg);
    const time = this.formatTime(msg.timestamp);
    
    this.innerHTML = `
      <div class="card" style="padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start;">
        <div style="width: 48px; height: 48px; min-width: 48px; border-radius: 50%; background: oklch(0.7 0.2 ${msg.avatarHue}); 
          display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; box-shadow: 0 4px 12px oklch(0.7 0.2 ${msg.avatarHue} / 0.3);">
          ${msg.nickname.charAt(0).toUpperCase()}
        </div>
        
        <div style="flex: 1; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
            <span style="font-weight: 800; font-size: 0.9rem;">${msg.nickname}</span>
            <span style="font-size: 0.7rem; color: var(--text-dim);">${time}</span>
          </div>
          <p style="word-wrap: break-word; color: oklch(0.95 0 0);">${msg.content}</p>
        </div>
      </div>
    `;
  }

  formatTime(isoString) {
    const date = new Date(isoString);
    const diff = Math.floor((new Date() - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }
}

customElements.define('community-app', CommunityApp);
customElements.define('post-editor', PostEditor);
customElements.define('message-feed', MessageFeed);
customElements.define('message-card', MessageCard);
