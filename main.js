// --- Community Store (한국어 데이터 및 로직) ---
class CommunityStore {
  static STORAGE_KEY = 'community_feed_100_kr';
  static TAGS = ['인공지능', '경제', '여행', '맛집', '테크', '디자인', '음악', '운동', '취업', '정치'];

  static getMessages() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  static saveMessage(nickname, content, tags) {
    const messages = this.getMessages();
    const newMessage = {
      id: crypto.randomUUID(),
      nickname: nickname || '익명',
      content: content.substring(0, 100),
      tags: tags || [],
      timestamp: new Date().toISOString(),
      avatarHue: Math.floor(Math.random() * 360)
    };
    messages.unshift(newMessage);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages.slice(0, 50)));
    return newMessage;
  }

  static getMatches() {
    const messages = this.getMessages();
    const myInterests = JSON.parse(localStorage.getItem('my_interests') || '[]');
    if (myInterests.length === 0) return [];

    const matches = new Map();
    messages.forEach(m => {
      const common = m.tags.filter(t => myInterests.includes(t));
      if (common.length > 0) {
        if (!matches.has(m.nickname)) {
          matches.set(m.nickname, { nickname: m.nickname, common, hue: m.avatarHue });
        }
      }
    });
    return Array.from(matches.values()).slice(0, 5);
  }
}

// --- Web Components ---

class CommunityApp extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addEventListener('new-message', () => this.refresh());
    this.addEventListener('interests-updated', () => this.refresh());
  }

  refresh() {
    const feed = this.querySelector('message-feed');
    const matches = this.querySelector('match-view');
    if (feed) feed.render();
    if (matches) matches.render();
  }

  render() {
    this.innerHTML = `
      <header style="padding: 2.5rem 1rem; text-align: center;">
        <h1 style="font-size: 3rem; font-weight: 900; letter-spacing: -3px; line-height: 1;">
          100 <span style="color: var(--primary); font-size: 1.5rem; letter-spacing: 0;">&middot; 펄스</span>
        </h1>
        <p style="color: var(--text-dim); margin-top: 0.5rem; font-weight: 700;">짧고 강렬한 100자의 소통</p>
      </header>

      <main style="max-width: 650px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 2rem; padding-bottom: 5rem;">
        <match-view></match-view>
        <post-editor></post-editor>
        <message-feed></message-feed>
      </main>

      <footer style="padding: 2rem; text-align: center; color: var(--text-dim); font-size: 0.8rem; font-weight: 700;">
        &copy; 2026 100 Pulse Community.
      </footer>
    `;
  }
}

class PostEditor extends HTMLElement {
  constructor() {
    super();
    this.nickname = localStorage.getItem('last_nickname') || '';
    this.selectedTags = JSON.parse(localStorage.getItem('my_interests') || '[]');
  }

  connectedCallback() {
    this.render();
  }

  toggleTag(tag, el) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
      el.classList.remove('active');
    } else {
      this.selectedTags.push(tag);
      el.classList.add('active');
    }
    localStorage.setItem('my_interests', JSON.stringify(this.selectedTags));
    this.dispatchEvent(new CustomEvent('interests-updated', { bubbles: true }));
  }

  async submit() {
    const nick = this.querySelector('#nick-input').value;
    const content = this.querySelector('#content-input').value;
    const btn = this.querySelector('#post-btn');

    if (!content || content.length > 100) return;

    btn.disabled = true;
    btn.textContent = '펄스 전송 중...';

    await new Promise(r => setTimeout(r, 600));

    CommunityStore.saveMessage(nick, content, this.selectedTags);
    localStorage.setItem('last_nickname', nick);

    this.querySelector('#content-input').value = '';
    this.querySelector('#char-counter').textContent = '0/100';
    btn.textContent = '펄스 공유하기';
    btn.disabled = true;

    this.dispatchEvent(new CustomEvent('new-message', { bubbles: true }));
  }

  render() {
    this.innerHTML = `
      <div class="card animate-entry">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="text" id="nick-input" class="input-field" placeholder="닉네임" value="${this.nickname}" style="max-width: 200px;">
          
          <div style="position: relative;">
            <textarea id="content-input" class="input-field" placeholder="지금 무슨 생각을 하고 계신가요? (100자 이내)" 
              style="min-height: 100px; resize: none; padding-bottom: 2rem;"></textarea>
            <div id="char-counter" class="char-count" style="position: absolute; bottom: 0.75rem; right: 1rem; color: var(--text-dim);">0/100</div>
          </div>

          <div>
            <p style="font-size: 0.75rem; font-weight: 800; color: var(--text-dim); margin-bottom: 0.5rem;">관심사 태그 (매칭에 사용됩니다)</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${CommunityStore.TAGS.map(t => `
                <span class="tag ${this.selectedTags.includes(t) ? 'active' : ''}" data-tag="${t}">${t}</span>
              `).join('')}
            </div>
          </div>

          <button id="post-btn" class="btn btn-primary" disabled style="justify-content: center;">펄스 공유하기</button>
        </div>
      </div>
    `;

    this.querySelectorAll('.tag').forEach(tagEl => {
      tagEl.onclick = () => this.toggleTag(tagEl.dataset.tag, tagEl);
    });

    const contentInput = this.querySelector('#content-input');
    contentInput.oninput = (e) => {
      const len = e.target.value.length;
      this.querySelector('#char-counter').textContent = `${len}/100`;
      this.querySelector('#char-counter').style.color = len > 100 ? 'var(--accent)' : 'var(--text-dim)';
      this.querySelector('#post-btn').disabled = len === 0 || len > 100;
    };

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
          <p>커뮤니티의 첫 번째 펄스를 남겨보세요!</p>
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${messages.map(msg => `
          <div class="card animate-entry" style="padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start;">
            <div style="width: 48px; height: 48px; min-width: 48px; border-radius: 50%; background: oklch(0.7 0.2 ${msg.avatarHue}); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white;">
              ${msg.nickname.charAt(0).toUpperCase()}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem;">
                <span style="font-weight: 800; font-size: 0.9rem;">${msg.nickname}</span>
                <span style="font-size: 0.7rem; color: var(--text-dim);">${this.formatTime(msg.timestamp)}</span>
              </div>
              <p style="word-wrap: break-word; font-size: 1rem; color: oklch(0.98 0 0); margin-bottom: 0.5rem;">${msg.content}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                ${msg.tags.map(t => `<span style="font-size: 0.65rem; color: var(--primary); font-weight: 700;">#${t}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  formatTime(iso) {
    const diff = Math.floor((new Date() - new Date(iso)) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return new Date(iso).toLocaleDateString();
  }
}

class MatchView extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const matches = CommunityStore.getMatches();
    if (matches.length === 0) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <h2 style="font-size: 1rem; font-weight: 900; color: var(--accent); margin-bottom: 0.75rem;">나와 비슷한 관심사의 유저</h2>
        <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
          ${matches.map(m => `
            <div class="card" style="min-width: 160px; padding: 1rem; flex-shrink: 0; text-align: center;">
              <div style="width: 50px; height: 50px; margin: 0 auto 0.5rem; border-radius: 50%; background: oklch(0.7 0.2 ${m.hue}); display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; border: 3px solid var(--primary);">
                ${m.nickname.charAt(0).toUpperCase()}
              </div>
              <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 0.2rem;">${m.nickname}</div>
              <div style="font-size: 0.65rem; color: var(--primary); font-weight: 700;">${m.common[0]} 등</div>
              <button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.7rem; width: 100%; margin-top: 0.5rem;">대화하기</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

customElements.define('pulse-app', CommunityApp);
customElements.define('post-editor', PostEditor);
customElements.define('message-feed', MessageFeed);
customElements.define('match-view', MatchView);
