// EcoPulse Municipal Command & Field Response Center
import { gamification } from './gamification.js';

export class AdminController {
  constructor(app) {
    this.app = app;
    this.activeReportForTriage = null;
  }

  init() {
    this.bindRoleSwitcher();
    this.bindTriageModalEvents();
  }

  bindRoleSwitcher() {
    const btnCitizen = document.getElementById('btn-role-citizen');
    const btnMunicipal = document.getElementById('btn-role-municipal');

    if (btnCitizen) {
      btnCitizen.addEventListener('click', () => {
        this.setRole('citizen');
      });
    }

    if (btnMunicipal) {
      btnMunicipal.addEventListener('click', () => {
        this.setRole('municipal');
      });
    }
  }

  setRole(role) {
    this.app.user.role = role;
    const btnCitizen = document.getElementById('btn-role-citizen');
    const btnMunicipal = document.getElementById('btn-role-municipal');

    if (role === 'municipal') {
      if (btnCitizen) btnCitizen.classList.remove('active');
      if (btnMunicipal) btnMunicipal.classList.add('active', 'municipal');
      this.app.showToast('Switched to Municipal Officer Command Mode', 'info');
    } else {
      if (btnMunicipal) btnMunicipal.classList.remove('active', 'municipal');
      if (btnCitizen) btnCitizen.classList.add('active');
      this.app.showToast('Switched to Citizen Engagement Mode', 'info');
    }

    this.app.refreshAllViews();
    this.app.saveState();
  }

  bindTriageModalEvents() {
    const closeBtn = document.getElementById('btn-close-triage-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeTriageModal());
    }

    const saveTriageBtn = document.getElementById('btn-save-triage');
    if (saveTriageBtn) {
      saveTriageBtn.addEventListener('click', () => this.saveTriageUpdate());
    }

    const broadcastBtn = document.getElementById('btn-broadcast-alert');
    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', () => this.promptBroadcastAlert());
    }
  }

  openTriageModal(reportId) {
    const report = this.app.reports.find(r => r.id === reportId);
    if (!report) return;

    this.activeReportForTriage = report;

    const modal = document.getElementById('triage-modal-backdrop');
    const titleEl = document.getElementById('triage-report-title');
    const statusSelect = document.getElementById('triage-status-select');
    const responseInput = document.getElementById('triage-response-input');
    const unitInput = document.getElementById('triage-unit-input');
    const resolvedImgInput = document.getElementById('triage-resolved-img');

    if (titleEl) titleEl.textContent = `${report.id}: ${report.title}`;
    if (statusSelect) statusSelect.value = report.status;
    if (responseInput) responseInput.value = report.officialResponse || '';
    if (unitInput) unitInput.value = report.dispatchedUnit || 'Municipal Rapid Environmental Remediation';
    if (resolvedImgInput) resolvedImgInput.value = report.resolvedImage || '';

    if (modal) modal.classList.add('open');
  }

  closeTriageModal() {
    const modal = document.getElementById('triage-modal-backdrop');
    if (modal) modal.classList.remove('open');
    this.activeReportForTriage = null;
  }

  saveTriageUpdate() {
    if (!this.activeReportForTriage) return;

    const statusSelect = document.getElementById('triage-status-select');
    const responseInput = document.getElementById('triage-response-input');
    const unitInput = document.getElementById('triage-unit-input');
    const resolvedImgInput = document.getElementById('triage-resolved-img');

    const newStatus = statusSelect ? statusSelect.value : this.activeReportForTriage.status;
    const newResponse = responseInput ? responseInput.value.trim() : '';
    const newUnit = unitInput ? unitInput.value.trim() : '';
    let newResolvedImg = resolvedImgInput ? resolvedImgInput.value.trim() : '';

    if (newStatus === 'Resolved' && !newResolvedImg) {
      // Provide high quality remediation after proof photo
      newResolvedImg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
    }

    this.activeReportForTriage.status = newStatus;
    this.activeReportForTriage.officialResponse = newResponse || 'Remediation inspected and signed off by Municipal Environmental Compliance.';
    this.activeReportForTriage.dispatchedUnit = newUnit;
    if (newResolvedImg) {
      this.activeReportForTriage.resolvedImage = newResolvedImg;
    }

    this.closeTriageModal();
    gamification.playTone('success');
    this.app.showToast(`Updated ${this.activeReportForTriage.id} status to: ${newStatus}`, 'success');

    this.app.refreshAllViews();
    this.app.saveState();
  }

  promptBroadcastAlert() {
    const text = prompt('Enter Municipal Public Safety Advisory message:', 'Active Hazmat containment ongoing near Willow Creek. Residents please avoid water contact.');
    if (text) {
      this.showPublicAlertBanner(text);
      this.app.showToast('Public safety alert broadcast to all connected citizens!', 'alert');
    }
  }

  showPublicAlertBanner(message) {
    const banner = document.getElementById('municipal-alert-banner');
    const textEl = document.getElementById('municipal-alert-text');
    if (banner && textEl) {
      textEl.textContent = message;
      banner.style.display = 'flex';
    }
  }

  // Before & After Interactive Slider Renderer
  renderBeforeAfterSlider(containerEl, beforeSrc, afterSrc) {
    if (!containerEl) return;

    containerEl.innerHTML = `
      <div class="before-after-container" id="slider-box">
        <img src="${afterSrc}" class="after-img" alt="Remediated Site (After)">
        <div class="before-img-wrap" id="slider-wrap" style="width: 50%;">
          <img src="${beforeSrc}" class="before-img" alt="Environmental Hazard (Before)">
        </div>
        <div class="slider-handle-line" id="slider-line" style="left: 50%;">
          <div class="slider-handle-thumb">⇄</div>
        </div>
        <input type="range" min="0" max="100" value="50" class="slider-range-input" id="slider-input">
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-top: 6px;">
        <span style="color: #f87171;">◀ BEFORE (Reported Incident)</span>
        <span style="color: var(--accent-mint);">AFTER (Remediated by Municipal Crew) ▶</span>
      </div>
    `;

    const input = containerEl.querySelector('#slider-input');
    const wrap = containerEl.querySelector('#slider-wrap');
    const line = containerEl.querySelector('#slider-line');

    if (input && wrap && line) {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        wrap.style.width = `${val}%`;
        line.style.left = `${val}%`;
      });
    }
  }
}
