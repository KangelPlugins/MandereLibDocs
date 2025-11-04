# Отправка файлов и текста

**MandreShare** позволяет легко отправлять текст или файлы через системный диалог "Поделиться" Android.

## Импорт

```python
from mandre_lib import Mandre
```

## Отправка текста

Простая отправка текстового сообщения:

```python
def share_greeting(self):
    Mandre.Share.share_text(
        text="Привет! Это сообщение от моего плагина!",
        title="Поделиться приветствием"
    )
```

### Пример с данными

```python
def share_stats(self):
    count = self.get_setting("message_count", 0)
    text = f"""📊 Статистика плагина
    
Отправлено сообщений: {count}
Плагин: {self.name}
Версия: {self.version}
"""
    
    Mandre.Share.share_text(text, "Статистика")
```

## Отправка файлов

Отправка любых файлов с автоматическим определением MIME-типа:

```python
def share_document(self):
    file_path = "/path/to/document.pdf"
    
    Mandre.Share.share_file(
        file_path=file_path,
        title="Поделиться документом",
        mime_type="application/pdf"  # Опционально
    )
```

### Автоматическое определение типа

Библиотека автоматически определяет MIME-тип по расширению:

- **Изображения**: `.jpg`, `.png`, `.gif`, `.webp`, `.bmp`
- **Видео**: `.mp4`, `.avi`, `.mkv`, `.mov`
- **Аудио**: `.mp3`, `.wav`, `.ogg`, `.m4a`
- **Документы**: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`
- **Архивы**: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- **Веб**: `.html`, `.htm`, `.css`, `.js`
- **Текст**: `.txt`, `.md`, `.json`, `.xml`, `.csv`

```python
# MIME-тип определится автоматически
Mandre.Share.share_file("/path/to/image.png", "Фото")
Mandre.Share.share_file("/path/to/video.mp4", "Видео")
```

## Создание временных файлов

Создание и отправка временных файлов:

```python
def create_and_share_text_file(self):
    import tempfile
    import time
    
    # Создаём временный файл
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
        f.write("Это содержимое временного файла\n")
        f.write(f"Создан: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        temp_file_path = f.name
    
    # Отправляем файл
    Mandre.Share.share_file(temp_file_path, "Текстовый файл")
    # Файл автоматически удалится через 5 минут
```

### Экспорт настроек

```python
def export_settings(self):
    import json
    import tempfile
    
    settings = {
        "version": self.version,
        "settings": {
            "option1": self.get_setting("option1", True),
            "option2": self.get_setting("option2", "default")
        },
        "exported_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
        temp_path = f.name
    
    Mandre.Share.share_file(temp_path, f"Настройки {self.name}")
    BulletinHelper.show_success("Настройки экспортированы!")
```

### HTML отчёт

```python
def generate_html_report(self):
    import tempfile
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Отчёт</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        h1 {{ color: #0088cc; }}
    </style>
</head>
<body>
    <h1>📊 Отчёт плагина</h1>
    <p><b>Плагин:</b> {self.name}</p>
    <p><b>Версия:</b> {self.version}</p>
    <p><b>Статус:</b> Активен</p>
</body>
</html>"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        temp_path = f.name
    
    Mandre.Share.share_file(temp_path, "Отчёт")
```

## Важные особенности

### Копирование файлов

Файлы автоматически копируются в `Downloads/exteraGram/` перед отправкой для обеспечения доступа другим приложениям.

### Автоудаление

Временные файлы автоматически удаляются через 5 минут после отправки.

### Потокобезопасность

Все методы можно безопасно вызывать из любого потока:

```python
from client_utils import run_on_queue

def background_export(self):
    run_on_queue(lambda: self.create_and_share())
```

## Полный пример

```python
from base_plugin import BasePlugin, HookResult, HookStrategy
from mandre_lib import Mandre
from ui.bulletin import BulletinHelper
from ui.settings import Header, Text, Divider
import tempfile
import json
import time

class ShareDemoPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        Mandre.register_command(self, "share", self.cmd_share)
        Mandre.register_command(self, "export", self.cmd_export)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_share(self, plugin, args, params):
        """Поделиться текстом"""
        if not args:
            BulletinHelper.show_error("Использование: .share <текст>")
            return HookResult(strategy=HookStrategy.CANCEL)
        
        Mandre.Share.share_text(args, "Поделиться")
        BulletinHelper.show_success("Диалог открыт")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def cmd_export(self, plugin, args, params):
        """Экспорт данных в JSON"""
        data = {
            "plugin": self.name,
            "version": self.version,
            "timestamp": time.time()
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            temp_path = f.name
        
        Mandre.Share.share_file(temp_path, "Экспорт данных")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def create_settings(self):
        return [
            Header(text="Отправка файлов"),
            Text(
                text="Поделиться текстом",
                icon="msg_share_solar",
                on_click=lambda _: Mandre.Share.share_text("Привет из плагина!", "Текст")
            ),
            Text(
                text="Экспортировать настройки",
                icon="msg_shareout",
                on_click=lambda _: self.export_settings()
            )
        ]
    
    def export_settings(self):
        settings = {k: v for k, v in self.settings.items()}
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
            temp_path = f.name
        
        Mandre.Share.share_file(temp_path, f"Настройки {self.name}")
        BulletinHelper.show_success("Настройки экспортированы!")
```

## Лучшие практики

### 1. Используйте tempfile

```python
# ✅ Правильно
import tempfile
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
    f.write("data")
    path = f.name

# ❌ Неправильно
path = "/tmp/file.txt"  # Может не существовать
```

### 2. Указывайте кодировку

```python
# ✅ Правильно
with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', ...) as f:
    f.write("Русский текст")

# ❌ Неправильно
with tempfile.NamedTemporaryFile(mode='w', ...) as f:
    f.write("Русский текст")  # Может быть кракозябры
```

### 3. Проверяйте существование файлов

```python
import os

def share_if_exists(self, file_path):
    if os.path.exists(file_path):
        Mandre.Share.share_file(file_path, "Файл")
    else:
        BulletinHelper.show_error("Файл не найден")
```

## Прямая отправка в чат (MandreSend)

Если нужно отправить изображение/файл непосредственно в текущий чат без системного диалога «Поделиться», используйте `MandreSend`:

```python
def send_image_directly(self, image_path: str):
    # Отправить PNG изображение напрямую в текущий чат
    MandreSend.png(image_path, "📸 Изображение из плагина")
```

### Пример: сгенерировать картинку из HTML и отправить

```python
def create_and_send_chart(self):
    html = """
    <canvas id=\"myChart\" width=\"400\" height=\"200\"></canvas>
    <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>
    <script>
      const ctx = document.getElementById('myChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май'],
          datasets: [{
            label: 'Продажи',
            data: [65, 59, 80, 81, 56],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }
      });
    </script>
    """

    def on_ready(success, path):
        if success:
            MandreSend.png(path, "📈 График продаж")

    MandreWeb.render_html_to_png(html, on_ready)
```

::: tip Когда использовать
- `MandreShare` — если нужно дать пользователю выбрать приложение для шаринга.
- `MandreSend` — если нужно отправить контент сразу в текущий чат, без взаимодействия.
:::

## См. также

- [MandreShare API](/api/mandre-share) - полная справка
- [MandreDevice](/guide/device) - информация об устройстве
- [Примеры](/examples/calculator) - готовые примеры
