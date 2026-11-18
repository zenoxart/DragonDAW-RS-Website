// Updates the all-time download ledger (run by .github/workflows/download-stats.yml).
//
//   node scripts/update-ledger.mjs <path/to/downloads-ledger.json>
//
// Reads the ledger (or starts a new one), merges the current download counts of every
// DragonDAW-RS release file into it (highest count wins, deleted files are kept) and writes
// it back. Prints the all-time total. Exits with an error if GitHub can't be reached, so a
// broken run never overwrites the ledger with less data.

import { readFile, writeFile } from 'node:fs/promises'
import { fetchReleases, mergeLedger, ledgerTotal, DOWNLOAD_REPO } from '../src/lib/releases.js'

const file = process.argv[2]
if (!file) throw new Error('usage: node scripts/update-ledger.mjs <ledger.json>')

const before = JSON.parse(await readFile(file, 'utf8').catch(() => '{"assets":{}}'))
const releases = await fetchReleases({ repo: process.env.DOWNLOAD_REPO || DOWNLOAD_REPO, token: process.env.GITHUB_TOKEN })
const after = mergeLedger(before, releases)

const total = ledgerTotal(after)
const ledger = { repo: process.env.DOWNLOAD_REPO || DOWNLOAD_REPO, total, assets: after.assets }

// Only rewrite when a count or a file changed (lastSeen alone isn't worth a commit).
const strip = (l) => JSON.stringify(Object.entries(l.assets ?? {}).map(([id, a]) => [id, a.count]).sort())
if (strip(before) === strip(ledger) && before.total === total) {
  console.log(`unchanged: ${total} all-time downloads across ${Object.keys(ledger.assets).length} files`)
} else {
  await writeFile(file, JSON.stringify(ledger, null, 2) + '\n')
  console.log(`updated: ${ledgerTotal(before)} -> ${total} all-time downloads across ${Object.keys(ledger.assets).length} files`)
}
