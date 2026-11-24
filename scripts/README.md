# Profile maintenance

`README.md` is shown on the `youzenghe` GitHub profile because this public repository has the same name as the account. Update its text and project links directly.

Run the local checks with:

```bash
node --test tests/*.test.mjs
```

The contribution animation workflow runs daily at 01:00 UTC (09:00 Asia/Shanghai), on pushes to `main`, and through manual dispatch. It generates light and dark SVGs from public contributions and publishes only to this repository's `output` branch. No personal access token is required.

To update it manually, open Actions → **Update contribution animation** → **Run workflow**. GitHub may disable scheduled workflows in inactive public repositories after 60 days; re-enable the workflow if that happens. The SVG is an animation, not an interactive game.

The avatar is a supplied local image. Technology logos remain subject to their respective trademark rules. The local Devicon icon-source license is in `assets/licenses/`.
