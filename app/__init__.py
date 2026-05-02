from flask import Flask, g, request
from whitenoise import WhiteNoise
from .routes import register_routes
from .i18n import SUPPORTED_LANGS, detect_locale, get_locale, translate

# Footer isometric icons — replace "#" with your profile URLs when ready
SOCIAL_URLS = {
    "linkedin": "https://www.linkedin.com/in/luisoctaviogs/",
    "youtube": "#",
    "github": "https://github.com/LuisOctavioGSeror",
}

CONTACT_EMAIL = "luisoctaviogalessoseror@protonmail.com"
CONTACT_PHONE_TEL = "+5565992284932"
CONTACT_PHONE_DISPLAY = "+55 65 992284932"


def create_app():
    app = Flask(__name__)
    app.wsgi_app = WhiteNoise(
        app.wsgi_app,
        root="app/static/",
        prefix="static/",
    )

    register_routes(app)

    @app.before_request
    def _set_locale():
        g.locale = detect_locale(request)

    @app.after_request
    def _store_locale(response):
        lang_from_query = request.args.get("lang")
        if lang_from_query in SUPPORTED_LANGS:
            # Remember language preference for future visits
            response.set_cookie("lang", lang_from_query, max_age=60 * 60 * 24 * 365, samesite="Lax")
        return response

    @app.context_processor
    def inject_i18n():
        return {
            "_": translate,
            "current_lang": get_locale(),
            "supported_langs": SUPPORTED_LANGS,
            "social_linkedin": SOCIAL_URLS["linkedin"],
            "social_youtube": SOCIAL_URLS["youtube"],
            "social_github": SOCIAL_URLS["github"],
            "contact_email": CONTACT_EMAIL,
            "contact_phone_tel": CONTACT_PHONE_TEL,
            "contact_phone_display": CONTACT_PHONE_DISPLAY,
        }

    return app
