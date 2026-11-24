import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("profile removes all stats but retains icons, name and snake", () => {
	const markdown = read("README.md");
	assert.doesNotMatch(markdown, /GitHub Stats|statistics|(?:languages|stats|streak)(?:-dark)?\.svg|banner\.svg|assets\/projects/i);
	assert.match(markdown, /Club Lead/);
	assert.doesNotMatch(markdown, /President/);
	assert.match(markdown, /HUEL/);
	assert.equal(markdown.match(/[\u3400-\u9fff]+/g)?.join(""), "尤赠贺");
	assert.match(markdown, /assets\/icons\/java\.svg/);
	assert.match(markdown, /output\/snake-dark\.svg/);
});

test("contact uses a normal HTTPS Gmail compose link with the right recipient", () => {
	const markdown = read("README.md");
	const href = markdown.match(/href="(https:\/\/mail\.google\.com[^\"]+)"/)[1].replace(/&amp;/g,"&");
	const url = new URL(href);
	assert.equal(url.searchParams.get("to"), "skyberggrenzmb3391@gmail.com");
	assert.equal(url.searchParams.get("view"), "cm");
	assert.doesNotMatch(markdown, /mailto:|onclick=/);
});

test("only the snake generator remains and cleans stale output", () => {
	const workflow = read(".github/workflows/snake.yml");
	assert.doesNotMatch(workflow, /generate-statistics|PROFILE_USER|GH_TOKEN|statistics\.json/);
	assert.match(workflow, /clean: true/);
	for (const name of ["scripts/statistics.mjs","scripts/generate-statistics.mjs"])
		assert.equal(existsSync(new URL(`../${name}`, import.meta.url)), false);
});
