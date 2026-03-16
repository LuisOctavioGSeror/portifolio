from flask import render_template, abort

from .projects_data import get_all_projects, get_project


def register_routes(app):
    @app.route("/")
    def hero():
        return render_template("hero.html")

    @app.route("/overview")
    def index():
        return render_template("index.html")

    @app.route("/solutions")
    def solutions():
        return render_template("solutions.html")

    @app.route("/projects")
    def projects():
        projects_data = get_all_projects()
        return render_template("projects.html", projects=projects_data)

    @app.route("/projects/<slug>")
    def project_detail(slug: str):
        project = get_project(slug)
        if not project:
            abort(404)
        return render_template("projects/detail.html", project=project)

    @app.route("/about")
    def about():
        return render_template("about.html")

    @app.route("/contact")
    def contact():
        return render_template("contact.html")