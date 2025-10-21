# Частые ошибки

Список распространённых ошибок при использовании MandreLib и способы их избежать.

## 1. Забыли активировать персистентное хранилище

### ❌ Неправильно

```python
def on_plugin_load(self):
    self.set_setting("key", "value")  # Данные потеряются при перезагрузке
```

### ✅ Правильно

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    self.set_setting("key", "value")  # Данные сохранятся
```

**Почему:** Без активации персистентного хранилища данные хранятся только в памяти и теряются при перезагрузке плагина.

## 2. UI-операции из фонового потока

### ❌ Неправильно

```python
def background_task(self):
    result = some_long_operation()
    BulletinHelper.show_info(result)  # Может вызвать краш!

run_on_queue(background_task)
```

### ✅ Правильно

```python
def background_task(self):
    result = some_long_operation()
    run_on_ui_thread(lambda: BulletinHelper.show_info(result))

run_on_queue(background_task)
```

**Почему:** UI операции должны выполняться в главном потоке. Вызов из фонового потока приведёт к краху приложения.

## 3. Не отменяют задачи при выгрузке

### ❌ Неправильно

```python
def on_plugin_load(self):
    Mandre.schedule_task(self, "infinite", 1, self.do_something)
    # Задача будет работать вечно, даже после выгрузки!
```

### ✅ Правильно

```python
def on_plugin_load(self):
    Mandre.schedule_task(self, "infinite", 1, self.do_something)

def on_plugin_unload(self):
    Mandre.cancel_task(self, "infinite")
```

**Почему:** Задачи продолжают работать после выгрузки плагина, что может привести к ошибкам и утечкам памяти.

## 4. Не указывают default значения

### ❌ Неправильно

```python
data = MandreData.read_persistent_json(self.id, "config.json")
# Может вызвать ошибку, если файл не существует
```

### ✅ Правильно

```python
data = MandreData.read_persistent_json(self.id, "config.json", {})
# Вернёт {} если файл не существует
```

**Почему:** Если файл не существует, метод без default значения вызовет ошибку.

## 5. Используют eval() без валидации

### ❌ Неправильно

```python
def cmd_calc(self, plugin, args, params):
    result = eval(args)  # Опасно! Может выполнить любой код
    return result
```

### ✅ Правильно

```python
def cmd_calc(self, plugin, args, params):
    # Валидация входных данных
    if not args or not self.is_safe_expression(args):
        BulletinHelper.show_error("Неверное выражение")
        return None
    
    try:
        result = safe_eval(args)  # Используйте безопасный парсер
        return result
    except Exception as e:
        BulletinHelper.show_error(f"Ошибка: {e}")
        return None
```

**Почему:** `eval()` может выполнить любой Python код, включая вредоносный.

## 6. Не обрабатывают исключения

### ❌ Неправильно

```python
def cmd_download(self, plugin, args, params):
    data = self.download_file(args)  # Может упасть
    self.save_file(data)
    return None
```

### ✅ Правильно

```python
def cmd_download(self, plugin, args, params):
    try:
        data = self.download_file(args)
        self.save_file(data)
        BulletinHelper.show_success("Файл загружен")
    except ConnectionError:
        BulletinHelper.show_error("Ошибка сети")
    except Exception as e:
        BulletinHelper.show_error(f"Ошибка: {e}")
        self.log(f"Ошибка загрузки: {e}")
    
    return None
```

**Почему:** Необработанные исключения приводят к крашу плагина.

## 7. Хранят слишком много данных

### ❌ Неправильно

```python
def on_send_message_hook(self, params):
    history = self.get_setting("message_history", [])
    history.append(params["message"])  # Растёт бесконечно!
    self.set_setting("message_history", history)
    return HookResult()
```

### ✅ Правильно

```python
def on_send_message_hook(self, params):
    history = self.get_setting("message_history", [])
    history.append(params["message"])
    
    # Ограничиваем размер
    if len(history) > 1000:
        history = history[-1000:]
    
    self.set_setting("message_history", history)
    return HookResult()
```

**Почему:** Бесконечно растущие данные приводят к проблемам с производительностью и памятью.

## 8. Блокируют UI поток

### ❌ Неправильно

```python
def cmd_process(self, plugin, args, params):
    # Долгая операция в UI потоке
    for i in range(1000000):
        process_item(i)
    
    BulletinHelper.show_success("Готово")
    return None
```

### ✅ Правильно

```python
def cmd_process(self, plugin, args, params):
    def background_work():
        for i in range(1000000):
            process_item(i)
        
        run_on_ui_thread(lambda: 
            BulletinHelper.show_success("Готово")
        )
    
    run_on_queue(background_work)
    BulletinHelper.show_info("Обработка...")
    return None
```

**Почему:** Долгие операции в UI потоке замораживают интерфейс.

## 9. Не валидируют аргументы команд

### ❌ Неправильно

```python
def cmd_set(self, plugin, args, params):
    key, value = args.split()  # Может упасть если args пустой
    self.set_setting(key, value)
    return None
```

### ✅ Правильно

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
    BulletinHelper.show_success("Сохранено")
    return HookResult(strategy=HookStrategy.CANCEL)
```

**Почему:** Невалидированные аргументы приводят к ошибкам.

## 10. Забывают вернуть HookResult

### ❌ Неправильно

```python
def on_send_message_hook(self, params):
    message = params.get("message", "")
    if message.startswith("."):
        self.handle_command(message)
        # Забыли вернуть HookResult!
```

### ✅ Правильно

```python
def on_send_message_hook(self, params):
    message = params.get("message", "")
    if message.startswith("."):
        self.handle_command(message)
        return HookResult(strategy=HookStrategy.CANCEL)
    
    return HookResult()
```

**Почему:** Без возврата HookResult поведение хука непредсказуемо.

## 11. Используют изменяемые default значения

### ❌ Неправильно

```python
def get_data(self, key, default=[]):  # Опасно!
    return self.get_setting(key, default)

# При использовании:
data1 = self.get_data("key1")
data1.append("item")  # Изменит default для всех вызовов!
```

### ✅ Правильно

```python
def get_data(self, key, default=None):
    if default is None:
        default = []
    return self.get_setting(key, default)

# Или:
def get_data(self, key):
    return self.get_setting(key, [])
```

**Почему:** Изменяемые default значения в Python — это одна переменная для всех вызовов.

## 12. Не удаляют deep link алиасы

### ❌ Неправильно

```python
def on_plugin_load(self):
    Mandre.add_tg_alias("my_plugin/action", self.handler)
    # Не удаляют при выгрузке
```

### ✅ Правильно

```python
def on_plugin_load(self):
    Mandre.add_tg_alias("my_plugin/action", self.handler)

def on_plugin_unload(self):
    Mandre.remove_tg_alias("my_plugin/action")
```

**Почему:** Неудалённые алиасы могут вызывать ошибки после выгрузки плагина.

## 13. Создают циклические зависимости

### ❌ Неправильно

```python
def on_send_message_hook(self, params):
    # Отправляем сообщение из хука отправки
    self.send_message("Hello")  # Вызовет хук снова!
    return HookResult()
```

### ✅ Правильно

```python
def on_send_message_hook(self, params):
    # Используем флаг для предотвращения рекурсии
    if self.get_setting("processing", False):
        return HookResult()
    
    self.set_setting("processing", True)
    self.send_message("Hello")
    self.set_setting("processing", False)
    
    return HookResult()
```

**Почему:** Циклические вызовы приводят к бесконечной рекурсии.

## 14. Не проверяют существование ключей

### ❌ Неправильно

```python
def process_data(self):
    data = MandreData.read_persistent_json(self.id, "data.json", {})
    value = data["key"]  # Может упасть если ключа нет
    return value
```

### ✅ Правильно

```python
def process_data(self):
    data = MandreData.read_persistent_json(self.id, "data.json", {})
    value = data.get("key", "default")  # Безопасно
    return value
```

**Почему:** Обращение к несуществующему ключу вызывает KeyError.

## 15. Используют глобальные переменные неправильно

### ❌ Неправильно

```python
counter = 0  # Глобальная переменная

def cmd_count(self, plugin, args, params):
    global counter
    counter += 1  # Не сохранится при перезагрузке
    return None
```

### ✅ Правильно

```python
def cmd_count(self, plugin, args, params):
    counter = self.get_setting("counter", 0)
    counter += 1
    self.set_setting("counter", counter)  # Сохранится
    return None
```

**Почему:** Глобальные переменные не сохраняются между перезагрузками.

## Чеклист перед релизом

- [ ] Активировано персистентное хранилище
- [ ] Все задачи отменяются в `on_plugin_unload()`
- [ ] UI операции выполняются в главном потоке
- [ ] Все исключения обработаны
- [ ] Аргументы команд валидируются
- [ ] Используются default значения для `read_persistent_json()`
- [ ] Размер хранимых данных ограничен
- [ ] Deep link алиасы удаляются при выгрузке
- [ ] Нет циклических зависимостей в хуках
- [ ] Долгие операции выполняются в фоновом потоке

## Следующие шаги

- [Калькулятор](/examples/calculator) - полный пример плагина
- [API Reference](/api/overview) - документация API
- [Руководство](/guide/introduction) - вернуться к руководству
