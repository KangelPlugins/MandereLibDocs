# Система команд

MandreLib предоставляет простой способ регистрации и обработки команд (сообщений, начинающихся с префикса `.команда`).

## Базовая регистрация

```python
from mandre_lib import Mandre
from base_plugin import BasePlugin, HookResult

class MyPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        # Регистрируем команды
        Mandre.register_command(self, "hello", self.cmd_hello)
        Mandre.register_command(self, "echo", self.cmd_echo)
    
    def on_send_message_hook(self, params):
        # MandreLib автоматически обработает команды
        result = Mandre.handle_outgoing_command(params)
        if result:
            return result
        
        # Ваша дополнительная логика
        return HookResult()
```

## Обработчик команды

Каждый обработчик получает три параметра:

```python
def cmd_hello(self, plugin, args, params):
    """
    Args:
        plugin: экземпляр плагина (self)
        args: текст после команды (строка)
        params: оригинальные параметры сообщения (dict)
    
    Returns:
        None - сообщение отправится как есть
        HookResult - для модификации или отмены
    """
    BulletinHelper.show_info("Привет!")
    return None  # Сообщение отправится
```

## Возвращаемые значения

### Отправить сообщение как есть

```python
def cmd_hello(self, plugin, args, params):
    BulletinHelper.show_info("Команда выполнена")
    return None  # Сообщение ".hello" отправится
```

### Отменить отправку

```python
def cmd_cancel(self, plugin, args, params):
    BulletinHelper.show_info("Сообщение не будет отправлено")
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Изменить сообщение

```python
def cmd_echo(self, plugin, args, params):
    if args:
        params["message"] = f"Эхо: {args}"
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    return None
```

## Примеры команд

### Простая команда

```python
def cmd_ping(self, plugin, args, params):
    """Команда .ping - проверка работы плагина"""
    BulletinHelper.show_success("Pong! 🏓")
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Команда с аргументами

```python
def cmd_say(self, plugin, args, params):
    """Команда .say <текст> - озвучить текст"""
    if not args:
        BulletinHelper.show_error("Использование: .say <текст>")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    MandreTTS.speak(args)
    BulletinHelper.show_success("Озвучиваю...")
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Команда со статистикой

```python
def cmd_stats(self, plugin, args, params):
    """Команда .stats - показать статистику"""
    count = self.get_setting("message_count", 0)
    commands = self.get_setting("command_count", 0)
    
    # Увеличиваем счётчик команд
    self.set_setting("command_count", commands + 1)
    
    stats = f"📊 Статистика:\n"
    stats += f"Сообщений: {count}\n"
    stats += f"Команд: {commands + 1}"
    
    params["message"] = stats
    return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

### Команда с выбором

```python
def cmd_menu(self, plugin, args, params):
    """Команда .menu - показать меню"""
    MandreUI.show(
        title="Меню команд",
        items=[
            "📊 Статистика",
            "🗑️ Очистить данные",
            "⚙️ Настройки"
        ],
        on_select=lambda i, t: self.handle_menu(i)
    )
    return HookResult(strategy=HookStrategy.CANCEL)

def handle_menu(self, index):
    if index == 0:
        self.cmd_stats(None, "", {})
    elif index == 1:
        self.clear_data()
    elif index == 2:
        self.open_settings()
```

### Команда с параметрами

```python
def cmd_remind(self, plugin, args, params):
    """Команда .remind <минуты> <текст> - напоминание"""
    if not args:
        BulletinHelper.show_error("Использование: .remind <минуты> <текст>")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    parts = args.split(maxsplit=1)
    if len(parts) < 2:
        BulletinHelper.show_error("Укажите время и текст")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    try:
        minutes = int(parts[0])
        text = parts[1]
        
        # Запускаем напоминание
        self.schedule_reminder(minutes, text)
        BulletinHelper.show_success(f"Напомню через {minutes} мин")
        
    except ValueError:
        BulletinHelper.show_error("Неверный формат времени")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

## Множественные команды

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    self.add_on_send_message_hook()
    
    # Регистрируем несколько команд
    commands = {
        "help": self.cmd_help,
        "start": self.cmd_start,
        "stop": self.cmd_stop,
        "status": self.cmd_status,
        "config": self.cmd_config
    }
    
    for cmd, handler in commands.items():
        Mandre.register_command(self, cmd, handler)

def cmd_help(self, plugin, args, params):
    """Показать справку по командам"""
    help_text = """
📖 Доступные команды:
.help - эта справка
.start - запустить функцию
.stop - остановить функцию
.status - показать статус
.config - настройки
    """.strip()
    
    params["message"] = help_text
    return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

## Алиасы команд

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    self.add_on_send_message_hook()
    
    # Основная команда
    Mandre.register_command(self, "statistics", self.cmd_stats)
    
    # Алиасы
    Mandre.register_command(self, "stats", self.cmd_stats)
    Mandre.register_command(self, "s", self.cmd_stats)
```

## Префикс команд

По умолчанию используется префикс `.` (точка). Вы можете настроить его в коде MandreLib или проверять свой префикс:

```python
def on_send_message_hook(self, params):
    message = params.get("message", "")
    
    # Свой префикс
    if message.startswith("!"):
        command = message[1:].split()[0]
        args = message[len(command)+2:]
        
        if command == "mycommand":
            self.handle_custom_command(args)
            return HookResult(strategy=HookStrategy.CANCEL)
    
    # Стандартные команды MandreLib
    return Mandre.handle_outgoing_command(params) or HookResult()
```

## Команды с подтверждением

```python
def cmd_delete(self, plugin, args, params):
    """Команда .delete - удалить данные (с подтверждением)"""
    
    def confirm_delete(index, text):
        if index == 0:  # Да
            self.delete_all_data()
            BulletinHelper.show_success("Данные удалены")
        else:
            BulletinHelper.show_info("Отменено")
    
    MandreUI.show(
        title="Удалить все данные?",
        items=["✅ Да, удалить", "❌ Отмена"],
        on_select=confirm_delete,
        message="Это действие нельзя отменить!"
    )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

## Команды с состоянием

```python
def cmd_toggle(self, plugin, args, params):
    """Команда .toggle - переключить функцию"""
    enabled = self.get_setting("feature_enabled", False)
    new_state = not enabled
    
    self.set_setting("feature_enabled", new_state)
    
    status = "включена" if new_state else "выключена"
    BulletinHelper.show_success(f"Функция {status}")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

## Логирование команд

```python
def on_send_message_hook(self, params):
    message = params.get("message", "")
    
    # Логируем команды
    if message.startswith("."):
        command = message.split()[0]
        self.log(f"Команда выполнена: {command}")
        
        # Сохраняем в историю
        history = MandreData.read_persistent_json(self.id, "commands.json", [])
        history.append({
            "command": command,
            "timestamp": time.time()
        })
        MandreData.write_persistent_json(self.id, "commands.json", history)
    
    return Mandre.handle_outgoing_command(params) or HookResult()
```

## Обработка ошибок

```python
def cmd_safe(self, plugin, args, params):
    """Команда с обработкой ошибок"""
    try:
        # Ваша логика
        result = self.do_something(args)
        BulletinHelper.show_success(f"Результат: {result}")
        
    except ValueError as e:
        BulletinHelper.show_error(f"Неверное значение: {e}")
    except Exception as e:
        BulletinHelper.show_error(f"Ошибка: {e}")
        self.log(f"Ошибка в команде: {e}")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

## Лучшие практики

::: tip Документация команд
Добавляйте docstring к каждой команде с описанием использования:

```python
def cmd_example(self, plugin, args, params):
    """Команда .example <arg1> <arg2> - описание команды
    
    Примеры:
        .example test 123
        .example "hello world" 456
    """
    pass
```
:::

::: warning Валидация
Всегда проверяйте аргументы перед использованием:

```python
def cmd_set(self, plugin, args, params):
    if not args:
        BulletinHelper.show_error("Использование: .set <ключ> <значение>")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    parts = args.split(maxsplit=1)
    if len(parts) < 2:
        BulletinHelper.show_error("Укажите ключ и значение")
        return HookResult(strategy=HookStrategy.CANCEL)
    
    key, value = parts
    self.set_setting(key, value)
```
:::

## Следующие шаги

- [Планировщик задач](/guide/scheduler) - выполнение по расписанию
- [UI компоненты](/guide/ui) - диалоги и меню
- [Примеры](/examples/calculator) - готовые примеры
