# Локализация

MandreLib может автоматически переводить строки плагина на язык пользователя с помощью AI.

## Базовое использование

```python
from mandre_lib import Mandre

# Словарь переводов (исходный язык - русский)
_translations = {
    "greeting": "Привет, {name}!",
    "error": "Произошла ошибка",
    "success": "Готово!",
    "confirm_delete": "Вы уверены, что хотите удалить {count} элементов?"
}

def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Регистрируем переводы
    # "ru" — исходный язык плагина
    Mandre.register_localizations(self, "ru", _translations)

def some_function(self):
    # Используем переводы
    greeting = Mandre.t(self, "greeting", name="Алиса")
    self.log(greeting)  # "Привет, Алиса!" на русском,
                        # автоматически переведётся на язык пользователя
    
    error_msg = Mandre.t(self, "error")
    BulletinHelper.show_error(error_msg)
```

## Как это работает

1. **Определение языка** - MandreLib определяет язык устройства пользователя
2. **Запрос перевода** - Если язык отличается от исходного, запрашивает перевод через AI (Pollinations API)
3. **Кэширование** - Переводы кэшируются для быстроты
4. **Fallback** - Если перевод недоступен, показывается исходный текст

## Параметры с подстановкой

Используйте `{переменная}` для динамических значений:

```python
_translations = {
    "welcome": "Добро пожаловать, {username}!",
    "items_count": "Найдено {count} элементов",
    "progress": "Выполнено {current} из {total}",
    "time_left": "Осталось {minutes} минут и {seconds} секунд"
}

# Использование
welcome = Mandre.t(self, "welcome", username="Иван")
count = Mandre.t(self, "items_count", count=42)
progress = Mandre.t(self, "progress", current=5, total=10)
time = Mandre.t(self, "time_left", minutes=3, seconds=45)
```

## Примеры использования

### Локализация команд

```python
_translations = {
    "cmd_help_desc": "Показать справку по командам",
    "cmd_stats_desc": "Показать статистику плагина",
    "cmd_clear_desc": "Очистить все данные",
    "help_text": """
📖 Доступные команды:
.help - {help_desc}
.stats - {stats_desc}
.clear - {clear_desc}
    """,
    "stats_text": "📊 Статистика:\nСообщений: {messages}\nКоманд: {commands}"
}

def cmd_help(self, plugin, args, params):
    """Команда .help"""
    help_text = Mandre.t(
        self, "help_text",
        help_desc=Mandre.t(self, "cmd_help_desc"),
        stats_desc=Mandre.t(self, "cmd_stats_desc"),
        clear_desc=Mandre.t(self, "cmd_clear_desc")
    )
    
    params["message"] = help_text
    return HookResult(strategy=HookStrategy.MODIFY, params=params)

def cmd_stats(self, plugin, args, params):
    """Команда .stats"""
    messages = self.get_setting("message_count", 0)
    commands = self.get_setting("command_count", 0)
    
    stats = Mandre.t(
        self, "stats_text",
        messages=messages,
        commands=commands
    )
    
    params["message"] = stats
    return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

### Локализация UI

```python
_translations = {
    "settings_header": "Настройки плагина",
    "enable_feature": "Включить функцию",
    "enable_feature_desc": "Активировать основную функцию плагина",
    "notifications": "Уведомления",
    "notifications_desc": "Показывать уведомления о событиях",
    "about": "О плагине",
    "version": "Версия: {version}",
    "author": "Автор: {author}"
}

def create_settings(self):
    return [
        Header(text=Mandre.t(self, "settings_header")),
        Switch(
            text=Mandre.t(self, "enable_feature"),
            description=Mandre.t(self, "enable_feature_desc"),
            value=self.get_setting("enabled", False),
            on_change=lambda v: self.set_setting("enabled", v)
        ),
        Switch(
            text=Mandre.t(self, "notifications"),
            description=Mandre.t(self, "notifications_desc"),
            value=self.get_setting("notifications", True),
            on_change=lambda v: self.set_setting("notifications", v)
        ),
        Divider(),
        Header(text=Mandre.t(self, "about")),
        Text(text=Mandre.t(self, "version", version="1.0")),
        Text(text=Mandre.t(self, "author", author="@yourname"))
    ]
```

### Локализация уведомлений

```python
_translations = {
    "success_saved": "Данные успешно сохранены",
    "success_deleted": "Удалено {count} элементов",
    "error_network": "Ошибка сети. Проверьте подключение",
    "error_invalid": "Неверный формат данных",
    "warning_limit": "Достигнут лимит: {current}/{max}",
    "info_processing": "Обработка... {percent}%"
}

def save_data(self, data):
    """Сохранение с локализованным уведомлением"""
    try:
        MandreData.write_persistent_json(self.id, "data.json", data)
        msg = Mandre.t(self, "success_saved")
        BulletinHelper.show_success(msg)
    except Exception as e:
        msg = Mandre.t(self, "error_network")
        BulletinHelper.show_error(msg)

def delete_items(self, count):
    """Удаление с подсчётом"""
    # Удаляем элементы
    self.perform_delete(count)
    
    msg = Mandre.t(self, "success_deleted", count=count)
    BulletinHelper.show_success(msg)
```

### Локализация диалогов

```python
_translations = {
    "dialog_title": "Выберите действие",
    "dialog_message": "Что вы хотите сделать?",
    "action_export": "📤 Экспортировать данные",
    "action_import": "📥 Импортировать данные",
    "action_clear": "🗑️ Очистить всё",
    "action_cancel": "Отмена",
    "confirm_title": "Подтверждение",
    "confirm_message": "Вы уверены?"
}

def show_actions_menu(self):
    """Меню действий с локализацией"""
    MandreUI.show(
        title=Mandre.t(self, "dialog_title"),
        items=[
            Mandre.t(self, "action_export"),
            Mandre.t(self, "action_import"),
            Mandre.t(self, "action_clear")
        ],
        on_select=self.handle_action,
        message=Mandre.t(self, "dialog_message"),
        cancel_text=Mandre.t(self, "action_cancel")
    )
```

### Множественные формы

Для языков с множественными формами (русский: 1 элемент, 2 элемента, 5 элементов):

```python
_translations = {
    "items_one": "{count} элемент",
    "items_few": "{count} элемента",
    "items_many": "{count} элементов"
}

def get_items_text(self, count):
    """Получить текст с правильной формой"""
    if count % 10 == 1 and count % 100 != 11:
        key = "items_one"
    elif 2 <= count % 10 <= 4 and (count % 100 < 10 or count % 100 >= 20):
        key = "items_few"
    else:
        key = "items_many"
    
    return Mandre.t(self, key, count=count)
```

## Структура переводов

Рекомендуется группировать переводы по категориям:

```python
_translations = {
    # Команды
    "cmd_help": "Справка",
    "cmd_stats": "Статистика",
    "cmd_clear": "Очистить",
    
    # Настройки
    "settings_header": "Настройки",
    "settings_enable": "Включить",
    "settings_disable": "Выключить",
    
    # Уведомления
    "notify_success": "Успешно!",
    "notify_error": "Ошибка!",
    "notify_warning": "Внимание!",
    
    # Диалоги
    "dialog_confirm": "Подтвердить",
    "dialog_cancel": "Отмена",
    
    # Ошибки
    "error_network": "Ошибка сети",
    "error_permission": "Нет доступа",
    "error_invalid": "Неверные данные"
}
```

## Поддерживаемые языки

MandreLib использует Pollinations API для перевода, который поддерживает большинство языков:

- 🇷🇺 Русский (ru)
- 🇬🇧 Английский (en)
- 🇩🇪 Немецкий (de)
- 🇫🇷 Французский (fr)
- 🇪🇸 Испанский (es)
- 🇮🇹 Итальянский (it)
- 🇵🇹 Португальский (pt)
- 🇨🇳 Китайский (zh)
- 🇯🇵 Японский (ja)
- 🇰🇷 Корейский (ko)
- И многие другие...

## Кэширование

Переводы автоматически кэшируются в файл `translations_cache.json`:

```python
# Просмотр кэша
cache = MandreData.read_persistent_json(self.id, "translations_cache.json", {})
self.log(f"Кэшировано переводов: {len(cache)}")

# Очистка кэша (если нужно обновить переводы)
MandreData.write_persistent_json(self.id, "translations_cache.json", {})
```

## Fallback

Если перевод недоступен (нет интернета, ошибка API), возвращается исходный текст:

```python
# Если перевод недоступен, вернётся "Привет, мир!"
text = Mandre.t(self, "greeting", name="мир")
```

## Лучшие практики

::: tip Ключи на английском
Используйте понятные ключи на английском для лучшей читаемости:

```python
# ✅ Хорошо
_translations = {
    "welcome_message": "Добро пожаловать!",
    "error_network": "Ошибка сети"
}

# ❌ Плохо
_translations = {
    "msg1": "Добро пожаловать!",
    "err1": "Ошибка сети"
}
```
:::

::: warning Не переводите технические термины
Оставляйте технические термины и имена без перевода:

```python
_translations = {
    "app_name": "MandreLib",  # Не переводится
    "version": "Версия: {version}",
    "author": "Автор: {author}"
}
```
:::

::: info Тестирование
Тестируйте переводы на разных языках, меняя язык системы.
:::

## Полный пример

```python
__id__ = "localized_plugin"
__name__ = "Локализованный плагин"
__version__ = "1.0"
__author__ = "@yourname"
__description__ = "Плагин с поддержкой локализации"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin, HookResult, HookStrategy
from mandre_lib import Mandre, MandreUI
from ui.bulletin import BulletinHelper
from ui.settings import Header, Switch, Text

_translations = {
    # Команды
    "cmd_hello": "Привет, {name}!",
    "cmd_stats": "📊 Статистика:\nСообщений: {messages}\nКоманд: {commands}",
    
    # Настройки
    "settings_header": "Настройки",
    "enable_notifications": "Включить уведомления",
    "enable_notifications_desc": "Показывать уведомления о событиях",
    
    # Уведомления
    "success": "Успешно выполнено!",
    "error": "Произошла ошибка"
}

class LocalizedPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        # Регистрируем локализации
        Mandre.register_localizations(self, "ru", _translations)
        
        # Команды
        Mandre.register_command(self, "hello", self.cmd_hello)
        Mandre.register_command(self, "stats", self.cmd_stats)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_hello(self, plugin, args, params):
        """Команда .hello <имя>"""
        name = args if args else "друг"
        msg = Mandre.t(self, "cmd_hello", name=name)
        
        params["message"] = msg
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    
    def cmd_stats(self, plugin, args, params):
        """Команда .stats"""
        messages = self.get_setting("message_count", 0)
        commands = self.get_setting("command_count", 0)
        
        stats = Mandre.t(self, "cmd_stats", messages=messages, commands=commands)
        params["message"] = stats
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    
    def create_settings(self):
        return [
            Header(text=Mandre.t(self, "settings_header")),
            Switch(
                text=Mandre.t(self, "enable_notifications"),
                description=Mandre.t(self, "enable_notifications_desc"),
                value=self.get_setting("notifications", True),
                on_change=lambda v: self.set_setting("notifications", v)
            )
        ]
```

## Следующие шаги

- [Deep Linking](/guide/deep-linking) - пользовательские ссылки
- [Примеры](/examples/calculator) - готовые примеры
- [API Reference](/api/overview) - полная документация API
