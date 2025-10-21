# Deep Linking

MandreLib позволяет регистрировать пользовательские ссылки типа `tg://` для открытия функций плагина.

## Базовое использование

```python
from mandre_lib import Mandre

def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Регистрируем алиас для ссылки tg://my_plugin/action
    Mandre.add_tg_alias("my_plugin/action", self.handle_deeplink)

def handle_deeplink(self, intent):
    """Обработчик deep link"""
    # intent — Android Intent с данными ссылки
    uri_str = str(intent.getData())
    self.log(f"Открыта ссылка: {uri_str}")
    
    BulletinHelper.show_success("Ссылка открыта!")

def on_plugin_unload(self):
    # Удаляем алиас при выгрузке
    Mandre.remove_tg_alias("my_plugin/action")
```

## Автоматическая ссылка на настройки

Для быстрого открытия настроек плагина:

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Автоматически создаёт ссылку tg://settings/<plugin_id>
    Mandre.register_settings_alias(self)
```

Теперь пользователи могут открыть настройки по ссылке: `tg://settings/my_plugin`

## Парсинг параметров

Извлечение параметров из ссылки:

```python
def handle_deeplink(self, intent):
    """Обработчик с парсингом параметров"""
    uri = intent.getData()
    uri_str = str(uri)
    
    # Пример: tg://my_plugin/open?chat_id=123&message=hello
    
    # Парсим параметры
    if "?" in uri_str:
        path, query = uri_str.split("?", 1)
        params = self.parse_query(query)
        
        chat_id = params.get("chat_id")
        message = params.get("message")
        
        self.log(f"Chat ID: {chat_id}, Message: {message}")
        
        # Выполняем действие
        if chat_id and message:
            self.send_message(chat_id, message)

def parse_query(self, query):
    """Парсинг query параметров"""
    params = {}
    for pair in query.split("&"):
        if "=" in pair:
            key, value = pair.split("=", 1)
            params[key] = value
    return params
```

## Примеры использования

### Открытие чата

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.add_tg_alias("my_plugin/open_chat", self.open_chat_link)

def open_chat_link(self, intent):
    """Открыть чат по ссылке
    Пример: tg://my_plugin/open_chat?id=123456789
    """
    uri_str = str(intent.getData())
    
    # Извлекаем ID чата
    if "id=" in uri_str:
        chat_id = uri_str.split("id=")[1].split("&")[0]
        
        try:
            chat_id = int(chat_id)
            self.open_chat(chat_id)
            BulletinHelper.show_success(f"Открываю чат {chat_id}")
        except ValueError:
            BulletinHelper.show_error("Неверный ID чата")
```

### Выполнение команды

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.add_tg_alias("my_plugin/command", self.execute_command_link)

def execute_command_link(self, intent):
    """Выполнить команду по ссылке
    Пример: tg://my_plugin/command?cmd=stats
    """
    uri_str = str(intent.getData())
    
    if "cmd=" in uri_str:
        command = uri_str.split("cmd=")[1].split("&")[0]
        
        # Выполняем команду
        if command == "stats":
            self.show_statistics()
        elif command == "clear":
            self.clear_data()
        elif command == "export":
            self.export_data()
        else:
            BulletinHelper.show_error(f"Неизвестная команда: {command}")
```

### Быстрые действия

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Регистрируем несколько быстрых действий
    Mandre.add_tg_alias("my_plugin/toggle", self.toggle_feature)
    Mandre.add_tg_alias("my_plugin/backup", self.create_backup)
    Mandre.add_tg_alias("my_plugin/restore", self.restore_backup)

def toggle_feature(self, intent):
    """Переключить функцию"""
    enabled = self.get_setting("feature_enabled", False)
    new_state = not enabled
    self.set_setting("feature_enabled", new_state)
    
    status = "включена" if new_state else "выключена"
    BulletinHelper.show_success(f"Функция {status}")

def create_backup(self, intent):
    """Создать резервную копию"""
    self.backup_all_data()
    BulletinHelper.show_success("Резервная копия создана")

def restore_backup(self, intent):
    """Восстановить из резервной копии"""
    self.restore_from_backup()
    BulletinHelper.show_success("Данные восстановлены")
```

### Передача данных

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.add_tg_alias("my_plugin/share", self.handle_share)

def handle_share(self, intent):
    """Обработка переданных данных
    Пример: tg://my_plugin/share?text=Hello&type=message
    """
    uri_str = str(intent.getData())
    params = self.parse_query(uri_str.split("?")[1] if "?" in uri_str else "")
    
    text = params.get("text", "")
    share_type = params.get("type", "message")
    
    if text:
        if share_type == "message":
            self.save_message(text)
        elif share_type == "note":
            self.save_note(text)
        
        BulletinHelper.show_success("Данные сохранены")
    else:
        BulletinHelper.show_error("Нет данных для сохранения")
```

### Множественные алиасы

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Регистрируем несколько алиасов
    aliases = {
        "my_plugin/settings": self.open_settings,
        "my_plugin/help": self.show_help,
        "my_plugin/about": self.show_about,
        "my_plugin/export": self.export_data,
        "my_plugin/import": self.import_data
    }
    
    for alias, handler in aliases.items():
        Mandre.add_tg_alias(alias, handler)

def on_plugin_unload(self):
    # Удаляем все алиасы
    for alias in ["settings", "help", "about", "export", "import"]:
        Mandre.remove_tg_alias(f"my_plugin/{alias}")
```

## Создание ссылок

Для создания ссылок, которые пользователи могут использовать:

```python
def generate_share_link(self, text):
    """Создать ссылку для шаринга"""
    import urllib.parse
    
    encoded_text = urllib.parse.quote(text)
    link = f"tg://my_plugin/share?text={encoded_text}&type=message"
    
    return link

def cmd_share(self, plugin, args, params):
    """Команда .share - создать ссылку"""
    if not args:
        BulletinHelper.show_error("Использование: .share <текст>")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    link = self.generate_share_link(args)
    
    # Копируем в буфер обмена
    self.copy_to_clipboard(link)
    BulletinHelper.show_success("Ссылка скопирована в буфер")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

## Интеграция с настройками

Добавление ссылок в настройки:

```python
def create_settings(self):
    return [
        Header(text="Быстрые действия"),
        Text(
            text="Создать резервную копию",
            description="tg://my_plugin/backup",
            icon="msg_saved",
            on_click=lambda _: self.copy_link("tg://my_plugin/backup")
        ),
        Text(
            text="Восстановить данные",
            description="tg://my_plugin/restore",
            icon="msg_retry",
            on_click=lambda _: self.copy_link("tg://my_plugin/restore")
        ),
        Text(
            text="Переключить функцию",
            description="tg://my_plugin/toggle",
            icon="msg_switch",
            on_click=lambda _: self.copy_link("tg://my_plugin/toggle")
        )
    ]

def copy_link(self, link):
    """Скопировать ссылку в буфер"""
    self.copy_to_clipboard(link)
    BulletinHelper.show_success("Ссылка скопирована")
```

## Обработка ошибок

```python
def safe_deeplink_handler(self, intent):
    """Безопасный обработчик deep link"""
    try:
        uri_str = str(intent.getData())
        self.log(f"Deep link: {uri_str}")
        
        # Валидация
        if not uri_str.startswith("tg://my_plugin/"):
            BulletinHelper.show_error("Неверная ссылка")
            return
        
        # Обработка
        self.process_deeplink(uri_str)
        
    except Exception as e:
        self.log(f"Ошибка обработки deep link: {e}")
        BulletinHelper.show_error("Ошибка обработки ссылки")
```

## Логирование

```python
def handle_deeplink(self, intent):
    """Обработчик с логированием"""
    uri_str = str(intent.getData())
    
    # Логируем использование
    history = MandreData.read_persistent_json(self.id, "deeplinks.json", [])
    history.append({
        "uri": uri_str,
        "timestamp": time.time()
    })
    
    # Ограничиваем размер истории
    if len(history) > 100:
        history = history[-100:]
    
    MandreData.write_persistent_json(self.id, "deeplinks.json", history)
    
    # Обрабатываем ссылку
    self.process_deeplink(uri_str)
```

## Важные моменты

::: tip Уникальные алиасы
Используйте уникальные префиксы для алиасов, чтобы избежать конфликтов с другими плагинами:

```python
# ✅ Хорошо
Mandre.add_tg_alias("my_unique_plugin/action", handler)

# ❌ Плохо (может конфликтовать)
Mandre.add_tg_alias("action", handler)
```
:::

::: warning Очистка
Всегда удаляйте алиасы при выгрузке плагина:

```python
def on_plugin_unload(self):
    Mandre.remove_tg_alias("my_plugin/action")
```
:::

::: info Безопасность
Валидируйте все параметры из ссылок перед использованием:

```python
def handle_deeplink(self, intent):
    uri_str = str(intent.getData())
    
    # Проверяем формат
    if not uri_str.startswith("tg://my_plugin/"):
        return
    
    # Валидируем параметры
    # ...
```
:::

## Полный пример

```python
__id__ = "deeplink_plugin"
__name__ = "Deep Link Плагин"
__version__ = "1.0"
__author__ = "@yourname"
__description__ = "Плагин с deep linking"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin
from mandre_lib import Mandre, MandreData
from ui.bulletin import BulletinHelper
from ui.settings import Header, Text
import urllib.parse

class DeepLinkPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        
        # Регистрируем алиасы
        Mandre.add_tg_alias("deeplink_plugin/open", self.handle_open)
        Mandre.add_tg_alias("deeplink_plugin/action", self.handle_action)
        Mandre.register_settings_alias(self)
    
    def handle_open(self, intent):
        """Обработчик tg://deeplink_plugin/open?id=123"""
        try:
            uri_str = str(intent.getData())
            
            if "id=" in uri_str:
                item_id = uri_str.split("id=")[1].split("&")[0]
                self.open_item(item_id)
                BulletinHelper.show_success(f"Открыт элемент {item_id}")
            else:
                BulletinHelper.show_error("ID не указан")
                
        except Exception as e:
            self.log(f"Ошибка: {e}")
            BulletinHelper.show_error("Ошибка обработки ссылки")
    
    def handle_action(self, intent):
        """Обработчик tg://deeplink_plugin/action?cmd=stats"""
        try:
            uri_str = str(intent.getData())
            
            if "cmd=" in uri_str:
                command = uri_str.split("cmd=")[1].split("&")[0]
                
                if command == "stats":
                    self.show_statistics()
                elif command == "clear":
                    self.clear_data()
                else:
                    BulletinHelper.show_error(f"Неизвестная команда: {command}")
            
        except Exception as e:
            self.log(f"Ошибка: {e}")
    
    def create_settings(self):
        return [
            Header(text="Deep Links"),
            Text(
                text="Открыть настройки",
                description=f"tg://settings/{self.id}",
                icon="msg_settings",
                on_click=lambda _: self.copy_link(f"tg://settings/{self.id}")
            ),
            Text(
                text="Показать статистику",
                description="tg://deeplink_plugin/action?cmd=stats",
                icon="msg_stats",
                on_click=lambda _: self.copy_link("tg://deeplink_plugin/action?cmd=stats")
            )
        ]
    
    def copy_link(self, link):
        """Копировать ссылку в буфер"""
        # Реализация копирования
        BulletinHelper.show_success("Ссылка скопирована")
    
    def on_plugin_unload(self):
        # Удаляем алиасы
        Mandre.remove_tg_alias("deeplink_plugin/open")
        Mandre.remove_tg_alias("deeplink_plugin/action")
```

## Следующие шаги

- [Примеры](/examples/calculator) - готовые примеры плагинов
- [API Reference](/api/overview) - полная документация API
- [Частые ошибки](/examples/common-mistakes) - как избежать проблем
