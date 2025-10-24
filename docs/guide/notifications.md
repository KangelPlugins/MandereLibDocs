# Системные уведомления

**MandreNotification** позволяет показывать системные уведомления Android (не путать с Bulletin — встроенными уведомлениями Telegram).

## Импорт

```python
from mandre_lib import Mandre
```

## Простое уведомление

Базовое системное уведомление с заголовком и текстом:

```python
def show_simple_notification(self):
    Mandre.Notification.show_simple(
        title="MandreLib Demo",
        text="Это простое уведомление от плагина! 🚀",
        channel_id="my_plugin_notifications"  # Опционально
    )
```

### Параметры

- `title` (str) - заголовок уведомления
- `text` (str) - текст уведомления
- `channel_id` (str, optional) - ID канала уведомлений (по умолчанию "mandre_notifications")

## Уведомление в стиле диалога

Уведомление с аватаром отправителя, как в мессенджерах:

```python
def show_dialog_notification(self):
    Mandre.Notification.show_dialog(
        sender_name="Мой Плагин",
        message="Привет! Это уведомление в стиле диалога с аватаром! 🎉",
        avatar_url="https://example.com/avatar.png",
        channel_id="my_plugin_dialogs"  # Опционально
    )
```

### Параметры

- `sender_name` (str) - имя отправителя
- `message` (str) - текст сообщения
- `avatar_url` (str) - URL аватара (загружается автоматически)
- `channel_id` (str, optional) - ID канала уведомлений

## Особенности

### Автоматическое создание каналов

Каналы уведомлений создаются автоматически при первом использовании (требуется для Android 8.0+).

### Загрузка аватаров

Аватары автоматически загружаются по URL и скругляются для стиля мессенджера.

### Стилизация под Telegram

Уведомления-диалоги стилизованы под интерфейс Telegram для единообразия.

## Примеры использования

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
        MandreTTS.speak(f"Напоминание: {text}")
    
    task_name = f"reminder_{int(time.time())}"
    
    def one_time_task():
        send_reminder()
        Mandre.cancel_task(self, task_name)
    
    Mandre.schedule_task(self, task_name, delay_seconds, one_time_task)
    BulletinHelper.show_success(f"Напоминание установлено на {delay_seconds} сек")
```

### Уведомление с командой

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    self.add_on_send_message_hook()
    Mandre.register_command(self, "notify", self.cmd_notify)

def on_send_message_hook(self, params):
    return Mandre.handle_outgoing_command(params) or HookResult()

def cmd_notify(self, plugin, args, params):
    """Показать уведомление"""
    if not args:
        Mandre.Notification.show_simple(
            "Тестовое уведомление",
            "Это простое уведомление! 🚀"
        )
    else:
        Mandre.Notification.show_dialog(
            sender_name="Плагин",
            message=args,
            avatar_url="https://i.postimg.cc/436ngppG/image.png"
        )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Уведомления о событиях

```python
def on_new_message_received(self, message):
    if self.get_setting("notify_on_messages", False):
        sender = message.get("sender_name", "Неизвестный")
        text = message.get("text", "")
        
        Mandre.Notification.show_dialog(
            sender_name=sender,
            message=text[:100],  # Ограничиваем длину
            avatar_url=message.get("avatar_url", "")
        )
```

### Прогресс-уведомления

```python
def process_with_notifications(self, items):
    total = len(items)
    
    for i, item in enumerate(items):
        # Обрабатываем элемент
        process_item(item)
        
        # Показываем прогресс каждые 10%
        if (i + 1) % (total // 10) == 0:
            progress = int((i + 1) / total * 100)
            Mandre.Notification.show_simple(
                "Обработка",
                f"Выполнено {progress}% ({i + 1}/{total})"
            )
    
    # Финальное уведомление
    Mandre.Notification.show_dialog(
        sender_name="Обработка завершена",
        message=f"Обработано {total} элементов! ✅",
        avatar_url="https://i.postimg.cc/436ngppG/image.png"
    )
```

### Группировка уведомлений

Избегайте спама — группируйте уведомления:

```python
def __init__(self):
    self.pending_notifications = []
    self.timer_active = False

def queue_notification(self, message):
    self.pending_notifications.append(message)
    
    if not self.timer_active:
        self.timer_active = True
        Mandre.schedule_task(self, "notify_group", 5, self.send_grouped)

def send_grouped(self):
    count = len(self.pending_notifications)
    
    if count == 1:
        Mandre.Notification.show_simple(
            "Новое событие",
            self.pending_notifications[0]
        )
    elif count > 1:
        Mandre.Notification.show_simple(
            f"Новых событий: {count}",
            "\n".join(self.pending_notifications[:3])  # Первые 3
        )
    
    self.pending_notifications.clear()
    self.timer_active = False
    Mandre.cancel_task(self, "notify_group")
```

## Каналы уведомлений

### Использование разных каналов

Разные типы уведомлений можно разделить по каналам:

```python
# Важные уведомления
Mandre.Notification.show_simple(
    "Критическая ошибка",
    "Требуется внимание!",
    channel_id="critical_alerts"
)

# Информационные
Mandre.Notification.show_simple(
    "Информация",
    "Обновление доступно",
    channel_id="info_updates"
)

# Диалоги
Mandre.Notification.show_dialog(
    "Бот",
    "Новое сообщение",
    "https://example.com/bot.png",
    channel_id="bot_messages"
)
```

## Полный пример

```python
from base_plugin import BasePlugin, HookResult, HookStrategy
from mandre_lib import Mandre, MandreTTS
from ui.bulletin import BulletinHelper
from ui.settings import Header, Switch, Text
import time

class NotificationDemoPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        Mandre.register_command(self, "notify", self.cmd_notify)
        Mandre.register_command(self, "remind", self.cmd_remind)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
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
    
    def cmd_remind(self, plugin, args, params):
        """Установить напоминание"""
        if not args:
            BulletinHelper.show_error("Использование: .remind <секунды> <текст>")
            return HookResult(strategy=HookStrategy.CANCEL)
        
        parts = args.split(" ", 1)
        if len(parts) < 2:
            BulletinHelper.show_error("Укажите время и текст")
            return HookResult(strategy=HookStrategy.CANCEL)
        
        try:
            delay = int(parts[0])
            text = parts[1]
            self.set_reminder(text, delay)
        except ValueError:
            BulletinHelper.show_error("Неверное время")
        
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def set_reminder(self, text, delay_seconds):
        def send_reminder():
            Mandre.Notification.show_dialog(
                "Напоминание",
                text,
                "https://i.postimg.cc/436ngppG/image.png"
            )
            if self.get_setting("tts_enabled", False):
                MandreTTS.speak(f"Напоминание: {text}")
        
        task_name = f"reminder_{int(time.time())}"
        
        def one_time():
            send_reminder()
            Mandre.cancel_task(self, task_name)
        
        Mandre.schedule_task(self, task_name, delay_seconds, one_time)
        BulletinHelper.show_success(f"Напоминание через {delay_seconds} сек")
    
    def create_settings(self):
        return [
            Header(text="Уведомления"),
            Switch(
                text="Озвучивать напоминания",
                value=self.get_setting("tts_enabled", False),
                on_change=lambda v: self.set_setting("tts_enabled", v)
            ),
            Text(
                text="Тест простого уведомления",
                icon="msg_notifications_solar",
                on_click=lambda _: Mandre.Notification.show_simple("Тест", "Простое! 🚀")
            ),
            Text(
                text="Тест уведомления-диалога",
                icon="msg_notifications_solar",
                on_click=lambda _: Mandre.Notification.show_dialog(
                    "Demo", "Диалог! 👋", "https://i.postimg.cc/436ngppG/image.png"
                )
            )
        ]
```

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

# ❌ Неправильно - всё в один канал
Mandre.Notification.show_simple("Ошибка", "...")
Mandre.Notification.show_simple("Инфо", "...")
```

### 3. Ограничивайте длину текста

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

# ❌ Неправильно - нет контроля
Mandre.Notification.show_simple("Title", "Text")
```

## См. также

- [MandreNotification API](/api/mandre-notification) - полная справка
- [MandreTTS](/guide/tts) - озвучивание текста
- [Планировщик](/guide/scheduler) - отложенные уведомления
