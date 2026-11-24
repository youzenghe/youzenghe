const dayMs = 86400000;
const dateValue = (value) => Date.parse(`${value}T00:00:00Z`);
const escapeXml = (value) =>
	String(value).replace(
		/[&<>"']/g,
		(c) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&apos;",
			})[c],
	);
const colors = {
	Java: "#b07219",
	Python: "#3572a5",
	HTML: "#e34c26",
	JavaScript: "#e8c33a",
	TypeScript: "#3178c6",
	CSS: "#7954c8",
	Vue: "#41b883",
	Astro: "#ef8542",
	Shell: "#89b84a",
	"C#": "#6e3994",
};

export function calculateStreaks(values, today) {
	const days = [...values]
		.filter((d) => d.date <= today)
		.sort((a, b) => a.date.localeCompare(b.date));
	let total = 0,
		run = 0,
		start = null,
		previous = null;
	const result = {
		total: 0,
		current: 0,
		currentStart: null,
		currentEnd: null,
		longest: 0,
		longestStart: null,
		longestEnd: null,
	};
	for (const day of days) {
		if (
			!Number.isSafeInteger(day.contributionCount) ||
			day.contributionCount < 0 ||
			!Number.isFinite(dateValue(day.date))
		)
			throw new Error("Invalid contribution day");
		if (previous && previous.date === day.date)
			throw new Error("Duplicate contribution date");
		total += day.contributionCount;
		if (day.contributionCount > 0) {
			if (
				!previous ||
				!previous.contributionCount ||
				dateValue(day.date) - dateValue(previous.date) !== dayMs
			) {
				run = 1;
				start = day.date;
			} else run++;
			if (run > result.longest) {
				result.longest = run;
				result.longestStart = start;
				result.longestEnd = day.date;
			}
			if (dateValue(today) - dateValue(day.date) <= dayMs) {
				result.current = run;
				result.currentStart = start;
				result.currentEnd = day.date;
			}
		} else run = 0;
		previous = day;
	}
	result.total = total;
	return result;
}

export function aggregateLanguages(tables) {
	const bytes = new Map();
	for (const table of tables)
		for (const [name, count] of Object.entries(table)) {
			if (!Number.isSafeInteger(count) || count < 0)
				throw new Error("Invalid language byte count");
			bytes.set(name, (bytes.get(name) || 0) + count);
		}
	const totalBytes = [...bytes.values()].reduce((a, b) => a + b, 0);
	return {
		totalBytes,
		languages: [...bytes]
			.filter(([, count]) => count > 0)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.map(([name, count]) => ({
				name,
				bytes: count,
				percent: (count / totalBytes) * 100,
			})),
	};
}

function themeColors(theme) {
	return theme === "dark"
		? {
				bg: "#0d1117",
				border: "#30363d",
				title: "#58a6ff",
				text: "#c9d1d9",
				muted: "#8b949e",
				track: "#233044",
				accent: "#ff9f43",
			}
		: {
				bg: "#ffffff",
				border: "#d0d7de",
				title: "#2f81f7",
				text: "#434d58",
				muted: "#697580",
				track: "#e4edf8",
				accent: "#fb8c00",
			};
}

function text(x, y, value, size = 14, fill, extra = "") {
	return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${escapeXml(value)}</text>`;
}

function shell(width, height, title, body, c) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${escapeXml(title)}</title><rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="8" fill="${c.bg}" stroke="${c.border}"/><g font-family="Verdana, DejaVu Sans, sans-serif">${body}</g></svg>\n`;
}

export function renderCards(data, theme = "light") {
	const c = themeColors(theme),
		n = (v) => Number(v).toLocaleString("en-US");
	const updated = `Updated ${data.updatedAt.slice(0, 16).replace("T", " ")} UTC`;
	let languages = data.languages.languages.slice(0, 5);
	if (data.languages.languages.length > 5)
		languages.push({
			name: "Other",
			percent: data.languages.languages
				.slice(5)
				.reduce((a, b) => a + b.percent, 0),
		});
	let body = text(
		24,
		36,
		"Most Used Languages",
		22,
		c.title,
		'font-weight="600"',
	);
	let offset = 24;
	for (const l of languages) {
		const w = l.percent * 4.52;
		body += `<rect x="${offset.toFixed(2)}" y="61" width="${w.toFixed(2)}" height="10" fill="${colors[l.name] || "#93a1af"}"/>`;
		offset += w;
	}
	if (!languages.length)
		body += text(24, 108, "No language data available", 14, c.muted);
	for (const [i, l] of languages.entries()) {
		const x = i % 2 ? 265 : 24,
			y = 108 + Math.floor(i / 2) * 31;
		body += `<circle cx="${x + 5}" cy="${y - 5}" r="5" fill="${colors[l.name] || "#93a1af"}"/>`;
		body += text(x + 18, y, `${l.name} ${l.percent.toFixed(2)}%`, 13, c.text);
	}
	body +=
		text(24, 213, "Source bytes / owned public non-fork repos", 10, c.muted) +
		text(24, 234, updated, 10, c.muted);
	const languageCard = shell(500, 254, "Most Used Languages", body, c);
	body = text(
		24,
		36,
		`${data.login}'s GitHub Stats`,
		21,
		c.title,
		'font-weight="600"',
	);
	const rows = [
		["Stars (owned repos)", data.stars],
		["Commits (past 365 days)", data.commits],
		["PRs (past 365 days)", data.prs],
		["Issues (past 365 days)", data.issues],
	];
	for (const [i, [label, value]] of rows.entries()) {
		const y = 82 + i * 31;
		body += `<circle cx="29" cy="${y - 5}" r="4" fill="none" stroke="${c.title}" stroke-width="1.6"/>`;
		body +=
			text(42, y, label, 12, c.text) +
			text(310, y, n(value), 15, c.text, 'text-anchor="end" font-weight="600"');
	}
	body += `<circle cx="409" cy="121" r="46" fill="none" stroke="${c.track}" stroke-width="7"/><path d="M409 75 A46 46 0 0 1 455 121" fill="none" stroke="${c.title}" stroke-width="7" stroke-linecap="round"/>`;
	body +=
		text(
			409,
			130,
			n(data.repositories),
			30,
			c.text,
			'text-anchor="middle" font-weight="700"',
		) +
		text(409, 182, "Repos with commits", 10, c.muted, 'text-anchor="middle"');
	body +=
		text(
			24,
			213,
			`Public GitHub data / ${data.from} to ${data.to}`,
			10,
			c.muted,
		) + text(24, 234, updated, 10, c.muted);
	const statsCard = shell(500, 254, `${data.login}'s GitHub Stats`, body, c);
	body = text(24, 35, "Contribution Streak", 22, c.title, 'font-weight="600"');
	body += `<path d="M332 59V188M666 59V188" stroke="${c.border}"/>`;
	body +=
		text(
			167,
			107,
			n(data.streak.total),
			42,
			c.text,
			'text-anchor="middle" font-weight="700"',
		) +
		text(167, 144, "Total Contributions", 16, c.text, 'text-anchor="middle"') +
		text(
			167,
			176,
			`${data.from} — ${data.to}`,
			11,
			c.muted,
			'text-anchor="middle"',
		);
	body += `<circle cx="500" cy="108" r="45" fill="none" stroke="${c.accent}" stroke-width="6"/>`;
	body +=
		text(
			500,
			121,
			n(data.streak.current),
			36,
			c.text,
			'text-anchor="middle" font-weight="700"',
		) +
		text(
			500,
			174,
			"Current Streak",
			16,
			c.accent,
			'text-anchor="middle" font-weight="600"',
		) +
		text(
			500,
			200,
			data.streak.current
				? `${data.streak.currentStart} — ${data.streak.currentEnd}`
				: "No active streak",
			11,
			c.muted,
			'text-anchor="middle"',
		);
	body +=
		text(
			833,
			107,
			n(data.streak.longest),
			42,
			c.text,
			'text-anchor="middle" font-weight="700"',
		) +
		text(833, 144, "Longest Streak", 16, c.text, 'text-anchor="middle"') +
		text(
			833,
			176,
			data.streak.longest
				? `${data.streak.longestStart} — ${data.streak.longestEnd}`
				: "No contributions in this period",
			11,
			c.muted,
			'text-anchor="middle"',
		);
	body += text(24, 230, `Past 365 days / UTC / ${updated}`, 11, c.muted);
	return {
		languages: languageCard,
		stats: statsCard,
		streak: shell(1000, 254, "Contribution Streak", body, c),
	};
}

export async function collectStatistics(login, token, now = new Date()) {
	if (!/^[a-zA-Z0-9-]+$/.test(login)) throw new Error("Invalid GitHub account");
	const request = async (path, options = {}) => {
		const response = await fetch(`https://api.github.com${path}`, {
			...options,
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "github-profile-public-statistics",
				Authorization: `Bearer ${token}`,
				...options.headers,
			},
			signal: AbortSignal.timeout(30000),
		});
		if (!response.ok)
			throw new Error(`GitHub statistics request failed (${response.status})`);
		const result = await response.json();
		if (result.errors) throw new Error("GitHub statistics query is incomplete");
		return result;
	};
	const repos = [];
	for (let page = 1; ; page++) {
		const rows = await request(
			`/users/${login}/repos?type=owner&per_page=100&page=${page}`,
		);
		repos.push(...rows.filter((r) => !r.private && !r.fork));
		if (rows.length < 100) break;
	}
	const tables = [];
	for (const repo of repos)
		tables.push(await request(`/repos/${repo.full_name}/languages`));
	const to = now.toISOString(),
		date = to.slice(0, 10),
		from = new Date(dateValue(date) - 364 * dayMs).toISOString();
	const result = await request("/graphql", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query:
				"query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){totalCommitContributions totalPullRequestContributions totalIssueContributions totalRepositoriesWithContributedCommits contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}",
			variables: { login, from, to },
		}),
	});
	const contribution = result.data?.user?.contributionsCollection;
	if (!contribution) throw new Error("GitHub contribution data unavailable");
	const days = contribution.contributionCalendar.weeks
		.flatMap((w) => w.contributionDays)
		.filter((d) => d.date >= from.slice(0, 10) && d.date <= date);
	return {
		login,
		updatedAt: to,
		from: from.slice(0, 10),
		to: date,
		stars: repos.reduce((a, r) => a + r.stargazers_count, 0),
		commits: contribution.totalCommitContributions,
		prs: contribution.totalPullRequestContributions,
		issues: contribution.totalIssueContributions,
		repositories: contribution.totalRepositoriesWithContributedCommits,
		languages: aggregateLanguages(tables),
		streak: calculateStreaks(days, date),
	};
}
