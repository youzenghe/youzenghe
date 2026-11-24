import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("profile removes rejected artwork and uses English except for the name", () => {
	const markdown = readFileSync(
		new URL("../README.md", import.meta.url),
		"utf8",
	);
	assert.doesNotMatch(
		markdown,
		/banner\.svg|assets\/projects|### Repositories/,
	);
	assert.ok(markdown.includes("HUEL"));
	assert.equal(markdown.match(/[\u3400-\u9fff]+/g)?.join(""), "尤赠贺");
	assert.ok(markdown.includes("languages.svg"));
	assert.ok(markdown.includes("stats.svg"));
	assert.ok(markdown.includes("streak.svg"));
});

test("streaks use consecutive dates and allow yesterday as the latest active day", async () => {
	const { calculateStreaks } = await import("../scripts/statistics.mjs");
	const days = [
		{ date: "2026-11-18", contributionCount: 1 },
		{ date: "2026-11-19", contributionCount: 2 },
		{ date: "2026-11-20", contributionCount: 0 },
		{ date: "2026-11-21", contributionCount: 3 },
		{ date: "2026-11-22", contributionCount: 1 },
		{ date: "2026-11-23", contributionCount: 1 },
		{ date: "2026-11-24", contributionCount: 0 },
	];
	assert.deepEqual(calculateStreaks(days, "2026-11-24"), {
		total: 8,
		current: 3,
		currentStart: "2026-11-21",
		currentEnd: "2026-11-23",
		longest: 3,
		longestStart: "2026-11-21",
		longestEnd: "2026-11-23",
	});
	assert.equal(calculateStreaks(days, "2026-11-26").current, 0);
	assert.equal(calculateStreaks([], "2026-11-24").total, 0);
	assert.equal(
		calculateStreaks([days[0], days[2], days[4]], "2026-11-22").longest,
		1,
	);
	assert.throws(
		() => calculateStreaks([days[0], days[0]], "2026-11-24"),
		/Duplicate/,
	);
	assert.throws(
		() =>
			calculateStreaks(
				[{ date: "2026-11-24", contributionCount: -1 }],
				"2026-11-24",
			),
		/Invalid/,
	);
});

test("language percentages aggregate bytes and keep every counted language", async () => {
	const { aggregateLanguages } = await import("../scripts/statistics.mjs");
	const result = aggregateLanguages([
		{ Java: 300, Python: 100 },
		{ Java: 100, HTML: 500 },
	]);
	assert.equal(result.totalBytes, 1000);
	assert.deepEqual(
		result.languages.map((l) => [l.name, l.bytes, l.percent]),
		[
			["HTML", 500, 50],
			["Java", 400, 40],
			["Python", 100, 10],
		],
	);
	assert.deepEqual(aggregateLanguages([{}]), { totalBytes: 0, languages: [] });
	assert.throws(() => aggregateLanguages([{ Java: -2 }]), /Invalid/);
});

test("stat cards support themes, safe labels and a factual update date", async () => {
	const { renderCards } = await import("../scripts/statistics.mjs");
	const data = {
		login: "a<&",
		updatedAt: "2026-11-24T14:00:00Z",
		from: "2025-11-25",
		to: "2026-11-24",
		stars: 4,
		commits: 8,
		prs: 2,
		issues: 1,
		repositories: 3,
		languages: {
			totalBytes: 400,
			languages: [{ name: "Java", bytes: 400, percent: 100 }],
		},
		streak: {
			total: 8,
			current: 2,
			currentStart: "2026-11-23",
			currentEnd: "2026-11-24",
			longest: 3,
			longestStart: "2026-02-01",
			longestEnd: "2026-02-03",
		},
	};
	for (const theme of ["light", "dark"]) {
		const cards = renderCards(data, theme);
		assert.equal(Object.keys(cards).length, 3);
		for (const svg of Object.values(cards)) {
			assert.match(svg, /<title/);
			assert.match(svg, /2026-11-24/);
			assert.doesNotMatch(svg, /<script|foreignObject/);
		}
		assert.match(cards.stats, /a&lt;&amp;/);
		assert.match(cards.streak, /Past 365 days/);
	}
});
