// Writes src/data/github.json with the past year of GitHub contributions.
// Runs in CI before the build (GITHUB_TOKEN from the workflow). Locally:
//   GITHUB_TOKEN=$(gh auth token) npm run stats:github
// Without a token it keeps the committed snapshot so builds never fail on this.
import { writeFileSync } from 'node:fs'

const LOGIN = 'clevernyyyy'
const OUT = new URL('../src/data/github.json', import.meta.url)
const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.warn('fetch-github: no GITHUB_TOKEN, keeping existing src/data/github.json')
  process.exit(0)
}

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
})
const body = await res.json()
const calendar = body?.data?.user?.contributionsCollection?.contributionCalendar
if (!res.ok || !calendar) {
  console.warn('fetch-github: request failed, keeping existing snapshot', res.status, JSON.stringify(body.errors ?? body))
  process.exit(0)
}

const days = calendar.weeks.flatMap((w) =>
  w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 })),
)

let longestStreak = 0
let run = 0
for (const d of days) {
  run = d.count > 0 ? run + 1 : 0
  longestStreak = Math.max(longestStreak, run)
}

writeFileSync(
  OUT,
  JSON.stringify({ login: LOGIN, total: calendar.totalContributions, longestStreak, updated: new Date().toISOString(), days }) + '\n',
)
console.log(`fetch-github: ${calendar.totalContributions} contributions, longest streak ${longestStreak} days`)
