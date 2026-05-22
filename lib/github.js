// GitHub API helper - commits job JSON files + updates sitemap registry

const GITHUB_API = "https://api.github.com";

async function commitBatch(owner, repo, files, dateStr, batchIndex, token) {
  // Get current HEAD SHA
  const refRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
  });
  if (!refRes.ok) throw new Error("Failed to get repo ref");
  const refData = await refRes.json();
  const headSha = refData.object.sha;

  // Get base tree SHA
  const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${headSha}`, {
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "JobPoster-Bot/1.0" }
  });
  const treeData = await treeRes.json();
  const baseTreeSha = treeData.tree.sha;

  // --- Read existing sitemap registry ---
  let registry = { urls: [], updatedAt: "" };
  try {
    const regRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/sitemap-registry.json`);
    if (regRes.ok) registry = await regRes.json();
  } catch { }

  // Add new URLs to registry (avoid duplicates)
  const existingSet = new Set(registry.urls);
  for (const file of files) {
    existingSet.add(file.path);
  }
  registry.urls = [...existingSet];
  registry.updatedAt = new Date().toISOString();
  registry.total = registry.urls.length;

  // --- Create blobs for job files ---
  const treeItems = [];
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

  // --- Add sitemap registry blob ---
  const regBlobRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({ content: JSON.stringify(registry, null, 2), encoding: "utf-8" })
  });
  const regBlobData = await regBlobRes.json();
  treeItems.push({ path: "sitemap-registry.json", mode: "100644", type: "blob", sha: regBlobData.sha });

  // --- Create new tree ---
  const newTreeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
  });
  const newTree = await newTreeRes.json();

  // --- Create commit ---
  const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({
      message: `[Auto] Batch ${batchIndex} for ${dateStr} (${files.length} posts, ${registry.total} total)`,
      tree: newTree.sha,
      parents: [headSha]
    })
  });
  const commitData = await commitRes.json();

  // --- Update ref ---
  await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    method: "PATCH",
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", "User-Agent": "JobPoster-Bot/1.0" },
    body: JSON.stringify({ sha: commitData.sha })
  });

  return { committed: treeItems.length - 1, commitSha: commitData.sha, totalUrls: registry.total };
}

export { commitBatch };
