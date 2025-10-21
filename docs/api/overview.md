# API Reference - Обзор

Полная справка по API MandreLib.

::: info Базовые знания
Эта документация описывает API MandreLib. Для понимания базовых концепций exteraGram (BasePlugin, хуки, настройки) обратитесь к [официальной документации](https://plugins.exteragram.app).
:::

## Основные модули

MandreLib состоит из нескольких модулей, каждый из которых отвечает за определённую функциональность:

### Mandre (Основной модуль)

Центральный модуль библиотеки, предоставляющий основные функции:

- `use_persistent_storage()` - активация персистентного хранилища
- `register_command()` - регистрация команд
- `handle_outgoing_command()` - обработка команд
- `schedule_task()` - планирование задач
- `cancel_task()` - отмена задач
- `register_localizations()` - регистрация переводов
- `t()` - получение переведённой строки
- `add_tg_alias()` - регистрация deep link
- `remove_tg_alias()` - удаление deep link
- `apply_and_refresh_settings()` - обновление настроек

[Подробнее →](/api/mandre)

### MandreData (Хранилище данных)

Модуль для работы с персистентными данными:

- `write_persistent_json()` - запись JSON файла
- `read_persistent_json()` - чтение JSON файла
- `list_files_for_plugin()` - список файлов плагина

[Подробнее →](/api/mandre-data)

### MandreUI (UI компоненты)

Модуль для создания пользовательского интерфейса:

- `show()` - показать диалог с выбором
- `ripple()` - ripple эффект
- `select_chat()` - селектор чатов
- `setup_settings_bottom_bar()` - навигационная панель

[Подробнее →](/api/mandre-ui)

### MandreTTS (Текст-в-речь)

Модуль для озвучивания текста:

- `speak()` - озвучить текст

[Подробнее →](/api/mandre-tts)

### MandreAuth (Аутентификация)

Модуль для запроса подтверждения личности:

- `request()` - запросить аутентификацию

[Подробнее →](/api/mandre-auth)

## Быстрый старт

```python
from mandre_lib import Mandre, MandreData, MandreUI, MandreTTS, MandreAuth
from base_plugin import BasePlugin

class MyPlugin(BasePlugin):
    def on_plugin_load(self):
        # Активация хранилища
        Mandre.use_persistent_storage(self)
        
        # Регистрация команды
        Mandre.register_command(self, "hello", self.cmd_hello)
        
        # Планирование задачи
        Mandre.schedule_task(self, "task", 60, self.periodic_task)
    
    def cmd_hello(self, plugin, args, params):
        MandreUI.show(
            title="Привет!",
            items=["Вариант 1", "Вариант 2"],
            on_select=lambda i, t: self.log(f"Выбрано: {t}")
        )
        return None
    
    def periodic_task(self):
        self.log("Задача выполнена")
    
    def on_plugin_unload(self):
        Mandre.cancel_task(self, "task")
```

## Типы данных

### HookResult

Результат выполнения хука:

```python
from base_plugin import HookResult, HookStrategy

# Не изменять сообщение
HookResult()

# Отменить отправку
HookResult(strategy=HookStrategy.CANCEL)

# Изменить сообщение
HookResult(strategy=HookStrategy.MODIFY, params=modified_params)
```

### Callback функции

#### Command Handler

```python
def cmd_handler(plugin, args, params):
    """
    Args:
        plugin: экземпляр плагина (self)
        args: строка с аргументами команды
        params: dict с параметрами сообщения
    
    Returns:
        None - сообщение отправится
        HookResult - для модификации/отмены
    """
    pass
```

#### UI Select Handler

```python
def on_select(index, text):
    """
    Args:
        index: индекс выбранного элемента (int)
        text: текст выбранного элемента (str)
    """
    pass
```

#### Chat Select Handler

```python
def on_chat_select(chat_info):
    """
    Args:
        chat_info: dict с информацией о чате
            - 'title': название чата (str)
            - 'id': ID чата (int)
            - 'obj': объект чата/пользователя (TLRPC)
    """
    pass
```

#### Auth Callbacks

```python
def on_success():
    """Вызывается при успешной аутентификации"""
    pass

def on_failure():
    """Вызывается при неудачной аутентификации"""
    pass
```

#### Task Callback

```python
def task_callback():
    """Вызывается по расписанию"""
    pass
```

#### Deep Link Handler

```python
def deeplink_handler(intent):
    """
    Args:
        intent: Android Intent с данными ссылки
    """
    uri_str = str(intent.getData())
    # Обработка ссылки
```

## Константы

### HookStrategy

```python
from base_plugin import HookStrategy

HookStrategy.CANCEL  # Отменить действие
HookStrategy.MODIFY  # Изменить параметры
```

### Цвета (Android)

```python
from android.graphics import Color

Color.WHITE
Color.BLACK
Color.RED
Color.GREEN
Color.BLUE

# Создание цвета
Color.rgb(255, 0, 0)  # RGB
Color.argb(255, 255, 0, 0)  # ARGB с прозрачностью
```

## Соглашения

### Именование

- **Плагины**: `snake_case` для ID, `Title Case` для имени
- **Команды**: `lowercase` без префикса
- **Задачи**: `snake_case` описательные имена
- **Файлы данных**: `snake_case.json`

### Структура плагина

```python
__id__ = "plugin_id"
__name__ = "Plugin Name"
__version__ = "1.0.0"
__author__ = "@username"
__description__ = "Description"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin
from mandre_lib import Mandre

class MyPlugin(BasePlugin):
    def on_plugin_load(self):
        """Инициализация"""
        pass
    
    def on_plugin_unload(self):
        """Очистка"""
        pass
    
    def create_settings(self):
        """UI настроек"""
        return []
```

## Обработка ошибок

Всегда оборачивайте критичный код в try-except:

```python
try:
    # Ваш код
    result = risky_operation()
except SpecificError as e:
    # Обработка конкретной ошибки
    self.log(f"Ошибка: {e}")
    BulletinHelper.show_error("Что-то пошло не так")
except Exception as e:
    # Обработка всех остальных ошибок
    self.log(f"Неожиданная ошибка: {e}")
```

## Потоки выполнения

### UI поток

Для UI операций:

```python
run_on_ui_thread(lambda: BulletinHelper.show_info("Message"))
```

### Фоновый поток

Для долгих операций:

```python
def background_work():
    result = long_operation()
    run_on_ui_thread(lambda: show_result(result))

run_on_queue(background_work)
```

## Версионирование

MandreLib следует [Semantic Versioning](https://semver.org/):

- **MAJOR** - несовместимые изменения API
- **MINOR** - новая функциональность (обратно совместимая)
- **PATCH** - исправления ошибок

## Совместимость

- **exteraGram**: 11.9.0+
- **Python**: 3.x
- **Android**: 5.0+ (API 21+)

## Следующие шаги

Изучите подробную документацию по каждому модулю:

- [Mandre](/api/mandre) - основной модуль
- [MandreData](/api/mandre-data) - хранилище данных
- [MandreUI](/api/mandre-ui) - UI компоненты
- [MandreTTS](/api/mandre-tts) - текст-в-речь
- [MandreAuth](/api/mandre-auth) - аутентификация
