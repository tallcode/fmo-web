// 8kHz PCM audio player in TypeScript
// Plays an ArrayBuffer of 16-bit PCM audio data directly.

interface AudioPlayerOptions {
  inputSampleRate?: number
}

export class AudioPlayer {
  private audioCtx: AudioContext | null = null
  private gainNode: GainNode | null = null
  private chainInput: GainNode | null = null
  private hpf: BiquadFilterNode | null = null
  private lpf: BiquadFilterNode | null = null
  private eqLow: BiquadFilterNode | null = null
  private eqMid: BiquadFilterNode | null = null
  private eqHigh: BiquadFilterNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private inputSampleRate: number

  constructor({ inputSampleRate = 8000 }: AudioPlayerOptions = {}) {
    this.inputSampleRate = inputSampleRate
  }

  private ensureAudio(): boolean {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      return true
    }
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }

      this.gainNode = this.audioCtx.createGain()
      this.gainNode.gain.value = 1
      this.gainNode.connect(this.audioCtx.destination)

      // Build processing chain
      this.chainInput = this.audioCtx.createGain()
      this.chainInput.gain.value = 1.0

      this.hpf = this.audioCtx.createBiquadFilter()
      this.hpf.type = 'highpass'
      this.hpf.frequency.value = 220
      this.hpf.Q.value = 0.5

      this.lpf = this.audioCtx.createBiquadFilter()
      this.lpf.type = 'lowpass'
      this.lpf.frequency.value = 3000
      this.lpf.Q.value = 0.5

      this.eqLow = this.audioCtx.createBiquadFilter()
      this.eqLow.type = 'lowshelf'
      this.eqLow.frequency.value = 180
      this.eqLow.gain.value = 0.5

      this.eqMid = this.audioCtx.createBiquadFilter()
      this.eqMid.type = 'peaking'
      this.eqMid.frequency.value = 1400
      this.eqMid.Q.value = 0.8
      this.eqMid.gain.value = 1.0

      this.eqHigh = this.audioCtx.createBiquadFilter()
      this.eqHigh.type = 'highshelf'
      this.eqHigh.frequency.value = 2600
      this.eqHigh.gain.value = 0.0

      this.compressor = this.audioCtx.createDynamicsCompressor()
      this.compressor.threshold.value = -22
      this.compressor.knee.value = 24
      this.compressor.ratio.value = 2.0
      this.compressor.attack.value = 0.006
      this.compressor.release.value = 0.30

      // Wire: input -> HPF -> LPF -> EQ(Low -> Mid -> High) -> Compressor -> Gain -> Destination
      this.chainInput.connect(this.hpf)
      this.hpf.connect(this.lpf)
      this.lpf.connect(this.eqLow)
      this.eqLow.connect(this.eqMid)
      this.eqMid.connect(this.eqHigh)
      this.eqHigh.connect(this.compressor)
      this.compressor.connect(this.gainNode)

      return true
    }
    catch (e) {
      console.error('Web Audio API is not supported in this browser', e)
      return false
    }
  }

  public get volume(): number {
    if (this.gainNode) {
      return this.gainNode.gain.value
    }
    return 1
  }

  public set volume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(2, value)) // Clamp volume
    }
  }

  public play(arrayBuffer: ArrayBuffer): void {
    if (!this.ensureAudio() || !this.audioCtx || !this.chainInput) {
      console.error('Audio context not available.')
      return
    }

    // Convert 16-bit PCM ArrayBuffer to Float32Array
    const view = new Int16Array(arrayBuffer)
    const float32Array = new Float32Array(view.length)
    for (let i = 0; i < view.length; i++) {
      float32Array[i] = view[i] / 32768
    }

    const audioBuffer = this.audioCtx.createBuffer(
      1, // numberOfChannels
      float32Array.length,
      this.inputSampleRate,
    )

    audioBuffer.copyToChannel(float32Array, 0)

    const source = this.audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.chainInput)
    source.start()
  }

  public stop(): void {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend()
    }
  }

  public destroy(): void {
    if (this.audioCtx) {
      this.audioCtx.close()
      this.audioCtx = null
      this.gainNode = null
      this.chainInput = null
      this.hpf = null
      this.lpf = null
      this.eqLow = null
      this.eqMid = null
      this.eqHigh = null
      this.compressor = null
    }
  }
}
