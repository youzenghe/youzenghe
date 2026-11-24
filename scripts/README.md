# Profile maintenance

`README.md` is shown on the `youzenghe` GitHub profile because this public repository has the same name as the account. Update its text and project links directly.

Run the local checks with:

```bash
node --test tests/*.test.mjs
```

The profile workflow runs daily at 01:00 UTC (09:00 Asia/Shanghai), on pushes to `main`, and through manual dispatch. It generates light and dark statistics cards and contribution animations, publishing only to this repository's `output` branch. No personal access token is required.

To update it manually, open Actions → **Update profile statistics** → **Run workflow**. GitHub may disable scheduled workflows in inactive public repositories after 60 days; re-enable the workflow if that happens. The snake SVG is an animation, not an interactive game.

Statistics are timestamped snapshots, not live counters. Language shares use GitHub language bytes from owned public non-fork repositories and do not measure proficiency. Contribution counts, commit/PR/issue counts and streaks cover the displayed past-365-day UTC window. A current streak may end yesterday when today has no contributions yet. The repository-count ring is a decorative count display, not a performance rank. API errors fail the job rather than generate fake zero values; the last successful output remains available.

`scripts/generate-statistics.mjs` collects GitHub public repository metadata and contribution calendar data with the repository-scoped workflow token. `scripts/statistics.mjs` aggregates and renders the cards. It does not fetch or publish private repository contents. `output/statistics.json` contains the public snapshot behind the displayed numbers.

The avatar is a supplied local image. Technology logos remain subject to their respective trademark rules. The local Devicon icon-source license is in `assets/licenses/`.
