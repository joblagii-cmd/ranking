// GitHub API helper - commits job JSON files to your repository

const GITHUB_API = "https://api.github.com";

async function getFileSha(owner, repo, path, token) {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "JobPoster-Bot/1.0"
      }
    });
    if (res.status === 404) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

async function commitFile(owner, repo, path, content, message, token) {
  const sha = await getFileSha(owner, repo, path, token);
  const body = {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
    committer: {
      name: "JobPoster Bot",
      email: "bot@jobposter.auto"
    }
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "JobPoster-Bot/1.0"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit failed for ${path}: ${res.status} - ${err}`);
  }
  return await res.json();
}

// Commit multiple files in a single tree (faster, fewer API calls)
async function commitBatch(owner, repo, files, dateStr, batchIndex, token) {
  // Get current HEAD SHA
  const refRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JobPoster-Bot/1.0"
    }
  });
  if (!refRes.ok) throw new Error("Failed to get repo ref");
  const refData = await refRes.json();
  const headSha = refData.object.sha;

  // Get base tree
  const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${headSha}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JobPoster-Bot/1.0"
    }
  });
  const treeData = await treeRes.json();
  const baseTreeSha = treeData.tree.sha;

  // Create blobs for all files
  const treeItems = [];
  for (const file of files) {
    const blobRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "JobPoster-Bot/1.0"
      },
      body: JSON.stringify({
        content: JSON.stringify(file.content, null, 2),
        encoding: "utf-8"
      })
    });
    if (!blobRes.ok) {
      console.error(`Blob creation failed for ${file.path}`);
      continue;
    }
    const blobData = await blobRes.json();
    treeItems.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blobData.sha
    });
  }

  // Create new tree
  const newTreeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "JobPoster-Bot/1.0"
    },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems
    })
  });
  const newTree = await newTreeRes.json();

  // Create commit
  const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "JobPoster-Bot/1.0"
    },
    body: JSON.stringify({
      message: `[Auto] Job postings batch ${batchIndex} for ${dateStr} (${files.length} posts)`,
      tree: newTree.sha,
      parents: [headSha]
    })
  });
  const commitData = await commitRes.json();

  // Update ref
  await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "JobPoster-Bot/1.0"
    },
    body: JSON.stringify({ sha: commitData.sha })
  });

  return { committed: treeItems.length, commitSha: commitData.sha };
}

export { commitFile, commitBatch };
