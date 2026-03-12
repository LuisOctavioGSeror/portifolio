## Portfólio - Aplicação Flask

Este é um projeto de portfólio pessoal desenvolvido em **Python** com **Flask**.
Aqui você encontra as seções de apresentação, projetos, soluções e contato.

### Pré-requisitos

- **Python 3.10+** instalado na máquina
- **pip** (gerenciador de pacotes do Python)
- Opcional, mas recomendado: **virtualenv** ou similar (por exemplo, `venv`)

### Como rodar o projeto localmente

1. **Clonar o repositório**

   ```bash
   git clone <URL-DO-REPOSITORIO>
   cd portifolio
   ```

2. **Criar e ativar um ambiente virtual (recomendado)**

   - No Linux/macOS:

     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

   - No Windows (PowerShell):

     ```bash
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```

3. **Instalar as dependências**

   As dependências estão listadas em `requirements.txt`.

   ```bash
   pip install -r requirements.txt
   ```

4. **Rodar o servidor de desenvolvimento**

   Você pode rodar a aplicação usando o arquivo `main.py`:

   ```bash
   python main.py
   ```

   Por padrão, o Flask será executado em modo de desenvolvimento com `debug=True`.

5. **Acessar no navegador**

   Abra o navegador e acesse:

   ```text
   http://127.0.0.1:5000
   ```

### Estrutura básica do projeto

- `main.py`: ponto de entrada da aplicação em modo de desenvolvimento.
- `app/__init__.py`: configuração da aplicação Flask e do `WhiteNoise` para servir arquivos estáticos.
- `app/routes.py`: definição das rotas/páginas do site.
- `app/templates/`: templates HTML (páginas como `index.html`, `about.html`, `projects.html`, etc.).
- `app/static/`: arquivos estáticos (CSS, JS, imagens).
- `Procfile`: configuração para deploy em plataformas como Render/Heroku usando `gunicorn`.
- `requirements.txt`: dependências Python do projeto.

### Variáveis de ambiente

Atualmente o projeto não exige variáveis de ambiente obrigatórias para rodar em modo de desenvolvimento.
Se no futuro forem adicionadas (por exemplo, chaves de API ou configurações de e-mail), elas podem ser definidas via
variáveis de ambiente no sistema operacional ou em um arquivo `.env` (não incluído no repositório).

### Rodando com gunicorn (opcional)

Se quiser simular o ambiente de produção localmente, você pode usar o `gunicorn`:

```bash
gunicorn "app:create_app()"
```

Por padrão, ele rodará em `http://127.0.0.1:8000`.

### Contribuições

Este é um portfólio pessoal, mas sugestões e melhorias são bem-vindas.
Sinta-se à vontade para abrir *issues* ou *pull requests*.

