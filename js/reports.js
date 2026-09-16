// EcoPulse Incident Reporting Studio & Feed Manager
import { gamification } from './gamification.js';

export class ReportsController {
  constructor(app) {
    this.app = app;
    this.currentStep = 1;
    this.newReportData = {
      category: 'illegal_dumping',
      title: '',
      locationName: '',
      lat: 37.7749,
      lng: -122.4194,
      image: null,
      description: '',
      urgency: 'Moderate',
      isAnonymous: false
    };
  }

  init() {
    this.bindReportModalEvents();
    this.bindFeedFilterEvents();
  }

  bindFeedFilterEvents() {
    const searchInput = document.getElementById('feed-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderFeed(e.target.value);
      });
    }

    const urgencyFilter = document.getElementById('feed-urgency-filter');
    if (urgencyFilter) {
      urgencyFilter.addEventListener('change', () => {
        this.renderFeed();
      });
    }

    const statusFilter = document.getElementById('feed-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.renderFeed();
      });
    }
  }

  openReportModal() {
    this.currentStep = 1;
    this.resetReportForm();
    this.updateWizardUI();
    const modal = document.getElementById('report-modal-backdrop');
    if (modal) modal.classList.add('open');
  }

  closeReportModal() {
    const modal = document.getElementById('report-modal-backdrop');
    if (modal) modal.classList.remove('open');
  }

  resetReportForm() {
    this.newReportData = {
      category: 'illegal_dumping',
      title: '',
      locationName: '',
      lat: 37.7749,
      lng: -122.4194,
      image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
      description: '',
      urgency: 'Moderate',
      isAnonymous: false
    };

    const titleInput = document.getElementById('rep-form-title');
    const locInput = document.getElementById('rep-form-location');
    const descInput = document.getElementById('rep-form-desc');
    const previewImg = document.getElementById('rep-image-preview');
    const dropzoneContent = document.getElementById('dropzone-prompt');

    if (titleInput) titleInput.value = '';
    if (locInput) locInput.value = '';
    if (descInput) descInput.value = '';
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (dropzoneContent) dropzoneContent.style.display = 'flex';
  }

  bindReportModalEvents() {
    // Step navigation buttons
    const nextBtn = document.getElementById('btn-wizard-next');
    const prevBtn = document.getElementById('btn-wizard-prev');
    const closeBtn = document.getElementById('btn-close-report-modal');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeReportModal());

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < 4) {
          if (this.validateStep(this.currentStep)) {
            this.currentStep++;
            this.updateWizardUI();
          }
        } else {
          this.submitReport();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.updateWizardUI();
        }
      });
    }

    // Category cards selection
    const catCards = document.querySelectorAll('.category-choice-card');
    catCards.forEach(card => {
      card.addEventListener('click', () => {
        catCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.newReportData.category = card.dataset.category;
      });
    });

    // File input & Drag drop
    const fileInput = document.getElementById('rep-file-input');
    const dropzone = document.getElementById('rep-dropzone');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-mint)';
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--border-subtle)';
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-subtle)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }

    // Map picker button
    const mapPickBtn = document.getElementById('btn-pick-on-map');
    if (mapPickBtn) {
      mapPickBtn.addEventListener('click', () => {
        this.closeReportModal();
        this.app.switchTab('map-view');
        this.app.ecoMap.enableLocationPickMode((lat, lng) => {
          this.newReportData.lat = lat;
          this.newReportData.lng = lng;
          const locInput = document.getElementById('rep-form-location');
          if (locInput) locInput.value = `Geo-Coord (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          this.openReportModal();
          this.currentStep = 2;
          this.updateWizardUI();
        });
      });
    }

    // GPS Simulation button
    const gpsBtn = document.getElementById('btn-use-gps');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        // SF downtown offset simulation
        const offsetLat = 37.7749 + (Math.random() - 0.5) * 0.04;
        const offsetLng = -122.4194 + (Math.random() - 0.5) * 0.04;
        this.newReportData.lat = offsetLat;
        this.newReportData.lng = offsetLng;
        const locInput = document.getElementById('rep-form-location');
        if (locInput) locInput.value = `Civic GPS Anchor (${offsetLat.toFixed(4)}, ${offsetLng.toFixed(4)})`;
        this.app.showToast('GPS coordinates locked!', 'success');
      });
    }
  }

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.newReportData.image = e.target.result;
      const previewImg = document.getElementById('rep-image-preview');
      const dropzonePrompt = document.getElementById('dropzone-prompt');
      if (previewImg) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
      }
      if (dropzonePrompt) {
        dropzonePrompt.style.display = 'none';
      }
      this.app.showToast('Evidence photo attached!', 'info');
    };
    reader.readAsDataURL(file);
  }

  validateStep(step) {
    if (step === 2) {
      const locInput = document.getElementById('rep-form-location');
      if (!locInput || !locInput.value.trim()) {
        this.app.showToast('Please specify an incident location or use map pin.', 'alert');
        return false;
      }
      this.newReportData.locationName = locInput.value.trim();
    } else if (step === 3) {
      const titleInput = document.getElementById('rep-form-title');
      const descInput = document.getElementById('rep-form-desc');
      if (!titleInput || !titleInput.value.trim()) {
        this.app.showToast('Please provide an incident title.', 'alert');
        return false;
      }
      if (!descInput || !descInput.value.trim()) {
        this.app.showToast('Please describe the environmental hazard.', 'alert');
        return false;
      }
      this.newReportData.title = titleInput.value.trim();
      this.newReportData.description = descInput.value.trim();
      
      // Fallback default image if none uploaded
      if (!this.newReportData.image) {
        this.newReportData.image = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80';
      }

      // Populate AI assessment preview in Step 4
      this.generateAIAssessmentPreview();
    }
    return true;
  }

  generateAIAssessmentPreview() {
    const urgencySelect = document.getElementById('rep-form-urgency');
    const urgency = urgencySelect ? urgencySelect.value : 'Moderate';
    this.newReportData.urgency = urgency;

    const riskScore = urgency === 'Critical' ? '92/100 (Immediate Public Danger)' : urgency === 'Moderate' ? '68/100 (Environmental Hazard)' : '35/100 (Non-urgent remediation)';
    const recDept = this.getRecommendedDepartment(this.newReportData.category);

    const aiBox = document.getElementById('rep-ai-preview-box');
    if (aiBox) {
      aiBox.innerHTML = `
        <div style="font-size: 0.8rem; font-weight: 700; color: #d8b4fe; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
          🤖 EcoPulse AI Triage Analysis
        </div>
        <div style="font-size: 0.85rem; color: #f3e8ff;">
          <strong>Calculated Risk Score:</strong> ${riskScore}<br>
          <strong>Recommended Dispatch Unit:</strong> ${recDept}<br>
          <strong>Automated Tag:</strong> Verified Citizen Submission #2026-ENVIRO
        </div>
      `;
    }
  }

  getRecommendedDepartment(category) {
    switch (category) {
      case 'water_pollution': return 'Regional Water Quality Protection Board';
      case 'air_pollution': return 'Air Quality Compliance Division';
      case 'chemical_spill': return 'Hazardous Materials Rapid Strike Team';
      case 'deforestation': return 'Urban Forest & Tree Preservation Agency';
      case 'wildlife_threat': return 'Wildlife & Habitat Conservation Bureau';
      default: return 'Municipal Sanitation & Waste Enforcement';
    }
  }

  updateWizardUI() {
    // Hide all step sections
    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`wizard-step-${i}`);
      const nodeEl = document.getElementById(`step-node-${i}`);
      if (stepEl) stepEl.style.display = i === this.currentStep ? 'flex' : 'none';
      if (nodeEl) {
        nodeEl.classList.remove('active', 'done');
        if (i === this.currentStep) nodeEl.classList.add('active');
        else if (i < this.currentStep) nodeEl.classList.add('done');
      }
    }

    const prevBtn = document.getElementById('btn-wizard-prev');
    const nextBtn = document.getElementById('btn-wizard-next');

    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (this.currentStep === 4) {
        nextBtn.innerHTML = '🚀 Submit Report & Earn 50 Pts';
        nextBtn.classList.add('btn-primary');
      } else {
        nextBtn.innerHTML = 'Next Step ➔';
      }
    }
  }

  submitReport() {
    const urgencySelect = document.getElementById('rep-form-urgency');
    const anonCheckbox = document.getElementById('rep-form-anon');

    if (urgencySelect) this.newReportData.urgency = urgencySelect.value;
    if (anonCheckbox) this.newReportData.isAnonymous = anonCheckbox.checked;

    const newId = `REP-${Math.floor(100 + Math.random() * 900)}`;
    const newReport = {
      id: newId,
      title: this.newReportData.title,
      category: this.newReportData.category,
      urgency: this.newReportData.urgency,
      status: 'Reported',
      locationName: this.newReportData.locationName,
      lat: this.newReportData.lat,
      lng: this.newReportData.lng,
      description: this.newReportData.description,
      reportedBy: this.newReportData.isAnonymous ? 'Anonymous Citizen' : this.app.user.name,
      reporterBadge: this.app.user.rankTitle,
      timestamp: 'Just now',
      date: new Date().toISOString(),
      upvotes: 1,
      hasUpvoted: true,
      image: this.newReportData.image,
      resolvedImage: null,
      officialResponse: null,
      dispatchedUnit: this.getRecommendedDepartment(this.newReportData.category),
      aiAssessment: {
        riskLevel: `${this.newReportData.urgency === 'Critical' ? '92' : '65'}/100`,
        pollutantType: 'Citizen-flagged environmental contaminant',
        recommendedAction: `Dispatched to ${this.getRecommendedDepartment(this.newReportData.category)}`
      }
    };

    // Prepend to app reports
    this.app.reports.unshift(newReport);
    this.app.user.reportsCount++;

    // Close modal
    this.closeReportModal();

    // Award EcoPoints
    gamification.awardPoints(this.app.user, 50, 'Environmental Hazard Report Filed', this.app);

    // Refresh UI
    this.app.refreshAllViews();
    this.app.showToast(`Report ${newId} logged successfully! Dispatch notification issued.`, 'success');
  }

  upvoteReport(reportId) {
    const report = this.app.reports.find(r => r.id === reportId);
    if (!report) return;

    if (report.hasUpvoted) {
      report.upvotes--;
      report.hasUpvoted = false;
      this.app.showToast('Upvote removed', 'info');
    } else {
      report.upvotes++;
      report.hasUpvoted = true;
      gamification.playTone('points');
      gamification.awardPoints(this.app.user, 5, 'Citizen Verification Upvote', this.app);
      this.app.showToast('Report verified & upvoted!', 'success');
    }

    this.app.refreshAllViews();
    this.app.saveState();
  }

  renderSidebarList(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = this.app.reports.filter(r => {
      return filter === 'all' || r.category === filter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No environmental incidents match this filter.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => `
      <div class="incident-card-mini" id="mini-card-${r.id}" onclick="window.ecoApp.focusOnReport('${r.id}')">
        <div class="incident-card-top">
          <span class="urgency-badge ${r.urgency}">${r.urgency}</span>
          <span class="status-badge ${r.status.replace(' ', '-')}">● ${r.status}</span>
        </div>
        <div class="incident-title-mini">${r.title}</div>
        <div class="incident-location-mini">📍 ${r.locationName}</div>
        <div class="incident-footer-mini">
          <span>${r.timestamp} • ${r.reportedBy}</span>
          <button class="upvote-btn ${r.hasUpvoted ? 'upvoted' : ''}" onclick="event.stopPropagation(); window.ecoApp.reportsController.upvoteReport('${r.id}')">
            ▲ ${r.upvotes}
          </button>
        </div>
      </div>
    `).join('');
  }

  renderFeed(searchQuery = '') {
    const container = document.getElementById('feed-incident-grid');
    if (!container) return;

    const urgencyVal = document.getElementById('feed-urgency-filter')?.value || 'all';
    const statusVal = document.getElementById('feed-status-filter')?.value || 'all';

    const filtered = this.app.reports.filter(r => {
      const matchSearch = !searchQuery || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.locationName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchUrgency = urgencyVal === 'all' || r.urgency === urgencyVal;
      const matchStatus = statusVal === 'all' || r.status === statusVal;

      return matchSearch && matchUrgency && matchStatus;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--surface-card); border-radius: var(--radius-lg);">
          <h3>No environmental reports match your search criteria</h3>
          <p style="margin-top: 0.5rem;">Try modifying your keyword search or adjusting the filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => `
      <div class="feed-card">
        <div class="feed-card-media">
          <img src="${r.image}" class="feed-card-img" alt="${r.title}" onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600'">
          <span class="urgency-badge ${r.urgency}" style="position: absolute; top: 10px; left: 10px;">${r.urgency}</span>
          ${r.status === 'Resolved' ? '<span class="status-badge Resolved" style="position: absolute; bottom: 10px; left: 10px;">✓ Remediation Verified</span>' : ''}
        </div>

        <div class="feed-card-content">
          <div>
            <div class="feed-card-header">
              <div>
                <h3 class="feed-card-title">${r.title}</h3>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  📍 ${r.locationName} • Reported by <strong style="color: var(--text-secondary);">${r.reportedBy}</strong> (${r.timestamp})
                </div>
              </div>
              <span class="status-badge ${r.status.replace(' ', '-')}">${r.status}</span>
            </div>

            <p class="feed-card-desc">${r.description}</p>

            ${r.aiAssessment ? `
              <div class="ai-triage-badge">
                <span>🤖 AI Assessment:</span> ${r.aiAssessment.riskLevel} • ${r.aiAssessment.pollutantType}
              </div>
            ` : ''}

            ${r.officialResponse ? `
              <div class="official-response-box">
                <strong>🏛️ Official Municipal Dispatch (${r.dispatchedUnit || 'Field Agency'}):</strong>
                ${r.officialResponse}
              </div>
            ` : ''}
          </div>

          <div class="feed-card-actions">
            <div style="display: flex; gap: 0.75rem;">
              <button class="upvote-btn ${r.hasUpvoted ? 'upvoted' : ''}" onclick="window.ecoApp.reportsController.upvoteReport('${r.id}')">
                ▲ Endorse & Verify (${r.upvotes})
              </button>
              <button class="btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.78rem;" onclick="window.ecoApp.focusOnReport('${r.id}')">
                🗺️ View on Map
              </button>
            </div>

            <button class="btn-primary" style="padding: 0.35rem 0.9rem; font-size: 0.82rem;" onclick="window.ecoApp.openReportDetail('${r.id}')">
              Full Evidence File ➔
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}
