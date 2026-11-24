import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("profile uses the approved project set and Gmail only", () => {
	const markdown = read("README.md");
	for (const repo of ["ClassicSage", "bot", "ContractReview2", "TangShiSongCi"]) {
		assert.ok(markdown.includes(`https://github.com/youzenghe/${repo}`), repo);
	}
	assert.ok(markdown.includes("mailto:skyberggrenzmb3391@gmail.com"));
	assert.doesNotMatch(markdown, /PoetryNest|yzh1019\.top|youzenghe\.github\.io|GalGame|博客|次元日记|游戏|bilibili|qq\.com|163\.com/i);
	assert.doesNotMatch(markdown, /komarev|shields\.io|vercel\.app|github-profile-trophy/);
});

test("all non-generated README images exist locally and have alt text", () => {
	const markdown = read("README.md");
	for (const match of markdown.matchAll(/<img\s+[^>]+>/g)) {
		assert.match(match[0], /alt="[^"]+"/);
		const src = match[0].match(/src="([^"]+)"/)[1];
		if (src.startsWith("https://raw.githubusercontent.com/")) continue;
		assert.equal(fs.existsSync(new URL(`../${src}`, import.meta.url)), true, src);
	}
	assert.ok(markdown.includes("assets/avatar.png"));
	assert.ok(markdown.includes("prefers-color-scheme: dark"));
});

test("snake workflow generates both themes and publishes only the profile output branch", () => {
	const source = read(".github/workflows/snake.yml");
	assert.match(source, /schedule:/);
	assert.match(source, /workflow_dispatch:/);
	assert.match(source, /contents: write/);
	assert.match(source, /Platane\/snk\/svg-only@[a-f0-9]{40}/);
	assert.match(source, /github_user_name: \$\{\{ github\.repository_owner \}\}/);
	assert.match(source, /snake\.svg/);
	assert.match(source, /snake-dark\.svg/);
	assert.match(source, /branch: output/);
	assert.match(source, /if: github\.repository == 'youzenghe\/youzenghe'/);
	assert.doesNotMatch(source, /youzenghe\.github\.io|GH_PAT|PERSONAL_TOKEN/);
});

test("banner is safe static SVG with identity and no external dependencies", () => {
	const source = read("assets/banner.svg");
	assert.match(source, /youzenghe/);
	assert.match(source, /<title(?:\s[^>]*)?>/);
	assert.doesNotMatch(source, /<script|foreignObject|https?:\/\/[^" ]+\.(?:png|jpg|svg)|<image\b/);
});
