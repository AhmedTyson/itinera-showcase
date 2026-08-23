import re, pathlib, json

src = pathlib.Path(r"C:\Programming\conference\showcase\index.html")
text = src.read_text(encoding="utf-8")
# Find all endpoint details
pattern = re.compile(r'<details class="endpoint"[^>]*data-cat="([^"]*)"[^>]*data-meth="([^"]*)"[^>]*data-search="([^"]*)"[^>]*>.*?<span class="meth[^"]*">([^<]+)</span><span class="path">([^<]+)</span>(.*?)</details>', re.DOTALL)
matches = pattern.findall(text)
print(f"found {len(matches)}")
# Extract chips and request/response for each
# We'll also extract ep-body for request/response
# For simplicity, just capture the whole details block and then extract
import re as re2
# Instead, split by details
details_blocks = re.findall(r'<details class="endpoint".*?</details>', text, flags=re.DOTALL)
endpoints = []
for block in details_blocks:
    m = re.search(r'data-cat="([^"]*)".*?data-meth="([^"]*)".*?data-search="([^"]*)"', block, flags=re.DOTALL)
    cat, meth, search = m.groups() if m else ("", "", "")
    m_path = re.search(r'<span class="path">([^<]+)</span>', block)
    path = m_path.group(1).strip() if m_path else ""
    m_meth = re.search(r'<span class="meth[^"]*">([^<]+)</span>', block)
    meth_text = m_meth.group(1).strip().lower() if m_meth else meth.lower()
    # chips: <span class="chip">...</span> inside summary
    chips = re.findall(r'<span class="chip">([^<]+)</span>', block)
    # request/response: look for <div class="meta">REQUEST</div><div class="code">(.*?)</div>
    req_match = re.search(r'<div class="meta[^>]*>REQUEST</div><div class="code">(.*?)</div>', block, flags=re.DOTALL)
    req = ""
    if req_match:
        req = re.sub(r"<[^>]+>", "", req_match.group(1)).strip()
        req = req.replace("&nbsp;", " ").replace("&quot;", '"').replace("&#39;", "'")
    resp_match = re.search(r'<div class="meta[^>]*>RESPONSE[^<]*</div><div class="code">(.*?)</div>', block, flags=re.DOTALL)
    resp = ""
    if resp_match:
        resp = re.sub(r"<[^>]+>", "", resp_match.group(1)).strip()
        resp = resp.replace("&nbsp;", " ").replace("&quot;", '"')
    # summary text for description: <p class="muted"...>(.*?)</p> inside ep-body
    desc_match = re.search(r'<p class="muted"[^>]*>(.*?)</p>', block, flags=re.DOTALL)
    desc = ""
    if desc_match:
        desc = re.sub(r"<[^>]+>", "", desc_match.group(1)).strip()
    endpoints.append({
        "cat": cat,
        "meth": meth_text or meth,
        "path": path,
        "search": search,
        "chips": chips,
        "request": req,
        "response": resp,
        "desc": desc
    })

# Write TS file
out_path = pathlib.Path(r"C:\Programming\conference\itinera-showcase-react\src\lib\explorer-data.ts")
lines = []
lines.append("export type Endpoint = { id: string; cat: string; meth: \"get\"|\"post\"|\"put\"|\"patch\"|\"delete\"; path: string; search: string; chips: string[]; desc: string; request?: string; response?: string }")
lines.append("export const ENDPOINTS: Endpoint[] = [")
for i, e in enumerate(endpoints):
    # escape for TS string
    def esc(s):
        return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${").replace('"', '\\"')
    lines.append(f'  {{ id: "ep-{i+1}", cat: "{e["cat"]}", meth: "{e["meth"]}", path: "{e["path"]}", search: "{esc(e["search"])}", chips: {json.dumps(e["chips"])}, desc: "{esc(e["desc"])}", request: `{esc(e["request"])}`, response: `{esc(e["response"])}` }},')
lines.append("]")
lines.append("")
lines.append('export const GW_NODES = [')
lines.append('  { label: "login", note: "throttle · brute-force" },')
lines.append('  { label: "register", note: "throttle" },')
lines.append('  { label: "refresh", note: "15/min" },')
lines.append('  { label: "ai", note: "quota-guarded" },')
lines.append('  { label: "checkout", note: "money-path" },')
lines.append('  { label: "weather", note: "abuse-tested" },')
lines.append(']')
out_path.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(endpoints)} endpoints to {out_path}")
for e in endpoints[:3]:
    print(e["path"], e["meth"], e["cat"])
