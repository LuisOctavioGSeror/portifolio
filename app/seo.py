import os
from typing import List, Tuple
from urllib.parse import urlencode

from flask import Request

from .i18n import DEFAULT_LANG, SUPPORTED_LANGS, translate

SITE_URL = os.environ.get("SITE_URL", "https://www.luisseror.com").rstrip("/")

SITEMAP_PATHS = [
    "/",
    "/overview",
    "/solutions",
    "/projects",
    "/about",
    "/contact",
]

OG_LOCALE = {
    "en": "en_US",
    "pt": "pt_BR",
    "de": "de_DE",
}


def page_path(request: Request) -> str:
    return request.path or "/"


def absolute_url(path: str, lang: str | None = None) -> str:
    if not path.startswith("/"):
        path = f"/{path}"
    url = f"{SITE_URL}{path}"
    if lang:
        url = f"{url}?{urlencode({'lang': lang})}"
    return url


def canonical_url(request: Request) -> str:
    return absolute_url(page_path(request))


def hreflang_alternates(request: Request) -> List[Tuple[str, str]]:
    path = page_path(request)
    alternates = [(lang, absolute_url(path, lang)) for lang in SUPPORTED_LANGS]
    alternates.append(("x-default", absolute_url(path, DEFAULT_LANG)))
    return alternates


def og_locale_for(lang: str) -> str:
    return OG_LOCALE.get(lang, OG_LOCALE[DEFAULT_LANG])


def page_seo(page: str, *, seo_title: str | None = None, seo_description: str | None = None) -> dict:
    title = seo_title or translate(f"seo.{page}.title")
    description = seo_description or translate(f"seo.{page}.description")
    return {
        "seo_title": title,
        "seo_description": description,
        "seo_keywords": translate("seo.keywords"),
        "seo_site_name": translate("seo.site_name"),
    }
