from flask import render_template


def register_routes(app):
    @app.route("/")
    def index():
        return "Portfolio Flask skeleton is running."

    @app.route("/solutions")
    def solutions():
        return "Solutions page placeholder."

    @app.route("/projects")
    def projects():
        return "Projects page placeholder."

    @app.route("/projects/myticketflow")
    def project_myticketflow():
        return "MyTicketFlow page placeholder."

    @app.route("/about")
    def about():
        return "About page placeholder."

    @app.route("/contact")
    def contact():
        return "Contact page placeholder."
