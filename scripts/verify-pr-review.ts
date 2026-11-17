import { readFileSync } from "node:fs";

const fail = (message: string): never => {
  throw new TypeError(message);
};

const eventPath = process.env.GITHUB_EVENT_PATH ??
  fail("GITHUB_EVENT_PATH is required");
const repository = process.env.GITHUB_REPOSITORY ??
  fail("GITHUB_REPOSITORY is required");
const token = process.env.GITHUB_TOKEN ??
  fail("GITHUB_TOKEN is required");

const event = JSON.parse(readFileSync(eventPath, "utf8")) as {
  pull_request?: {
    number?: number;
    user?: { login?: string };
    head?: { sha?: string };
  };
};
const pullRequest = event.pull_request ??
  fail("pull_request event payload is required");
const number = pullRequest.number ??
  fail("pull request number is required");
const author = pullRequest.user?.login ??
  fail("pull request author is required");
const headSha = pullRequest.head?.sha ??
  fail("pull request head SHA is required");

type Review = Readonly<{
  id: number;
  state: string;
  commit_id: string | null;
  submitted_at: string | null;
  user: Readonly<{ login: string }> | null;
}>;

const reviews: Review[] = [];
for (let page = 1; ; page += 1) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/pulls/${number}/reviews?per_page=100&page=${page}`,
    {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    },
  );
  if (!response.ok) {
    fail(
      `failed to read pull-request reviews: HTTP ${response.status} ${await response.text()}`,
    );
  }
  const pageReviews = await response.json() as Review[];
  reviews.push(...pageReviews);
  if (pageReviews.length < 100) break;
}

const latestByReviewer = new Map<string, Review>();
for (const review of reviews) {
  const login = review.user?.login;
  if (login === undefined || login === author) continue;
  const prior = latestByReviewer.get(login);
  if (
    prior === undefined ||
    (review.submitted_at ?? "") > (prior.submitted_at ?? "") ||
    (
      review.submitted_at === prior.submitted_at &&
      review.id > prior.id
    )
  ) {
    latestByReviewer.set(login, review);
  }
}

const approval = [...latestByReviewer.values()].find(
  (review) =>
    review.state === "APPROVED" &&
    review.commit_id === headSha,
) ?? fail(
  `PR #${number} requires an independent APPROVED review bound to current head ${headSha}`,
);

process.stdout.write(
  `independent current-head review verified for PR #${number}: ${approval.user?.login}\n`,
);
