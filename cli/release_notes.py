import subprocess


def get_latest_tag():
    try:
        return (
            subprocess.check_output(["git", "describe", "--tags", "--abbrev=0"])
            .strip()
            .decode("utf-8")
        )
    except Exception:
        return None


def get_commit_messages(since_tag=None):
    cmd = ["git", "log", "--pretty=format:%s"]
    if since_tag:
        cmd.append(f"{since_tag}..HEAD")

    try:
        return subprocess.check_output(cmd).strip().decode("utf-8").split("\n")
    except Exception:
        return []


def generate_release_notes():
    last_tag = get_latest_tag()
    messages = get_commit_messages(last_tag)

    if not messages or messages == [""]:
        print("No hay nuevos cambios para reportar.")
        return

    print(f"## Notas de la Versión {' (desde ' + last_tag + ')' if last_tag else ''}")

    categories = {
        "feat": "🚀 Nuevas Funcionalidades",
        "fix": "🐛 Correcciones de Errores",
        "refactor": "🛠 Refactorizaciones",
        "docs": "📝 Documentación",
        "test": "🧪 Pruebas",
        "chore": "🔧 Tareas de Mantenimiento",
    }

    organized = {k: [] for k in categories.values()}
    organized["Otros"] = []

    for msg in messages:
        found = False
        for prefix, category in categories.items():
            if msg.lower().startswith(f"{prefix}:"):
                organized[category].append(msg[len(prefix) + 1 :].strip())
                found = True
                break
        if not found:
            organized["Otros"].append(msg)

    for category, items in organized.items():
        if items:
            print(f"\n### {category}")
            for item in items:
                print(f"- {item}")


if __name__ == "__main__":
    generate_release_notes()
