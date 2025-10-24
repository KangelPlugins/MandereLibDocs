# MandreShare API

Модуль для отправки текста и файлов через системный диалог "Поделиться" Android.

## Импорт

```python
from mandre_lib import Mandre
```

## Методы

### share_text()

Отправляет текст через системный диалог.

```python
Mandre.Share.share_text(text, title)
```

**Параметры:**
- `text` (str) - текст для отправки
- `title` (str) - заголовок диалога

**Возвращает:** None

**Пример:**

```python
Mandre.Share.share_text(
    text="Привет! Это сообщение от моего плагина!",
    title="Поделиться приветствием"
)
```

---

### share_file()

Отправляет файл через системный диалог.

```python
Mandre.Share.share_file(file_path, title, mime_type=None)
```

**Параметры:**
- `file_path` (str) - путь к файлу
- `title` (str) - заголовок диалога
- `mime_type` (str, optional) - MIME-тип файла (определяется автоматически)

**Возвращает:** None

**Пример:**

```python
Mandre.Share.share_file(
    file_path="/path/to/document.pdf",
    title="Поделиться документом",
    mime_type="application/pdf"
)
```

---

## Автоматическое определение MIME-типов

Библиотека автоматически определяет тип файла по расширению:

| Расширение | MIME-тип |
|------------|----------|
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.png` | `image/png` |
| `.gif` | `image/gif` |
| `.webp` | `image/webp` |
| `.bmp` | `image/bmp` |
| `.mp4` | `video/mp4` |
| `.avi` | `video/x-msvideo` |
| `.mkv` | `video/x-matroska` |
| `.mov` | `video/quicktime` |
| `.mp3` | `audio/mpeg` |
| `.wav` | `audio/wav` |
| `.ogg` | `audio/ogg` |
| `.m4a` | `audio/mp4` |
| `.pdf` | `application/pdf` |
| `.doc`, `.docx` | `application/msword` |
| `.xls`, `.xlsx` | `application/vnd.ms-excel` |
| `.ppt`, `.pptx` | `application/vnd.ms-powerpoint` |
| `.zip` | `application/zip` |
| `.rar` | `application/x-rar-compressed` |
| `.7z` | `application/x-7z-compressed` |
| `.tar` | `application/x-tar` |
| `.gz` | `application/gzip` |
| `.html`, `.htm` | `text/html` |
| `.css` | `text/css` |
| `.js` | `application/javascript` |
| `.txt` | `text/plain` |
| `.md` | `text/markdown` |
| `.json` | `application/json` |
| `.xml` | `application/xml` |
| `.csv` | `text/csv` |

---

## Особенности

### Копирование файлов

Файлы автоматически копируются в `Downloads/exteraGram/` перед отправкой для обеспечения доступа другим приложениям.

### Автоудаление

Временные файлы автоматически удаляются через 5 минут после отправки.

### Потокобезопасность

Все методы потокобезопасны и могут вызываться из любого потока.

---

## Примеры

### Отправка статистики

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

### Экспорт в JSON

```python
def export_settings(self):
    import json
    import tempfile
    import time
    
    settings = {
        "version": self.version,
        "settings": {k: v for k, v in self.settings.items()},
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
def generate_report(self):
    import tempfile
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Отчёт</title>
</head>
<body>
    <h1>📊 Отчёт плагина</h1>
    <p><b>Плагин:</b> {self.name}</p>
    <p><b>Версия:</b> {self.version}</p>
</body>
</html>"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        temp_path = f.name
    
    Mandre.Share.share_file(temp_path, "Отчёт")
```

---

## См. также

- [Отправка файлов](/guide/share) - подробное руководство
- [MandreDevice](/api/mandre-device) - информация об устройстве
- [Примеры](/examples/calculator) - примеры использования
