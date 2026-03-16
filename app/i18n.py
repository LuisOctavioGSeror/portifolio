from typing import Dict

from flask import Request, g

SUPPORTED_LANGS = ["en", "pt", "de"]
DEFAULT_LANG = "en"


TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "nav.solutions": "Solutions I build",
        "nav.projects": "Projects",
        "nav.about": "About me",
        "nav.contact": "Contact",
        "nav.lang.en": "EN",
        "nav.lang.pt": "PT",
        "nav.lang.de": "DE",
        "footer.title": "Want to work together?",
        "footer.text": "Tell me briefly about your team, product and what you’d like help with.",
        "footer.meta": "Backend, data and AI work are all welcome.",
        "form.name": "Name",
        "form.email": "Email",
        "form.context": "Current technical context",
        "form.message": "Message",
        "form.required": "Required",
        "form.optional": "Optional",
        "form.submit": "Send email",
    },
    "pt": {
        "nav.solutions": "Soluções que construo",
        "nav.projects": "Projetos",
        "nav.about": "Sobre mim",
        "nav.contact": "Contato",
        "nav.lang.en": "EN",
        "nav.lang.pt": "PT",
        "nav.lang.de": "DE",
        "footer.title": "Vamos trabalhar juntos?",
        "footer.text": "Conte rapidamente sobre seu time, produto e no que você precisa de ajuda.",
        "footer.meta": "Trabalho com backend, dados e IA.",
        "form.name": "Nome",
        "form.email": "E-mail",
        "form.context": "Contexto técnico atual",
        "form.message": "Mensagem",
        "form.required": "Obrigatório",
        "form.optional": "Opcional",
        "form.submit": "Enviar mensagem",
    },
    "de": {
        "nav.solutions": "Lösungen, die ich baue",
        "nav.projects": "Projekte",
        "nav.about": "Über mich",
        "nav.contact": "Kontakt",
        "nav.lang.en": "EN",
        "nav.lang.pt": "PT",
        "nav.lang.de": "DE",
        "footer.title": "Lass uns zusammenarbeiten.",
        "footer.text": "Erzähl mir kurz von deinem Team, Produkt und wobei du Unterstützung brauchst.",
        "footer.meta": "Backend-, Daten- und KI-Arbeit sind willkommen.",
        "form.name": "Name",
        "form.email": "E-Mail",
        "form.context": "Aktueller technischer Kontext",
        "form.message": "Nachricht",
        "form.required": "Pflichtfeld",
        "form.optional": "Optional",
        "form.submit": "E-Mail senden",
    },
}


def _normalize_lang(code: str) -> str:
    code = code.lower()
    if code.startswith("pt"):
        return "pt"
    if code.startswith("de"):
        return "de"
    if code.startswith("en"):
        return "en"
    return DEFAULT_LANG


def _parse_accept_language(header: str) -> str:
    if not header:
        return DEFAULT_LANG

    parts = [p.split(";")[0].strip() for p in header.split(",")]
    for part in parts:
        if not part:
            continue
        normalized = _normalize_lang(part)
        if normalized in SUPPORTED_LANGS:
            return normalized
    return DEFAULT_LANG


def detect_locale(request: Request) -> str:
    query_lang = request.args.get("lang")
    if query_lang in SUPPORTED_LANGS:
        return query_lang

    cookie_lang = request.cookies.get("lang")
    if cookie_lang in SUPPORTED_LANGS:
        return cookie_lang

    header_lang = _parse_accept_language(request.headers.get("Accept-Language", ""))
    return header_lang if header_lang in SUPPORTED_LANGS else DEFAULT_LANG


def get_locale() -> str:
    return getattr(g, "locale", DEFAULT_LANG)


def translate(key: str) -> str:
    lang = get_locale()
    if lang in TRANSLATIONS and key in TRANSLATIONS[lang]:
        return TRANSLATIONS[lang][key]
    if key in TRANSLATIONS[DEFAULT_LANG]:
        return TRANSLATIONS[DEFAULT_LANG][key]
    return key

