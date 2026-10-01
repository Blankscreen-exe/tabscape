// @ts-check
/**
 * Rain sound generated live in the browser (Web Audio): filtered noise + random droplet ticks.
 * No audio files. Never autoplays — browsers require a click first.
 */

/** @typedef {{ volume: number, storm: number }} RainData */

/** @type {import("../../../core/contracts.js").WidgetDef} */
export default {
  apiVersion: 1,
  id: "rainsound",
  name: "Rain Sound",
  description: "Gentle to stormy rain, generated in your browser.",
  css: "widget.css",
  size: { w: 4, h: 3 },
  bestWith: ["lofi-rain"],
  data: { volume: 0.5, storm: 0.3 },
  settings: [
    { key: "title", label: "Title", type: "text", default: "Rain sound" },
  ],

  render(el, ctx) {
    el.innerHTML = `
      <h3 class="rs-title"></h3>
      <button class="rs-play"><span class="rs-ico">▶</span><span class="rs-txt">Play rain</span></button>
      <label class="rs-row">vol <input type="range" class="rs-vol" min="0" max="1" step="0.01"></label>
      <label class="rs-row">storm <input type="range" class="rs-storm" min="0" max="1" step="0.01"></label>
      <small class="rs-note">made live in your browser · no audio files</small>`;
    /** @type {HTMLElement} */ (el.querySelector(".rs-title")).textContent = ctx.settings.title;
    const q = (/** @type {string} */ s) => /** @type {HTMLInputElement} */ (el.querySelector(s));
    const vol = q(".rs-vol"), storm = q(".rs-storm"), play = q(".rs-play");

    /** @type {AudioContext | null} */
    let audio = null;
    /** @type {GainNode | null} */
    let master = null, noiseGain = null;
    let playing = false;

    ctx.data.watch((/** @type {RainData} */ d) => {
      vol.value = String(d.volume); storm.value = String(d.storm);
      if (master) master.gain.value = d.volume;
      if (noiseGain) noiseGain.gain.value = .6 + d.storm;
    });

    function start() {
      const d = /** @type {RainData} */ (ctx.data.get());
      audio = new AudioContext();
      master = audio.createGain(); master.gain.value = d.volume; master.connect(audio.destination);
      // brown-ish noise buffer
      const len = audio.sampleRate * 2, buf = audio.createBuffer(1, len, audio.sampleRate), data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; data[i] = last * 3.5 + w * .08; }
      const src = audio.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = audio.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
      noiseGain = audio.createGain(); noiseGain.gain.value = .6 + d.storm;
      src.connect(lp).connect(noiseGain).connect(master); src.start();
      const drip = () => {
        if (!audio || audio.state === "closed" || !master) return;
        if (audio.state === "running") {
          const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
          o.frequency.value = 1800 + Math.random() * 2500;
          g.gain.setValueAtTime(.04 + Math.random() * .04, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
          o.connect(g).connect(master); o.start(t); o.stop(t + .06);
        }
        ctx.after(40 + Math.random() * (300 - /** @type {RainData} */ (ctx.data.get()).storm * 240), drip);
      };
      drip();
    }

    ctx.listen(play, "click", async () => {
      if (!playing) { if (!audio) start(); else await audio.resume(); }
      else await audio?.suspend();
      playing = !playing;
      play.classList.toggle("on", playing);
      /** @type {HTMLElement} */ (el.querySelector(".rs-ico")).textContent = playing ? "❚❚" : "▶";
      /** @type {HTMLElement} */ (el.querySelector(".rs-txt")).textContent = playing ? "Pause rain" : "Play rain";
    });
    ctx.listen(vol, "input", () => ctx.data.update((/** @type {RainData} */ d) => { d.volume = Number(vol.value); }));
    ctx.listen(storm, "input", () => ctx.data.update((/** @type {RainData} */ d) => { d.storm = Number(storm.value); }));
    ctx.cleanup(() => { audio?.close(); audio = null; });
  },
};
