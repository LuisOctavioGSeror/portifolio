from flask import Flask, g, request
from whitenoise import WhiteNoise
from .routes import register_routes
from .i18n import SUPPORTED_LANGS, detect_locale, get_locale, translate


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
        }

    return app
