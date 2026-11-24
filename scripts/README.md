# Profile maintenance

`README.md` is shown on the `youzenghe` GitHub profile because this public repository has the same name as the account. Update its text and project links directly.

Run the local checks with:

```bash
node --test tests/*.test.mjs
```

The contribution animation workflow runs daily at 01:00 UTC (09:00 Asia/Shanghai), on pushes to `main`, and through manual dispatch. It generates light and dark snake SVGs, publishing only to this repository's `output` branch. No personal access token is required.

To update it manually, open Actions → **Update contribution animation** → **Run workflow**. GitHub may disable scheduled workflows in inactive public repositories after 60 days; re-enable the workflow if that happens. The snake SVG is an animation, not an interactive game.

The Gmail contact link opens web compose with a prefilled recipient. It does not depend on an installed email client; visitors may need to sign in to Gmail. No message is sent automatically.

The avatar is a supplied local image. Technology logos remain subject to their respective trademark rules. The local Devicon icon-source license is in `assets/licenses/`.
