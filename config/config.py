from dynaconf import Dynaconf

settings = Dynaconf(
    envvar_prefix=False,
    settings_files=["settings.toml", ".secrets.toml"],
)

# `envvar_prefix` = False allows using SUPABASE_URL directly as an env var.
# `settings_files` = Load these files in the order.
