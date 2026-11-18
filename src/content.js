// Central place for links, images and copy.
// Images were generated with Higgsfield. To host them yourself, save them into
// public/assets/ and change these to '/assets/hero.png' etc.
export const IMAGES = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_3Hs2wRAhT9DncV0lApoXxWtztzX/hf_20261118_100533_ece4138f-c2b7-4b9f-83ab-d2d6deef09c0.png',
  logo: './assets/dragon-logo.png',  // official DragonDaw logo
  mark: './assets/dragon-mark.png',  // small dragon head for nav, footer, favicon
  studio: 'https://d8j0ntlcm91z4.cloudfront.net/user_3Hs2wRAhT9DncV0lApoXxWtztzX/hf_20261118_100538_68be9ac4-a535-49e8-9d66-751dd37f703a.png',
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

export const FEATURES = [
  { icon: '●', title: 'Record', text: 'Multitrack audio recording with low-latency monitoring. Capture vocals, guitars and anything with a mic.' },
  { icon: '▦', title: 'Make Beats', text: 'A step sequencer and piano roll for drums, melodies and basslines. Sketch a groove in seconds.' },
  { icon: '⫶', title: 'Mix', text: 'A full mixer with faders, panning, sends and effect chains, so every track sits where it belongs.' },
  { icon: '◆', title: 'Master', text: 'Finish your track with mastering tools and export it ready for streaming, without leaving the app.' },
]

export const STEPS = [
  { n: '01', title: 'Spark', text: 'Open a project and start a beat or hit record. No setup, no paywall.' },
  { n: '02', title: 'Shape', text: 'Arrange clips on the timeline, edit in the piano roll and layer your sounds.' },
  { n: '03', title: 'Polish', text: 'Mix with the full mixer, then master and export your song.' },
]

export const FAQ = [
  { q: 'Is DragonDaw really free?', a: 'Yes. DragonDaw is free and open source, with no subscriptions, trials or locked features.' },
  { q: 'Which platforms are supported?', a: 'DragonDaw is developed on Windows first. Check the GitHub repository for the current platform status.' },
  { q: 'Can I contribute?', a: 'Absolutely. Open an issue, discuss an idea or submit a pull request on GitHub.' },
  { q: 'How do I get support?', a: 'Email us at', email: true },
  { q: 'Why Rust?', a: 'Rust gives the audio engine speed close to C++ while preventing whole classes of memory bugs, which means fewer crashes in the middle of a session.' },
]
