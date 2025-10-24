# MandreNotification API

Модуль для показа системных уведомлений Android.

## Импорт

```python
from mandre_lib import Mandre
```

## Методы

### show_simple()

Показывает простое системное уведомление.

```python
Mandre.Notification.show_simple(title, text, channel_id=None)
```

**Параметры:**
- `title` (str) - заголовок уведомления
- `text` (str) - текст уведомления
- `channel_id` (str, optional) - ID канала уведомлений (по умолчанию "mandre_notifications")

**Возвращает:** None

**Пример:**

```python
Mandre.Notification.show_simple(
    title="MandreLib Demo",
    text="Это простое уведомление от плагина! 🚀",
    channel_id="my_plugin_notifications"
)
```

---

### show_dialog()

Показывает уведомление в стиле диалога с аватаром.

```python
Mandre.Notification.show_dialog(sender_name, message, avatar_url, channel_id=None)
```

**Параметры:**
- `sender_name` (str) - имя отправителя
- `message` (str) - текст сообщения
- `avatar_url` (str) - URL аватара
- `channel_id` (str, optional) - ID канала уведомлений (по умолчанию "mandre_dialogs")

**Возвращает:** None

**Пример:**

```python
Mandre.Notification.show_dialog(
    sender_name="Мой Плагин",
    message="Привет! Это уведомление в стиле диалога! 🎉",
    avatar_url="https://example.com/avatar.png",
    channel_id="my_plugin_dialogs"
)
```

---

## Особенности

### Автоматическое создание каналов

Каналы уведомлений создаются автоматически при первом использовании (требуется для Android 8.0+).

### Загрузка аватаров

Аватары автоматически загружаются по URL и скругляются для стиля мессенджера.

### Стилизация

Уведомления-диалоги стилизованы под интерфейс Telegram для единообразия.

---

## Каналы уведомлений

### Стандартные каналы

- `"mandre_notifications"` - для простых уведомлений
- `"mandre_dialogs"` - для уведомлений-диалогов

### Пользовательские каналы

Вы можете создавать свои каналы для разных типов уведомлений:

```python
# Критические уведомления
Mandre.Notification.show_simple(
    "Ошибка",
    "Требуется внимание!",
    channel_id="critical_alerts"
)

# Информационные
Mandre.Notification.show_simple(
    "Информация",
    "Обновление доступно",
    channel_id="info_updates"
)
```

---

## Примеры

### Уведомление о завершении задачи

```python
def on_task_complete(self):
    Mandre.Notification.show_simple(
        title="Задача выполнена",
        text="Обработка данных завершена успешно! ✅"
    )
```

### Напоминание

```python
def set_reminder(self, text, delay_seconds):
    import time
    
    def send_reminder():
        Mandre.Notification.show_dialog(
            sender_name="Напоминание",
            message=text,
            avatar_url="https://i.postimg.cc/436ngppG/image.png"
        )
    
    task_name = f"reminder_{int(time.time())}"
    
    def one_time_task():
        send_reminder()
        Mandre.cancel_task(self, task_name)
    
    Mandre.schedule_task(self, task_name, delay_seconds, one_time_task)
```

### Команда для уведомлений

```python
def cmd_notify(self, plugin, args, params):
    """Показать уведомление"""
    if not args:
        Mandre.Notification.show_simple("Тест", "Простое уведомление! 🚀")
    else:
        Mandre.Notification.show_dialog(
            "Demo Plugin",
            args,
            "https://i.postimg.cc/436ngppG/image.png"
        )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Прогресс-уведомления

```python
def process_with_notifications(self, items):
    total = len(items)
    
    for i, item in enumerate(items):
        process_item(item)
        
        if (i + 1) % (total // 10) == 0:
            progress = int((i + 1) / total * 100)
            Mandre.Notification.show_simple(
                "Обработка",
                f"Выполнено {progress}% ({i + 1}/{total})"
            )
    
    Mandre.Notification.show_dialog(
        "Обработка завершена",
        f"Обработано {total} элементов! ✅",
        "https://i.postimg.cc/436ngppG/image.png"
    )
```

---

## Лучшие практики

### 1. Не спамьте уведомлениями

```python
# ✅ Правильно - группируем
def queue_notification(self, msg):
    self.pending.append(msg)
    if len(self.pending) >= 5:
        self.send_grouped()

# ❌ Неправильно - спам
for item in items:
    Mandre.Notification.show_simple("Item", str(item))
```

### 2. Используйте разные каналы

```python
# ✅ Правильно
Mandre.Notification.show_simple("Ошибка", "...", channel_id="errors")
Mandre.Notification.show_simple("Инфо", "...", channel_id="info")

# ❌ Неправильно
Mandre.Notification.show_simple("Ошибка", "...")
Mandre.Notification.show_simple("Инфо", "...")
```

### 3. Ограничивайте длину

```python
# ✅ Правильно
text = long_text[:100] + "..." if len(long_text) > 100 else long_text
Mandre.Notification.show_simple("Title", text)

# ❌ Неправильно
Mandre.Notification.show_simple("Title", very_long_text)
```

### 4. Проверяйте настройки

```python
# ✅ Правильно
if self.get_setting("notifications_enabled", True):
    Mandre.Notification.show_simple("Title", "Text")

# ❌ Неправильно
Mandre.Notification.show_simple("Title", "Text")
```

---

## См. также

- [Системные уведомления](/guide/notifications) - подробное руководство
- [MandreTTS](/api/mandre-tts) - озвучивание текста
- [Планировщик](/guide/scheduler) - отложенные уведомления
