const GITHUB_API = "https://api.github.com";

async function commitBatch(owner, repo, files, dateStr, batchIndex, token) {
  const refRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
  });
  if (!refRes.ok) throw new Error("Failed to get repo ref");
  const refData = await refRes.json();
  const headSha = refData.object.sha;

  const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${headSha}`, {
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
  });
  const treeData = await treeRes.json();
  const baseTreeSha = treeData.tree.sha;

  // Read existing dates-index.json
  let dates = [];
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/dates-index.json`);
    if (r.ok) dates = await r.json();
  } catch { }

  // Add today's date if not already there
  if (!dates.includes(dateStr)) {
    dates.push(dateStr);
    dates.sort((a, b) => b.localeCompare(a)); // newest first
  }

  const treeItems = [];

  // Create blobs for job files
  for (const file of files) {
    const blobRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
      body: JSON.stringify({ content: JSON.stringify(file.content, null, 2), encoding: "utf-8" })
    });
    if (!blobRes.ok) { console.error(`Blob failed: ${file.path}`); continue; }
    const blobData = await blobRes.json();
    treeItems.push({ path: file.path, mode: "100644", type: "blob", sha: blobData.sha });
  }

  // Add dates-index.json blob
  const datesBlob = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({ content: JSON.stringify(dates, null, 2), encoding: "utf-8" })
  });
  const datesBlobData = await datesBlob.json();
  treeItems.push({ path: "dates-index.json", mode: "100644", type: "blob", sha: datesBlobData.sha });

  // Create new tree
  const newTreeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
  });
  const newTree = await newTreeRes.json();

  // Create commit
  const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({
      message: `[Auto] Batch ${batchIndex} for ${dateStr} (${files.length} posts)`,
      tree: newTree.sha,
      parents: [headSha]
    })
  });
  const commitData = await commitRes.json();

  // Update ref
  await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    method: "PATCH",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({ sha: commitData.sha })
  });

  return { committed: treeItems.length - 1, commitSha: commitData.sha };
}

export { commitBatch };
