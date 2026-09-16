// EcoCitizen Platform Orchestrator (PRD Antigravity Implementation)
import { MOCK_ISSUES, MOCK_INITIATIVES, MOCK_USER } from './mockData.js';

class EcoCitizenApp {
  constructor() {
    this.STORAGE_KEY = 'ecocitizen_state_v2';
    this.issues = [];
    this.initiatives = [];
    this.user = {};

    this.activeTab = 'feed-hub';
    this.activeCategory = 'All';
    this.searchQuery = '';

    this.map = null;
    this.markersLayer = null;
    this.activeDetailIssue = null;
    this.tempUploadedImage = null;
  }

  init() {
    this.loadState();
    this.initMap();
    this.renderAll();
    this.bindEvents();

    window.ecoApp = this;
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  loadState() {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.issues = parsed.issues || MOCK_ISSUES;
        this.initiatives = parsed.initiatives || MOCK_INITIATIVES;
        this.user = parsed.user || MOCK_USER;
        return;
      }
    } catch (e) {
      console.warn('LocalStorage error, fallback to mockData', e);
    }
    this.issues = JSON.parse(JSON.stringify(MOCK_ISSUES));
    this.initiatives = JSON.parse(JSON.stringify(MOCK_INITIATIVES));
    this.user = JSON.parse(JSON.stringify(MOCK_USER));
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        issues: this.issues,
        initiatives: this.initiatives,
        user: this.user
      }));
    } catch (e) {
      console.warn('Could not persist to LocalStorage', e);
    }
  }

  // =========================================================
  // Leaflet Interactive Map View (Left Column)
  // =========================================================
  initMap() {
    const mapEl = document.getElementById('leaflet-map');
    if (!mapEl) return;

    // Center on default coordinate (SF Eco-Zone)
    this.map = L.map('leaflet-map', {
      center: [37.7749, -122.4194],
      zoom: 12.5,
      zoomControl: false
    });

    // Clean, crisp Positron map tiles (Government & Tech Portal Aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);

    this.renderMapMarkers();
  }

  renderMapMarkers() {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    const filtered = this.getFilteredIssues();

    filtered.forEach(issue => {
      const pinClass = issue.status === 'Resolved' ? 'pin-resolved' :
                       (issue.urgency === 'High' ? 'pin-urgent' : 'pin-pending');

      const iconSymbol = issue.category.includes('Water') ? '💧' :
                         issue.category.includes('Waste') ? '🗑️' :
                         issue.category.includes('Air') ? '💨' :
                         issue.category.includes('Deforest') ? '🌲' : '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: `<div class="custom-pin ${pinClass}">${iconSymbol}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
      });

      const marker = L.marker(issue.coordinates, { icon: customIcon });

      const popupHtml = `
        <div class="w-64 overflow-hidden rounded-xl bg-white font-sans text-left">
          <img src="${issue.imageUrl}" class="w-full h-28 object-cover" alt="${issue.title}" onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600'">
          <div class="p-3">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
              <span class="text-gray-500">${issue.category}</span>
              <span class="${issue.status === 'Resolved' ? 'text-emerald-700' : (issue.urgency === 'High' ? 'text-orange-600' : 'text-amber-600')}">${issue.status}</span>
            </div>
            <h4 class="text-xs font-bold text-gray-900 leading-snug line-clamp-2">${issue.title}</h4>
            <div class="text-[11px] text-gray-500 mt-1 flex items-center gap-1">📍 ${issue.location}</div>
            <button class="mt-2.5 w-full py-1.5 px-3 bg-forest-800 hover:bg-forest-900 text-white rounded-lg text-xs font-semibold" onclick="window.ecoApp.openDetailModal('${issue.id}')">
              Inspect Issue Dossier
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      this.markersLayer.addLayer(marker);
    });
  }

  recenterMap() {
    if (this.map) {
      this.map.flyTo([37.7749, -122.4194], 12.5, { duration: 1 });
      this.showToast('Map camera recentered', 'info');
    }
  }

  // =========================================================
  // Filtering & Feed (Right Column)
  // =========================================================
  getFilteredIssues() {
    return this.issues.filter(issue => {
      const matchCat = this.activeCategory === 'All' || issue.category === this.activeCategory;
      const query = this.searchQuery.toLowerCase().trim();
      const matchSearch = !query ||
        issue.title.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }

  setCategoryFilter(category) {
    this.activeCategory = category;

    // Update filter pill UI
    document.querySelectorAll('.filter-pill').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.className = 'filter-pill active px-3 py-1 rounded-full text-xs font-semibold bg-forest-800 text-white shadow-sm';
      } else {
        btn.className = 'filter-pill px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-600 border border-gray-200 hover:border-gray-300';
      }
    });

    // PRD Winning Touch 1: Skeleton Loader during filter transition
    this.simulateLoadingFeed();
  }

  simulateLoadingFeed() {
    const skeleton = document.getElementById('feed-skeleton-loader');
    const container = document.getElementById('feed-list-container');
    const emptyState = document.getElementById('feed-empty-state');

    if (skeleton && container) {
      skeleton.classList.remove('hidden');
      container.classList.add('hidden');
      if (emptyState) emptyState.classList.add('hidden');

      setTimeout(() => {
        skeleton.classList.add('hidden');
        container.classList.remove('hidden');
        this.renderFeed();
        this.renderMapMarkers();
      }, 240);
    } else {
      this.renderFeed();
      this.renderMapMarkers();
    }
  }

  renderFeed() {
    const container = document.getElementById('feed-list-container');
    const countBadge = document.getElementById('feed-count-badge');
    const emptyState = document.getElementById('feed-empty-state');
    if (!container) return;

    const filtered = this.getFilteredIssues();

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} verified report${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = filtered.map(issue => {
      const isUrgent = issue.urgency === 'High';
      const isResolved = issue.status === 'Resolved';

      return `
        <article class="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all p-4 flex flex-col sm:flex-row gap-4 cursor-pointer group" onclick="window.ecoApp.openDetailModal('${issue.id}')">
          <!-- Thumbnail Image -->
          <div class="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img src="${issue.imageUrl}" alt="${issue.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600'">
            ${isUrgent ? `
              <span class="absolute top-2 left-2 bg-alert-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                <span>🚨</span> Urgent
              </span>
            ` : ''}
            ${isResolved ? `
              <span class="absolute top-2 left-2 bg-forest-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                ✓ Resolved
              </span>
            ` : ''}
          </div>

          <!-- Content -->
          <div class="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-[11px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-100">
                  ${issue.category}
                </span>
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md ${isResolved ? 'bg-emerald-50 text-emerald-700' : (issue.status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600')}">
                  ● ${issue.status}
                </span>
              </div>

              <h3 class="text-sm font-bold text-gray-900 group-hover:text-forest-800 transition-colors leading-snug line-clamp-2">
                ${issue.title}
              </h3>

              <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                ${issue.description}
              </p>
            </div>

            <!-- Footer Meta & Upvote Action -->
            <div class="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-[11px] text-gray-500">
              <div class="flex items-center gap-2 truncate">
                <span class="flex items-center gap-1 truncate">📍 ${issue.location}</span>
                <span>•</span>
                <span>${issue.timestamp}</span>
              </div>

              <!-- Upvote / Support CTA -->
              <button class="flex items-center gap-1.5 px-3 py-1 rounded-lg border ${issue.hasUpvoted ? 'bg-forest-50 border-forest-600 text-forest-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 font-semibold'} transition-all" onclick="event.stopPropagation(); window.ecoApp.toggleUpvote('${issue.id}')">
                <i data-lucide="thumbs-up" class="w-3.5 h-3.5 ${issue.hasUpvoted ? 'fill-forest-800' : ''}"></i>
                <span>${issue.upvotes}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  toggleUpvote(issueId) {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) return;

    if (issue.hasUpvoted) {
      issue.upvotes--;
      issue.hasUpvoted = false;
      this.showToast('Upvote removed', 'info');
    } else {
      issue.upvotes++;
      issue.hasUpvoted = true;
      this.user.ecoPoints += 5;
      this.showToast('+5 EcoPoints! Hazard verified and supported', 'success');
      this.triggerConfetti();
    }

    this.renderFeed();
    this.updateUserStatsUI();
    this.saveState();
  }

  resetFilters() {
    this.activeCategory = 'All';
    this.searchQuery = '';
    const searchInput = document.getElementById('global-search-input');
    const mobileSearch = document.getElementById('mobile-search-input');
    if (searchInput) searchInput.value = '';
    if (mobileSearch) mobileSearch.value = '';
    this.setCategoryFilter('All');
  }

  // =========================================================
  // SCREEN 2: Report an Issue Modal Flow
  // =========================================================
  openReportModal() {
    this.resetReportForm();
    const modal = document.getElementById('report-modal');
    const card = document.getElementById('report-modal-card');
    if (modal && card) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        card.classList.remove('scale-95');
      }, 10);
    }
  }

  closeReportModal() {
    const modal = document.getElementById('report-modal');
    const card = document.getElementById('report-modal-card');
    if (modal && card) {
      modal.classList.add('opacity-0');
      card.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }
  }

  resetReportForm() {
    this.tempUploadedImage = null;
    const form = document.getElementById('report-issue-form');
    if (form) form.reset();

    const preview = document.getElementById('dropzone-preview');
    const emptyPrompt = document.getElementById('dropzone-empty');
    const charCounter = document.getElementById('char-counter');

    if (preview) preview.classList.add('hidden');
    if (emptyPrompt) emptyPrompt.classList.remove('hidden');
    if (charCounter) charCounter.textContent = '0 / 500';
  }

  handleImageDrop(file) {
    if (!file || !file.type.startsWith('image/')) {
      this.showToast('Please attach a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.tempUploadedImage = e.target.result;
      const previewImg = document.getElementById('image-preview-element');
      const previewBox = document.getElementById('dropzone-preview');
      const emptyPrompt = document.getElementById('dropzone-empty');

      if (previewImg) previewImg.src = e.target.result;
      if (previewBox) previewBox.classList.remove('hidden');
      if (emptyPrompt) emptyPrompt.classList.add('hidden');
      this.showToast('Evidence photo loaded successfully', 'info');
    };
    reader.readAsDataURL(file);
  }

  useCurrentLocation() {
    const input = document.getElementById('report-location-input');
    // Simulated precise GPS geocoding
    const simulatedLocations = [
      'Willow Creek Greenway, Culvert 4B (37.7749, -122.4194)',
      'Oakridge Park Trailhead (37.7650, -122.4450)',
      'Mission District Greenway (37.7599, -122.4148)',
      'Marina Wharf Pier 3 (37.8050, -122.4350)'
    ];
    const picked = simulatedLocations[Math.floor(Math.random() * simulatedLocations.length)];
    if (input) {
      input.value = picked;
      this.showToast('Current GPS coordinates acquired!', 'success');
    }
  }

  submitReportForm(e) {
    e.preventDefault();

    const title = document.getElementById('report-title-input')?.value.trim();
    const category = document.getElementById('report-category-select')?.value;
    const location = document.getElementById('report-location-input')?.value.trim();
    const desc = document.getElementById('report-desc-textarea')?.value.trim();
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'Medium';

    if (!title || !location || !desc) {
      this.showToast('Please fill all required report fields', 'error');
      return;
    }

    // PRD Section 4 Screen 2: Submit Button Loading State
    const submitBtn = document.getElementById('btn-submit-report');
    const submitText = document.getElementById('btn-submit-text');
    const submitSpinner = document.getElementById('btn-submit-spinner');

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Verifying & Submitting...';
    if (submitSpinner) submitSpinner.classList.remove('hidden');

    // Simulate network delay
    setTimeout(() => {
      // Re-enable button
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Submit Report';
      if (submitSpinner) submitSpinner.classList.add('hidden');

      const newId = String(Math.floor(108 + Math.random() * 800));
      const newIssue = {
        id: newId,
        title,
        category,
        location,
        coordinates: [37.7749 + (Math.random() - 0.5) * 0.05, -122.4194 + (Math.random() - 0.5) * 0.05],
        status: 'Pending',
        urgency,
        upvotes: 1,
        hasUpvoted: true,
        imageUrl: this.tempUploadedImage || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        resolvedImageUrl: null,
        timestamp: 'Just now',
        description: desc,
        reportedBy: this.user.name
      };

      this.issues.unshift(newIssue);
      this.user.issuesReported++;
      this.user.ecoPoints += 50;

      this.closeReportModal();
      this.triggerConfetti();

      // PRD Section 4 Screen 2: Success Toast Notification
      this.showToast('Success! Issue Reported and Dispatched to Municipal Board (+50 EcoPoints)', 'success');

      this.renderFeed();
      this.renderMapMarkers();
      this.renderDashboard();
      this.updateUserStatsUI();
      this.saveState();

      // Fly to the new marker
      if (this.map) {
        this.map.flyTo(newIssue.coordinates, 14, { duration: 1.2 });
      }
    }, 700);
  }

  // =========================================================
  // SCREEN 3: Sustainability Initiatives
  // =========================================================
  renderInitiatives() {
    const grid = document.getElementById('initiatives-grid');
    if (!grid) return;

    grid.innerHTML = this.initiatives.map(init => {
      const percent = Math.min(100, Math.round((init.volunteersRegistered / init.volunteersTarget) * 100));

      return `
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <!-- Banner Image -->
            <div class="relative h-44 w-full bg-gray-100 overflow-hidden">
              <img src="${init.imageUrl}" alt="${init.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'">
              <span class="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-forest-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
                ${init.category}
              </span>
              <span class="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                +${init.ecoPointsReward} PTS
              </span>
            </div>

            <!-- Body -->
            <div class="p-5">
              <h3 class="text-base font-bold text-gray-900 leading-snug">${init.title}</h3>
              <p class="text-xs text-gray-500 mt-1 leading-relaxed">${init.description}</p>

              <!-- Progress Bar (PRD: "45/50 Volunteers Registered") -->
              <div class="mt-4 space-y-1.5">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-gray-700">Participation Goal</span>
                  <span class="text-forest-700">${init.volunteersRegistered} / ${init.volunteersTarget} Volunteers</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-forest-800 rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
                </div>
              </div>

              <!-- Meta -->
              <div class="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                <div>📅 ${init.date}</div>
                <div>📍 ${init.location}</div>
                <div class="text-[11px] text-gray-400">Organized by ${init.organizer}</div>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="p-5 pt-0">
            <button class="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${init.hasJoined ? 'bg-forest-50 border border-forest-300 text-forest-800' : 'bg-forest-800 hover:bg-forest-900 text-white shadow-forest-800/20'}" onclick="window.ecoApp.toggleJoinInitiative('${init.id}')">
              ${init.hasJoined ? '✓ Registered to Volunteer (Leave)' : 'Join Now (+40 PTS)'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleJoinInitiative(initId) {
    const init = this.initiatives.find(i => i.id === initId);
    if (!init) return;

    if (init.hasJoined) {
      init.hasJoined = false;
      init.volunteersRegistered = Math.max(0, init.volunteersRegistered - 1);
      this.user.initiativesJoined = Math.max(0, this.user.initiativesJoined - 1);
      this.showToast(`Withdrew RSVP from ${init.title}`, 'info');
    } else {
      init.hasJoined = true;
      init.volunteersRegistered++;
      this.user.initiativesJoined++;
      this.user.ecoPoints += init.ecoPointsReward;
      this.triggerConfetti();
      this.showToast(`🎉 Joined "${init.title}"! (+${init.ecoPointsReward} EcoPoints)`, 'success');
    }

    this.renderInitiatives();
    this.updateUserStatsUI();
    this.saveState();
  }

  openProposeModal() {
    const modal = document.getElementById('propose-modal');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
  }

  closeProposeModal() {
    const modal = document.getElementById('propose-modal');
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 200);
    }
  }

  submitProposeForm(e) {
    e.preventDefault();
    const title = document.getElementById('prop-title')?.value.trim();
    const category = document.getElementById('prop-cat')?.value;
    const target = parseInt(document.getElementById('prop-target')?.value) || 50;
    const date = document.getElementById('prop-date')?.value.trim();
    const location = document.getElementById('prop-loc')?.value.trim();
    const desc = document.getElementById('prop-desc')?.value.trim();

    if (!title || !location || !desc) {
      this.showToast('Please fill all required initiative fields', 'error');
      return;
    }

    const newInit = {
      id: `INIT-${Math.floor(206 + Math.random() * 800)}`,
      title,
      category,
      description: desc,
      organizer: `${this.user.name} (Lead Volunteer)`,
      location,
      date,
      volunteersRegistered: 1,
      volunteersTarget: target,
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      hasJoined: true,
      ecoPointsReward: 50
    };

    this.initiatives.unshift(newInit);
    this.user.initiativesJoined++;
    this.user.ecoPoints += 60;
    this.closeProposeModal();
    this.triggerConfetti();
    this.showToast('Initiative launched successfully! (+60 EcoPoints)', 'success');

    this.renderInitiatives();
    this.updateUserStatsUI();
    this.saveState();
  }

  // =========================================================
  // SCREEN 4: User Dashboard (Gamification & Tracking)
  // =========================================================
  renderDashboard() {
    const reportedEl = document.getElementById('dash-reported-count');
    const resolvedEl = document.getElementById('dash-resolved-count');
    const pointsEl = document.getElementById('dash-points-count');
    const rankTitleEl = document.getElementById('dash-rank-title');
    const progressFill = document.getElementById('dash-level-progress-fill');
    const progressText = document.getElementById('dash-level-progress-text');
    const badgesRow = document.getElementById('dash-badges-row');
    const tbody = document.getElementById('dash-my-reports-tbody');

    if (reportedEl) reportedEl.textContent = this.user.issuesReported;
    if (resolvedEl) resolvedEl.textContent = this.user.issuesResolved;
    if (pointsEl) pointsEl.textContent = this.user.ecoPoints;
    if (rankTitleEl) rankTitleEl.textContent = this.user.rankTitle;

    const percent = Math.min(100, Math.round((this.user.ecoPoints / this.user.nextLevelPoints) * 100));
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${this.user.ecoPoints} / ${this.user.nextLevelPoints} PTS`;

    // Badges Showcase
    if (badgesRow && this.user.badges) {
      badgesRow.innerHTML = this.user.badges.map(b => `
        <div class="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-2.5 text-center flex flex-col items-center gap-1 ${b.unlocked ? '' : 'opacity-40 grayscale'}">
          <span class="text-xl">${b.unlocked ? '🏅' : '🔒'}</span>
          <span class="text-[11px] font-bold text-white leading-tight">${b.name}</span>
          <span class="text-[9px] text-emerald-200/80">${b.unlocked ? 'Unlocked' : 'Locked'}</span>
        </div>
      `).join('');
    }

    // My Reports Table
    if (tbody) {
      tbody.innerHTML = this.issues.map(issue => `
        <tr class="hover:bg-gray-50/80 transition-colors">
          <td class="p-3.5 font-mono font-bold text-gray-500">#${issue.id}</td>
          <td class="p-3.5">
            <div class="font-bold text-gray-900 line-clamp-1">${issue.title}</div>
            <div class="text-[11px] text-forest-700">${issue.category}</div>
          </td>
          <td class="p-3.5 text-gray-600">${issue.location}</td>
          <td class="p-3.5 text-gray-500">${issue.timestamp}</td>
          <td class="p-3.5 font-semibold text-gray-700">▲ ${issue.upvotes}</td>
          <td class="p-3.5">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : (issue.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700')}">
              ${issue.status}
            </span>
          </td>
          <td class="p-3.5 text-right">
            <button class="text-forest-700 hover:text-forest-900 font-semibold underline" onclick="window.ecoApp.openDetailModal('${issue.id}')">
              View
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  updateUserStatsUI() {
    const pointsBadge = document.getElementById('nav-points-badge');
    if (pointsBadge) {
      pointsBadge.textContent = `${this.user.ecoPoints} EcoPoints`;
    }
    this.renderDashboard();
  }

  // =========================================================
  // Issue Detail Modal (With Interactive Before/After Slider)
  // =========================================================
  openDetailModal(issueId) {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) return;

    this.activeDetailIssue = issue;

    const modal = document.getElementById('detail-modal');
    const card = document.getElementById('detail-modal-card');
    const catBadge = document.getElementById('det-badge-cat');
    const titleEl = document.getElementById('det-title');
    const descEl = document.getElementById('det-desc');
    const locEl = document.getElementById('det-location');
    const timeEl = document.getElementById('det-time');
    const reporterEl = document.getElementById('det-reporter');
    const statusPill = document.getElementById('det-status-pill');
    const upvoteBtnText = document.getElementById('det-upvote-count');
    const mediaContainer = document.getElementById('det-media-container');

    if (catBadge) catBadge.textContent = issue.category;
    if (titleEl) titleEl.textContent = issue.title;
    if (descEl) descEl.textContent = issue.description;
    if (locEl) locEl.textContent = issue.location;
    if (timeEl) timeEl.textContent = issue.timestamp;
    if (reporterEl) reporterEl.textContent = issue.reportedBy;
    if (upvoteBtnText) upvoteBtnText.textContent = `Upvote (${issue.upvotes})`;

    if (statusPill) {
      statusPill.textContent = issue.status;
      statusPill.className = `px-2 py-0.5 rounded-full font-bold text-[11px] ${issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;
    }

    // Media: If Resolved with Before & After, render interactive slider
    if (mediaContainer) {
      if (issue.status === 'Resolved' && issue.resolvedImageUrl) {
        mediaContainer.innerHTML = `
          <div class="before-after-box" id="slider-box">
            <img src="${issue.resolvedImageUrl}" alt="Resolved Remediation (After)">
            <div class="before-img-clip" id="slider-clip" style="width: 50%;">
              <img src="${issue.imageUrl}" alt="Reported Hazard (Before)">
            </div>
            <div class="slider-divider-line" id="slider-line" style="left: 50%;">
              <div class="slider-divider-knob">⇄</div>
            </div>
            <input type="range" min="0" max="100" value="50" class="absolute inset-0 opacity-0 cursor-ew-resize z-30" id="slider-input">
          </div>
          <div class="p-2 bg-gray-50 flex justify-between text-[11px] font-bold text-gray-500">
            <span class="text-orange-600">◀ BEFORE (Incident)</span>
            <span class="text-forest-700">AFTER (Municipal Remediated) ▶</span>
          </div>
        `;

        const input = mediaContainer.querySelector('#slider-input');
        const clip = mediaContainer.querySelector('#slider-clip');
        const line = mediaContainer.querySelector('#slider-line');

        if (input && clip && line) {
          input.addEventListener('input', (e) => {
            const val = e.target.value;
            clip.style.width = `${val}%`;
            line.style.left = `${val}%`;
          });
        }
      } else {
        mediaContainer.innerHTML = `
          <img src="${issue.imageUrl}" class="w-full h-48 object-cover" alt="${issue.title}">
        `;
      }
    }

    if (modal && card) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        card.classList.remove('scale-95');
      }, 10);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    const card = document.getElementById('detail-modal-card');
    if (modal && card) {
      modal.classList.add('opacity-0');
      card.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }
  }

  focusIssueOnMapFromModal() {
    if (!this.activeDetailIssue) return;
    this.closeDetailModal();
    this.switchTab('feed-hub');
    if (this.map) {
      this.map.flyTo(this.activeDetailIssue.coordinates, 15, { duration: 1.2 });
      this.showToast(`Panned map to: ${this.activeDetailIssue.title}`, 'info');
    }
  }

  // =========================================================
  // Tab Routing & Event Bindings
  // =========================================================
  switchTab(tabId) {
    this.activeTab = tabId;

    // Desktop Nav tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.className = 'nav-tab-btn active px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 text-forest-800 bg-white shadow-sm';
      } else {
        btn.className = 'nav-tab-btn px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 text-gray-600 hover:text-gray-900';
      }
    });

    // Mobile Bottom Nav
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.className = 'mobile-nav-btn active flex flex-col items-center text-forest-800';
      } else {
        btn.className = 'mobile-nav-btn flex flex-col items-center text-gray-400 hover:text-gray-600';
      }
    });

    // View Panels
    const panels = {
      'feed-hub': document.getElementById('view-feed-hub'),
      'initiatives': document.getElementById('view-initiatives'),
      'dashboard': document.getElementById('view-dashboard')
    };

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        if (key === tabId) {
          panels[key].classList.remove('hidden');
        } else {
          panels[key].classList.add('hidden');
        }
      }
    });

    // If switching to map, trigger invalidateSize so tiles render correctly
    if (tabId === 'feed-hub' && this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  bindEvents() {
    // Nav Tab clicks
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Mobile report button
    const mobileReportBtn = document.getElementById('btn-mobile-report');
    if (mobileReportBtn) {
      mobileReportBtn.addEventListener('click', () => this.openReportModal());
    }

    // Header Report CTA
    const headerReportBtn = document.getElementById('btn-open-report-modal');
    if (headerReportBtn) {
      headerReportBtn.addEventListener('click', () => this.openReportModal());
    }

    const closeReportBtn = document.getElementById('btn-close-report-modal');
    const cancelReportBtn = document.getElementById('btn-cancel-report');
    if (closeReportBtn) closeReportBtn.addEventListener('click', () => this.closeReportModal());
    if (cancelReportBtn) cancelReportBtn.addEventListener('click', () => this.closeReportModal());

    // Report Form Submit
    const reportForm = document.getElementById('report-issue-form');
    if (reportForm) {
      reportForm.addEventListener('submit', (e) => this.submitReportForm(e));
    }

    // Propose Initiative Modal triggers
    const openPropBtn = document.getElementById('btn-open-propose-modal');
    if (openPropBtn) openPropBtn.addEventListener('click', () => this.openProposeModal());
    const propForm = document.getElementById('propose-form');
    if (propForm) propForm.addEventListener('submit', (e) => this.submitProposeForm(e));

    // Filter Pills
    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => this.setCategoryFilter(btn.dataset.category));
    });

    // Global & Mobile Search Inputs
    const searchInput = document.getElementById('global-search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const onSearch = (e) => {
      this.searchQuery = e.target.value;
      this.simulateLoadingFeed();
    };
    if (searchInput) searchInput.addEventListener('input', onSearch);
    if (mobileSearchInput) mobileSearchInput.addEventListener('input', onSearch);

    // Description Character Counter (PRD Screen 2)
    const descTextarea = document.getElementById('report-desc-textarea');
    const charCounter = document.getElementById('char-counter');
    if (descTextarea && charCounter) {
      descTextarea.addEventListener('input', () => {
        const len = descTextarea.value.length;
        charCounter.textContent = `${len} / 500`;
        if (len >= 480) {
          charCounter.classList.add('text-orange-600', 'font-bold');
        } else {
          charCounter.classList.remove('text-orange-600', 'font-bold');
        }
      });
    }

    // "Use Current Location" button
    const currLocBtn = document.getElementById('btn-use-curr-location');
    if (currLocBtn) {
      currLocBtn.addEventListener('click', () => this.useCurrentLocation());
    }

    // Drag-and-Drop Image Uploader
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('report-file-input');
    const clearImgBtn = document.getElementById('btn-clear-image');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target.closest('#btn-clear-image')) return;
        fileInput.click();
      });
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-forest-600', 'bg-forest-50/50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-forest-600', 'bg-forest-50/50');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-forest-600', 'bg-forest-50/50');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageDrop(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageDrop(e.target.files[0]);
        }
      });
    }

    if (clearImgBtn) {
      clearImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.tempUploadedImage = null;
        const preview = document.getElementById('dropzone-preview');
        const emptyPrompt = document.getElementById('dropzone-empty');
        if (preview) preview.classList.add('hidden');
        if (emptyPrompt) emptyPrompt.classList.remove('hidden');
        if (fileInput) fileInput.value = '';
      });
    }
  }

  renderAll() {
    this.renderFeed();
    this.renderInitiatives();
    this.renderDashboard();
    this.updateUserStatsUI();
  }

  // =========================================================
  // PRD WINNING TOUCH 2: Toast Notifications
  // =========================================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-animate bg-white border border-gray-200 rounded-xl p-3.5 shadow-lg flex items-center gap-3 pointer-events-auto text-xs font-semibold text-gray-800';

    let iconHtml = '<i data-lucide="info" class="w-4 h-4 text-blue-600 flex-shrink-0"></i>';
    if (type === 'success') {
      iconHtml = '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 flex-shrink-0"></i>';
    } else if (type === 'error') {
      iconHtml = '<i data-lucide="alert-triangle" class="w-4 h-4 text-alert-600 flex-shrink-0"></i>';
    }

    toast.innerHTML = `
      ${iconHtml}
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) {
      window.lucide.createIcons();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#166534', '#22c55e', '#ea580c', '#f59e0b', '#10b981']
      });
    }
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new EcoCitizenApp();
  app.init();
});
