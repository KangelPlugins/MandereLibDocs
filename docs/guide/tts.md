# Текст-в-речь (TTS)

MandreTTS предоставляет простой способ озвучивания текста с помощью системного синтезатора речи Android.

## Базовое использование

```python
from mandre_lib import MandreTTS

def speak_hello(self):
    MandreTTS.speak("Привет, мир!")
```

Вот и всё! TTS автоматически инициализируется при первом использовании.

## Интеграция с командами

```python
from mandre_lib import Mandre, MandreTTS
from base_plugin import BasePlugin, HookResult, HookStrategy

class TTSPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        Mandre.register_command(self, "say", self.cmd_say)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_say(self, plugin, args, params):
        """Команда .say <текст> - озвучить текст"""
        if not args:
            BulletinHelper.show_error("Использование: .say <текст>")
            return HookResult(strategy=HookStrategy.CANCEL)
        
        MandreTTS.speak(args)
        BulletinHelper.show_success("Озвучиваю...")
        return HookResult(strategy=HookStrategy.CANCEL)
```

## Примеры использования

### Озвучивание уведомлений

```python
def on_new_message(self, message):
    """Озвучивание входящих сообщений"""
    if self.get_setting("tts_enabled", False):
        sender = message.get("sender_name", "Неизвестный")
        text = message.get("text", "")
        
        # Озвучиваем
        MandreTTS.speak(f"Сообщение от {sender}: {text}")
```

### Голосовой помощник

```python
def cmd_time(self, plugin, args, params):
    """Команда .time - озвучить текущее время"""
    from datetime import datetime
    
    now = datetime.now()
    time_str = now.strftime("%H:%M")
    
    MandreTTS.speak(f"Сейчас {time_str}")
    BulletinHelper.show_info(f"🕐 {time_str}")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Озвучивание статистики

```python
def cmd_stats_voice(self, plugin, args, params):
    """Команда .stats_voice - озвучить статистику"""
    messages = self.get_setting("message_count", 0)
    commands = self.get_setting("command_count", 0)
    
    text = f"Отправлено {messages} сообщений и выполнено {commands} команд"
    
    MandreTTS.speak(text)
    BulletinHelper.show_info("🔊 Озвучиваю статистику...")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Чтение текста из буфера

```python
def cmd_read_clipboard(self, plugin, args, params):
    """Команда .read - прочитать текст из буфера обмена"""
    try:
        # Получаем текст из буфера
        clipboard_text = self.get_clipboard_text()
        
        if clipboard_text:
            MandreTTS.speak(clipboard_text)
            BulletinHelper.show_success("Читаю текст из буфера")
        else:
            BulletinHelper.show_error("Буфер обмена пуст")
            
    except Exception as e:
        BulletinHelper.show_error(f"Ошибка: {e}")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Озвучивание с выбором

```python
def cmd_speak_menu(self, plugin, args, params):
    """Команда .speak_menu - меню озвучивания"""
    phrases = [
        "Привет!",
        "Как дела?",
        "Спасибо!",
        "До свидания!",
        "Отлично!"
    ]
    
    MandreUI.show(
        title="Выберите фразу",
        items=phrases,
        on_select=lambda i, text: MandreTTS.speak(text),
        message="Фраза будет озвучена"
    )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Озвучивание с задержкой

```python
def speak_with_delay(self, text, delay_seconds=2):
    """Озвучить текст с задержкой"""
    import time
    
    def delayed_speak():
        time.sleep(delay_seconds)
        MandreTTS.speak(text)
    
    # Запускаем в фоновом потоке
    run_on_queue(delayed_speak)
    
    BulletinHelper.show_info(f"Озвучу через {delay_seconds} сек")
```

### Последовательное озвучивание

```python
def speak_sequence(self, texts, interval=2):
    """Озвучить несколько фраз последовательно"""
    def speak_next(index=0):
        if index < len(texts):
            MandreTTS.speak(texts[index])
            
            # Планируем следующую фразу
            import time
            time.sleep(interval)
            speak_next(index + 1)
    
    run_on_queue(speak_next)
```

## Настройки TTS

Создайте настройки для управления TTS:

```python
def create_settings(self):
    return [
        Header(text="Настройки TTS"),
        Switch(
            text="Включить озвучивание",
            description="Озвучивать уведомления и сообщения",
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

## Важные моменты

::: tip Инициализация
TTS инициализируется автоматически при первом вызове `speak()`. Первый вызов может быть медленным (1-2 секунды).
:::

::: warning Язык
TTS использует системный синтезатор речи. Язык устанавливается автоматически на основе локали устройства. Для русского текста убедитесь, что в системе установлен русский голос.
:::

::: info Качество
Качество озвучивания зависит от системного TTS движка (обычно Google TTS). На разных устройствах качество может отличаться.
:::

## Обработка ошибок

```python
def safe_speak(self, text):
    """Безопасное озвучивание с обработкой ошибок"""
    try:
        MandreTTS.speak(text)
        return True
    except Exception as e:
        self.log(f"Ошибка TTS: {e}")
        BulletinHelper.show_error("Ошибка озвучивания")
        return False
```

## Ограничения

- Максимальная длина текста зависит от системного TTS (обычно ~4000 символов)
- Нельзя контролировать скорость и тон голоса (зависит от системы)
- Нельзя прервать озвучивание программно
- Работает только на Android устройствах

## Советы

1. **Короткие фразы** - озвучивайте короткие и понятные фразы
2. **Проверка длины** - ограничивайте длину текста:
   ```python
   if len(text) > 200:
       text = text[:200] + "..."
   MandreTTS.speak(text)
   ```
3. **Обратная связь** - показывайте уведомление при озвучивании:
   ```python
   MandreTTS.speak(text)
   BulletinHelper.show_info("🔊 Озвучиваю...")
   ```

## Полный пример

```python
__id__ = "tts_plugin"
__name__ = "TTS Плагин"
__version__ = "1.0"
__author__ = "@yourname"
__description__ = "Плагин с озвучиванием"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin, HookResult, HookStrategy
from mandre_lib import Mandre, MandreTTS, MandreUI
from ui.bulletin import BulletinHelper
from ui.settings import Header, Switch, Text

class TTSPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        # Команды
        Mandre.register_command(self, "say", self.cmd_say)
        Mandre.register_command(self, "time", self.cmd_time)
        Mandre.register_command(self, "menu", self.cmd_menu)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_say(self, plugin, args, params):
        """Команда .say <текст>"""
        if not args:
            BulletinHelper.show_error("Использование: .say <текст>")
            return HookResult(strategy=HookStrategy.CANCEL)
        
        MandreTTS.speak(args)
        BulletinHelper.show_success("🔊 Озвучиваю...")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def cmd_time(self, plugin, args, params):
        """Команда .time - озвучить время"""
        from datetime import datetime
        now = datetime.now()
        time_str = now.strftime("%H:%M")
        
        MandreTTS.speak(f"Сейчас {time_str}")
        BulletinHelper.show_info(f"🕐 {time_str}")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def cmd_menu(self, plugin, args, params):
        """Команда .menu - меню фраз"""
        phrases = [
            "Привет!",
            "Как дела?",
            "Спасибо!",
            "До свидания!"
        ]
        
        MandreUI.show(
            title="Выберите фразу",
            items=phrases,
            on_select=lambda i, t: MandreTTS.speak(t)
        )
        return HookResult(strategy=HookStrategy.CANCEL)
    
    def create_settings(self):
        return [
            Header(text="Настройки TTS"),
            Text(
                text="Тест озвучивания",
                icon="msg_voicechat",
                on_click=lambda _: MandreTTS.speak("Тестовое сообщение")
            )
        ]
```

## Следующие шаги

- [Аутентификация](/guide/auth) - запрос подтверждения личности
- [Локализация](/guide/localization) - перевод на другие языки
- [Примеры](/examples/calculator) - готовые примеры
