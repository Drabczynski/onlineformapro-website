import requests, re, sys, os
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
s = requests.Session(); s.headers["User-Agent"] = UA; s.verify = "/root/.ccr/ca-bundle.crt"
def uploads(jeu):
    base = f"https://quaternius.itch.io/{jeu}"
    r = s.get(base, timeout=30); csrf = re.search(r'name="csrf_token" value="([^"]+)"', r.text).group(1)
    j = s.post(base + "/download_url", data={"csrf_token": csrf}, timeout=30).json()
    r = s.get(j["url"], timeout=30)
    c2 = re.search(r'name="csrf_token" value="([^"]+)"', r.text); csrf = c2.group(1) if c2 else csrf
    ups = re.findall(r'data-upload_id="(\d+)"', r.text)
    noms = re.findall(r'<strong title="([^"]+)" class="name">', r.text)
    tailles = re.findall(r'class="file_size"><span>([^<]+)</span>', r.text)
    return base, csrf, list(zip(ups, noms, tailles))
def lien(base, csrf, up):
    r = s.post(f"{base}/file/{up}?source=view_game&as_props=1&after_download_lightbox=true", data={"csrf_token": csrf}, timeout=30)
    return r.json()["url"]
if __name__ == "__main__":
    mode, jeu = sys.argv[1], sys.argv[2]
    base, csrf, ups = uploads(jeu)
    if mode == "liste":
        for u in ups: print(jeu, *u)
    else:
        idx = int(sys.argv[3]); dest = sys.argv[4]
        up, nom, t = ups[idx]; url = lien(base, csrf, up)
        with s.get(url, stream=True, timeout=600) as r:
            r.raise_for_status()
            with open(os.path.join(dest, nom.replace("/", "_")), "wb") as f:
                for b in r.iter_content(1 << 20): f.write(b)
        print("ok", nom, os.path.getsize(os.path.join(dest, nom.replace("/", "_"))))
