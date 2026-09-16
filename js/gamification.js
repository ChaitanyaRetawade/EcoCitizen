// EcoPulse Gamification, Eco-Pass & Audio-Visual Celebration Engine

class GamificationEngine {
  constructor() {
    this.audioCtx = null;
  }

  // Initialize Web Audio API on first user interaction
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  // Synthesize custom eco chimes using Web Audio API
  playTone(type = 'success') {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'success') {
        // Melodic ascending chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'points') {
        // Crisp coin/point chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'alert') {
        // Low cautionary tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // Trigger celebration confetti
  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b', '#ffffff']
      });
    }
  }

  // Award points to user and check tier progression
  awardPoints(user, amount, reason, app) {
    const oldTier = this.calculateTier(user.ecoPoints);
    user.ecoPoints += amount;
    const newTier = this.calculateTier(user.ecoPoints);

    this.playTone('points');
    this.triggerConfetti();

    // Check if new badges unlocked
    this.checkBadgeUnlocks(user);

    // If tier leveled up
    if (newTier.level > oldTier.level) {
      this.playTone('success');
      user.rankTitle = newTier.title;
      user.tier = newTier.level;
      if (app && app.showToast) {
        app.showToast(`🎉 Tier Promotion! You are now an ${newTier.title}!`, 'success');
      }
    } else {
      if (app && app.showToast) {
        app.showToast(`+${amount} EcoPoints: ${reason}`, 'points');
      }
    }

    if (app && app.updateUserUI) {
      app.updateUserUI();
    }
    if (app && app.saveState) {
      app.saveState();
    }
  }

  calculateTier(points) {
    if (points >= 600) {
      return { level: 4, title: 'Eco Vanguard', next: 1000, color: '#a855f7' };
    } else if (points >= 300) {
      return { level: 3, title: 'Earth Guardian', next: 600, color: '#34d399' };
    } else if (points >= 100) {
      return { level: 2, title: 'Green Ranger', next: 300, color: '#06b6d4' };
    } else {
      return { level: 1, title: 'Eco Sprout', next: 100, color: '#94a3b8' };
    }
  }

  checkBadgeUnlocks(user) {
    if (!user.badges) return;

    user.badges.forEach(badge => {
      if (!badge.unlocked) {
        if (badge.id === 'first_responder' && user.reportsCount >= 1) {
          badge.unlocked = true;
        } else if (badge.id === 'master_mobilizer' && user.initiativesJoined >= 3) {
          badge.unlocked = true;
        } else if (badge.id === 'solar_advocate' && user.ecoPoints >= 500) {
          badge.unlocked = true;
        }
      }
    });
  }

  renderEcoPass(containerId, user, leaderboard) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tierInfo = this.calculateTier(user.ecoPoints);
    const progressPercent = Math.min(100, Math.round((user.ecoPoints / tierInfo.next) * 100));

    container.innerHTML = `
      <div class="pass-hero-grid">
        <!-- Holographic Eco-Pass Card -->
        <div class="eco-pass-card-visual">
          <div class="pass-card-header">
            <div class="pass-user-info">
              <span class="pass-name">${user.name}</span>
              <span class="pass-handle">${user.handle} • Municipal Citizen ID #7842</span>
            </div>
            <span class="pass-tier-badge">Level ${tierInfo.level} • ${tierInfo.title}</span>
          </div>

          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a7f3d0;">Verified Civic Impact</div>
            <div class="pass-points-huge">${user.ecoPoints.toLocaleString()} <span style="font-size: 1.2rem; font-weight: 600; color: #6ee7b7;">PTS</span></div>
            
            <div class="progress-block" style="margin-top: 0.5rem;">
              <div class="progress-header" style="color: #a7f3d0;">
                <span>Progress to Next Rank</span>
                <span>${user.ecoPoints} / ${tierInfo.next} PTS</span>
              </div>
              <div class="progress-track" style="background: rgba(0,0,0,0.3);">
                <div class="progress-fill" style="width: ${progressPercent}%; background: linear-gradient(90deg, #34d399, #67e8f9);"></div>
              </div>
            </div>
          </div>

          <div class="pass-card-footer">
            <span>Verified Citizen Node</span>
            <span>Offset: ${user.co2OffsetKg} kg CO₂ • Diverted: ${user.wasteDivertedKg} kg</span>
          </div>
        </div>

        <!-- Badges & Accolades -->
        <div class="chart-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.15rem;">Civic Badges & Credentials</h3>
            <span style="font-size: 0.82rem; color: var(--accent-mint); font-weight: 700;">
              ${user.badges.filter(b => b.unlocked).length} of ${user.badges.length} Unlocked
            </span>
          </div>
          <div class="badges-container">
            ${user.badges.map(b => `
              <div class="badge-item ${b.unlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
                <div class="badge-icon-box">
                  ${b.unlocked ? '🏅' : '🔒'}
                </div>
                <span class="badge-name">${b.name}</span>
                <span style="font-size: 0.68rem; color: var(--text-muted);">${b.unlocked ? 'Earned' : 'Locked'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- District Leaderboard & Civic Honor Roll -->
      <div class="leaderboard-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div>
            <h3 style="font-size: 1.3rem;">Regional Eco-Leaderboard</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Citizens leading urban sustainability action and verified hazard reports</p>
          </div>
          <span class="brand-badge">Live Civic Standings</span>
        </div>

        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Citizen</th>
              <th>District</th>
              <th>Rank Title</th>
              <th>Reports Filed</th>
              <th>Initiatives</th>
              <th style="text-align: right;">Total Impact Points</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboard.map(item => `
              <tr class="leaderboard-row rank-${item.rank} ${item.isCurrentUser ? 'current-user' : ''}">
                <td>
                  <span class="rank-badge-num">${item.rank}</span>
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>${item.name}</span>
                    ${item.isCurrentUser ? '<span style="font-size: 0.7rem; background: var(--primary-emerald); color: #071510; padding: 1px 6px; border-radius: 99px; font-weight: 800;">YOU</span>' : ''}
                  </div>
                </td>
                <td style="color: var(--text-secondary);">${item.district}</td>
                <td>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--accent-mint);">${item.badge}</span>
                </td>
                <td>${item.reports}</td>
                <td>${item.initiatives}</td>
                <td style="text-align: right; font-weight: 800; color: var(--text-highlight);">
                  ${item.points.toLocaleString()} PTS
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

export const gamification = new GamificationEngine();
