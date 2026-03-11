from flask import Flask
from whitenoise import WhiteNoise
from .routes import register_routes


def create_app():
    app = Flask(__name__)
    app.wsgi_app = WhiteNoise(
        app.wsgi_app,
        root="app/static/",
        prefix="static/",
    )

    register_routes(app)

    return app
