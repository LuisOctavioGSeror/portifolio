from typing import Dict, Any

from .i18n import get_locale


PROJECTS: Dict[str, Dict[str, Any]] = {
    "myticketflow": {
        "slug": "myticketflow",
        "name": "MyTicketFlow",
        "live_url": "https://frontend-production-ef14.up.railway.app",
        "youtube_id": "VIDEO_ID_MYTICKETFLOW",
        "readme_url": "https://github.com/SEU_USUARIO/myticketflow#readme",
        "thumbnail": "img/projects/myticketflow/app-1.png",
        "stack": ["FastAPI", "Python", "PostgreSQL", "React", "MCP", "LLM"],
        "translations": {
            "en": {
                "card_title": "Ticket management system with MCP + LLM.",
                "card_text": "Full‑stack ticket app with FastAPI, PostgreSQL, React and MCP + LLM for smarter triage.",
                "card_stack": "FastAPI • Python • PostgreSQL • React • MCP • LLM",
            },
            "pt": {
                "card_title": "Sistema de tickets com MCP + LLM.",
                "card_text": "Aplicação de tickets full‑stack com FastAPI, PostgreSQL, React e MCP + LLM para triagem inteligente.",
                "card_stack": "FastAPI • Python • PostgreSQL • React • MCP • LLM",
            },
            "de": {
                "card_title": "Ticket-System mit MCP + LLM.",
                "card_text": "Full‑Stack-Ticket-App mit FastAPI, PostgreSQL, React sowie MCP + LLM für intelligente Triage.",
                "card_stack": "FastAPI • Python • PostgreSQL • React • MCP • LLM",
            },
        },
    },
    "myideas": {
        "slug": "myideas",
        "name": "MyIdeas",
        "live_url": "https://myideasfrontend-production.up.railway.app/login",
        "youtube_id": "VIDEO_ID_MYIDEAS",
        "readme_url": "https://github.com/SEU_USUARIO/myideas#readme",
        "thumbnail": "img/projects/myticketflow/app-2.png",
        "stack": ["FastAPI", "Python", "PostgreSQL", "React"],
        "translations": {
            "en": {
                "card_title": "Idea management system with editing and images.",
                "card_text": "Full‑stack app to capture, edit and organize ideas with images in one place.",
                "card_stack": "FastAPI • Python • PostgreSQL • React",
            },
            "pt": {
                "card_title": "Sistema de ideias com edição e imagens.",
                "card_text": "Aplicação full‑stack para registrar, editar e organizar ideias com imagens em um só lugar.",
                "card_stack": "FastAPI • Python • PostgreSQL • React",
            },
            "de": {
                "card_title": "Ideen-System mit Bearbeitung und Bildern.",
                "card_text": "Full‑Stack-App zum Erfassen, Bearbeiten und Organisieren von Ideen mit Bildern an einem Ort.",
                "card_stack": "FastAPI • Python • PostgreSQL • React",
            },
        },
    },
}


def get_all_projects() -> Dict[str, Dict[str, Any]]:
    """Return all projects with language-specific fields merged in."""
    lang = get_locale()
    result: Dict[str, Dict[str, Any]] = {}
    for slug, data in PROJECTS.items():
        translations = data.get("translations", {})
        localized = translations.get(lang) or translations.get("en") or {}
        merged = {**data, **localized}
        result[slug] = merged
    return result


def get_project(slug: str) -> Dict[str, Any] | None:
    projects = get_all_projects()
    return projects.get(slug)

