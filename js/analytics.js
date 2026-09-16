// EcoPulse Telemetry & Community Impact Analytics Controller

export class AnalyticsController {
  constructor(app) {
    this.app = app;
    this.resolutionChart = null;
    this.categoryChart = null;
  }

  init() {
    this.updateMetricsHeader();
    this.renderCharts();
  }

  updateMetricsHeader() {
    const totalReports = this.app.reports.length;
    const resolvedReports = this.app.reports.filter(r => r.status === 'Resolved').length;
    const resolvedRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    let totalTrees = 0;
    let totalWasteKg = 0;

    this.app.initiatives.forEach(item => {
      if (item.unit.includes('Trees')) {
        totalTrees += item.current;
      } else if (item.unit.includes('kg') || item.unit.includes('Tons')) {
        totalWasteKg += item.unit.includes('Tons') ? item.current * 1000 : item.current;
      }
    });

    const valTrees = document.getElementById('ticker-trees-val');
    const valWaste = document.getElementById('ticker-waste-val');
    const valResolved = document.getElementById('ticker-resolved-val');
    const valActive = document.getElementById('ticker-active-val');

    if (valTrees) valTrees.textContent = totalTrees.toLocaleString();
    if (valWaste) valWaste.textContent = `${(totalWasteKg / 1000).toFixed(1)}k kg`;
    if (valResolved) valResolved.textContent = `${resolvedRate}%`;
    if (valActive) valActive.textContent = `${totalReports - resolvedReports} Active`;
  }

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    this.renderResolutionChart();
    this.renderCategoryChart();
  }

  renderResolutionChart() {
    const canvas = document.getElementById('resolutionTrendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (this.resolutionChart) {
      this.resolutionChart.destroy();
    }

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Projected)'];
    const reportedData = [14, 22, 28, 35, this.app.reports.length, this.app.reports.length + 8];
    const resolvedData = [11, 18, 23, 29, this.app.reports.filter(r => r.status === 'Resolved').length, this.app.reports.filter(r => r.status === 'Resolved').length + 7];

    this.resolutionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Reported Hazards',
            data: reportedData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 4
          },
          {
            label: 'Verified Remediations',
            data: resolvedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  renderCategoryChart() {
    const canvas = document.getElementById('categoryBreakdownChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    // Count occurrences by category
    const counts = {
      illegal_dumping: 0,
      water_pollution: 0,
      air_pollution: 0,
      deforestation: 0,
      chemical_spill: 0,
      wildlife_threat: 0
    };

    this.app.reports.forEach(r => {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      }
    });

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Illegal Dumping',
          'Water Contamination',
          'Air & Emissions',
          'Deforestation',
          'Hazardous Chemical',
          'Wildlife Threat'
        ],
        datasets: [{
          data: [
            counts.illegal_dumping,
            counts.water_pollution,
            counts.air_pollution,
            counts.deforestation,
            counts.chemical_spill,
            counts.wildlife_threat
          ],
          backgroundColor: [
            '#f59e0b',
            '#06b6d4',
            '#a855f7',
            '#10b981',
            '#ef4444',
            '#ec4899'
          ],
          borderColor: '#0d1720',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 11 }, boxWidth: 14 }
          }
        }
      }
    });
  }
}
