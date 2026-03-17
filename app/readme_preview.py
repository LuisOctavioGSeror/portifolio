from __future__ import annotations

from functools import lru_cache
from typing import Optional

import requests
from markdown import markdown


def _to_raw_github_url(url: str) -> str:
  """
  Convert common GitHub README URLs to raw content URLs.
  If the URL is already raw or from another host, return as-is.
  """
  if "raw.githubusercontent.com" in url:
      return url
  if "github.com" in url and "/blob/" in url:
      # https://github.com/user/repo/blob/branch/README.md
      parts = url.split("github.com/", 1)[1]
      user_repo, blob_and_path = parts.split("/blob/", 1)
      return f"https://raw.githubusercontent.com/{user_repo}/{blob_and_path.split('#', 1)[0]}"
  return url


@lru_cache(maxsize=16)
def fetch_readme_html(url: str) -> Optional[str]:
    """
    Fetch README markdown from a remote URL and convert to HTML.
    Returns None if fetching or conversion fails.
    """
    try:
        raw_url = _to_raw_github_url(url)
        resp = requests.get(raw_url, timeout=5)
        if resp.status_code != 200:
            return None
        md_text = resp.text
        # Basic markdown -> HTML conversion
        html = markdown(
            md_text,
            extensions=["extra", "fenced_code", "codehilite", "tables", "toc"],
        )
        return html
    except Exception:
        return None

