// EcoPulse Sustainability Initiatives Hub Controller
import { gamification } from './gamification.js';

export class InitiativesController {
  constructor(app) {
    this.app = app;
  }

  init() {
    this.bindProposalModalEvents();
  }

  bindProposalModalEvents() {
    const proposeBtn = document.getElementById('btn-open-propose-modal');
    const closeBtn = document.getElementById('btn-close-propose-modal');
    const form = document.getElementById('propose-initiative-form');

    if (proposeBtn) {
      proposeBtn.addEventListener('click', () => {
        const modal = document.getElementById('propose-modal-backdrop');
        if (modal) modal.classList.add('open');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('propose-modal-backdrop');
        if (modal) modal.classList.remove('open');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitInitiativeProposal();
      });
    }
  }

  submitInitiativeProposal() {
    const title = document.getElementById('prop-title').value.trim();
    const category = document.getElementById('prop-category').value;
    const target = parseInt(document.getElementById('prop-target').value) || 1000;
    const unit = document.getElementById('prop-unit').value.trim() || 'Trees / Units';
    const location = document.getElementById('prop-location').value.trim();
    const date = document.getElementById('prop-date').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();

    if (!title || !location || !desc) {
      this.app.showToast('Please fill all required initiative fields.', 'alert');
      return;
    }

    const newInit = {
      id: `INIT-${Math.floor(200 + Math.random() * 800)}`,
      title,
      category,
      description: desc,
      organizer: `${this.app.user.name} (Grassroots Citizen Lead)`,
      location,
      date: date || 'Saturday, Nov 14, 2026 • 10:00 AM',
      target,
      current: 1,
      unit,
      volunteers: 1,
      pointsReward: 50,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      status: 'Active',
      hasJoined: true,
      tags: ['Community Led', 'Grassroots Action', 'EcoPulse Certified']
    };

    this.app.initiatives.unshift(newInit);
    this.app.user.initiativesJoined++;

    const modal = document.getElementById('propose-modal-backdrop');
    if (modal) modal.classList.remove('open');

    gamification.awardPoints(this.app.user, 60, 'Proposed Grassroots Sustainability Initiative', this.app);
    this.renderInitiatives();
    this.app.showToast('Initiative launched! Community RSVPs are now live.', 'success');
  }

  joinInitiative(initId) {
    const item = this.app.initiatives.find(i => i.id === initId);
    if (!item) return;

    if (item.hasJoined) {
      item.hasJoined = false;
      item.volunteers = Math.max(0, item.volunteers - 1);
      this.app.user.initiativesJoined = Math.max(0, this.app.user.initiativesJoined - 1);
      this.app.showToast(`Withdrew RSVP from: ${item.title}`, 'info');
    } else {
      item.hasJoined = true;
      item.volunteers++;
      item.current = Math.min(item.target, item.current + Math.floor(item.target * 0.02) + 1);
      this.app.user.initiativesJoined++;

      gamification.awardPoints(this.app.user, item.pointsReward, `Joined Campaign: ${item.title}`, this.app);
      this.app.showToast(`🎉 You joined "${item.title}"! Calendar invite generated.`, 'success');
    }

    this.renderInitiatives();
    this.app.saveState();
  }

  renderInitiatives() {
    const grid = document.getElementById('initiatives-grid');
    if (!grid) return;

    grid.innerHTML = this.app.initiatives.map(item => {
      const progressPercent = Math.min(100, Math.round((item.current / item.target) * 100));

      return `
        <div class="initiative-card">
          <div class="initiative-img-container">
            <img src="${item.image}" class="initiative-img" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'">
            <span class="initiative-category-tag">${item.category}</span>
            <span class="initiative-reward-pill">⚡ +${item.pointsReward} PTS</span>
          </div>

          <div class="initiative-body">
            <h3 class="initiative-title">${item.title}</h3>
            <p class="initiative-desc">${item.description}</p>

            <div class="progress-block">
              <div class="progress-header">
                <span>Impact Progress</span>
                <span style="color: var(--accent-mint); font-weight: 700;">
                  ${item.current.toLocaleString()} / ${item.target.toLocaleString()} ${item.unit} (${progressPercent}%)
                </span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>

            <div class="initiative-meta-row">
              <span>📅 ${item.date}</span>
              <span>📍 ${item.location}</span>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Organizer: <strong style="color: var(--text-secondary);">${item.organizer}</strong></span>
              <span>👥 ${item.volunteers} Volunteers Enrolled</span>
            </div>
          </div>

          <div class="initiative-card-footer">
            <button class="btn-rsvp ${item.hasJoined ? 'joined' : 'join'}" onclick="window.ecoApp.initiativesController.joinInitiative('${item.id}')">
              ${item.hasJoined ? '✓ Enrolled in Initiative (Cancel)' : '🤝 Join Initiative / RSVP'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}
