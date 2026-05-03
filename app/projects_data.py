from typing import Any, Dict, List, Tuple

from .i18n import get_locale

# Ordem dos destaques na visão geral (centro → esquerda → direita, como em /about).
FEATURED_PROJECT_SLUGS: Tuple[str, ...] = (
    "myticketflow",
    "myideas",
    "myassistant",
)

PROJECTS: Dict[str, Dict[str, Any]] = {
    "myticketflow": {
        "slug": "myticketflow",
        "name": "MyTicketFlow",
        "live_url": "https://frontend-production-ef14.up.railway.app",
        "youtube_id": "VIDEO_ID_MYTICKETFLOW",
        "readme_url": "https://github.com/SEU_USUARIO/myticketflow#readme",
        "thumbnail": "img/ticket.png",
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
        "readme_url": "https://github.com/LuisOctavioGSeror/MyIdeasBackend/blob/main/README.md",
        "backend_repo": "https://github.com/LuisOctavioGSeror/MyIdeasBackend",
        "frontend_repo": "https://github.com/LuisOctavioGSeror/MyIdeasFrontend",
        "thumbnail": "img/idea.png",
        "stack": ["FastAPI", "Python", "PostgreSQL", "React"],
        "translations": {
            "en": {
                "card_title": "Idea management system with editing and images.",
                "card_text": "AI‑powered app to capture, edit and organize ideas with images in one place.",
                "card_stack": "FastAPI • Python • PostgreSQL • React",
            },
            "pt": {
                "card_title": "Sistema de ideias com edição e imagens.",
                "card_text": "Aplicação com IA para registrar, editar e organizar ideias com imagens em um só lugar.",
                "card_stack": "FastAPI • Python • PostgreSQL • React",
            },
            "de": {
                "card_title": "Ideen-System mit Bearbeitung und Bildern.",
                "card_text": "KI‑gestützte App zum Erfassen, Bearbeiten und Organisieren von Ideen mit Bildern an einem Ort.",
                "card_stack": "FastAPI • Python • PostgreSQL • React",
            },
        },
    },
    "myassistant": {
        "slug": "myassistant",
        "name": "MyAssistant",
        "readme_url": "https://github.com/LuisOctavioGSeror/MyAssistant/blob/main/README.md",
        "backend_repo": "https://github.com/LuisOctavioGSeror/MyAssistant",
        "thumbnail": "img/MyAssistant.png",
        "stack": ["Python", "PyQt5", "LlamaIndex", "LLM", "Speech"],
        "translations": {
            "en": {
                "card_title": "Open-source AI voice assistant (desktop).",
                "card_text": "Desktop app with mic, LLM agents (Groq/Ollama), and tools: TTS, notes, email, Spotify, crypto.",
                "card_stack": "Python • PyQt5 • LlamaIndex • LLM • Speech",
            },
            "pt": {
                "card_title": "Assistente de voz com IA (desktop), open source.",
                "card_text": "App desktop com microfone, agentes LLM (Groq/Ollama) e ferramentas: TTS, notas, e-mail, Spotify, cripto.",
                "card_stack": "Python • PyQt5 • LlamaIndex • LLM • Speech",
            },
            "de": {
                "card_title": "Open-Source KI-Sprachassistent (Desktop).",
                "card_text": "Desktop-App mit Mikrofon, LLM-Agenten (Groq/Ollama) und Tools: TTS, Notizen, E-Mail, Spotify, Krypto.",
                "card_stack": "Python • PyQt5 • LlamaIndex • LLM • Speech",
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


def get_featured_projects(limit: int = 3) -> List[Tuple[str, Dict[str, Any]]]:
    """Últimos / principais projetos na ordem definida em FEATURED_PROJECT_SLUGS."""
    all_p = get_all_projects()
    out: List[Tuple[str, Dict[str, Any]]] = []
    for slug in FEATURED_PROJECT_SLUGS[:limit]:
        if slug in all_p:
            out.append((slug, all_p[slug]))
    return out

