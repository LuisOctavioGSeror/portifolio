from flask import Response, abort, render_template

from .i18n import translate
from .projects_data import PROJECTS, get_all_projects, get_featured_projects, get_project
from .readme_preview import fetch_readme_html
from .seo import SITE_URL, SITEMAP_PATHS, page_seo


def register_routes(app):
    @app.route("/")
    def hero():
        return render_template("hero.html", **page_seo("hero"))

    @app.route("/overview")
    def index():
        featured_projects = get_featured_projects(3)
        return render_template(
            "index.html",
            featured_projects=featured_projects,
            **page_seo("overview"),
        )

    @app.route("/solutions")
    def solutions():
        return render_template("solutions.html", **page_seo("solutions"))

    @app.route("/projects")
    def projects():
        projects_data = get_all_projects()
        return render_template("projects.html", projects=projects_data, **page_seo("projects"))

    @app.route("/projects/<slug>")
    def project_detail(slug: str):
        project = get_project(slug)
        if not project:
            abort(404)
        readme_html = None
        if project.get("readme_url"):
            readme_html = fetch_readme_html(project["readme_url"])
        seo_title = f"{project['name']} · {translate('seo.project.title_suffix')}"
        seo_description = project.get("card_text") or translate("seo.projects.description")
        return render_template(
            "projects/detail.html",
            project=project,
            readme_html=readme_html,
            **page_seo("project", seo_title=seo_title, seo_description=seo_description),
        )

    @app.route("/about")
    def about():
        return render_template("about.html", **page_seo("about"))

    @app.route("/contact")
    def contact():
        return render_template("contact.html", **page_seo("contact"))

    @app.route("/robots.txt")
    def robots_txt():
        body = f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n"
        return Response(body, mimetype="text/plain")

    @app.route("/sitemap.xml")
    def sitemap_xml():
        paths = list(SITEMAP_PATHS)
        for slug in PROJECTS:
            paths.append(f"/projects/{slug}")
        urls = "\n".join(
            f"  <url>\n    <loc>{SITE_URL}{path}</loc>\n  </url>" for path in paths
        )
        xml = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"{urls}\n"
            "</urlset>\n"
        )
        return Response(xml, mimetype="application/xml")
