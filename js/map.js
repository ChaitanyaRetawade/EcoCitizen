// EcoPulse Interactive Environmental GIS Map Controller

export class EcoMapController {
  constructor(containerId, app) {
    this.containerId = containerId;
    this.app = app;
    this.map = null;
    this.markersGroup = null;
    this.selectionMarker = null;
    this.isPickMode = false;
    this.reports = [];
    this.activeFilter = 'all';
    this.activeStatus = 'all';
  }

  init(reports) {
    this.reports = reports;
    if (this.map) return;

    const mapEl = document.getElementById(this.containerId);
    if (!mapEl) return;

    // Center on default coordinates (San Francisco Eco-Zone)
    this.map = L.map(this.containerId, {
      center: [37.7749, -122.4194],
      zoom: 12.5,
      zoomControl: false
    });

    // Sleek Dark Matter tile layer by CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Zoom controls on top right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);

    // Click handler for location picking
    this.map.on('click', (e) => {
      this.handleMapClick(e.latlng);
    });

    this.renderMarkers();
  }

  renderMarkers() {
    if (!this.markersGroup) return;
    this.markersGroup.clearLayers();

    const filtered = this.reports.filter(r => {
      const catMatch = this.activeFilter === 'all' || r.category === this.activeFilter;
      const statusMatch = this.activeStatus === 'all' || r.status === this.activeStatus;
      return catMatch && statusMatch;
    });

    filtered.forEach(report => {
      const marker = this.createReportMarker(report);
      this.markersGroup.addLayer(marker);
    });
  }

  createReportMarker(report) {
    const isCritical = report.urgency === 'Critical' && report.status !== 'Resolved';
    const categoryColor = this.getCategoryColor(report.category);

    const iconHtml = `
      <div class="custom-eco-marker">
        ${isCritical ? `<div class="marker-pulse-ring" style="background: ${categoryColor};"></div>` : ''}
        <div class="marker-inner" style="background: ${categoryColor}; border-color: ${report.status === 'Resolved' ? '#10b981' : '#ffffff'};">
          ${this.getCategoryIcon(report.category)}
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'eco-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });

    const marker = L.marker([report.lat, report.lng], { icon: customIcon });

    // Sleek Popup Card
    const popupContent = `
      <div class="popup-card">
        <img src="${report.image}" class="popup-img" alt="${report.title}" onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600'">
        <div class="popup-body">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="urgency-badge ${report.urgency}">${report.urgency}</span>
            <span class="status-badge ${report.status.replace(' ', '-')}">${report.status}</span>
          </div>
          <h4 class="popup-title">${report.title}</h4>
          <div class="popup-meta">📍 ${report.locationName}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin: 4px 0;">
            Reported by ${report.reportedBy} • ${report.upvotes} Upvotes
          </div>
          <button class="popup-btn" onclick="window.ecoApp.openReportDetail('${report.id}')">
            Inspect Incident & Evidence
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 300 });

    return marker;
  }

  getCategoryColor(cat) {
    switch (cat) {
      case 'illegal_dumping': return '#f59e0b';
      case 'water_pollution': return '#06b6d4';
      case 'air_pollution': return '#a855f7';
      case 'deforestation': return '#10b981';
      case 'chemical_spill': return '#ef4444';
      case 'wildlife_threat': return '#ec4899';
      default: return '#10b981';
    }
  }

  getCategoryIcon(cat) {
    switch (cat) {
      case 'illegal_dumping': return '🗑️';
      case 'water_pollution': return '💧';
      case 'air_pollution': return '💨';
      case 'deforestation': return '🌲';
      case 'chemical_spill': return '⚠️';
      case 'wildlife_threat': return '🐾';
      default: return '📍';
    }
  }

  flyToLocation(lat, lng, zoom = 15) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }

  enableLocationPickMode(onPicked) {
    this.isPickMode = true;
    this.onLocationPicked = onPicked;
    if (this.app) {
      this.app.showToast('Click anywhere on the map to set incident coordinates', 'info');
    }
    const banner = document.getElementById('map-pick-banner');
    if (banner) banner.style.display = 'flex';
  }

  disableLocationPickMode() {
    this.isPickMode = false;
    const banner = document.getElementById('map-pick-banner');
    if (banner) banner.style.display = 'none';
  }

  handleMapClick(latlng) {
    if (this.isPickMode) {
      if (this.selectionMarker) {
        this.map.removeLayer(this.selectionMarker);
      }

      const pickIcon = L.divIcon({
        html: `
          <div class="custom-eco-marker">
            <div class="marker-pulse-ring" style="background: #34d399;"></div>
            <div class="marker-inner" style="background: #10b981; border-color: #fff; width: 42px; height: 42px;">📍</div>
          </div>`,
        className: 'pick-marker',
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      this.selectionMarker = L.marker(latlng, { icon: pickIcon, draggable: true }).addTo(this.map);
      this.selectionMarker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        if (this.onLocationPicked) {
          this.onLocationPicked(newPos.lat, newPos.lng);
        }
      });

      if (this.onLocationPicked) {
        this.onLocationPicked(latlng.lat, latlng.lng);
      }

      this.disableLocationPickMode();
      this.app.showToast(`Coordinates set: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`, 'success');
    }
  }

  setFilter(category) {
    this.activeFilter = category;
    this.renderMarkers();
  }

  setStatusFilter(status) {
    this.activeStatus = status;
    this.renderMarkers();
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 150);
    }
  }
}
