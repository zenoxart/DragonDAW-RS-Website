// Central place for links, images and copy.
// Images were generated with Higgsfield and are served from this site (public/assets).
export const IMAGES = {
  hero: './assets/hero.webp',
  logo: './assets/dragon-logo.webp',  // official DragonDaw logo
  mark: './assets/dragon-mark.webp',  // small dragon head for nav, footer, favicon
  studio: './assets/studio.webp',
}

export const LINKS = {
  github: 'https://github.com/zenoxart/DragonDAW-RS',
  repo: 'https://github.com/zenoxart/DragonDAW-RS',
  releases: 'https://github.com/zenoxart/DragonDAW-RS/releases',
  supportEmail: 'support@dragondaw.com',
}

export const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#opensource', label: 'Open Source' },
  { href: '#faq', label: 'FAQ' },
]

// Feature copy follows DragonDAW-RS docs/FEATURES.md – keep it in step with what the app really does.
export const FEATURES = [
  { icon: '●', title: 'Record', text: 'Multitrack audio recording with latency compensation, punch in/out, takes and comping. Plug in MIDI keyboards and controllers and play.' },
  { icon: '▦', title: 'Make Beats', text: 'Step sequencer, channel rack and a full piano roll with chords, arpeggiator and scale snap. Built-in sampler, synth and the Dragon Kit drums.' },
  { icon: '⫶', title: 'Mix', text: 'Mixer with sends, buses, sidechain and automation. Host your VST3 and CLAP plugins next to the stock EQ, compressor, reverb and delay.' },
  { icon: '◆', title: 'Master', text: 'Master with LUFS and true-peak meters, a spectrum analyser and reference-track comparison, then export WAV, FLAC, MP3 or stems.' },
]

// "Everything inside" list under the feature cards (all ✅ in docs/FEATURES.md)
export const FEATURE_LIST = [
  'VST3 & CLAP plugin hosting',
  'Crash-safe plugin scan',
  'Plugin delay compensation',
  'Piano roll & step sequencer',
  'Sampler, synth & drum pads',
  'Audio recording & comping',
  'MIDI input & MIDI learn',
  'Mixer with sends & sidechain',
  'Automation lanes & clips',
  'Time-stretch & pitch-shift',
  'BPM & key detection',
  'Chord tools & arpeggiator',
  'LUFS & true-peak metering',
  'Reference track compare',
  'Export WAV, FLAC, MP3 & stems',
  'MIDI import & export',
  'Autosave & crash recovery',
  'Rebindable shortcuts',
  'Click-through tutorials',
  'Quests, XP & levels',
]

export const STEPS = [
  { n: '01', title: 'Spark', text: 'Open a project and start a beat or hit record. No setup, no paywall.' },
  { n: '02', title: 'Shape', text: 'Arrange clips on the timeline, edit in the piano roll and layer your sounds.' },
  { n: '03', title: 'Polish', text: 'Mix with the full mixer, then master and export your song.' },
]

export const FAQ = [
  { q: 'Is DragonDaw really free?', a: 'Yes. DragonDaw is free and open source, with no subscriptions, trials or locked features.' },
  { q: 'Does DragonDaw support VST3 and CLAP plugins?', a: 'Yes. DragonDaw hosts VST3 and CLAP plugins with their own editors, scans them crash-safely and compensates plugin delay automatically. It also ships with its own EQ, compressor, reverb, delay and many more effects.' },
  { q: 'Can I record audio and use MIDI keyboards?', a: 'Yes. Record several tracks at once with latency compensation, punch in and out, and comp the best takes. MIDI keyboards and controllers work out of the box, and any knob can be mapped with MIDI learn.' },
  { q: 'Which formats can I export?', a: 'Export your song as WAV, FLAC or MP3, as separate stems, or as a MIDI file, with optional loudness normalisation.' },
  { q: 'Are there tutorials?', a: 'Yes. DragonDaw comes with interactive click-through tutorials, and the app itself guides you to its features step by step, so you can start making music right away.' },
  { q: 'Which platforms are supported?', a: 'DragonDaw runs on Windows (x64), macOS (Apple Silicon and Intel) and Linux (x64). Pick your system in the download section above.' },
  { q: 'Can I contribute?', a: 'Absolutely. Open an issue, discuss an idea or submit a pull request on GitHub.' },
  { q: 'How do I get support?', a: 'Email us at', email: true },
  { q: 'Why Rust?', a: 'Rust gives the audio engine speed close to C++ while preventing whole classes of memory bugs, which means fewer crashes in the middle of a session.' },
]
