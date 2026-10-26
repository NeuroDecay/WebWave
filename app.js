(function () {
  'use strict';

  class ChiptuneSynth {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.bgmStep = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.15, pitchDecay = 0) {
      if (this.isMuted) return;
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(freq, now);
        if (pitchDecay !== 0) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + pitchDecay), now + duration);
        }

        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        
      }
    }

    playNoise(duration = 0.1, gainVal = 0.12) {
      if (this.isMuted) return;
      try {
        this.init();
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
      } catch (e) {}
    }

    sfxClick() {
      this.playTone(800, 'triangle', 0.03, 0.08);
    }

    sfxButtonPress() {
      this.playTone(320, 'square', 0.04, 0.1);
    }

    sfxPowerOnChime() {
      if (this.isMuted) return;
      try {
        this.init();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1046.5, now); 
        osc.frequency.setValueAtTime(2093.0, now + 0.12); 
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } catch (e) {}
    }

    sfxCoin() {
      if (this.isMuted) return;
      try {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); 
        osc.frequency.setValueAtTime(1318.51, now + 0.08); 
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    }

    sfxJump() {
      this.playTone(150, 'square', 0.16, 0.15, 380);
    }

    sfxLaser() {
      this.playTone(950, 'sawtooth', 0.12, 0.12, -700);
    }

    sfxExplosion() {
      this.playNoise(0.3, 0.25);
    }

    sfxPowerup() {
      if (this.isMuted) return;
      try {
        this.init();
        const notes = [330, 392, 659, 523, 587, 784];
        notes.forEach((freq, i) => {
          setTimeout(() => {
            this.playTone(freq, 'square', 0.08, 0.12);
          }, i * 55);
        });
      } catch (e) {}
    }

    sfx1Up() {
      if (this.isMuted) return;
      const notes = [330, 392, 659, 523, 587, 784];
      notes.forEach((f, i) => {
        setTimeout(() => this.playTone(f * 1.5, 'square', 0.07, 0.1), i * 60);
      });
    }

    sfxCartridge() {
      this.playNoise(0.06, 0.18);
      setTimeout(() => this.playTone(120, 'square', 0.04, 0.1), 30);
    }

    toggleBgm(btnElement) {
      this.init();
      this.bgmPlaying = !this.bgmPlaying;
      if (this.bgmPlaying) {
        if (btnElement) btnElement.classList.add('active');
        this.startBgmLoop();
      } else {
        if (btnElement) btnElement.classList.remove('active');
        if (this.bgmTimer) clearInterval(this.bgmTimer);
      }
      return this.bgmPlaying;
    }

    startBgmLoop() {
      
      const melody = [
        330, 0, 330, 0, 392, 0, 330, 0,
        294, 0, 330, 0, 261, 0, 294, 0,
        330, 0, 392, 0, 440, 0, 392, 0,
        330, 294, 261, 294, 330, 0, 0, 0,
        392, 0, 440, 0, 523, 0, 440, 0,
        392, 0, 330, 0, 294, 0, 261, 0,
        294, 0, 330, 0, 294, 0, 261, 0,
        220, 0, 261, 0, 220, 0, 0, 0
      ];

      const bassline = [
        165, 0, 165, 0, 196, 0, 196, 0,
        147, 0, 147, 0, 130, 0, 147, 0,
        165, 0, 196, 0, 220, 0, 196, 0,
        165, 0, 130, 0, 165, 0, 165, 0
      ];

      const stepDuration = 135; 
      if (this.bgmTimer) clearInterval(this.bgmTimer);

      this.bgmTimer = setInterval(() => {
        if (!this.bgmPlaying || this.isMuted) return;

        const note = melody[this.bgmStep % melody.length];
        const bass = bassline[(Math.floor(this.bgmStep / 2)) % bassline.length];

        if (note > 0) {
          this.playTone(note, 'square', 0.1, 0.08);
        }
        if (this.bgmStep % 2 === 0 && bass > 0) {
          this.playTone(bass, 'triangle', 0.15, 0.12);
        }
        
        if (this.bgmStep % 4 === 2) {
          this.playNoise(0.04, 0.05);
        }

        this.bgmStep++;
      }, stepDuration);
    }
  }

  const synth = new ChiptuneSynth();

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const consoleEl = document.getElementById('dmgConsole');
  const cartridgeIndicator = document.getElementById('activeCartridgeIndicator');
  const lcdScreen = document.getElementById('lcdScreen');

  let isPoweredOn = true;
  let activeGame = 'tetris'; 
  let animationFrameId = null;

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      darkest: style.getPropertyValue('--lcd-darkest').trim() || '#0f380f',
      dark: style.getPropertyValue('--lcd-dark').trim() || '#306230',
      light: style.getPropertyValue('--lcd-light').trim() || '#8bac0f',
      lightest: style.getPropertyValue('--lcd-lightest').trim() || '#9bbc0f'
    };
  }

  class TetrisGame {
    constructor() {
      this.cols = 10;
      this.rows = 18;
      this.blockSize = 7;
      this.offsetX = 20;
      this.offsetY = 9;
      this.grid = [];
      this.score = 0;
      this.lines = 0;
      this.level = 1;
      this.gameOver = false;
      this.dropCounter = 0;
      this.dropInterval = 35; 
      this.currentPiece = null;

      this.shapes = [
        [[1, 1, 1, 1]], 
        [[1, 1], [1, 1]], 
        [[0, 1, 0], [1, 1, 1]], 
        [[1, 0, 0], [1, 1, 1]], 
        [[0, 0, 1], [1, 1, 1]], 
        [[0, 1, 1], [1, 1, 0]], 
        [[1, 1, 0], [0, 1, 1]]  
      ];

      this.reset();
    }

    reset() {
      this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      this.score = 0;
      this.lines = 0;
      this.level = 1;
      this.gameOver = false;
      this.dropInterval = 35;
      this.spawnPiece();
    }

    spawnPiece() {
      const idx = Math.floor(Math.random() * this.shapes.length);
      const matrix = this.shapes[idx];
      this.currentPiece = {
        matrix: matrix,
        x: Math.floor((this.cols - matrix[0].length) / 2),
        y: 0
      };

      if (this.collide(this.currentPiece)) {
        this.gameOver = true;
        synth.sfxExplosion();
      }
    }

    collide(piece) {
      const m = piece.matrix;
      for (let r = 0; r < m.length; r++) {
        for (let c = 0; c < m[r].length; c++) {
          if (m[r][c] !== 0) {
            const newX = piece.x + c;
            const newY = piece.y + r;
            if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
            if (newY >= 0 && this.grid[newY][newX] !== 0) return true;
          }
        }
      }
      return false;
    }

    merge() {
      const m = this.currentPiece.matrix;
      for (let r = 0; r < m.length; r++) {
        for (let c = 0; c < m[r].length; c++) {
          if (m[r][c] !== 0) {
            this.grid[this.currentPiece.y + r][this.currentPiece.x + c] = 1;
          }
        }
      }
      synth.sfxButtonPress();
      this.clearLines();
      this.spawnPiece();
    }

    rotateMatrix(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;
      const res = Array.from({ length: cols }, () => Array(rows).fill(0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          res[c][rows - 1 - r] = matrix[r][c];
        }
      }
      return res;
    }

    rotate() {
      if (this.gameOver) return;
      const oldMatrix = this.currentPiece.matrix;
      const rotated = this.rotateMatrix(oldMatrix);
      const oldX = this.currentPiece.x;
      this.currentPiece.matrix = rotated;

      let offset = 1;
      while (this.collide(this.currentPiece)) {
        this.currentPiece.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > this.currentPiece.matrix[0].length) {
          this.currentPiece.matrix = oldMatrix;
          this.currentPiece.x = oldX;
          return;
        }
      }
      synth.playTone(520, 'square', 0.04, 0.08);
    }

    move(dir) {
      if (this.gameOver) return;
      this.currentPiece.x += dir;
      if (this.collide(this.currentPiece)) {
        this.currentPiece.x -= dir;
      } else {
        synth.playTone(380, 'square', 0.03, 0.06);
      }
    }

    drop() {
      if (this.gameOver) return;
      this.currentPiece.y++;
      if (this.collide(this.currentPiece)) {
        this.currentPiece.y--;
        this.merge();
      }
    }

    hardDrop() {
      if (this.gameOver) return;
      while (!this.collide(this.currentPiece)) {
        this.currentPiece.y++;
      }
      this.currentPiece.y--;
      this.merge();
      synth.playTone(220, 'square', 0.06, 0.1);
    }

    clearLines() {
      let linesCleared = 0;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r].every(val => val !== 0)) {
          this.grid.splice(r, 1);
          this.grid.unshift(Array(this.cols).fill(0));
          linesCleared++;
          r++; 
        }
      }
      if (linesCleared > 0) {
        this.lines += linesCleared;
        this.score += linesCleared === 4 ? 800 : linesCleared * 100;
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = Math.max(8, 35 - (this.level - 1) * 3);
        synth.sfxCoin();
      }
    }

    update() {
      if (this.gameOver) return;
      this.dropCounter++;
      if (this.dropCounter >= this.dropInterval) {
        this.drop();
        this.dropCounter = 0;
      }
    }

    render(ctx, p) {
      
      ctx.fillStyle = p.lightest;
      ctx.fillRect(0, 0, 160, 144);

      ctx.strokeStyle = p.darkest;
      ctx.lineWidth = 2;
      const fieldW = this.cols * this.blockSize;
      const fieldH = this.rows * this.blockSize;
      ctx.strokeRect(this.offsetX - 2, this.offsetY - 2, fieldW + 4, fieldH + 4);

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c] !== 0) {
            ctx.fillStyle = p.darkest;
            ctx.fillRect(this.offsetX + c * this.blockSize, this.offsetY + r * this.blockSize, this.blockSize - 1, this.blockSize - 1);
            ctx.fillStyle = p.light;
            ctx.fillRect(this.offsetX + c * this.blockSize + 1, this.offsetY + r * this.blockSize + 1, this.blockSize - 3, this.blockSize - 3);
          }
        }
      }

      if (this.currentPiece && !this.gameOver) {
        const m = this.currentPiece.matrix;
        for (let r = 0; r < m.length; r++) {
          for (let c = 0; c < m[r].length; c++) {
            if (m[r][c] !== 0) {
              const px = this.offsetX + (this.currentPiece.x + c) * this.blockSize;
              const py = this.offsetY + (this.currentPiece.y + r) * this.blockSize;
              ctx.fillStyle = p.darkest;
              ctx.fillRect(px, py, this.blockSize - 1, this.blockSize - 1);
              ctx.fillStyle = p.light;
              ctx.fillRect(px + 1, py + 1, this.blockSize - 3, this.blockSize - 3);
            }
          }
        }
      }

      const hudX = 100;
      ctx.fillStyle = p.darkest;
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('SCORE', hudX, 24);
      ctx.fillText(`${this.score}`, hudX, 36);

      ctx.fillText('LINES', hudX, 56);
      ctx.fillText(`${this.lines}`, hudX, 68);

      ctx.fillText('LEVEL', hudX, 88);
      ctx.fillText(`${this.level}`, hudX, 100);

      if (this.gameOver) {
        ctx.fillStyle = p.darkest;
        ctx.fillRect(20, 50, 120, 44);
        ctx.fillStyle = p.lightest;
        ctx.fillRect(22, 52, 116, 40);

        ctx.fillStyle = p.darkest;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', 35, 68);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('PRESS START', 34, 82);
      }
    }

    handleInput(action) {
      if (this.gameOver) {
        if (action === 'start' || action === 'a') this.reset();
        return;
      }
      switch (action) {
        case 'left': this.move(-1); break;
        case 'right': this.move(1); break;
        case 'down': this.drop(); break;
        case 'up': case 'a': this.rotate(); break;
        case 'b': this.hardDrop(); break;
        case 'start': this.reset(); break;
      }
    }
  }

  class SpaceGame {
    constructor() {
      this.reset();
    }

    reset() {
      this.player = { x: 74, y: 126, w: 12, h: 8, speed: 3 };
      this.bullets = [];
      this.invaders = [];
      this.enemyBullets = [];
      this.score = 0;
      this.wave = 1;
      this.gameOver = false;
      this.invaderDir = 1;
      this.invaderSpeed = 0.4;
      this.moveTimer = 0;
      this.spawnInvaders();
    }

    spawnInvaders() {
      this.invaders = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          this.invaders.push({
            x: 20 + c * 20,
            y: 18 + r * 14,
            w: 10,
            h: 8,
            alive: true,
            type: r
          });
        }
      }
    }

    update() {
      if (this.gameOver) return;

      this.bullets.forEach((b, idx) => {
        b.y -= 4;
        if (b.y < 0) this.bullets.splice(idx, 1);
      });

      this.enemyBullets.forEach((eb, idx) => {
        eb.y += 2;
        if (eb.y > 144) this.enemyBullets.splice(idx, 1);
        
        if (
          eb.x > this.player.x && eb.x < this.player.x + this.player.w &&
          eb.y > this.player.y && eb.y < this.player.y + this.player.h
        ) {
          this.gameOver = true;
          synth.sfxExplosion();
        }
      });

      let hitWall = false;
      let livingCount = 0;
      this.invaders.forEach(inv => {
        if (!inv.alive) return;
        livingCount++;
        inv.x += this.invaderDir * this.invaderSpeed;
        if (inv.x > 145 || inv.x < 5) hitWall = true;

        if (inv.y + inv.h >= this.player.y) {
          this.gameOver = true;
          synth.sfxExplosion();
        }
      });

      if (hitWall) {
        this.invaderDir *= -1;
        this.invaders.forEach(inv => {
          if (inv.alive) inv.y += 4;
        });
      }

      if (livingCount > 0 && Math.random() < 0.03) {
        const liveInvaders = this.invaders.filter(i => i.alive);
        const shooter = liveInvaders[Math.floor(Math.random() * liveInvaders.length)];
        this.enemyBullets.push({ x: shooter.x + 5, y: shooter.y + 8 });
      }

      this.bullets.forEach((b, bIdx) => {
        this.invaders.forEach(inv => {
          if (inv.alive && b.x >= inv.x && b.x <= inv.x + inv.w && b.y >= inv.y && b.y <= inv.y + inv.h) {
            inv.alive = false;
            this.bullets.splice(bIdx, 1);
            this.score += 50;
            synth.sfxExplosion();
          }
        });
      });

      if (livingCount === 0) {
        this.wave++;
        this.invaderSpeed += 0.2;
        this.spawnInvaders();
        synth.sfxPowerup();
      }
    }

    shoot() {
      if (this.gameOver) return;
      if (this.bullets.length < 3) {
        this.bullets.push({ x: this.player.x + 6, y: this.player.y });
        synth.sfxLaser();
      }
    }

    render(ctx, p) {
      ctx.fillStyle = p.lightest;
      ctx.fillRect(0, 0, 160, 144);

      ctx.fillStyle = p.darkest;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(`SCORE:${this.score}`, 8, 10);
      ctx.fillText(`WAVE:${this.wave}`, 105, 10);

      ctx.fillStyle = p.darkest;
      const px = this.player.x;
      const py = this.player.y;
      ctx.fillRect(px + 4, py, 4, 3);
      ctx.fillRect(px + 2, py + 3, 8, 3);
      ctx.fillRect(px, py + 5, 12, 3);

      ctx.fillStyle = p.dark;
      this.bullets.forEach(b => ctx.fillRect(b.x - 1, b.y, 2, 4));
      this.enemyBullets.forEach(eb => ctx.fillRect(eb.x - 1, eb.y, 2, 4));

      this.invaders.forEach(inv => {
        if (!inv.alive) return;
        ctx.fillStyle = p.darkest;
        ctx.fillRect(inv.x + 2, inv.y, 6, 2);
        ctx.fillRect(inv.x, inv.y + 2, 10, 4);
        ctx.fillRect(inv.x + 1, inv.y + 6, 2, 2);
        ctx.fillRect(inv.x + 7, inv.y + 6, 2, 2);
      });

      if (this.gameOver) {
        ctx.fillStyle = p.darkest;
        ctx.fillRect(20, 50, 120, 44);
        ctx.fillStyle = p.lightest;
        ctx.fillRect(22, 52, 116, 40);

        ctx.fillStyle = p.darkest;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', 35, 68);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('PRESS START', 34, 82);
      }
    }

    handleInput(action) {
      if (this.gameOver) {
        if (action === 'start' || action === 'a') this.reset();
        return;
      }
      switch (action) {
        case 'left': this.player.x = Math.max(4, this.player.x - 6); break;
        case 'right': this.player.x = Math.min(144, this.player.x + 6); break;
        case 'a': case 'up': this.shoot(); break;
        case 'start': this.reset(); break;
      }
    }
  }

  class MonsterGame {
    constructor() {
      this.reset();
    }

    reset() {
      this.playerMon = { name: 'PIKACHU', hp: 20, maxHp: 20, lv: 5 };
      this.enemyMon = { name: 'GENGAR', hp: 22, maxHp: 22, lv: 5 };
      this.state = 'MENU'; 
      this.selectedOption = 0; 
      this.message = 'What will PIKACHU do?';
      this.animTimer = 0;
    }

    update() {
      if (this.state === 'ATTACK_ANIM') {
        this.animTimer++;
        if (this.animTimer > 40) {
          if (this.enemyMon.hp <= 0) {
            this.state = 'VICTORY';
            this.message = 'GENGAR fainted! WIN!';
            synth.sfxPowerup();
          } else {
            this.state = 'ENEMY_TURN';
            this.message = 'GENGAR used SHADOW PUNCH!';
            synth.playTone(180, 'sawtooth', 0.15, 0.15);
            this.animTimer = 0;
          }
        }
      } else if (this.state === 'ENEMY_TURN') {
        this.animTimer++;
        if (this.animTimer > 45) {
          this.playerMon.hp = Math.max(0, this.playerMon.hp - Math.floor(Math.random() * 5 + 3));
          if (this.playerMon.hp <= 0) {
            this.state = 'DEFEAT';
            this.message = 'PIKACHU fainted! RIP';
            synth.sfxExplosion();
          } else {
            this.state = 'MENU';
            this.message = 'What will PIKACHU do?';
          }
          this.animTimer = 0;
        }
      }
    }

    executeAction() {
      if (this.state !== 'MENU') return;

      if (this.selectedOption === 0) { 
        const dmg = Math.floor(Math.random() * 7 + 6);
        this.enemyMon.hp = Math.max(0, this.enemyMon.hp - dmg);
        this.state = 'ATTACK_ANIM';
        this.message = 'PIKACHU used THUNDER!';
        synth.sfxLaser();
        this.animTimer = 0;
      } else if (this.selectedOption === 1) { 
        const dmg = Math.floor(Math.random() * 4 + 4);
        this.enemyMon.hp = Math.max(0, this.enemyMon.hp - dmg);
        this.state = 'ATTACK_ANIM';
        this.message = 'PIKACHU used TACKLE!';
        synth.playTone(250, 'square', 0.1, 0.12);
        this.animTimer = 0;
      } else if (this.selectedOption === 2) { 
        this.playerMon.hp = Math.min(this.playerMon.maxHp, this.playerMon.hp + 10);
        this.state = 'ENEMY_TURN';
        this.message = 'PIKACHU drank POTION!';
        synth.sfxCoin();
        this.animTimer = 0;
      } else if (this.selectedOption === 3) { 
        this.message = "Can't escape!";
        synth.sfxClick();
      }
    }

    render(ctx, p) {
      ctx.fillStyle = p.lightest;
      ctx.fillRect(0, 0, 160, 144);

      ctx.fillStyle = p.darkest;
      ctx.fillRect(10, 8, 70, 22);
      ctx.fillStyle = p.lightest;
      ctx.fillRect(12, 10, 66, 18);
      ctx.fillStyle = p.darkest;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(this.enemyMon.name, 16, 18);
      
      ctx.fillRect(16, 22, 58, 4);
      ctx.fillStyle = p.light;
      const enemyPct = Math.max(0, this.enemyMon.hp / this.enemyMon.maxHp);
      ctx.fillRect(16, 22, Math.floor(58 * enemyPct), 4);

      ctx.fillStyle = p.darkest;
      ctx.fillRect(100, 18, 38, 34);
      ctx.fillStyle = p.light;
      ctx.fillRect(104, 22, 30, 26);
      ctx.fillStyle = p.darkest;
      
      ctx.fillRect(110, 28, 4, 4);
      ctx.fillRect(124, 28, 4, 4);

      ctx.fillStyle = p.darkest;
      ctx.fillRect(20, 56, 36, 32);
      ctx.fillStyle = p.light;
      ctx.fillRect(24, 60, 28, 24);
      
      ctx.fillStyle = p.darkest;
      ctx.fillRect(16, 52, 8, 12);
      ctx.fillRect(44, 52, 8, 12);

      ctx.fillStyle = p.darkest;
      ctx.fillRect(80, 54, 72, 26);
      ctx.fillStyle = p.lightest;
      ctx.fillRect(82, 56, 68, 22);
      ctx.fillStyle = p.darkest;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(this.playerMon.name, 86, 64);
      
      ctx.fillRect(86, 68, 60, 4);
      ctx.fillStyle = p.light;
      const playerPct = Math.max(0, this.playerMon.hp / this.playerMon.maxHp);
      ctx.fillRect(86, 68, Math.floor(60 * playerPct), 4);
      ctx.fillStyle = p.darkest;
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText(`${this.playerMon.hp}/${this.playerMon.maxHp} HP`, 86, 76);

      ctx.fillStyle = p.darkest;
      ctx.fillRect(4, 90, 152, 50);
      ctx.fillStyle = p.lightest;
      ctx.fillRect(6, 92, 148, 46);

      if (this.state === 'MENU') {
        const options = ['THUNDER', 'TACKLE', 'POTION', 'RUN'];
        ctx.fillStyle = p.darkest;
        ctx.font = '6px "Press Start 2P", monospace';
        options.forEach((opt, idx) => {
          const ox = (idx % 2) * 70 + 20;
          const oy = Math.floor(idx / 2) * 16 + 110;
          if (idx === this.selectedOption) {
            ctx.fillText('▶', ox - 10, oy);
          }
          ctx.fillText(opt, ox, oy);
        });
      } else {
        ctx.fillStyle = p.darkest;
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText(this.message, 12, 114);
        if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillText('PRESS START TO RETRY', 12, 130);
        }
      }
    }

    handleInput(action) {
      if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
        if (action === 'start' || action === 'a') this.reset();
        return;
      }
      if (this.state !== 'MENU') return;

      switch (action) {
        case 'left':
          if (this.selectedOption % 2 === 1) {
            this.selectedOption--;
            synth.sfxClick();
          }
          break;
        case 'right':
          if (this.selectedOption % 2 === 0) {
            this.selectedOption++;
            synth.sfxClick();
          }
          break;
        case 'up':
          if (this.selectedOption >= 2) {
            this.selectedOption -= 2;
            synth.sfxClick();
          }
          break;
        case 'down':
          if (this.selectedOption < 2) {
            this.selectedOption += 2;
            synth.sfxClick();
          }
          break;
        case 'a':
        case 'start':
          this.executeAction();
          break;
      }
    }
  }

  class BricksGame {
    constructor() {
      this.reset();
    }

    reset() {
      this.paddle = { x: 65, y: 132, w: 28, h: 4, speed: 4 };
      this.ball = { x: 78, y: 120, vx: 1.5, vy: -1.5, r: 2.5 };
      this.bricks = [];
      this.score = 0;
      this.gameOver = false;
      this.spawnBricks();
    }

    spawnBricks() {
      this.bricks = [];
      const rows = 4;
      const cols = 8;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.bricks.push({
            x: 10 + c * 18,
            y: 18 + r * 10,
            w: 16,
            h: 7,
            alive: true
          });
        }
      }
    }

    update() {
      if (this.gameOver) return;

      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;

      if (this.ball.x - this.ball.r < 0 || this.ball.x + this.ball.r > 160) {
        this.ball.vx *= -1;
        synth.playTone(400, 'square', 0.02, 0.05);
      }
      if (this.ball.y - this.ball.r < 0) {
        this.ball.vy *= -1;
        synth.playTone(400, 'square', 0.02, 0.05);
      }

      if (
        this.ball.y + this.ball.r >= this.paddle.y &&
        this.ball.y - this.ball.r <= this.paddle.y + this.paddle.h &&
        this.ball.x >= this.paddle.x &&
        this.ball.x <= this.paddle.x + this.paddle.w
      ) {
        this.ball.vy = -Math.abs(this.ball.vy);
        const hitOffset = (this.ball.x - (this.paddle.x + this.paddle.w / 2)) / (this.paddle.w / 2);
        this.ball.vx = hitOffset * 2.2;
        synth.playTone(550, 'square', 0.03, 0.08);
      }

      let activeCount = 0;
      this.bricks.forEach(b => {
        if (!b.alive) return;
        activeCount++;
        if (
          this.ball.x >= b.x && this.ball.x <= b.x + b.w &&
          this.ball.y >= b.y && this.ball.y <= b.y + b.h
        ) {
          b.alive = false;
          this.ball.vy *= -1;
          this.score += 20;
          synth.sfxCoin();
        }
      });

      if (activeCount === 0) {
        this.spawnBricks();
        synth.sfxPowerup();
      }

      if (this.ball.y > 144) {
        this.gameOver = true;
        synth.sfxExplosion();
      }
    }

    render(ctx, p) {
      ctx.fillStyle = p.lightest;
      ctx.fillRect(0, 0, 160, 144);

      ctx.fillStyle = p.darkest;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(`SCORE:${this.score}`, 8, 10);

      ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);

      ctx.fillRect(this.ball.x - this.ball.r, this.ball.y - this.ball.r, this.ball.r * 2, this.ball.r * 2);

      this.bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = p.darkest;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = p.light;
        ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
      });

      if (this.gameOver) {
        ctx.fillStyle = p.darkest;
        ctx.fillRect(20, 50, 120, 44);
        ctx.fillStyle = p.lightest;
        ctx.fillRect(22, 52, 116, 40);

        ctx.fillStyle = p.darkest;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', 35, 68);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('PRESS START', 34, 82);
      }
    }

    handleInput(action) {
      if (this.gameOver) {
        if (action === 'start' || action === 'a') this.reset();
        return;
      }
      switch (action) {
        case 'left': this.paddle.x = Math.max(4, this.paddle.x - 8); break;
        case 'right': this.paddle.x = Math.min(160 - this.paddle.w - 4, this.paddle.x + 8); break;
        case 'start': this.reset(); break;
      }
    }
  }

  const games = {
    tetris: new TetrisGame(),
    space: new SpaceGame(),
    monster: new MonsterGame(),
    bricks: new BricksGame()
  };

  let isBooting = false;
  let bootY = -20;

  function runBootSequence(onComplete) {
    isBooting = true;
    bootY = -15;

    function step() {
      const p = getPalette();
      ctx.fillStyle = p.lightest;
      ctx.fillRect(0, 0, 160, 144);

      ctx.fillStyle = p.darkest;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Nintendo', 80, bootY);
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText('®', 132, bootY - 4);
      ctx.textAlign = 'start';

      bootY += 1.6;

      if (bootY < 72) {
        requestAnimationFrame(step);
      } else {
        synth.sfxPowerOnChime();
        setTimeout(() => {
          isBooting = false;
          if (onComplete) onComplete();
        }, 700);
      }
    }
    requestAnimationFrame(step);
  }

  function gameLoop() {
    if (isPoweredOn && !isBooting) {
      const p = getPalette();
      const current = games[activeGame];
      if (current) {
        current.update();
        current.render(ctx, p);
      }
    }
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  const powerSwitch = document.getElementById('powerSwitch');
  function togglePower(state) {
    if (state !== undefined) {
      isPoweredOn = state;
    } else {
      isPoweredOn = !isPoweredOn;
    }

    synth.sfxClick();

    if (isPoweredOn) {
      consoleEl.classList.add('power-on');
      lcdScreen.classList.remove('is-off');
      runBootSequence();
    } else {
      consoleEl.classList.remove('power-on');
      lcdScreen.classList.add('is-off');
      const p = getPalette();
      ctx.fillStyle = '#222818';
      ctx.fillRect(0, 0, 160, 144);
    }
  }

  if (powerSwitch) {
    powerSwitch.addEventListener('click', () => togglePower());
  }

  togglePower(true);
  animationFrameId = requestAnimationFrame(gameLoop);

  function triggerGameAction(action) {
    if (!isPoweredOn || isBooting) return;
    const current = games[activeGame];
    if (current && current.handleInput) {
      current.handleInput(action);
    }
  }

  const controlButtons = [
    { id: 'btnUp', action: 'up' },
    { id: 'btnDown', action: 'down' },
    { id: 'btnLeft', action: 'left' },
    { id: 'btnRight', action: 'right' },
    { id: 'btnA', action: 'a' },
    { id: 'btnB', action: 'b' },
    { id: 'btnSelect', action: 'select' },
    { id: 'btnStart', action: 'start' }
  ];

  controlButtons.forEach(btnObj => {
    const el = document.getElementById(btnObj.id);
    if (el) {
      const press = (e) => {
        e.preventDefault();
        el.classList.add('pressed');
        synth.sfxButtonPress();
        triggerGameAction(btnObj.action);
      };
      const release = (e) => {
        e.preventDefault();
        el.classList.remove('pressed');
      };
      el.addEventListener('mousedown', press);
      el.addEventListener('mouseup', release);
      el.addEventListener('mouseleave', release);
      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release, { passive: false });
    }
  });

  const keyMap = {
    'ArrowUp': 'up',
    'KeyW': 'up',
    'ArrowDown': 'down',
    'KeyS': 'down',
    'ArrowLeft': 'left',
    'KeyA': 'left',
    'ArrowRight': 'right',
    'KeyD': 'right',
    'KeyZ': 'a',
    'KeyK': 'a',
    'Space': 'a',
    'KeyX': 'b',
    'KeyJ': 'b',
    'Enter': 'start',
    'ShiftRight': 'select',
    'ShiftLeft': 'select'
  };

  const keyToBtnId = {
    'up': 'btnUp',
    'down': 'btnDown',
    'left': 'btnLeft',
    'right': 'btnRight',
    'a': 'btnA',
    'b': 'btnB',
    'start': 'btnStart',
    'select': 'btnSelect'
  };

  window.addEventListener('keydown', (e) => {
    
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    const action = keyMap[e.code];
    if (action) {
      e.preventDefault();
      const btnEl = document.getElementById(keyToBtnId[action]);
      if (btnEl) btnEl.classList.add('pressed');
      triggerGameAction(action);
    }
  });

  window.addEventListener('keyup', (e) => {
    const action = keyMap[e.code];
    if (action) {
      const btnEl = document.getElementById(keyToBtnId[action]);
      if (btnEl) btnEl.classList.remove('pressed');
    }
  });

  const cartButtons = document.querySelectorAll('.insert-cart-btn');
  const cartCards = document.querySelectorAll('.cartridge-card');

  function showToast(message) {
    const toast = document.getElementById('pixelToast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  }

  function insertCartridge(gameId, title) {
    synth.sfxCartridge();
    activeGame = gameId;

    if (cartridgeIndicator) {
      cartridgeIndicator.textContent = title;
    }

    cartCards.forEach(card => {
      if (card.dataset.game === gameId) {
        card.classList.add('active-cart');
      } else {
        card.classList.remove('active-cart');
      }
    });

    showToast(`INSERTED: ${title}!`);

    if (games[gameId] && games[gameId].reset) {
      games[gameId].reset();
    }

    if (isPoweredOn) {
      runBootSequence();
    }
  }

  cartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.cartridge-card');
      if (card) {
        const gameId = card.dataset.game;
        const title = card.dataset.title;
        insertCartridge(gameId, title);
      }
    });
  });

  const anatomyData = {
    cpu: {
      title: 'Sharp LR35902 8-bit CPU',
      badge: '4.194304 MHz Core',
      desc: 'A custom hybrid processor engineered by Sharp specifically for the Game Boy. It synthesizes features from both the iconic Zilog Z80 and Intel 8080 architectures. Operating at 4.19 MHz, it executed all game logic, sprite collisions, and system routines with extreme power efficiency.',
      fact: 'Gunpei Yokoi deliberately chose an 8-bit chip rather than a 16-bit processor to maximize battery endurance (giving 30+ hours on 4 AAs) and keep unit manufacturing costs below $90.'
    },
    screen: {
      title: 'STN Dot-Matrix LCD (160×144)',
      badge: 'Super-Twisted Nematic 2-bit',
      desc: 'A 2.6-inch reflective LCD panel capable of displaying 4 shades of olive-green grayscale. Because it lacked an active backlight, it consumed a mere fraction of the power of rival portable color screens (like Sega Game Gear and Atari Lynx) and was easily readable in direct sunlight.',
      fact: 'The legendary "pea-soup" green tint was not an intentional color choice, but the natural optical characteristic of early reflective STN liquid crystal matrices.'
    },
    audio: {
      title: 'DMG 4-Channel Sound Synth',
      badge: 'Custom Silicon PSG',
      desc: 'Two square-wave pulse channels with variable duty cycle and pitch envelope sweeps, one programmable 4-bit sample wave channel for rich melodic bass, and one white-noise channel for explosive percussion and snare drums.',
      fact: 'Legendary composer Hirokazu Tanaka pushed this modest 4-channel chip to its physical limits, creating the world-renowned Tetris Theme A (Korobeiniki) and Super Mario Land soundtracks.'
    },
    battery: {
      title: 'Power Unit: 4× AA Cells',
      badge: '35+ Hours Continuous Play',
      desc: 'While competing handhelds devoured 6 AA batteries in under 3 hours, Gunpei Yokoi’s optimization allowed the DMG-01 to run for up to 35-40 continuous hours on four standard alkaline batteries.',
      fact: 'This immense battery life was the primary reason parents bought the Game Boy for long family road trips, causing it to crush color-screen rivals 10-to-1 in global market sales.'
    },
    link: {
      title: 'Game Link Cable Ext Port',
      badge: '512 kbps Serial Interface',
      desc: 'A proprietary serial communications port on the side of the console allowing two DMG-01 systems to connect. It enabled head-to-head multiplayer Tetris and laid the architectural foundation for Satoshi Tajiri to invent Pokémon trading in 1996.',
      fact: 'Shigeru Miyamoto and Satoshi Tajiri envisioned Pokémon specifically because they saw the Link Cable not just as a competition wire, but as an interactive pipeline for trading living digital creatures.'
    },
    cartridge: {
      title: 'Game Pak ROM & MBC Chips',
      badge: 'Memory Bank Controllers',
      desc: 'Original cartridges held 32 KB to 8 MB of ROM. Advanced games utilized custom Memory Bank Controller (MBC) silicon inside the cartridge to bank-switch larger ROMs, hold save-game battery-backed SRAM, and include real-time hardware clocks (as seen in Pokémon Gold/Silver).',
      fact: 'The notch in the top right corner of every DMG cartridge mechanically locked the Game Boy power slider in the ON position, preventing players from accidentally ripping out the cartridge while powered on.'
    }
  };

  const partButtons = document.querySelectorAll('.part-btn');
  const partDetailTitle = document.getElementById('partDetailTitle');
  const partDetailBadge = document.getElementById('partDetailBadge');
  const partDetailText = document.getElementById('partDetailText');
  const partDetailFact = document.getElementById('partDetailFact');

  partButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      synth.sfxClick();
      partButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const partKey = btn.dataset.part;
      const data = anatomyData[partKey];
      if (data) {
        if (partDetailTitle) partDetailTitle.textContent = data.title;
        if (partDetailBadge) partDetailBadge.textContent = data.badge;
        if (partDetailText) partDetailText.textContent = data.desc;
        if (partDetailFact) partDetailFact.innerHTML = `<strong>★ HISTORICAL DOSSIER:</strong> ${data.fact}`;
      }
    });
  });

  const pianoKeys = document.querySelectorAll('.piano-key');
  const sfxButtons = document.querySelectorAll('.sfx-trigger-btn');
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  const soundMuteBtn = document.getElementById('soundMuteBtn');

  pianoKeys.forEach(key => {
    const playKey = () => {
      const freq = parseFloat(key.dataset.freq);
      synth.playTone(freq, 'square', 0.25, 0.15);
      key.classList.add('active');
    };
    const stopKey = () => key.classList.remove('active');

    key.addEventListener('mousedown', playKey);
    key.addEventListener('mouseup', stopKey);
    key.addEventListener('mouseleave', stopKey);
    key.addEventListener('touchstart', (e) => { e.preventDefault(); playKey(); });
    key.addEventListener('touchend', (e) => { e.preventDefault(); stopKey(); });
  });

  sfxButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sfx = btn.dataset.sfx;
      switch (sfx) {
        case 'coin': synth.sfxCoin(); break;
        case 'jump': synth.sfxJump(); break;
        case 'laser': synth.sfxLaser(); break;
        case 'explosion': synth.sfxExplosion(); break;
        case 'powerup': synth.sfxPowerup(); break;
        case '1up': synth.sfx1Up(); break;
        case 'chime': synth.sfxPowerOnChime(); break;
      }
    });
  });

  if (bgmToggleBtn) {
    bgmToggleBtn.addEventListener('click', () => {
      const isPlaying = synth.toggleBgm(bgmToggleBtn);
      showToast(isPlaying ? 'CHIPTUNE BGM: PLAYING ♪' : 'CHIPTUNE BGM: STOPPED');
    });
  }

  if (soundMuteBtn) {
    soundMuteBtn.addEventListener('click', () => {
      synth.isMuted = !synth.isMuted;
      soundMuteBtn.classList.toggle('active', !synth.isMuted);
      soundMuteBtn.textContent = synth.isMuted ? 'SFX: OFF' : 'SFX: ON';
      showToast(synth.isMuted ? 'ALL AUDIO MUTED' : 'AUDIO UNMUTED');
    });
  }

  const paletteSelector = document.getElementById('paletteSelect');
  const scanlinesToggle = document.getElementById('scanlinesToggle');
  const flickerToggle = document.getElementById('flickerToggle');

  if (paletteSelector) {
    paletteSelector.addEventListener('change', (e) => {
      synth.sfxClick();
      const val = e.target.value;
      if (val === 'classic') {
        document.body.removeAttribute('data-palette');
      } else {
        document.body.setAttribute('data-palette', val);
      }
      showToast(`PALETTE: ${val.toUpperCase()}`);
    });
  }

  if (scanlinesToggle) {
    scanlinesToggle.addEventListener('click', () => {
      synth.sfxClick();
      document.body.classList.toggle('scanlines-off');
      const isOn = !document.body.classList.contains('scanlines-off');
      scanlinesToggle.classList.toggle('active', isOn);
      showToast(isOn ? 'CRT SCANLINES: ENABLED' : 'CRT SCANLINES: DISABLED');
    });
  }

  if (flickerToggle) {
    flickerToggle.addEventListener('click', () => {
      synth.sfxClick();
      document.body.classList.toggle('flicker-on');
      const isOn = document.body.classList.contains('flicker-on');
      flickerToggle.classList.toggle('active', isOn);
      showToast(isOn ? 'CRT FLICKER: ON' : 'CRT FLICKER: OFF');
    });
  }

  const quizData = [
    {
      q: '1. What was the central product design philosophy of Game Boy creator Gunpei Yokoi?',
      options: [
        'Cutting-edge specs at any financial cost',
        'Lateral Thinking with Withered Technology',
        '3D Virtual Reality Handheld Computing',
        'Cloud-streamed portable gaming'
      ],
      correct: 1,
      explanation: 'Gunpei Yokoi believed in using cheap, mature ("withered") technology in creative, lateral ways to keep hardware affordable and battery life long.'
    },
    {
      q: '2. Which world-famous puzzle game was bundled with the North American launch of the Game Boy in 1989?',
      options: [
        'Super Mario Land',
        'Tetris',
        'The Legend of Zelda',
        'Pokémon Red'
      ],
      correct: 1,
      explanation: 'Henk Rogers famously convinced Minoru Arakawa of Nintendo of America to bundle Tetris, stating: "If you want little boys to buy Game Boy, pack Mario. If you want everyone to buy it, pack Tetris."'
    },
    {
      q: '3. What was the native screen resolution of the original DMG-01 Dot Matrix LCD?',
      options: [
        '320 × 240 pixels',
        '256 × 224 pixels',
        '160 × 144 pixels',
        '128 × 128 pixels'
      ],
      correct: 2,
      explanation: 'The Game Boy screen featured exactly 160 horizontal by 144 vertical pixels with 2-bit grayscale depth (4 olive green shades).'
    },
    {
      q: '4. During the 1990-1991 Gulf War, a Game Boy survived a barracks bombing and still ran which game?',
      options: [
        'Tetris',
        'Metroid II',
        'Kirby’s Dream Land',
        'DuckTales'
      ],
      correct: 0,
      explanation: 'A US soldier’s Game Boy survived a bomb blast that melted the outer casing and charred the motherboard. It was put on display in Nintendo World NYC running Tetris flawlessly!'
    },
    {
      q: '5. How many total lifetime units did the Game Boy & Game Boy Color family sell worldwide?',
      options: [
        'About 25 million units',
        'Around 62 million units',
        'Over 118 million units',
        'Roughly 45 million units'
      ],
      correct: 2,
      explanation: 'The original Game Boy line sold 118.69 million units worldwide, reigning supreme as an uncontested juggernaut for over a decade.'
    }
  ];

  let currentQuizIdx = 0;
  let quizScore = 0;

  const quizQuestionEl = document.getElementById('quizQuestion');
  const quizOptionsContainer = document.getElementById('quizOptions');
  const quizCounterEl = document.getElementById('quizCounter');
  const quizScoreEl = document.getElementById('quizScore');
  const quizFeedbackEl = document.getElementById('quizFeedback');
  const quizFeedbackText = document.getElementById('quizFeedbackText');
  const quizNextBtn = document.getElementById('quizNextBtn');

  function loadQuizQuestion(idx) {
    if (idx >= quizData.length) {
      
      quizQuestionEl.textContent = `★ QUIZ COMPLETE! FINAL SCORE: ${quizScore} / ${quizData.length} ★`;
      quizOptionsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="font-size: 1.1rem; color: #ffcc00; margin-bottom: 1rem;">
            ${quizScore >= 4 ? 'RANK: MASTER 8-BIT ARCHIVIST! 🏆' : 'RANK: RETRO NOVICE! KEEP EXPLORING! 👾'}
          </p>
          <button class="pixel-btn pixel-btn-primary" id="restartQuizBtn">RESTART TRIVIA QUIZ</button>
        </div>
      `;
      quizFeedbackEl.classList.remove('show');
      document.getElementById('restartQuizBtn').addEventListener('click', () => {
        currentQuizIdx = 0;
        quizScore = 0;
        loadQuizQuestion(0);
      });
      return;
    }

    const item = quizData[idx];
    quizCounterEl.textContent = `QUESTION ${idx + 1} OF ${quizData.length}`;
    quizScoreEl.textContent = `SCORE: ${quizScore}`;
    quizQuestionEl.textContent = item.q;
    quizOptionsContainer.innerHTML = '';
    quizFeedbackEl.classList.remove('show');

    item.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span>[${String.fromCharCode(65 + optIdx)}]</span> ${optText}`;
      btn.addEventListener('click', () => selectQuizAnswer(optIdx, btn, item));
      quizOptionsContainer.appendChild(btn);
    });
  }

  function selectQuizAnswer(selectedIndex, clickedBtn, item) {
    const allBtns = quizOptionsContainer.querySelectorAll('.quiz-option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (selectedIndex === item.correct) {
      clickedBtn.classList.add('correct');
      quizScore++;
      quizScoreEl.textContent = `SCORE: ${quizScore}`;
      synth.sfxCoin();
      quizFeedbackText.innerHTML = `<strong>✔ CORRECT!</strong> ${item.explanation}`;
    } else {
      clickedBtn.classList.add('wrong');
      allBtns[item.correct].classList.add('correct');
      synth.sfxExplosion();
      quizFeedbackText.innerHTML = `<strong>✘ INCORRECT!</strong> ${item.explanation}`;
    }

    quizFeedbackEl.classList.add('show');
  }

  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      synth.sfxClick();
      currentQuizIdx++;
      loadQuizQuestion(currentQuizIdx);
    });
  }

  loadQuizQuestion(0);

  const konamiPattern = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  let konamiProgress = 0;

  window.addEventListener('keydown', (e) => {
    if (e.code === konamiPattern[konamiProgress]) {
      konamiProgress++;
      if (konamiProgress === konamiPattern.length) {
        
        document.body.classList.toggle('golden-edition');
        synth.sfx1Up();
        showToast('★ SECRET UNLOCKED: OVERCLOCKED GOLDEN EDITION! ★');
        konamiProgress = 0;
      }
    } else {
      konamiProgress = 0;
    }
  });

})();
