class AudioEngine {
  private ctx: AudioContext | null = null;
  private lastEraseTime = 0;

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.warn("Failed to resume audio:", err));
    }
  }

  /**
   * Play dynamic double-thump heartbeat (lub-dub)
   * @param stressRatio - Between 0.0 (low stress) and 1.0 (maximum panic/deadlines)
   */
  playHeartbeat(stressRatio: number) {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Play a low, heavy bass thump
    const playThump = (time: number, frequency: number, gainValue: number) => {
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      // Heartbeat is extremely low pitch (45Hz - 60Hz) that decays rapidly
      osc.frequency.setValueAtTime(frequency, time);
      osc.frequency.exponentialRampToValueAtTime(10, time + 0.14);
      
      // Decay shape
      gainNode.gain.setValueAtTime(gainValue * 0.7, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      
      osc.start(time);
      osc.stop(time + 0.15);
    };

    // Calculate volume: louder at high stress
    const volumeMultiplier = 0.4 + stressRatio * 0.6; // 0.4 to 1.0
    
    // Thump 1: Lub (lower and deeper pitch)
    playThump(now, 45, volumeMultiplier);
    
    // Thump 2: Dub (slightly higher pitch, slightly delayed & softer)
    // Delay decreases slightly as pulse speeds up
    const delay = 0.14 - (stressRatio * 0.03); 
    playThump(now + delay, 50, volumeMultiplier * 0.85);
  }

  /**
   * Play pencil scribbling effect (high-pass band noise burst)
   */
  playScribble() {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    try {
      const bufferSize = this.ctx.sampleRate * 0.08; // 80ms duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Fill with noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Pencil shading sound is dry scratching, so focus on midrange frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(5, now);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(now);
      noise.stop(now + 0.1);
    } catch (e) {
      // Graceful degradation
    }
  }

  /**
   * Play soft friction sound for eraser rubbing
   */
  playErase() {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastEraseTime < 0.06) return; // Debounce to prevent overlapping overload
    this.lastEraseTime = now;

    try {
      // Soft rustle friction
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Rubber eraser sound has a lot of low-to-mid dampening friction
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.08);
    } catch (e) {
      // Graceful fallback
    }
  }

  /**
   * Play dramatic fail sound effect
   */
  playFailure() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.8);
      
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {}
  }

  /**
   * Play euphoric success chime
   */
  playSuccess() {
    this.init();
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5 (ascending arpeggio!)
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        
        gain.gain.setValueAtTime(0.15, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.4);
        
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.45);
      });
    } catch (e) {}
  }
}

export const audioEngine = new AudioEngine();
