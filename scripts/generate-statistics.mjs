import { mkdir, writeFile } from "node:fs/promises";
import { collectStatistics, renderCards } from "./statistics.mjs";

const login = process.env.PROFILE_USER || "youzenghe";
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token)
	throw new Error(
		"GitHub token is required for authenticated statistics queries",
	);
const data = await collectStatistics(login, token);
await mkdir("dist", { recursive: true });
for (const theme of ["light", "dark"]) {
	const suffix = theme === "dark" ? "-dark" : "";
	for (const [name, svg] of Object.entries(renderCards(data, theme)))
		await writeFile(`dist/${name}${suffix}.svg`, svg);
}
await writeFile("dist/statistics.json", JSON.stringify(data, null, 2) + "\n");
console.log(
	`Generated public statistics for ${login}; updated ${data.updatedAt}`,
);
