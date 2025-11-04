# PIP-менеджер (MandrePip)

MandrePip позволяет устанавливать и использовать Python-пакеты прямо в окружении exteraGram на Android.

## Быстрый старт

```python
# Установить один пакет
Mandre.Pip.install("requests")

# Установить несколько пакетов
Mandre.Pip.install(["pyrogram", "aiohttp"])  # список пакетов

# Убедиться, что окружение готово
Mandre.Pip.ensure_ready()
```

## Вызов pip напрямую

```python
code, out, err = Mandre.Pip.pip([
    "install",
    "--upgrade",
    "--no-warn-conflicts",
    "colorama==0.4.6"
])

if code == 0:
    BulletinHelper.show_success("Пакет установлен!")
else:
    BulletinHelper.show_error(f"Ошибка: {err}")

# Список установленных пакетов
code, out, err = Mandre.Pip.pip(["list"])
self.log(f"Установленные пакеты:\n{out}")
```

## Импорт установленных модулей

```python
try:
    import requests
except ImportError:
    Mandre.Pip.install("requests")
    requests = Mandre.Pip.import_module("requests")

r = requests.get("https://api.github.com/users/octocat")
if r.status_code == 200:
    data = r.json()
    self.log(f"Пользователь: {data['name']}")
```

## Настройки PIP

Можно задать индекс пакетов и HTTP-прокси через настройки вашего плагина.

```python
from ui.settings import Input

def create_settings(self):
    return [
        Input(
            key="pip_index_url",
            text="Индекс пакетов (опционально)",
            subtext="Кастомный PyPI индекс",
            default="",
            icon="msg_edit_solar"
        ),
        Input(
            key="pip_proxy",
            text="HTTP прокси (опционально)",
            subtext="Формат: http://user:pass@host:port",
            default="",
            icon="msg_edit_solar"
        ),
    ]
```

## Рекомендации

- **Кэшируйте импорт**: сохраняйте импортированные модули в поле экземпляра, чтобы не импортировать повторно.
- **Проверяйте код возврата**: при вызове `pip()` анализируйте `code` и `err`.
- **Не блокируйте UI**: устанавливайте пакеты в фоновом потоке при необходимости.
