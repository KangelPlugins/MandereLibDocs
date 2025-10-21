# Mandre API

Основной модуль MandreLib, предоставляющий центральные функции библиотеки.

## Импорт

```python
from mandre_lib import Mandre
```

## Методы

### use_persistent_storage()

Активирует персистентное хранилище для плагина.

```python
Mandre.use_persistent_storage(plugin_instance)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина (self)

**Возвращает:** None

**Пример:**

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    # Теперь все set_setting() автоматически сохраняются
```

---

### register_command()

Регистрирует команду для плагина.

```python
Mandre.register_command(plugin_instance, command_name, handler)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина
- `command_name` (str) - имя команды без префикса
- `handler` (callable) - функция-обработчик

**Возвращает:** None

**Пример:**

```python
def on_plugin_load(self):
    Mandre.register_command(self, "hello", self.cmd_hello)

def cmd_hello(self, plugin, args, params):
    BulletinHelper.show_info("Привет!")
    return None
```

---

### handle_outgoing_command()

Обрабатывает исходящие команды.

```python
result = Mandre.handle_outgoing_command(params)
```

**Параметры:**
- `params` (dict) - параметры сообщения из хука

**Возвращает:** HookResult или None

**Пример:**

```python
def on_send_message_hook(self, params):
    result = Mandre.handle_outgoing_command(params)
    if result:
        return result
    return HookResult()
```

---

### schedule_task()

Планирует выполнение задачи с интервалом.

```python
Mandre.schedule_task(plugin_instance, task_name, interval_seconds, callback)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина
- `task_name` (str) - уникальное имя задачи
- `interval_seconds` (int) - интервал в секундах (минимум 1)
- `callback` (callable) - функция для вызова

**Возвращает:** None

**Пример:**

```python
def on_plugin_load(self):
    Mandre.schedule_task(self, "auto_save", 60, self.auto_save)

def auto_save(self):
    self.log("Автосохранение")
```

---

### cancel_task()

Отменяет запланированную задачу.

```python
Mandre.cancel_task(plugin_instance, task_name)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина
- `task_name` (str) - имя задачи для отмены

**Возвращает:** None

**Пример:**

```python
def on_plugin_unload(self):
    Mandre.cancel_task(self, "auto_save")
```

---

### register_localizations()

Регистрирует переводы для плагина.

```python
Mandre.register_localizations(plugin_instance, source_lang, translations)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина
- `source_lang` (str) - исходный язык (например, "ru")
- `translations` (dict) - словарь переводов

**Возвращает:** None

**Пример:**

```python
_translations = {
    "greeting": "Привет, {name}!",
    "error": "Произошла ошибка"
}

def on_plugin_load(self):
    Mandre.register_localizations(self, "ru", _translations)
```

---

### t()

Получает переведённую строку.

```python
text = Mandre.t(plugin_instance, key, **kwargs)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина
- `key` (str) - ключ перевода
- `**kwargs` - параметры для подстановки

**Возвращает:** str - переведённая строка

**Пример:**

```python
greeting = Mandre.t(self, "greeting", name="Алиса")
# Вернёт "Привет, Алиса!" на языке пользователя
```

---

### add_tg_alias()

Регистрирует deep link алиас.

```python
Mandre.add_tg_alias(alias, handler)
```

**Параметры:**
- `alias` (str) - алиас ссылки (например, "my_plugin/action")
- `handler` (callable) - функция-обработчик

**Возвращает:** None

**Пример:**

```python
def on_plugin_load(self):
    Mandre.add_tg_alias("my_plugin/open", self.handle_link)

def handle_link(self, intent):
    uri = str(intent.getData())
    self.log(f"Открыта ссылка: {uri}")
```

---

### remove_tg_alias()

Удаляет deep link алиас.

```python
Mandre.remove_tg_alias(alias)
```

**Параметры:**
- `alias` (str) - алиас для удаления

**Возвращает:** None

**Пример:**

```python
def on_plugin_unload(self):
    Mandre.remove_tg_alias("my_plugin/open")
```

---

### register_settings_alias()

Автоматически регистрирует ссылку на настройки плагина.

```python
Mandre.register_settings_alias(plugin_instance)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина

**Возвращает:** None

**Пример:**

```python
def on_plugin_load(self):
    Mandre.register_settings_alias(self)
    # Создаёт ссылку tg://settings/<plugin_id>
```

---

### apply_and_refresh_settings()

Применяет изменения и обновляет UI настроек.

```python
Mandre.apply_and_refresh_settings(plugin_instance)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина

**Возвращает:** None

**Пример:**

```python
def clear_data(self):
    # Очищаем данные
    self.set_setting("data", [])
    
    # Обновляем UI
    Mandre.apply_and_refresh_settings(self)
```

---

## Полный пример

```python
from mandre_lib import Mandre
from base_plugin import BasePlugin, HookResult

_translations = {
    "hello": "Привет, {name}!",
    "goodbye": "До свидания!"
}

class MyPlugin(BasePlugin):
    def on_plugin_load(self):
        # Активация хранилища
        Mandre.use_persistent_storage(self)
        
        # Регистрация переводов
        Mandre.register_localizations(self, "ru", _translations)
        
        # Регистрация команд
        self.add_on_send_message_hook()
        Mandre.register_command(self, "hello", self.cmd_hello)
        
        # Планирование задачи
        Mandre.schedule_task(self, "check", 30, self.periodic_check)
        
        # Deep link
        Mandre.add_tg_alias("my_plugin/action", self.handle_link)
        Mandre.register_settings_alias(self)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_hello(self, plugin, args, params):
        name = args if args else "друг"
        greeting = Mandre.t(self, "hello", name=name)
        params["message"] = greeting
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    
    def periodic_check(self):
        self.log("Проверка выполнена")
    
    def handle_link(self, intent):
        uri = str(intent.getData())
        self.log(f"Deep link: {uri}")
    
    def on_plugin_unload(self):
        Mandre.cancel_task(self, "check")
        Mandre.remove_tg_alias("my_plugin/action")
```

## См. также

- [MandreData](/api/mandre-data) - работа с данными
- [MandreUI](/api/mandre-ui) - UI компоненты
- [Команды](/guide/commands) - подробнее о командах
- [Планировщик](/guide/scheduler) - подробнее о задачах
