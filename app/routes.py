from flask import render_template


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
        return render_template("projects.html")

    @app.route("/projects/myticketflow")
    def project_myticketflow():
        return render_template("projects/myticketflow.html")

    @app.route("/about")
    def about():
        return render_template("about.html")

    @app.route("/contact")
    def contact():
        return render_template("contact.html")