# MandreTTS API

Модуль для озвучивания текста с помощью системного TTS.

## Импорт

```python
from mandre_lib import MandreTTS
```

## Методы

### speak()

Озвучивает текст с помощью системного синтезатора речи.

```python
MandreTTS.speak(text)
```

**Параметры:**
- `text` (str) - текст для озвучивания

**Возвращает:** None

**Пример:**

```python
MandreTTS.speak("Привет, мир!")
```

---

## Особенности

### Инициализация

TTS автоматически инициализируется при первом вызове. Первый вызов может занять 1-2 секунды.

### Язык

Язык озвучивания определяется автоматически на основе локали устройства. Для русского текста убедитесь, что в системе установлен русский голос.

### Качество

Качество зависит от системного TTS движка (обычно Google TTS). На разных устройствах может отличаться.

---

## Примеры использования

### Простое озвучивание

```python
def cmd_say(self, plugin, args, params):
    """Команда .say <текст>"""
    if not args:
        BulletinHelper.show_error("Использование: .say <текст>")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    MandreTTS.speak(args)
    BulletinHelper.show_success("🔊 Озвучиваю...")
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Озвучивание времени

```python
from datetime import datetime

def cmd_time(self, plugin, args, params):
    """Команда .time - озвучить время"""
    now = datetime.now()
    time_str = now.strftime("%H:%M")
    
    MandreTTS.speak(f"Сейчас {time_str}")
    BulletinHelper.show_info(f"🕐 {time_str}")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Озвучивание уведомлений

```python
def on_new_message(self, message):
    """Озвучивание входящих сообщений"""
    if self.get_setting("tts_enabled", False):
        sender = message.get("sender_name", "Неизвестный")
        text = message.get("text", "")
        
        if text:
            MandreTTS.speak(f"Сообщение от {sender}: {text}")
```

### Меню с озвучиванием

```python
def cmd_speak_menu(self, plugin, args, params):
    """Меню фраз для озвучивания"""
    phrases = [
        "Привет!",
        "Как дела?",
        "Спасибо!",
        "До свидания!"
    ]
    
    MandreUI.show(
        title="Выберите фразу",
        items=phrases,
        on_select=lambda i, text: MandreTTS.speak(text)
    )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Озвучивание с задержкой

```python
import time

def speak_delayed(self, text, delay_seconds=2):
    """Озвучить с задержкой"""
    def delayed():
        time.sleep(delay_seconds)
        MandreTTS.speak(text)
    
    run_on_queue(delayed)
    BulletinHelper.show_info(f"Озвучу через {delay_seconds} сек")
```

### Последовательное озвучивание

```python
def speak_sequence(self, texts, interval=2):
    """Озвучить несколько фраз последовательно"""
    def speak_next(index=0):
        if index < len(texts):
            MandreTTS.speak(texts[index])
            time.sleep(interval)
            speak_next(index + 1)
    
    run_on_queue(speak_next)
```

### Озвучивание статистики

```python
def cmd_stats_voice(self, plugin, args, params):
    """Озвучить статистику"""
    messages = self.get_setting("message_count", 0)
    commands = self.get_setting("command_count", 0)
    
    text = f"Отправлено {messages} сообщений и выполнено {commands} команд"
    
    MandreTTS.speak(text)
    BulletinHelper.show_info("🔊 Озвучиваю статистику...")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Настройки TTS

```python
from ui.settings import Header, Switch, Text

def create_settings(self):
    return [
        Header(text="Озвучивание"),
        Switch(
            text="Включить TTS",
            description="Озвучивать сообщения и уведомления",
            value=self.get_setting("tts_enabled", False),
            on_change=lambda v: self.set_setting("tts_enabled", v)
        ),
        Switch(
            text="Озвучивать входящие",
            description="Озвучивать входящие сообщения",
            value=self.get_setting("tts_incoming", False),
            on_change=lambda v: self.set_setting("tts_incoming", v)
        ),
        Text(
            text="Тест озвучивания",
            icon="msg_voicechat",
            on_click=lambda _: MandreTTS.speak("Тестовое сообщение")
        )
    ]
```

### Безопасное озвучивание

```python
def safe_speak(self, text):
    """Безопасное озвучивание с обработкой ошибок"""
    try:
        # Ограничиваем длину
        if len(text) > 200:
            text = text[:200] + "..."
        
        MandreTTS.speak(text)
        return True
    except Exception as e:
        self.log(f"Ошибка TTS: {e}")
        BulletinHelper.show_error("Ошибка озвучивания")
        return False
```

### Озвучивание с условием

```python
def speak_if_enabled(self, text):
    """Озвучить если включено в настройках"""
    if self.get_setting("tts_enabled", False):
        MandreTTS.speak(text)
```

## Ограничения

- Максимальная длина текста: ~4000 символов (зависит от системы)
- Нельзя контролировать скорость и тон голоса
- Нельзя прервать озвучивание программно
- Работает только на Android устройствах
- Требуется установленный системный TTS движок

## Лучшие практики

### 1. Ограничивайте длину

```python
def speak_safe(self, text):
    if len(text) > 200:
        text = text[:200] + "..."
    MandreTTS.speak(text)
```

### 2. Показывайте обратную связь

```python
MandreTTS.speak(text)
BulletinHelper.show_info("🔊 Озвучиваю...")
```

### 3. Проверяйте настройки

```python
if self.get_setting("tts_enabled", False):
    MandreTTS.speak(text)
```

### 4. Обрабатывайте ошибки

```python
try:
    MandreTTS.speak(text)
except Exception as e:
    self.log(f"TTS error: {e}")
```

## Полный пример

```python
__id__ = "tts_plugin"
__name__ = "TTS Плагин"
__version__ = "1.0"

from base_plugin import BasePlugin, HookResult, HookStrategy
from mandre_lib import Mandre, MandreTTS, MandreUI
from ui.bulletin import BulletinHelper
from ui.settings import Header, Switch, Text

class TTSPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        Mandre.register_command(self, "say", self.cmd_say)
        Mandre.register_command(self, "time", self.cmd_time)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_say(self, plugin, args, params):
        if not args:
            BulletinHelper.show_error("Использование: .say <текст>")
            return HookResult(strategy=HookStrategy.CANCEL)
        
        MandreTTS.speak(args)
        BulletinHelper.show_success("🔊 Озвучиваю...")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def cmd_time(self, plugin, args, params):
        from datetime import datetime
        now = datetime.now()
        time_str = now.strftime("%H:%M")
        
        MandreTTS.speak(f"Сейчас {time_str}")
        BulletinHelper.show_info(f"🕐 {time_str}")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def create_settings(self):
        return [
            Header(text="TTS"),
            Text(
                text="Тест озвучивания",
                icon="msg_voicechat",
                on_click=lambda _: MandreTTS.speak("Тестовое сообщение")
            )
        ]
```

## См. также

- [Текст-в-речь](/guide/tts) - подробное руководство
- [MandreUI](/api/mandre-ui) - UI компоненты
- [Примеры](/examples/calculator) - примеры использования
