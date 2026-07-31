// ==================== AUDIO ENGINE ====================
var AudioEngine = {
  ctx: null,
  enabled: true,
  musicGain: null,
  musicPlaying: false,
  musicTimeout: null,

  init: function() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.03;
      this.musicGain.connect(this.ctx.destination);
    } catch (e) {
      this.enabled = false;
    }
  },

  play: function(soundType) {
    if (!this.enabled || !this.ctx || !GameState.current.settings.sfx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    var t = this.ctx.currentTime;

    var sounds = {
      hit: [800, 'sine', 0.15, 0.1],
      miss: [200, 'square', 0.1, 0.2],
      combo: [1200, 'sine', 0.1, 0.15],
      buy: [600, 'triangle', 0.12, 0.3],
      button: [440, 'sine', 0.05, 0.05],
      daily: [660, 'triangle', 0.1, 0.4],
      levelup: [523, 'sine', 0.12, 0.5],
      wrong: [150, 'square', 0.08, 0.25],
      wave: [900, 'sawtooth', 0.08, 0.15],
      grid: [1000, 'sine', 0.1, 0.1],
      perfect: [1400, 'sine', 0.15, 0.2]
    };

    var s = sounds[soundType] || [440, 'sine', 0.1, 0.2];
    var freq = s[0];
    var oscType = s[1];
    var vol = s[2];
    var dur = s[3];

    osc.frequency.value = freq;
    osc.type = oscType;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start();
    osc.stop(t + dur);

    if (soundType === 'levelup') {
      var osc2 = this.ctx.createOscillator();
      var gain2 = this.ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.frequency.value = 784;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.12, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc2.start();
      osc2.stop(t + 0.5);
    }
  },

  startMusic: function() {
    if (!this.enabled || !this.ctx || !GameState.current.settings.music) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.musicPlaying) return;

    this.musicPlaying = true;
    var notes = [262, 330, 392, 523, 392, 330, 262, 294, 349, 440, 349, 294];
    var noteIndex = 0;
    var self = this;

    function playNextNote() {
      if (!self.musicPlaying) return;

      var osc = self.ctx.createOscillator();
      var noteGain = self.ctx.createGain();
      osc.connect(noteGain);
      noteGain.connect(self.musicGain);

      osc.frequency.value = notes[noteIndex % notes.length];
      osc.type = 'sine';
      noteGain.gain.setValueAtTime(0.5, self.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, self.ctx.currentTime + 0.4);

      osc.start();
      osc.stop(self.ctx.currentTime + 0.4);

      noteIndex++;
      self.musicTimeout = setTimeout(playNextNote, 500);
    }

    playNextNote();
  },

  stopMusic: function() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  },

  toggleMusic: function() {
    if (this.musicPlaying) {
      this.stopMusic();
      GameState.current.settings.music = false;
      document.getElementById('musicToggle').classList.add('muted');
      document.getElementById('musicToggle').textContent = '🔇';
    } else {
      GameState.current.settings.music = true;
      document.getElementById('musicToggle').classList.remove('muted');
      document.getElementById('musicToggle').textContent = '🎵';
      this.startMusic();
    }
    GameState.save();
  }
};

// ==================== TOAST SYSTEM ====================
function showToast(msg, dur) {
  dur = dur || 2000;
  var toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, dur);
}

// ==================== SKIN DEFINITIONS ====================
var SKINS = {
  target: [
    { id:'default', name:'Neon Orb', rarity:'Common', costCoins:0, costGems:0, emoji:'🟠' },
    { id:'target-neon', name:'Cryo Sphere', rarity:'Rare', costCoins:300, costGems:0, emoji:'🔵' },
    { id:'target-gold', name:'Golden Trophy', rarity:'Epic', costCoins:0, costGems:3, emoji:'🏆' },
    { id:'target-skull', name:'Skull Blinker', rarity:'Legendary', costCoins:0, costGems:8, emoji:'💀' },
    { id:'target-mythic', name:'Void Walker', rarity:'Mythic', costCoins:0, costGems:15, emoji:'🌌' },
    { id:'target-divine', name:'Celestial Eye', rarity:'Divine', costCoins:0, costGems:30, emoji:'👁️' },
    { id:'target-pixel', name:'Pixel Core', rarity:'Rare', costCoins:350, costGems:0, emoji:'👾' },
    { id:'target-flame', name:'Inferno Ring', rarity:'Epic', costCoins:0, costGems:5, emoji:'🔥' },
    { id:'target-diamond', name:'Diamond Target', rarity:'Legendary', costCoins:0, costGems:12, emoji:'💠' },
    { id:'target-heart', name:'Heart Beat', rarity:'Rare', costCoins:400, costGems:0, emoji:'❤️' },
    { id:'target-star', name:'Star Shard', rarity:'Epic', costCoins:0, costGems:4, emoji:'⭐' },
    { id:'target-moon', name:'Lunar Target', rarity:'Legendary', costCoins:0, costGems:10, emoji:'🌙' }
  ],
  particle: [
    { id:'default', name:'Blaze Burst', rarity:'Common', costCoins:0, costGems:0, emoji:'💥' },
    { id:'particle-firework', name:'Fireworks', rarity:'Rare', costCoins:250, costGems:0, emoji:'🎆' },
    { id:'particle-sparkle', name:'Stardust', rarity:'Epic', costCoins:0, costGems:4, emoji:'✨' },
    { id:'particle-neon', name:'Neon Rain', rarity:'Legendary', costCoins:0, costGems:10, emoji:'🌧️' },
    { id:'particle-mythic', name:'Cosmic Shower', rarity:'Mythic', costCoins:0, costGems:18, emoji:'☄️' },
    { id:'particle-divine', name:'Holy Light', rarity:'Divine', costCoins:0, costGems:35, emoji:'👼' },
    { id:'particle-smoke', name:'Dark Smoke', rarity:'Rare', costCoins:300, costGems:0, emoji:'💨' },
    { id:'particle-bubbles', name:'Bubble Pop', rarity:'Epic', costCoins:0, costGems:6, emoji:'🫧' },
    { id:'particle-hearts', name:'Love Burst', rarity:'Rare', costCoins:350, costGems:0, emoji:'💕' },
    { id:'particle-snow', name:'Snow Flakes', rarity:'Epic', costCoins:0, costGems:5, emoji:'❄️' },
    { id:'particle-lightning', name:'Thunder Bolt', rarity:'Legendary', costCoins:0, costGems:14, emoji:'⚡' },
    { id:'particle-confetti', name:'Confetti', rarity:'Mythic', costCoins:0, costGems:20, emoji:'🎊' }
  ],
  background: [
    { id:'default', name:'Deep Space', rarity:'Common', costCoins:0, costGems:0, emoji:'🌌' },
    { id:'bg-nebula', name:'Purple Nebula', rarity:'Rare', costCoins:400, costGems:0, emoji:'💜' },
    { id:'bg-matrix', name:'Matrix Code', rarity:'Epic', costCoins:0, costGems:5, emoji:'💚' },
    { id:'bg-synthwave', name:'Synthwave', rarity:'Legendary', costCoins:0, costGems:12, emoji:'🌅' },
    { id:'bg-mythic', name:'Wormhole', rarity:'Mythic', costCoins:0, costGems:20, emoji:'🌀' },
    { id:'bg-divine', name:'Heaven', rarity:'Divine', costCoins:0, costGems:40, emoji:'☁️' },
    { id:'bg-ocean', name:'Deep Ocean', rarity:'Rare', costCoins:450, costGems:0, emoji:'🌊' },
    { id:'bg-sunset', name:'Sunset Glow', rarity:'Epic', costCoins:0, costGems:7, emoji:'🌇' },
    { id:'bg-forest', name:'Cyber Forest', rarity:'Rare', costCoins:500, costGems:0, emoji:'🌲' },
    { id:'bg-volcano', name:'Volcano', rarity:'Legendary', costCoins:0, costGems:15, emoji:'🌋' },
    { id:'bg-galaxy', name:'Galaxy Spin', rarity:'Mythic', costCoins:0, costGems:25, emoji:'🌠' },
    { id:'bg-aurora', name:'Aurora', rarity:'Divine', costCoins:0, costGems:45, emoji:'🌈' }
  ],
  cursor: [
    { id:'default', name:'Default Dot', rarity:'Common', costCoins:0, costGems:0, emoji:'🔴' },
    { id:'cursor-neon', name:'Neon Trace', rarity:'Rare', costCoins:200, costGems:0, emoji:'🔵' },
    { id:'cursor-fire', name:'Fire Trail', rarity:'Epic', costCoins:0, costGems:3, emoji:'🔥' },
    { id:'cursor-sparkle', name:'Sparkle Dust', rarity:'Legendary', costCoins:0, costGems:8, emoji:'✨' },
    { id:'cursor-divine', name:'Angel Wings', rarity:'Divine', costCoins:0, costGems:25, emoji:'👼' },
    { id:'cursor-lightning', name:'Lightning', rarity:'Epic', costCoins:0, costGems:6, emoji:'⚡' },
    { id:'cursor-rainbow', name:'Rainbow Dash', rarity:'Legendary', costCoins:0, costGems:10, emoji:'🌈' },
    { id:'cursor-ghost', name:'Ghost Trail', rarity:'Rare', costCoins:300, costGems:0, emoji:'👻' }
  ],
  uiTheme: [
    { id:'default', name:'Hacker Orange', rarity:'Common', costCoins:0, costGems:0, emoji:'🟠' },
    { id:'theme-frost', name:'Arctic Frost', rarity:'Rare', costCoins:300, costGems:0, emoji:'❄️' },
    { id:'theme-inferno', name:'Inferno', rarity:'Epic', costCoins:0, costGems:5, emoji:'🔥' },
    { id:'theme-void', name:'Void', rarity:'Legendary', costCoins:0, costGems:10, emoji:'🖤' },
    { id:'theme-divine', name:'Ascended', rarity:'Divine', costCoins:0, costGems:30, emoji:'👑' },
    { id:'theme-ocean', name:'Ocean Breeze', rarity:'Rare', costCoins:350, costGems:0, emoji:'🌊' },
    { id:'theme-forest', name:'Forest Spirit', rarity:'Epic', costCoins:0, costGems:4, emoji:'🌿' },
    { id:'theme-sunset', name:'Sunset Vibes', rarity:'Legendary', costCoins:0, costGems:12, emoji:'🌅' }
  ],
  trail: [
    { id:'trail-default', name:'None', rarity:'Common', costCoins:0, costGems:0, emoji:'➖' },
    { id:'trail-rainbow', name:'Rainbow Road', rarity:'Rare', costCoins:350, costGems:0, emoji:'🌈' },
    { id:'trail-fire', name:'Blazing Trail', rarity:'Epic', costCoins:0, costGems:5, emoji:'🔥' },
    { id:'trail-void', name:'Void Steps', rarity:'Legendary', costCoins:0, costGems:12, emoji:'🖤' },
    { id:'trail-divine', name:'Holy Path', rarity:'Divine', costCoins:0, costGems:28, emoji:'✨' },
    { id:'trail-thunder', name:'Thunder Clap', rarity:'Epic', costCoins:0, costGems:7, emoji:'⚡' },
    { id:'trail-water', name:'Water Ripple', rarity:'Rare', costCoins:400, costGems:0, emoji:'💧' },
    { id:'trail-wind', name:'Wind Gust', rarity:'Legendary', costCoins:0, costGems:10, emoji:'💨' }
  ],
  explosion: [
    { id:'explosion-default', name:'Classic Pop', rarity:'Common', costCoins:0, costGems:0, emoji:'💥' },
    { id:'explosion-shatter', name:'Glass Shatter', rarity:'Rare', costCoins:400, costGems:0, emoji:'💎' },
    { id:'explosion-vortex', name:'Mini Vortex', rarity:'Epic', costCoins:0, costGems:6, emoji:'🌀' },
    { id:'explosion-nova', name:'Supernova', rarity:'Legendary', costCoins:0, costGems:15, emoji:'🌟' },
    { id:'explosion-divine', name:'Big Bang', rarity:'Divine', costCoins:0, costGems:35, emoji:'💫' },
    { id:'explosion-confetti', name:'Confetti Pop', rarity:'Rare', costCoins:350, costGems:0, emoji:'🎉' },
    { id:'explosion-ice', name:'Ice Shatter', rarity:'Epic', costCoins:0, costGems:5, emoji:'❄️' },
    { id:'explosion-thunder', name:'Thunder Crash', rarity:'Legendary', costCoins:0, costGems:14, emoji:'⚡' }
  ],
  banner: [
    { id:'banner-default', name:'Classic Dark', rarity:'Common', costCoins:0, costGems:0, emoji:'⬛' },
    { id:'banner-neon', name:'Neon Stripes', rarity:'Rare', costCoins:300, costGems:0, emoji:'💚' },
    { id:'banner-gold', name:'Gold Frame', rarity:'Epic', costCoins:0, costGems:4, emoji:'🟨' },
    { id:'banner-legend', name:'Legend Crest', rarity:'Legendary', costCoins:0, costGems:10, emoji:'🛡️' },
    { id:'banner-divine', name:'Divine Aura', rarity:'Divine', costCoins:0, costGems:25, emoji:'👼' },
    { id:'banner-pixel', name:'Pixel Art', rarity:'Rare', costCoins:400, costGems:0, emoji:'👾' },
    { id:'banner-flame', name:'Flame Border', rarity:'Epic', costCoins:0, costGems:5, emoji:'🔥' },
    { id:'banner-ocean', name:'Ocean Wave', rarity:'Legendary', costCoins:0, costGems:12, emoji:'🌊' }
  ],
  title: [
    { id:'title-default', name:'Operator', rarity:'Common', costCoins:0, costGems:0, emoji:'🎖️' },
    { id:'title-swift', name:'The Swift', rarity:'Rare', costCoins:500, costGems:0, emoji:'⚡' },
    { id:'title-precise', name:'Dead Eye', rarity:'Epic', costCoins:0, costGems:5, emoji:'🎯' },
    { id:'title-legend', name:'Legendary Soul', rarity:'Legendary', costCoins:0, costGems:12, emoji:'👑' },
    { id:'title-divine', name:'God of Reflex', rarity:'Divine', costCoins:0, costGems:40, emoji:'🌟' },
    { id:'title-grinder', name:'The Grinder', rarity:'Rare', costCoins:600, costGems:0, emoji:'💪' },
    { id:'title-sniper', name:'Sharpshooter', rarity:'Epic', costCoins:0, costGems:6, emoji:'🔫' },
    { id:'title-phoenix', name:'Phoenix', rarity:'Legendary', costCoins:0, costGems:15, emoji:'🐦‍🔥' },
    { id:'title-titan', name:'Titan', rarity:'Mythic', costCoins:0, costGems:25, emoji:'🗿' },
    { id:'title-angel', name:'Guardian Angel', rarity:'Divine', costCoins:0, costGems:50, emoji:'😇' }
  ]
};

// ==================== ACHIEVEMENTS & CHALLENGES ====================
var ACHIEVEMENTS = [
  { id:'first_blood', name:'First Blood', desc:'Play your first game', icon:'🩸', title:'Novice' },
  { id:'combo_king', name:'Combo King', desc:'Reach combo 20', icon:'👑', title:'Combo Master' },
  { id:'speed_demon', name:'Speed Demon', desc:'Score 200+', icon:'⚡', title:'Swift' },
  { id:'perfect_aim', name:'Perfect Aim', desc:'100% accuracy', icon:'🎯', title:'Deadeye' },
  { id:'collector_10', name:'Collector', desc:'Own 10 skins', icon:'🛍️', title:'Collector' },
  { id:'streak_7', name:'Streak Master', desc:'Login 7 days', icon:'🔥', title:'Dedicated' },
  { id:'level_5', name:'Rising Star', desc:'Reach level 5', icon:'⭐', title:'Promising' },
  { id:'rank_diamond', name:'Diamond Mind', desc:'Reach Diamond', icon:'💎', title:'Elite' },
  { id:'score_500', name:'Half Grand', desc:'Score 500', icon:'🏅', title:'Veteran' },
  { id:'all_modes', name:'Mode Master', desc:'Unlock all modes', icon:'🎮', title:'Explorer' },
  { id:'gauntlet_60', name:'Iron Will', desc:'Survive 60s in Gauntlet', icon:'⚔️', title:'Survivor' },
  { id:'collector_25', name:'Hoarder', desc:'Own 25 skins', icon:'💎', title:'Rich' },
  { id:'combo_50', name:'Combo God', desc:'Reach combo 50', icon:'🔥', title:'Unstoppable' },
  { id:'collector_50', name:'Dragon Hoard', desc:'Own 50 skins', icon:'🐉', title:'Tycoon' },
  { id:'level_25', name:'Quarter Century', desc:'Reach level 25', icon:'📈', title:'Grinder' },
  { id:'perfect_10', name:'Flawless', desc:'10 perfect games', icon:'✨', title:'Perfectionist' },
  { id:'all_skins', name:'Completionist', desc:'Own 75 skins', icon:'🏆', title:'Legend' },
  { id:'level_50', name:'Half Century', desc:'Reach level 50', icon:'🎯', title:'Master' }
];

var CHALLENGE_POOL = [
  { id: 'score_100', desc: 'Score 100', target: 100, type: 'score', reward: { coins: 50, xp: 30 } },
  { id: 'play_3', desc: 'Play 3 games', target: 3, type: 'games', reward: { coins: 40, xp: 20 } },
  { id: 'combo_10', desc: 'Combo 10', target: 10, type: 'maxCombo', reward: { coins: 30, xp: 15 } },
  { id: 'accuracy_80', desc: '80% accuracy', target: 80, type: 'accuracy', reward: { coins: 60, xp: 25 } },
  { id: 'collect_200_coins', desc: 'Earn 200 coins', target: 200, type: 'coinsEarned', reward: { coins: 50, xp: 20 } },
  { id: 'hit_50_targets', desc: 'Hit 50 targets', target: 50, type: 'hits', reward: { coins: 40, xp: 15 } },
  { id: 'perfect_5', desc: 'Get 5 perfects', target: 5, type: 'perfects', reward: { gems: 1, xp: 40 } }
];

// ==================== GAME STATE ====================
var GameState = {
  defaults: {
    coins: 500, gems: 10, xp: 0, level: 1, rank: 'Bronze',
    unlockedModes: ['classic-chase'],
    inventory: {
      equipped: { target: 'default', particle: 'default', background: 'default', cursor: 'default', uiTheme: 'default', trail: 'trail-default', explosion: 'explosion-default', banner: 'banner-default', title: 'title-default' },
      ownedSkins: ['default', 'trail-default', 'explosion-default', 'banner-default', 'title-default']
    },
    stats: { totalGames: 0, totalClicks: 0, totalPlayTime: 0, bestScores: {}, bestAccuracy: 0, bestCombo: 0, gauntletBest: 0 },
    daily: { lastClaimed: null, streak: 0, lastLoginDate: null },
    achievements: [], dailyChallenges: { date: '', list: [], progress: {}, completedList: [] },
    settings: { sfx: true, music: true, vibration: true }
  },
  current: null, lastGameResult: null, currentMode: 'classic-chase',

  init: function() {
    try {
      var saved = localStorage.getItem('reflexEmpire');
      if (saved) {
        this.current = this.mergeDeep(JSON.parse(JSON.stringify(this.defaults)), JSON.parse(saved));
      } else {
        this.current = JSON.parse(JSON.stringify(this.defaults));
      }
    } catch (e) {
      this.current = JSON.parse(JSON.stringify(this.defaults));
    }
    this.ensureProperties();
    this.updateDailyStreak();
    this.generateDailyChallenges();
    this.save();
    this.applyUITheme();
  },

  ensureProperties: function() {
    var c = this.current;
    if (!c || typeof c !== 'object') { this.current = JSON.parse(JSON.stringify(this.defaults)); return; }
    if (!c.inventory || typeof c.inventory !== 'object') { c.inventory = { equipped: {}, ownedSkins: ['default', 'trail-default', 'explosion-default', 'banner-default', 'title-default'] }; }
    if (!c.inventory.equipped || typeof c.inventory.equipped !== 'object') { c.inventory.equipped = { target: 'default', particle: 'default', background: 'default', cursor: 'default', uiTheme: 'default', trail: 'trail-default', explosion: 'explosion-default', banner: 'banner-default', title: 'title-default' }; }
    if (!Array.isArray(c.inventory.ownedSkins)) { c.inventory.ownedSkins = ['default', 'trail-default', 'explosion-default', 'banner-default', 'title-default']; }
    if (!c.stats || typeof c.stats !== 'object') { c.stats = { totalGames: 0, totalClicks: 0, totalPlayTime: 0, bestScores: {}, bestAccuracy: 0, bestCombo: 0, gauntletBest: 0 }; }
    if (!c.stats.bestScores || typeof c.stats.bestScores !== 'object') { c.stats.bestScores = {}; }
    if (c.stats.gauntletBest === undefined) { c.stats.gauntletBest = 0; }
    if (!c.daily || typeof c.daily !== 'object') { c.daily = { lastClaimed: null, streak: 0, lastLoginDate: null }; }
    if (!Array.isArray(c.achievements)) { c.achievements = []; }
    if (!Array.isArray(c.unlockedModes)) { c.unlockedModes = ['classic-chase']; }
    if (!c.dailyChallenges || typeof c.dailyChallenges !== 'object') { c.dailyChallenges = { date: '', list: [], progress: {}, completedList: [] }; }
    if (!Array.isArray(c.dailyChallenges.list)) { c.dailyChallenges.list = []; }
    if (!c.dailyChallenges.progress || typeof c.dailyChallenges.progress !== 'object') { c.dailyChallenges.progress = {}; }
    if (!Array.isArray(c.dailyChallenges.completedList)) { c.dailyChallenges.completedList = []; }
    if (!c.settings || typeof c.settings !== 'object') { c.settings = { sfx: true, music: true, vibration: true }; }
  },

  mergeDeep: function(target, source) {
    var output = Object.assign({}, target);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key]) && key in target) {
          output[key] = this.mergeDeep(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  },

  save: function() { try { localStorage.setItem('reflexEmpire', JSON.stringify(this.current)); } catch (e) {} },
  resetProgress: function() { this.current = JSON.parse(JSON.stringify(this.defaults)); this.save(); this.applyUITheme(); AudioEngine.stopMusic(); AudioEngine.startMusic(); },

  updateDailyStreak: function() {
    var today = new Date().toISOString().split('T')[0];
    var last = this.current.daily.lastLoginDate;
    if (last === today) return;
    if (last === this._yesterday()) this.current.daily.streak++; else this.current.daily.streak = 1;
    this.current.daily.lastLoginDate = today; this.save();
    if (this.current.daily.streak >= 7) this.unlockAchievement('streak_7');
  },
  _yesterday: function() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; },
  xpForLevel: function(level) { return Math.floor(100 * Math.pow(level, 1.3)); },

  addXP: function(amount) { this.current.xp += amount; this.checkLevelUp(); this.save(); },
  checkLevelUp: function() {
    var needed = this.xpForLevel(this.current.level);
    var leveled = false;
    while (this.current.xp >= needed) { this.current.xp -= needed; this.current.level++; leveled = true; this.updateRank(); this.giveLevelUpReward(); needed = this.xpForLevel(this.current.level); }
    if (leveled) AudioEngine.play('levelup');
  },
  giveLevelUpReward: function() { if (this.current.level % 5 === 0) { this.addGems(1); this.addCoins(100); showToast('Level ' + this.current.level + '! +1 💎 +100 🪙'); } },

  updateRank: function() {
    var lvl = this.current.level;
    if (lvl >= 75) this.current.rank = 'Legend'; else if (lvl >= 50) this.current.rank = 'Grandmaster'; else if (lvl >= 35) this.current.rank = 'Master'; else if (lvl >= 25) this.current.rank = 'Diamond'; else if (lvl >= 15) this.current.rank = 'Platinum'; else if (lvl >= 10) this.current.rank = 'Gold'; else if (lvl >= 5) this.current.rank = 'Silver'; else this.current.rank = 'Bronze';
    var unlocks = { 5: ['multi-target-storm', '🌪️ Multi-Target Storm'], 10: ['precision-sniper', '🔫 Precision Sniper'], 15: ['survival-wave', '🌊 Survival Wave'], 20: ['memory-pulse', '🧠 Memory Pulse'], 25: ['grid-rush', '🔲 Grid Rush'], 30: ['boss-duel', '👾 Boss Duel'], 40: ['color-clash', '🎨 Color Clash'], 50: ['reflex-roulette', '🎰 Reflex Roulette'], 60: ['time-warp', '⏳ Time Warp'], 75: ['gauntlet', '⚔️ The Gauntlet'] };
    for (var level in unlocks) {
      if (lvl >= parseInt(level) && !this.current.unlockedModes.includes(unlocks[level][0])) {
        this.current.unlockedModes.push(unlocks[level][0]);
        showToast('New mode: ' + unlocks[level][1] + '!');
      }
    }
    if (lvl >= 5) this.unlockAchievement('level_5');
    if (this.current.rank === 'Diamond') this.unlockAchievement('rank_diamond');
  },

  addCoins: function(a) { this.current.coins += a; this.save(); },
  addGems: function(a) { this.current.gems += a; this.save(); },

unlockAchievement: function(id) {
  if (!this.current.achievements.includes(id)) {
    this.current.achievements.push(id);
    var ach = ACHIEVEMENTS.find(function(a){return a.id===id});
    if (ach) showToast(ach.icon + ' ' + ach.name + '!');
    this.save();
    if (ScreenManager.currentScreen === 'profile') renderProfileScreen();
  }
},

  generateDailyChallenges: function() {
    var today = new Date().toISOString().split('T')[0];
    if (this.current.dailyChallenges.date === today) return;
    var shuffled = CHALLENGE_POOL.slice().sort(function() { return Math.random() - 0.5; });
    this.current.dailyChallenges = { date: today, list: shuffled.slice(0, 3), progress: {}, completedList: [] };
    this.save();
  },

  updateChallengeProgress: function(type, amount) {
    var dc = this.current.dailyChallenges;
    if (dc.date !== new Date().toISOString().split('T')[0]) return;
    dc.list.forEach(function(c) { if (c.type === type) { if (!dc.progress[c.id]) dc.progress[c.id] = 0; dc.progress[c.id] += amount; } });
    dc.list.forEach(function(c) { if (dc.progress[c.id] >= c.target && !dc.completedList.includes(c.id)) { if (c.reward.coins) GameState.addCoins(c.reward.coins); if (c.reward.gems) GameState.addGems(c.reward.gems); if (c.reward.xp) GameState.addXP(c.reward.xp); dc.completedList.push(c.id); showToast('Challenge: ' + c.desc + '!'); } });
    this.save();
  },

  postGameChecks: function(result) {
    if (this.current.stats.totalGames === 1) this.unlockAchievement('first_blood');
    if (result.score >= 200) this.unlockAchievement('speed_demon');
    if (result.maxCombo >= 20) this.unlockAchievement('combo_king');
    if (result.accuracy === 100) this.unlockAchievement('perfect_aim');
    if (result.score >= 500) this.unlockAchievement('score_500');
    if (this.current.inventory.ownedSkins.length >= 10) this.unlockAchievement('collector_10');
    if (this.current.inventory.ownedSkins.length >= 25) this.unlockAchievement('collector_25');
    if (this.current.unlockedModes.length >= 11) this.unlockAchievement('all_modes');
    if (result.survivalTime >= 60) this.unlockAchievement('gauntlet_60');
    this.updateChallengeProgress('score', result.score);
    this.updateChallengeProgress('games', 1);
    this.updateChallengeProgress('maxCombo', result.maxCombo);
    this.updateChallengeProgress('accuracy', result.accuracy);
    this.updateChallengeProgress('hits', result.hits || 0);
    this.updateChallengeProgress('coinsEarned', result.coinsEarned || 0);
  },

  isOwned: function(skinId) { return this.current.inventory.ownedSkins.includes(skinId); },
  canAfford: function(costCoins, costGems) { return this.current.coins >= costCoins && this.current.gems >= costGems; },

  buySkin: function(skinId, costCoins, costGems) {
    if (!this.isOwned(skinId) && this.canAfford(costCoins, costGems)) {
      this.current.coins -= costCoins; this.current.gems -= costGems;
      this.current.inventory.ownedSkins.push(skinId); this.save();
      AudioEngine.play('buy'); return true;
    }
    return false;
  },

  equipSkin: function(category, skinId) {
    if (!this.isOwned(skinId)) return;
    this.current.inventory.equipped[category] = skinId; this.save();
    if (category === 'uiTheme') this.applyUITheme();
  },

  applyUITheme: function() {
    var theme = this.current.inventory.equipped.uiTheme || 'default';
    document.body.classList.remove('theme-frost', 'theme-inferno', 'theme-void', 'theme-divine');
    if (theme !== 'default') document.body.classList.add(theme);
  }
};

// ==================== SCREEN MANAGER ====================
var ScreenManager = {
  currentScreen: 'home',

  init: function() {
    var self = this;
    document.querySelectorAll('.desktop-nav .nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var screenId = e.currentTarget.dataset.screen;
        if (screenId) { self.showScreen(screenId); AudioEngine.play('button'); }
      });
    });
    document.querySelectorAll('.mobile-nav-menu .nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var screenId = e.currentTarget.dataset.screen;
        if (screenId) { self.showScreen(screenId); AudioEngine.play('button'); }
      });
    });
    this.showScreen('home');
  },

  showScreen: function(id) {
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    var screen = document.getElementById('screen-' + id);
    if (!screen) return;
    screen.classList.add('active');
    this.currentScreen = id;
    updateNavActive(id);
    if (id === 'home') renderHomeScreen();
    else if (id === 'modes') renderModesScreen();
    else if (id === 'shop') renderShopScreen();
    else if (id === 'inventory') renderInventoryScreen();
    else if (id === 'profile') renderProfileScreen();
    else if (id === 'settings') renderSettingsScreen();
    else if (id === 'game') startGame();
    else if (id === 'results') renderResultsScreen();
  }
};

function updateNavActive(screenId) {
  document.querySelectorAll('.desktop-nav .nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.screen === screenId) btn.classList.add('active');
  });
  document.querySelectorAll('.mobile-nav-menu .nav-btn').forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.screen === screenId) btn.classList.add('active');
  });
}

// ==================== HOME SCREEN ====================
function renderHomeScreen() {
  var homeEl = document.getElementById('screen-home');
  if (!homeEl) return;
  var s = GameState.current;
  var xpNeeded = GameState.xpForLevel(s.level);
  var xpPercent = Math.min(100, (s.xp / xpNeeded) * 100);
  var dailyClaimed = s.daily.lastClaimed === new Date().toISOString().split('T')[0];

  var chHtml = '';
  if (s.dailyChallenges.list && s.dailyChallenges.list.length > 0) {
    chHtml = s.dailyChallenges.list.map(function(c) {
      var p = (s.dailyChallenges.progress && s.dailyChallenges.progress[c.id]) || 0;
      var done = (s.dailyChallenges.completedList || []).includes(c.id);
      return '<div class="daily-challenge-item ' + (done ? 'completed' : '') + '"><div class="challenge-check ' + (done ? 'done' : '') + '">' + (done ? '✓' : '') + '</div><span>' + c.desc + '</span><span class="challenge-progress">' + Math.min(p, c.target) + '/' + c.target + '</span></div>';
    }).join('');
  }

  homeEl.innerHTML = '<div class="home-container"><div class="rank-card"><div class="rank-title">RANK</div><div class="rank-name">' + s.rank + ' (Level ' + s.level + ')</div><div class="currency-row"><span class="currency-item"><span class="coin-icon">🪙</span> ' + s.coins + '</span><span class="currency-item"><span class="gem-icon">💎</span> ' + s.gems + '</span></div><div class="xp-container"><div class="xp-text">XP ' + s.xp + '/' + xpNeeded + '</div><div class="xp-bar"><div class="xp-fill" style="width:' + xpPercent + '%"></div></div></div></div><div class="daily-section"><button class="daily-btn" id="claimDailyBtn" ' + (dailyClaimed ? 'disabled' : '') + '>' + (dailyClaimed ? 'Claimed Today' : '🎁 Daily Reward') + '</button><div class="streak-info"><div class="streak-count">🔥 ' + s.daily.streak + '</div><div class="streak-label">Day Streak</div></div></div>' + (chHtml ? '<div class="daily-challenges"><strong style="color:var(--accent-orange);">Daily Challenges</strong>' + chHtml + '</div>' : '') + '<div class="quick-actions"><button class="action-btn" data-screen="modes"><span class="icon">🎮</span>Modes</button><button class="action-btn" data-screen="shop"><span class="icon">🛒</span>Shop</button><button class="action-btn" data-screen="inventory"><span class="icon">🎒</span>Loadout</button><button class="action-btn" data-screen="profile"><span class="icon">👤</span>Profile</button><button class="action-btn" data-screen="settings"><span class="icon">⚙️</span>Settings</button><button class="action-btn" id="quickPlayBtn"><span class="icon">⚡</span>Quick Play</button></div></div>';

  document.querySelectorAll('#screen-home .action-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      ScreenManager.showScreen(e.currentTarget.dataset.screen);
      AudioEngine.play('button');
    });
  });

  document.getElementById('claimDailyBtn')?.addEventListener('click', function() {
    var today = new Date().toISOString().split('T')[0];
    if (GameState.current.daily.lastClaimed === today) return;
    var coins = 100 + GameState.current.daily.streak * 20;
    var gems = 0;
    if (GameState.current.daily.streak >= 7) gems = 1;
    if (acc === 100) { GameState.current.stats.perfectGames = (GameState.current.stats.perfectGames || 0) + 1; }
    GameState.addCoins(coins);
    if (gems) GameState.addGems(gems);
    GameState.current.daily.lastClaimed = today;
    GameState.save();
    AudioEngine.play('daily');
    showToast('Daily: +' + coins + ' 🪙' + (gems ? ' +' + gems + ' 💎' : ''));
    renderHomeScreen();
  });

  document.getElementById('quickPlayBtn')?.addEventListener('click', function() {
    ScreenManager.showScreen('modes');
    AudioEngine.play('button');
  });
}

// ==================== MODES SCREEN ====================
var modesData = [
  { id: 'classic-chase', name: 'Classic Chase', desc: 'Speed = points!', icon: '🎯', unlockLevel: 1 },
  { id: 'multi-target-storm', name: 'Multi-Target Storm', desc: 'Gold, normal & danger!', icon: '🌪️', unlockLevel: 5 },
  { id: 'precision-sniper', name: 'Precision Sniper', desc: 'Shrinking center!', icon: '🔫', unlockLevel: 10 },
  { id: 'survival-wave', name: 'Survival Wave', desc: 'Endless waves!', icon: '🌊', unlockLevel: 15 },
  { id: 'memory-pulse', name: 'Memory Pulse', desc: 'Remember sequence!', icon: '🧠', unlockLevel: 20 },
  { id: 'grid-rush', name: 'Grid Rush', desc: 'Tap lit cells!', icon: '🔲', unlockLevel: 25 },
  { id: 'boss-duel', name: 'Boss Duel', desc: 'Fight the boss!', icon: '👾', unlockLevel: 30 },
  { id: 'color-clash', name: 'Color Clash', desc: 'Stroop test!', icon: '🎨', unlockLevel: 40 },
  { id: 'reflex-roulette', name: 'Reflex Roulette', desc: 'Moving patterns!', icon: '🎰', unlockLevel: 50 },
  { id: 'time-warp', name: 'Time Warp', desc: 'Combo slows time!', icon: '⏳', unlockLevel: 60 },
  { id: 'gauntlet', name: 'The Gauntlet', desc: 'Endless mode mix!', icon: '⚔️', unlockLevel: 75 }
];

function renderModesScreen() {
  var container = document.getElementById('screen-modes');
  if (!container) return;
  var unlocked = GameState.current.unlockedModes || ['classic-chase'];
  container.innerHTML = '<h2 style="color:var(--accent-orange);">Select Simulation</h2><div class="modes-grid">' + modesData.map(function(m) {
    var isUnlocked = Array.isArray(unlocked) && unlocked.includes(m.id);
    return '<div class="mode-card ' + (!isUnlocked ? 'locked' : '') + '" data-mode="' + m.id + '"><div class="mode-icon">' + m.icon + '</div><div class="mode-name">' + m.name + '</div><div class="mode-desc">' + m.desc + '</div>' + (!isUnlocked ? '<div class="lock-badge">🔒 Lvl ' + m.unlockLevel + '</div>' : '') + '</div>';
  }).join('') + '</div>';

  container.querySelectorAll('.mode-card:not(.locked)').forEach(function(card) {
    card.addEventListener('click', function() {
      GameState.currentMode = card.dataset.mode;
      ScreenManager.showScreen('game');
      AudioEngine.play('button');
    });
  });
}

// ==================== SHOP & INVENTORY ====================
var shopCategory = 'target';

function renderShopScreen() {
  var container = document.getElementById('screen-shop');
  if (!container) return;
  var cats = Object.keys(SKINS);
  container.innerHTML = '<h2 style="color:var(--accent-orange);">🛒 Shop</h2><div class="shop-categories">' + cats.map(function(c) {
    return '<button class="category-btn ' + (c === shopCategory ? 'active' : '') + '" data-cat="' + c + '">' + c.charAt(0).toUpperCase() + c.slice(1) + '</button>';
  }).join('') + '</div><div class="shop-grid" id="shopGrid"></div>';

  container.querySelectorAll('.category-btn').forEach(function(b) {
    b.addEventListener('click', function() { shopCategory = b.dataset.cat; renderShopScreen(); AudioEngine.play('button'); });
  });
  renderShopGrid();
}

function renderShopGrid() {
  var grid = document.getElementById('shopGrid'); if (!grid) return;
  var skins = SKINS[shopCategory] || [];
  grid.innerHTML = skins.map(function(s){
    var owned = GameState.isOwned(s.id), canBuy = !owned && GameState.canAfford(s.costCoins, s.costGems);
    var emoji = s.emoji || '🎨';
    return '<div class="shop-item ' + (s.rarity === 'Divine' ? 'divine' : '') + '">' +
      '<div class="item-preview skin-' + s.id + '">' + emoji + '</div>' +
      '<div class="item-name">' + s.name + '</div>' +
      '<div class="rarity ' + s.rarity + '">' + s.rarity + '</div>' +
      (owned ? '<span style="color:#00ff88;font-weight:bold;">✓ Owned</span>' :
      '<div style="font-size:13px;">' + (s.costCoins > 0 ? '🪙' + s.costCoins : '') + ' ' + (s.costGems > 0 ? '💎' + s.costGems : 'FREE') + '</div>' +
      '<button class="buy-btn" data-skin="' + s.id + '" ' + (!canBuy ? 'disabled' : '') + '>Buy</button>') +
      '</div>';
  }).join('');
  grid.querySelectorAll('.buy-btn').forEach(function(b){
    b.addEventListener('click', function(){
      var sid = b.dataset.skin;
      var s = skins.find(function(x){return x.id===sid});
      if (s && GameState.buySkin(sid, s.costCoins, s.costGems)) {
        showToast(s.name + ' purchased!'); renderShopScreen(); renderHomeScreen();
      }
    });
  });
}

function renderInventoryScreen() {
  var container = document.getElementById('screen-inventory');
  if (!container) return;
  var cats = Object.keys(SKINS);
  container.innerHTML = '<h2 style="color:var(--accent-orange);">🎒 Loadout</h2>';
  cats.forEach(function(cat) {
    var eq = GameState.current.inventory.equipped[cat] || 'default';
    var owned = SKINS[cat].filter(function(s) { return GameState.isOwned(s.id); });
    container.innerHTML += '<div class="inventory-section"><h3>' + cat.toUpperCase() + '</h3><div class="inventory-grid" data-cat="' + cat + '">' + owned.map(function(s) {
      return '<div class="inventory-item ' + (eq === s.id ? 'equipped' : '') + '" data-skin="' + s.id + '"><div class="item-preview skin-' + s.id + '" style="width:50px;height:50px;border-radius:10px;"></div></div>';
    }).join('') + '</div></div>';
  });
  container.querySelectorAll('.inventory-item').forEach(function(i) {
    i.addEventListener('click', function() { GameState.equipSkin(i.parentElement.dataset.cat, i.dataset.skin); showToast('Equipped!'); renderInventoryScreen(); AudioEngine.play('button'); });
  });
}

// ==================== GAME ENGINE ====================
var gameInterval = null;
var gameState = { timeLeft: 20, score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, paused: false, arenaRect: null };

function startGame() {
  var el = document.getElementById('screen-game');
  if (!el) return;
  clearInterval(gameInterval);
  document.removeEventListener('mousemove', trailHandler);
  el.innerHTML = '';
  gameState = { timeLeft: 20, score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, paused: false, arenaRect: null };
  var mode = GameState.currentMode;
  if (mode === 'grid-rush') startGridRush(el);
  else if (mode === 'color-clash') startColorClash(el);
  else if (mode === 'reflex-roulette') startRoulette(el);
  else if (mode === 'time-warp') startTimeWarp(el);
  else if (mode === 'gauntlet') startGauntlet(el);
  else startClassicChase(el);
}

function startClassicChase(el) {
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">⏱️<span id="td">' + gameState.timeLeft + '</span></div><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">🔥<span id="cd">x1</span></div><div class="hud-item">%<span id="ad">0%</span></div></div><div class="target" id="target"></div></div>';
  var arena = document.getElementById('gameArena');
  var target = document.getElementById('target');
  applySkins(arena);
  gameState.arenaRect = arena.getBoundingClientRect();
  window.addEventListener('resize', function() { var a = document.getElementById('gameArena'); if (a) gameState.arenaRect = a.getBoundingClientRect(); });
  moveTarget();
  target.addEventListener('pointerdown', hitHandler);
  arena.addEventListener('pointerdown', missHandler);
  gameInterval = setInterval(function() { gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  if (GameState.current.inventory.equipped.cursor !== 'default') document.addEventListener('mousemove', trailHandler);
}

function moveTarget() { var t = document.getElementById('target'); if (!t || !gameState.arenaRect) return; t.style.left = Math.random() * (gameState.arenaRect.width - 60) + 'px'; t.style.top = Math.random() * (gameState.arenaRect.height - 60) + 'px'; }

function hitHandler(e) {
  e.stopPropagation();
  if (gameState.paused || !e.target.closest('#target')) return;
  gameState.hits++; gameState.combo++;
  if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
  gameState.score += 10 + gameState.combo * 2; updateHUD();
  var t = document.getElementById('target'); t.classList.add('clicked');
  setTimeout(function() { t.classList.remove('clicked'); }, 300);
  var r = t.getBoundingClientRect();
  spawnParticles(r.left - gameState.arenaRect.left + 30, r.top - gameState.arenaRect.top + 30);
  moveTarget(); AudioEngine.play('hit');
  if (gameState.combo > 1) AudioEngine.play('combo');
}

function missHandler(e) {
  if (gameState.paused || e.target.closest('#target')) return;
  gameState.misses++; gameState.combo = 0; updateHUD();
  spawnParticles(e.clientX - gameState.arenaRect.left, e.clientY - gameState.arenaRect.top);
  AudioEngine.play('miss');
}

function updateHUD() {
  document.getElementById('sd').textContent = gameState.score;
  document.getElementById('cd').textContent = 'x' + (gameState.combo || 1);
  var acc = gameState.hits + gameState.misses > 0 ? Math.round((gameState.hits / (gameState.hits + gameState.misses)) * 100) : 0;
  document.getElementById('ad').textContent = acc + '%';
}

// Grid Rush
function startGridRush(el) {
  var size = 4; gameState.gridRound = 1;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">🔄<span id="rd">1</span></div></div><div class="grid-container" id="grid" style="grid-template-columns:repeat(' + size + ',70px);"></div></div>';
  var grid = document.getElementById('grid'), arena = document.getElementById('gameArena');
  gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  for (var i = 0; i < size * size; i++) { var cell = document.createElement('div'); cell.className = 'grid-cell'; cell.dataset.idx = i; grid.appendChild(cell); }
  genGridSequence();
}

function genGridSequence() { gameState.gridSequence = Array.from({length: gameState.gridRound + 2}, function() { return Math.floor(Math.random() * 16); }); gameState.gridIndex = 0; showGridSequence(); }

function showGridSequence() {
  var cells = document.querySelectorAll('.grid-cell'); cells.forEach(function(c) { c.classList.remove('active', 'wrong'); });
  var i = 0;
  var iv = setInterval(function() { if (i >= gameState.gridSequence.length) { clearInterval(iv); startGridInput(); return; } cells[gameState.gridSequence[i]].classList.add('active'); AudioEngine.play('grid'); setTimeout(function() { cells[gameState.gridSequence[i]].classList.remove('active'); }, 300); i++; }, 500);
}

function startGridInput() { document.querySelectorAll('.grid-cell').forEach(function(c) { c.addEventListener('pointerdown', gridClickHandler); }); }

function gridClickHandler(e) {
  var cell = e.currentTarget, idx = parseInt(cell.dataset.idx);
  if (idx === gameState.gridSequence[gameState.gridIndex]) { cell.classList.add('active'); gameState.gridIndex++; gameState.score += 10; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit');
    if (gameState.gridIndex >= gameState.gridSequence.length) { gameState.gridRound++; document.getElementById('rd').textContent = gameState.gridRound; document.querySelectorAll('.grid-cell').forEach(function(c) { c.removeEventListener('pointerdown', gridClickHandler); }); setTimeout(genGridSequence, 500); }
  } else { cell.classList.add('wrong'); AudioEngine.play('miss'); gameState.misses++; setTimeout(function() { endGame(); }, 500); }
}

// Color Clash
function startColorClash(el) {
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">⏱️<span id="td">30</span></div></div><div class="color-word" id="cw">RED</div><div class="color-target-row" id="ctr"></div></div>';
  gameState.timeLeft = 30; var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  gameInterval = setInterval(function() { gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  nextColorRound();
}

var colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

function nextColorRound() {
  var word = colors[Math.floor(Math.random() * colors.length)], color = colors[Math.floor(Math.random() * colors.length)];
  document.getElementById('cw').textContent = word; document.getElementById('cw').style.color = color.toLowerCase();
  var ctr = document.getElementById('ctr'); ctr.innerHTML = '';
  var shuffled = colors.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 4);
  shuffled.forEach(function(c) { var d = document.createElement('div'); d.className = 'color-target'; d.style.background = c.toLowerCase(); d.dataset.color = c; d.addEventListener('pointerdown', colorHitHandler); ctr.appendChild(d); });
  gameState.correctColor = color;
}

function colorHitHandler(e) { e.stopPropagation(); if (e.currentTarget.dataset.color === gameState.correctColor) { gameState.score += 25; gameState.hits++; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); nextColorRound(); } else { gameState.misses++; e.currentTarget.classList.add('wrong'); AudioEngine.play('wrong'); setTimeout(nextColorRound, 400); } }

// Reflex Roulette
function startRoulette(el) {
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">❤️<span id="ld">3</span></div><div class="hud-item">🔥<span id="cd">x1</span></div></div><div class="target" id="target" style="width:50px;height:50px;"></div></div>';
  gameState.lives = 3; gameState.targetSize = 50; var arena = document.getElementById('gameArena'), target = document.getElementById('target');
  gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena); gameState.angle = 0; gameState.speed = 2;
  target.addEventListener('pointerdown', rouletteHit); rouletteLoop();
}

function rouletteLoop() { if (gameState.paused) return; var target = document.getElementById('target'), cx = gameState.arenaRect.width / 2, cy = gameState.arenaRect.height / 2, r = Math.min(cx, cy) * 0.6; gameState.angle += gameState.speed * 0.02; var x = cx + Math.cos(gameState.angle) * r - gameState.targetSize / 2, y = cy + Math.sin(gameState.angle * 0.7) * r - gameState.targetSize / 2; target.style.left = x + 'px'; target.style.top = y + 'px'; requestAnimationFrame(rouletteLoop); }
function rouletteHit(e) { e.stopPropagation(); gameState.score += 30; gameState.combo++; gameState.targetSize = Math.max(15, gameState.targetSize - 3); document.getElementById('target').style.width = gameState.targetSize + 'px'; document.getElementById('target').style.height = gameState.targetSize + 'px'; document.getElementById('sd').textContent = gameState.score; document.getElementById('cd').textContent = 'x' + gameState.combo; AudioEngine.play('hit'); }

// Time Warp
function startTimeWarp(el) { gameState.timeLeft = 30; startClassicChase(el); clearInterval(gameInterval); gameInterval = setInterval(function() { if (gameState.paused) return; var speed = gameState.combo >= 5 ? 500 : 1000; gameState.timeLeft -= speed / 1000; document.getElementById('td').textContent = Math.ceil(gameState.timeLeft); if (gameState.timeLeft <= 0) endGame(); }, 200); }

// Gauntlet
function startGauntlet(el) {
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">⏱️<span id="td">0</span></div><div class="hud-item">❤️<span id="ld">3</span></div></div><div class="gauntlet-indicator" id="gi">CLASSIC CHASE</div><div class="target" id="target"></div></div>';
  gameState.lives = 3; gameState.survivalTime = 0; gameState.gauntletTimer = 0; var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  document.getElementById('target').addEventListener('pointerdown', gauntletHit);
  arena.addEventListener('pointerdown', function(e) { if (!e.target.closest('#target')) { gameState.lives--; document.getElementById('ld').textContent = gameState.lives; AudioEngine.play('miss'); if (gameState.lives <= 0) endGame(); } });
  gauntletLoop();
}

function gauntletLoop() { if (gameState.paused) return; gameState.survivalTime++; document.getElementById('td').textContent = gameState.survivalTime; gameState.gauntletTimer++; if (gameState.gauntletTimer >= 30) { gameState.gauntletTimer = 0; var modes = ['classic', 'multi', 'precision', 'grid', 'color']; gameState.gauntletMode = modes[Math.floor(Math.random() * modes.length)]; document.getElementById('gi').textContent = gameState.gauntletMode.toUpperCase(); AudioEngine.play('wave'); } moveTarget(); setTimeout(gauntletLoop, 1000); }
function gauntletHit(e) { e.stopPropagation(); gameState.score += 20; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); moveTarget(); }

// Shared
function trailHandler(e) { var arena = document.getElementById('gameArena'); if (!arena || gameState.paused) return; var rect = arena.getBoundingClientRect(), dot = document.createElement('div'); dot.className = 'cursor-trail'; dot.style.left = (e.clientX - rect.left) + 'px'; dot.style.top = (e.clientY - rect.top) + 'px'; dot.style.width = '8px'; dot.style.height = '8px'; dot.style.background = { 'cursor-neon': '#3b82f6', 'cursor-fire': '#ff8c00', 'cursor-sparkle': '#ffffff' }[GameState.current.inventory.equipped.cursor] || '#ff8c00'; arena.appendChild(dot); setTimeout(function() { dot.remove(); }, 400); }
function spawnParticles(x, y) { var arena = document.getElementById('gameArena'); if (!arena) return; var colorsMap = {
  'particle-firework': ['#ff3366','#fbbf24','#fff','#00ff88'],
  'particle-sparkle': ['#fff','#e0e7ff','#3b82f6','#93c5fd'],
  'particle-neon': ['#00ff88','#ff8c00','#3b82f6','#ff3366'],
  'particle-mythic': ['#ff8c00','#ff3366','#fbbf24','#fff'],
  'particle-divine': ['#ffd700','#ffffff','#ffd700','#fff8dc'],
  'particle-smoke': ['#555','#777','#999','#444'],
  'particle-bubbles': ['#ffffff','#3b82f6','#93c5fd','#fff']
}; var colors = colorsMap[GameState.current.inventory.equipped.particle] || ['#ff8c00', '#ffaa00', '#00ff88', '#fff']; for (var i = 0; i < 10; i++) { var p = document.createElement('div'); p.className = 'particle'; p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + (Math.random() * 6 + 3) + 'px;height:' + (Math.random() * 6 + 3) + 'px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';--tx:' + (Math.cos(Math.random() * Math.PI * 2) * 35 + 20) + 'px;--ty:' + (Math.sin(Math.random() * Math.PI * 2) * 35 + 20) + 'px;'; arena.appendChild(p); setTimeout(function() { p.remove(); }, 600); } }
function applySkins(arena) { var eq = GameState.current.inventory.equipped, t = document.getElementById('target'); if (t) { t.className = 'target'; if (eq.target !== 'default') t.classList.add(eq.target); } arena.style.background = { 'bg-nebula': 'linear-gradient(135deg,#1a0a2e,#0a0a1a)', 'bg-matrix': '#0a0f0a', 'bg-synthwave': 'linear-gradient(180deg,#1a0a2e,#0a0a1a)', 'bg-mythic': 'radial-gradient(circle,#2a1a3e,#0a0a1a)' }[eq.background] || 'radial-gradient(circle at center,#0f1923 0%,#0a0a0f 80%)'; }

function endGame() {
  clearInterval(gameInterval); document.removeEventListener('mousemove', trailHandler); gameState.paused = true;
  var mk = GameState.currentMode, prev = GameState.current.stats.bestScores[mk] || 0, isNew = gameState.score > prev;
  if (isNew) GameState.current.stats.bestScores[mk] = gameState.score;
  if (mk === 'gauntlet' && gameState.survivalTime > GameState.current.stats.gauntletBest) GameState.current.stats.gauntletBest = gameState.survivalTime;
  var acc = gameState.hits + gameState.misses > 0 ? Math.round((gameState.hits / (gameState.hits + gameState.misses)) * 100) : 0;
  var coins = Math.floor(gameState.score / 5) + gameState.maxCombo * 2, xp = Math.floor(gameState.score / 2);
  GameState.current.stats.totalGames++; GameState.current.stats.totalClicks += gameState.hits; GameState.current.stats.totalPlayTime += 20;
  if (acc > GameState.current.stats.bestAccuracy) GameState.current.stats.bestAccuracy = acc;
  if (gameState.maxCombo > GameState.current.stats.bestCombo) GameState.current.stats.bestCombo = gameState.maxCombo;
  GameState.addCoins(coins); GameState.addXP(xp);
  GameState.postGameChecks({ score: gameState.score, accuracy: acc, maxCombo: gameState.maxCombo, hits: gameState.hits, coinsEarned: coins, xpEarned: xp, survivalTime: gameState.survivalTime || 0 });
  GameState.lastGameResult = { score: gameState.score, accuracy: acc, maxCombo: gameState.maxCombo, coinsEarned: coins, xpEarned: xp, isNewRecord: isNew, survivalTime: gameState.survivalTime || 0 };
  ScreenManager.showScreen('results');
}

// ==================== RESULTS/PROFILE/SETTINGS ====================
function renderResultsScreen() { var c = document.getElementById('screen-results'); if (!c) return; var r = GameState.lastGameResult; if (!r) { c.innerHTML = '<p>No results</p>'; return; } c.innerHTML = '<div class="results-overlay"><div class="results-title">🏆 Complete</div><div class="stat-block"><span>Score</span><span class="stat-value">' + r.score + '</span></div><div class="stat-block"><span>Accuracy</span><span class="stat-value">' + r.accuracy + '%</span></div><div class="stat-block"><span>Max Combo</span><span class="stat-value">' + r.maxCombo + 'x</span></div>' + (r.survivalTime ? '<div class="stat-block"><span>Survival</span><span class="stat-value">' + r.survivalTime + 's</span></div>' : '') + '<div class="stat-block"><span>🪙 Coins</span><span class="stat-value">+' + r.coinsEarned + '</span></div><div class="stat-block"><span>⭐ XP</span><span class="stat-value">+' + r.xpEarned + '</span></div>' + (r.isNewRecord ? '<div class="new-record">🏅 NEW RECORD!</div>' : '') + '<div class="results-btns"><button class="btn-primary" id="pa">🔄 Again</button><button class="btn-secondary" id="bm">↩ Modes</button></div></div>'; document.getElementById('pa').addEventListener('click', function() { ScreenManager.showScreen('game'); AudioEngine.play('button'); }); document.getElementById('bm').addEventListener('click', function() { ScreenManager.showScreen('modes'); AudioEngine.play('button'); }); }

function renderProfileScreen() {
  var c = document.getElementById('screen-profile'); if (!c) return;
  var s = GameState.current;
  var rankEmoji = { 'Bronze':'🥉', 'Silver':'🥈', 'Gold':'🥇', 'Platinum':'🔷', 'Diamond':'💎', 'Master':'👑', 'Grandmaster':'🌟', 'Legend':'⚡' }[s.rank] || '🎖️';
  var titleId = s.inventory.equipped.title || 'title-default';
  var titleObj = SKINS.title.find(function(t){return t.id===titleId});
  var titleName = titleObj ? titleObj.name : 'Operator';
  c.innerHTML = '<h2 style="color:var(--accent-orange);">👤 Profile</h2>' +
    '<div class="profile-section"><h3>Rank</h3><div class="stat-row"><span>Rank</span><span>' + rankEmoji + ' ' + s.rank + '</span></div><div class="stat-row"><span>Level</span><span>' + s.level + '</span></div><div class="stat-row"><span>XP</span><span>' + s.xp + '/' + GameState.xpForLevel(s.level) + '</span></div><div class="xp-bar"><div class="xp-fill" style="width:' + Math.min(100, (s.xp/GameState.xpForLevel(s.level))*100) + '%"></div></div></div>' +
    '<div class="profile-section"><h3>Identity</h3><div class="stat-row"><span>Title</span><span>' + titleName + '</span></div></div>' +
    '<div class="profile-section"><h3>Stats</h3><div class="stat-row"><span>Games</span><span>' + s.stats.totalGames + '</span></div><div class="stat-row"><span>Best Accuracy</span><span>' + s.stats.bestAccuracy + '%</span></div><div class="stat-row"><span>Best Combo</span><span>' + s.stats.bestCombo + 'x</span></div>' + (s.stats.gauntletBest>0 ? '<div class="stat-row"><span>Gauntlet Best</span><span>' + s.stats.gauntletBest + 's</span></div>' : '') + '<div class="stat-row"><span>Perfect Games</span><span>' + (s.stats.perfectGames||0) + '</span></div></div>' +
    '<div class="profile-section"><h3>Achievements (' + s.achievements.length + '/' + ACHIEVEMENTS.length + ')</h3><div class="achievement-grid">' + ACHIEVEMENTS.map(function(a){return '<div class="achievement-item ' + (s.achievements.includes(a.id)?'earned':'locked') + '"><div class="achievement-icon">' + a.icon + '</div><div class="achievement-name">' + a.name + '</div>' + (s.achievements.includes(a.id)?'<div class="achievement-title">' + a.title + '</div>':'<div class="achievement-title">🔒</div>') + '</div>';}).join('') + '</div></div>';
}

function renderSettingsScreen() {
  var c = document.getElementById('screen-settings'); if (!c) return; var s = GameState.current.settings;
  c.innerHTML = '<h2 style="color:var(--accent-orange);">⚙️ Settings</h2><div class="settings-section"><h3>Audio</h3><div class="setting-row"><span>SFX</span><div class="toggle-switch ' + (s.sfx ? 'active' : '') + '" data-s="sfx"></div></div><div class="setting-row"><span>Music</span><div class="toggle-switch ' + (s.music ? 'active' : '') + '" data-s="music"></div></div></div><div class="settings-section"><h3>Gameplay</h3><div class="setting-row"><span>Vibration</span><div class="toggle-switch ' + (s.vibration ? 'active' : '') + '" data-s="vibration"></div></div></div><div class="settings-section"><button class="danger-btn" id="resetDataBtn">⚠️ Reset All</button></div>';
  c.querySelectorAll('.toggle-switch').forEach(function(t) { t.addEventListener('click', function() { var k = t.dataset.s; GameState.current.settings[k] = !GameState.current.settings[k]; t.classList.toggle('active'); GameState.save(); AudioEngine.play('button'); if (k === 'music') { if (GameState.current.settings.music) { AudioEngine.startMusic(); document.getElementById('musicToggle').classList.remove('muted'); document.getElementById('musicToggle').textContent = '🎵'; } else { AudioEngine.stopMusic(); document.getElementById('musicToggle').classList.add('muted'); document.getElementById('musicToggle').textContent = '🔇'; } } }); });
  document.getElementById('resetDataBtn').addEventListener('click', function() { if (confirm('Delete ALL progress?')) { GameState.resetProgress(); showToast('Reset!'); ScreenManager.showScreen('home'); } });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
  AudioEngine.init();
  GameState.init();
  ScreenManager.init();
  renderHomeScreen();

  var burgerMenu = document.getElementById('burgerMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileMenu = document.getElementById('mobileMenu');
  if (burgerMenu && mobileOverlay && mobileMenu) {
    burgerMenu.addEventListener('click', function() { burgerMenu.classList.toggle('open'); mobileOverlay.classList.toggle('open'); mobileMenu.classList.toggle('open'); AudioEngine.play('button'); });
    mobileOverlay.addEventListener('click', function() { burgerMenu.classList.remove('open'); mobileOverlay.classList.remove('open'); mobileMenu.classList.remove('open'); });
    mobileMenu.querySelectorAll('.nav-btn').forEach(function(btn) { btn.addEventListener('click', function() { burgerMenu.classList.remove('open'); mobileOverlay.classList.remove('open'); mobileMenu.classList.remove('open'); }); });
  }

  var musicBtn = document.getElementById('musicToggle');
  if (musicBtn) {
    musicBtn.addEventListener('click', function() { AudioEngine.toggleMusic(); AudioEngine.play('button'); });
    if (!GameState.current.settings.music) { musicBtn.classList.add('muted'); musicBtn.textContent = '🔇'; }
  }
  if (GameState.current.settings.music) { AudioEngine.startMusic(); }

  setTimeout(function() { document.getElementById('splash')?.classList.add('hide'); setTimeout(function() { document.getElementById('splash')?.remove(); }, 500); }, 1500);
  document.addEventListener('click', function() { if (AudioEngine.ctx?.state === 'suspended') AudioEngine.ctx.resume(); }, { once: true });
});
var gameInterval = null;
var gameState = { timeLeft: 20, score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, paused: false, arenaRect: null };

function startGame() {
  var el = document.getElementById('screen-game'); if (!el) return;
  clearInterval(gameInterval); document.removeEventListener('mousemove', trailHandler);
  el.innerHTML = '';
  gameState = { timeLeft: 20, score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, paused: false, arenaRect: null };
  var mode = GameState.currentMode;
  if (mode === 'classic-chase') startClassicChase(el);
  else if (mode === 'multi-target-storm') startMultiTargetStorm(el);
  else if (mode === 'precision-sniper') startPrecisionSniper(el);
  else if (mode === 'survival-wave') startSurvivalWave(el);
  else if (mode === 'memory-pulse') startMemoryPulse(el);
  else if (mode === 'grid-rush') startGridRush(el);
  else if (mode === 'boss-duel') startBossDuel(el);
  else if (mode === 'color-clash') startColorClash(el);
  else if (mode === 'reflex-roulette') startRoulette(el);
  else if (mode === 'time-warp') startTimeWarp(el);
  else if (mode === 'gauntlet') startGauntlet(el);
}

function startClassicChase(el) {
  gameState.timeLeft = 20;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">⏱️<span id="td">20</span></div><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">🔥<span id="cd">x1</span></div><div class="hud-item">%<span id="ad">0%</span></div></div><div class="target" id="target"></div></div>';
  var arena = document.getElementById('gameArena'), target = document.getElementById('target');
  applySkins(arena); gameState.arenaRect = arena.getBoundingClientRect();
  window.addEventListener('resize', function(){ var a = document.getElementById('gameArena'); if (a) gameState.arenaRect = a.getBoundingClientRect(); });
  moveTarget(); target.addEventListener('pointerdown', hitHandler); arena.addEventListener('pointerdown', missHandler);
  gameInterval = setInterval(function(){ gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  if (GameState.current.inventory.equipped.cursor !== 'default') document.addEventListener('mousemove', trailHandler);
}
function moveTarget() { var t = document.getElementById('target'); if (!t || !gameState.arenaRect) return; t.style.left = Math.random() * (gameState.arenaRect.width - 60) + 'px'; t.style.top = Math.random() * (gameState.arenaRect.height - 60) + 'px'; }
function hitHandler(e) { e.stopPropagation(); if (gameState.paused || !e.target.closest('#target')) return; gameState.hits++; gameState.combo++; if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo; gameState.score += 10 + gameState.combo * 2; updateHUD(); var t = document.getElementById('target'); t.classList.add('clicked'); setTimeout(function(){ t.classList.remove('clicked'); }, 300); var r = t.getBoundingClientRect(); spawnParticles(r.left - gameState.arenaRect.left + 30, r.top - gameState.arenaRect.top + 30); moveTarget(); AudioEngine.play('hit'); if (gameState.combo > 1) AudioEngine.play('combo'); }
function missHandler(e) { if (gameState.paused || e.target.closest('#target')) return; gameState.misses++; gameState.combo = 0; updateHUD(); spawnParticles(e.clientX - gameState.arenaRect.left, e.clientY - gameState.arenaRect.top); AudioEngine.play('miss'); }
function updateHUD() { document.getElementById('sd').textContent = gameState.score; document.getElementById('cd').textContent = 'x' + (gameState.combo || 1); var acc = gameState.hits + gameState.misses > 0 ? Math.round((gameState.hits / (gameState.hits + gameState.misses)) * 100) : 0; document.getElementById('ad').textContent = acc + '%'; }

function startMultiTargetStorm(el) {
  gameState.timeLeft = 25;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">⏱️<span id="td">25</span></div><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">❤️<span id="ld">3</span></div></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  gameState.lives = 3; gameState.activeTargets = [];
  window.addEventListener('resize', function(){ var a = document.getElementById('gameArena'); if (a) gameState.arenaRect = a.getBoundingClientRect(); });
  gameInterval = setInterval(function(){ gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  spawnStormTargets();
}
function spawnStormTargets() {
  var arena = document.getElementById('gameArena'); if (!arena) return;
  arena.querySelectorAll('.storm-target').forEach(function(t){ t.remove(); });
  var count = 3 + Math.floor(Math.random() * 4);
  for (var i = 0; i < count; i++) {
    var type = Math.random() < 0.2 ? 'danger' : (Math.random() < 0.4 ? 'gold' : 'normal');
    var t = document.createElement('div');
    t.className = 'target storm-target ' + (type === 'danger' ? 'target-skull' : (type === 'gold' ? 'target-gold' : ''));
    t.style.left = Math.random() * (gameState.arenaRect.width - 60) + 'px';
    t.style.top = Math.random() * (gameState.arenaRect.height - 60) + 'px';
    t.dataset.type = type;
    t.addEventListener('pointerdown', stormHit);
    arena.appendChild(t);
  }
  setTimeout(spawnStormTargets, 1500);
}
function stormHit(e) {
  e.stopPropagation(); var t = e.currentTarget; var type = t.dataset.type;
  if (type === 'danger') { gameState.lives--; document.getElementById('ld').textContent = gameState.lives; AudioEngine.play('miss'); t.remove(); if (gameState.lives <= 0) endGame(); return; }
  gameState.score += type === 'gold' ? 50 : 15; gameState.combo++; gameState.hits++;
  document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); t.remove();
}

function startPrecisionSniper(el) {
  gameState.timeLeft = 20;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">⏱️<span id="td">20</span></div><div class="hud-item">Perfects<span id="pd">0</span></div></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  gameState.perfects = 0;
  gameInterval = setInterval(function(){ gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  spawnSniperTarget();
}
function spawnSniperTarget() {
  var arena = document.getElementById('gameArena'); arena.querySelectorAll('.sniper-ring').forEach(function(r){ r.remove(); });
  var ring = document.createElement('div');
  ring.className = 'target sniper-ring';
  ring.style.width = '120px'; ring.style.height = '120px'; ring.style.borderRadius = '50%';
  ring.style.border = '4px solid white'; ring.style.position = 'absolute';
  ring.style.left = Math.random() * (gameState.arenaRect.width - 120) + 'px';
  ring.style.top = Math.random() * (gameState.arenaRect.height - 120) + 'px';
  ring.style.cursor = 'pointer';
  var inner = document.createElement('div');
  inner.style.width = '30px'; inner.style.height = '30px'; inner.style.borderRadius = '50%';
  inner.style.background = '#00ff88'; inner.style.position = 'absolute';
  inner.style.top = '50%'; inner.style.left = '50%'; inner.style.transform = 'translate(-50%,-50%)';
  ring.appendChild(inner);
  ring.addEventListener('pointerdown', function(e){ e.stopPropagation();
    var rect = ring.getBoundingClientRect(); var cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 15) { gameState.score += 100; gameState.perfects++; AudioEngine.play('perfect'); }
    else if (dist < 40) { gameState.score += 50; AudioEngine.play('hit'); }
    else if (dist < 60) { gameState.score += 20; AudioEngine.play('hit'); }
    else { gameState.misses++; AudioEngine.play('miss'); }
    document.getElementById('sd').textContent = gameState.score;
    document.getElementById('pd').textContent = gameState.perfects;
    ring.remove(); spawnSniperTarget();
  });
  arena.appendChild(ring);
}

function startSurvivalWave(el) {
  gameState.timeLeft = 0; gameState.wave = 1; gameState.lives = 5;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🌊<span id="wd">Wave 1</span></div><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">❤️<span id="ld">5</span></div></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  survivalSpawn();
}
function survivalSpawn() {
  var arena = document.getElementById('gameArena'); arena.querySelectorAll('.survival-enemy').forEach(function(e){ e.remove(); });
  var count = gameState.wave * 2;
  for (var i = 0; i < count; i++) {
    var enemy = document.createElement('div');
    enemy.className = 'target survival-enemy';
    enemy.style.width = (40 + Math.random() * 30) + 'px';
    enemy.style.height = enemy.style.width;
    enemy.style.left = Math.random() * (gameState.arenaRect.width - 80) + 'px';
    enemy.style.top = Math.random() * (gameState.arenaRect.height - 80) + 'px';
    enemy.style.background = 'radial-gradient(circle, #ff3366, #990000)';
    enemy.addEventListener('pointerdown', function(e){ e.stopPropagation(); gameState.score += 20; gameState.hits++; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); e.currentTarget.remove(); if (arena.querySelectorAll('.survival-enemy').length === 0) { gameState.wave++; document.getElementById('wd').textContent = 'Wave ' + gameState.wave; survivalSpawn(); } });
    arena.appendChild(enemy);
    setTimeout(function(){ if (enemy.parentNode) { enemy.remove(); gameState.lives--; document.getElementById('ld').textContent = gameState.lives; AudioEngine.play('miss'); if (gameState.lives <= 0) endGame(); if (arena.querySelectorAll('.survival-enemy').length === 0) { gameState.wave++; document.getElementById('wd').textContent = 'Wave ' + gameState.wave; survivalSpawn(); } } }, 2000 - gameState.wave * 80);
  }
}

function startMemoryPulse(el) {
  gameState.sequence = []; gameState.playerSeq = []; gameState.round = 1; gameState.showing = true;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🧠<span id="rd">Round 1</span></div><div class="hud-item">🎯<span id="sd">0</span></div></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  memoryAddToSequence();
}
function memoryAddToSequence() {
  gameState.sequence.push({ x: Math.random() * (gameState.arenaRect.width - 40), y: Math.random() * (gameState.arenaRect.height - 40) });
  memoryShowSequence();
}
function memoryShowSequence() {
  gameState.showing = true; var arena = document.getElementById('gameArena');
  var dots = gameState.sequence; var i = 0;
  var iv = setInterval(function(){
    if (i >= dots.length) { clearInterval(iv); setTimeout(function(){ arena.querySelectorAll('.memory-dot').forEach(function(d){ d.remove(); }); memoryStartInput(); }, 400); return; }
    var dot = document.createElement('div');
    dot.className = 'target memory-dot'; dot.style.width = '30px'; dot.style.height = '30px';
    dot.style.left = dots[i].x + 'px'; dot.style.top = dots[i].y + 'px';
    dot.style.background = '#ffffff'; dot.style.boxShadow = '0 0 20px white';
    arena.appendChild(dot); AudioEngine.play('grid');
    setTimeout(function(){ dot.remove(); }, 300); i++;
  }, 500);
}
function memoryStartInput() {
  gameState.showing = false; gameState.playerSeq = [];
  document.getElementById('gameArena').addEventListener('pointerdown', memoryInputHandler);
}
function memoryInputHandler(e) {
  if (gameState.showing) return;
  var arena = document.getElementById('gameArena'); var rect = arena.getBoundingClientRect();
  var x = e.clientX - rect.left, y = e.clientY - rect.top;
  gameState.playerSeq.push({x:x, y:y});
  var expected = gameState.sequence[gameState.playerSeq.length - 1];
  var dist = Math.hypot(x - expected.x, y - expected.y);
  if (dist > 40) { AudioEngine.play('miss'); gameState.misses++; endGame(); return; }
  if (gameState.playerSeq.length === gameState.sequence.length) {
    gameState.score += gameState.sequence.length * 30; gameState.round++;
    document.getElementById('sd').textContent = gameState.score;
    document.getElementById('rd').textContent = 'Round ' + gameState.round;
    arena.removeEventListener('pointerdown', memoryInputHandler);
    AudioEngine.play('perfect'); setTimeout(memoryAddToSequence, 600);
  }
}

function startBossDuel(el) {
  gameState.bossHP = 20; gameState.shieldActive = false; gameState.timeLeft = 30;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">👾<span id="bhp">20</span> HP</div><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">⏱️<span id="td">30</span></div></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  gameInterval = setInterval(function(){ gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  spawnBoss();
}
function spawnBoss() {
  var arena = document.getElementById('gameArena');
  var boss = document.createElement('div');
  boss.className = 'target'; boss.id = 'boss';
  boss.style.width = '100px'; boss.style.height = '100px';
  boss.style.background = 'radial-gradient(circle, #ff8c00, #b4450c)';
  boss.style.left = (gameState.arenaRect.width/2 - 50) + 'px';
  boss.style.top = (gameState.arenaRect.height/2 - 50) + 'px';
  boss.style.fontSize = '50px'; boss.style.display = 'flex'; boss.style.alignItems = 'center'; boss.style.justifyContent = 'center';
  boss.textContent = '👾';
  boss.addEventListener('pointerdown', function(e){
    e.stopPropagation();
    if (gameState.shieldActive) { AudioEngine.play('miss'); return; }
    gameState.bossHP--; gameState.score += 30;
    document.getElementById('bhp').textContent = gameState.bossHP;
    document.getElementById('sd').textContent = gameState.score;
    AudioEngine.play('hit');
    if (gameState.bossHP <= 0) { gameState.score += 200; endGame(); return; }
    if (gameState.bossHP % 5 === 0) { gameState.shieldActive = true; boss.style.border = '5px solid #3b82f6'; setTimeout(function(){ gameState.shieldActive = false; boss.style.border = '3px solid white'; }, 2000); }
    moveBoss();
  });
  arena.appendChild(boss);
}
function moveBoss() {
  var boss = document.getElementById('boss'); if (!boss) return;
  boss.style.left = Math.random() * (gameState.arenaRect.width - 100) + 'px';
  boss.style.top = Math.random() * (gameState.arenaRect.height - 100) + 'px';
}

function startGridRush(el) {
  gameState.gridSize = 4; gameState.gridRound = 1; gameState.gridSequence = []; gameState.gridIndex = 0;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">🔄<span id="rd">Round 1</span></div></div><div class="grid-container" id="grid" style="grid-template-columns:repeat(4,70px);"></div></div>';
  var grid = document.getElementById('grid'), arena = document.getElementById('gameArena');
  gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  for (var i = 0; i < 16; i++) { var cell = document.createElement('div'); cell.className = 'grid-cell'; cell.dataset.idx = i; grid.appendChild(cell); }
  genGridSequence();
}
function genGridSequence() {
  gameState.gridSequence = Array.from({length: gameState.gridRound + 2}, function(){ return Math.floor(Math.random() * 16); });
  gameState.gridIndex = 0; showGridSequence();
}
function showGridSequence() {
  var cells = document.querySelectorAll('.grid-cell'); cells.forEach(function(c){ c.classList.remove('active','wrong'); });
  var i = 0;
  var iv = setInterval(function(){ if (i >= gameState.gridSequence.length) { clearInterval(iv); startGridInput(); return; } cells[gameState.gridSequence[i]].classList.add('active'); AudioEngine.play('grid'); setTimeout(function(){ cells[gameState.gridSequence[i]].classList.remove('active'); }, 300); i++; }, 500);
}
function startGridInput() {
  document.querySelectorAll('.grid-cell').forEach(function(c){ c.addEventListener('pointerdown', gridClickHandler); });
}
function gridClickHandler(e) {
  var cell = e.currentTarget, idx = parseInt(cell.dataset.idx);
  if (idx === gameState.gridSequence[gameState.gridIndex]) { cell.classList.add('active'); gameState.gridIndex++; gameState.score += 15; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); if (gameState.gridIndex >= gameState.gridSequence.length) { gameState.gridRound++; document.getElementById('rd').textContent = 'Round ' + gameState.gridRound; document.querySelectorAll('.grid-cell').forEach(function(c){ c.removeEventListener('pointerdown', gridClickHandler); }); setTimeout(genGridSequence, 500); } }
  else { cell.classList.add('wrong'); AudioEngine.play('miss'); gameState.misses++; setTimeout(function(){ endGame(); }, 500); }
}

function startColorClash(el) {
  gameState.timeLeft = 30; gameState.score = 0;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">⏱️<span id="td">30</span></div></div><div class="color-word" id="cw">RED</div><div class="color-target-row" id="ctr"></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  gameInterval = setInterval(function(){ gameState.timeLeft--; document.getElementById('td').textContent = gameState.timeLeft; if (gameState.timeLeft <= 0) endGame(); }, 1000);
  nextColorRound();
}
var colorWords = ['RED','BLUE','GREEN','YELLOW','PURPLE','ORANGE'];
function nextColorRound() {
  var word = colorWords[Math.floor(Math.random() * colorWords.length)];
  var actualColor = colorWords[Math.floor(Math.random() * colorWords.length)];
  document.getElementById('cw').textContent = word;
  document.getElementById('cw').style.color = actualColor.toLowerCase();
  var ctr = document.getElementById('ctr'); ctr.innerHTML = '';
  var options = colorWords.slice().sort(function(){ return Math.random() - 0.5; }).slice(0, 4);
  if (!options.includes(actualColor)) options[0] = actualColor;
  options.forEach(function(c){
    var btn = document.createElement('div'); btn.className = 'color-target';
    btn.style.background = c.toLowerCase(); btn.dataset.color = c;
    btn.addEventListener('pointerdown', colorClickHandler); ctr.appendChild(btn);
  });
  gameState.correctColor = actualColor;
}
function colorClickHandler(e) {
  e.stopPropagation();
  if (e.currentTarget.dataset.color === gameState.correctColor) { gameState.score += 30; gameState.hits++; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); nextColorRound(); }
  else { gameState.misses++; AudioEngine.play('wrong'); e.currentTarget.classList.add('wrong'); setTimeout(nextColorRound, 400); }
}

function startRoulette(el) {
  gameState.score = 0; gameState.lives = 3; gameState.targetSize = 60;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">❤️<span id="ld">3</span></div><div class="hud-item">🔥<span id="cd">x1</span></div></div><div class="target" id="target" style="width:60px;height:60px;"></div></div>';
  var arena = document.getElementById('gameArena'), target = document.getElementById('target');
  gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  gameState.angle = 0; gameState.speed = 3; gameState.pattern = Math.random() < 0.5 ? 'circle' : 'infinity';
  target.addEventListener('pointerdown', rouletteHit); rouletteLoop();
}
function rouletteLoop() {
  if (gameState.paused) return;
  var target = document.getElementById('target'), cx = gameState.arenaRect.width/2, cy = gameState.arenaRect.height/2;
  gameState.angle += gameState.speed * 0.03;
  var r = Math.min(cx, cy) * 0.6;
  var x, y;
  if (gameState.pattern === 'circle') { x = cx + Math.cos(gameState.angle) * r - gameState.targetSize/2; y = cy + Math.sin(gameState.angle) * r - gameState.targetSize/2; }
  else { x = cx + Math.cos(gameState.angle) * r * 0.8 - gameState.targetSize/2; y = cy + Math.sin(gameState.angle * 2) * r * 0.5 - gameState.targetSize/2; }
  target.style.left = x + 'px'; target.style.top = y + 'px';
  requestAnimationFrame(rouletteLoop);
}
function rouletteHit(e) {
  e.stopPropagation(); gameState.score += 40; gameState.combo++;
  gameState.targetSize = Math.max(20, gameState.targetSize - 4);
  document.getElementById('target').style.width = gameState.targetSize + 'px';
  document.getElementById('target').style.height = gameState.targetSize + 'px';
  document.getElementById('sd').textContent = gameState.score;
  document.getElementById('cd').textContent = 'x' + gameState.combo;
  AudioEngine.play('hit'); gameState.speed += 0.5;
}

function startTimeWarp(el) {
  gameState.timeLeft = 30; gameState.warpActive = true;
  startClassicChase(el);
  clearInterval(gameInterval);
  gameInterval = setInterval(function(){
    if (gameState.paused) return;
    var speed = gameState.combo >= 8 ? 400 : (gameState.combo >= 4 ? 700 : 1000);
    gameState.timeLeft -= speed / 1000;
    document.getElementById('td').textContent = Math.max(0, Math.ceil(gameState.timeLeft));
    if (gameState.timeLeft <= 0) endGame();
  }, 150);
}

function startGauntlet(el) {
  gameState.lives = 5; gameState.survivalTime = 0; gameState.gauntletTimer = 0;
  el.innerHTML = '<div class="game-arena" id="gameArena"><div class="game-hud"><div class="hud-item">🎯<span id="sd">0</span></div><div class="hud-item">⏱️<span id="td">0</span>s</div><div class="hud-item">❤️<span id="ld">5</span></div></div><div class="gauntlet-indicator" id="gi">WARM UP</div><div class="target" id="target"></div></div>';
  var arena = document.getElementById('gameArena'); gameState.arenaRect = arena.getBoundingClientRect(); applySkins(arena);
  document.getElementById('target').addEventListener('pointerdown', gauntletHit);
  arena.addEventListener('pointerdown', function(e){ if (!e.target.closest('#target')) { gameState.lives--; document.getElementById('ld').textContent = gameState.lives; AudioEngine.play('miss'); if (gameState.lives <= 0) endGame(); } });
  gauntletLoop();
}
function gauntletLoop() {
  if (gameState.paused) return;
  gameState.survivalTime++; document.getElementById('td').textContent = gameState.survivalTime + 's';
  gameState.gauntletTimer++;
  if (gameState.gauntletTimer >= 25) {
    gameState.gauntletTimer = 0;
    var modes = ['CLASSIC','STORM','SNIPER','WAVE','GRID','COLOR','ROULETTE','WARP'];
    gameState.gauntletMode = modes[Math.floor(Math.random() * modes.length)];
    document.getElementById('gi').textContent = gameState.gauntletMode;
    AudioEngine.play('wave');
  }
  moveTarget(); setTimeout(gauntletLoop, 800);
}
function gauntletHit(e) { e.stopPropagation(); gameState.score += 25; document.getElementById('sd').textContent = gameState.score; AudioEngine.play('hit'); moveTarget(); }