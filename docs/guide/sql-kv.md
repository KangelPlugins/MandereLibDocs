# SQL KV-хелперы (Key-Value хранилище)

SQL KV-хелперы предоставляют простой и быстрый способ сохранять и получать данные в виде пар ключ-значение прямо в БД приложения.

## Основные методы

### Инициализация KV-таблицы

```python
Mandre.sql_init_kv(plugin_id, table_name="mandre_kv")
```

Создаёт таблицу для хранения ключ-значение пар (если её ещё нет).

**Параметры:**
- `plugin_id` — ID вашего плагина (обычно `self.id`)
- `table_name` — имя таблицы (по умолчанию `"mandre_kv"`)

**Пример:**
```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    # Инициализируем KV-таблицу
    Mandre.sql_init_kv(self.id, "my_plugin_kv")
    self.log("KV-таблица готова")
```

### Запись значения

```python
Mandre.sql_kv_set(plugin_id, key, value, table_name="mandre_kv")
```

Сохраняет значение по ключу.

**Параметры:**
- `plugin_id` — ID плагина
- `key` — ключ (строка)
- `value` — значение (может быть строкой, числом или JSON)
- `table_name` — имя таблицы

**Пример:**
```python
# Сохранить последнее время синхронизации
import time
Mandre.sql_kv_set(self.id, "last_sync", int(time.time()), "my_plugin_kv")

# Сохранить JSON-данные
import json
user_data = {"name": "Alice", "age": 30}
Mandre.sql_kv_set(self.id, "user:1", json.dumps(user_data), "my_plugin_kv")
```

### Чтение строкового значения

```python
value = Mandre.sql_kv_get(plugin_id, key, table_name="mandre_kv") -> Optional[str]
```

Получает значение по ключу как строку.

**Возвращает:**
- Строку, если ключ найден
- `None`, если ключ не существует

**Пример:**
```python
# Получить последнее время синхронизации
last_sync_str = Mandre.sql_kv_get(self.id, "last_sync", "my_plugin_kv")
if last_sync_str:
    last_sync = int(last_sync_str)
    self.log(f"Последняя синхронизация: {last_sync}")
else:
    self.log("Синхронизация ещё не проводилась")

# Получить JSON-данные
user_json = Mandre.sql_kv_get(self.id, "user:1", "my_plugin_kv")
if user_json:
    import json
    user_data = json.loads(user_json)
    self.log(f"Пользователь: {user_data['name']}")
```

### Чтение числового значения

```python
value = Mandre.sql_kv_get_int(plugin_id, key, default=0, table_name="mandre_kv") -> int
```

Получает значение по ключу как целое число. Удобнее, чем `sql_kv_get` + преобразование.

**Параметры:**
- `plugin_id` — ID плагина
- `key` — ключ
- `default` — значение по умолчанию, если ключ не найден (по умолчанию `0`)
- `table_name` — имя таблицы

**Возвращает:**
- Целое число, если ключ найден и содержит число
- `default`, если ключ не существует или не является числом

**Пример:**
```python
# Получить счётчик посещений
visit_count = Mandre.sql_kv_get_int(self.id, "visit_count", 0, "my_plugin_kv")
self.log(f"Посещений: {visit_count}")

# Увеличить счётчик
Mandre.sql_kv_set(self.id, "visit_count", visit_count + 1, "my_plugin_kv")
```

### Удаление ключей по префиксу

```python
Mandre.sql_kv_delete_prefix(plugin_id, prefix, table_name="mandre_kv")
```

Удаляет все ключи, начинающиеся с заданного префикса.

**Параметры:**
- `plugin_id` — ID плагина
- `prefix` — префикс для поиска
- `table_name` — имя таблицы

**Пример:**
```python
# Удалить все данные пользователей (ключи вида "user:1", "user:2" и т.д.)
Mandre.sql_kv_delete_prefix(self.id, "user:", "my_plugin_kv")
self.log("Все данные пользователей удалены")

# Удалить все кэш-записи
Mandre.sql_kv_delete_prefix(self.id, "cache:", "my_plugin_kv")
```

### Получение объекта БД

```python
db = Mandre.sql_get_database()
```

Получает объект `MessagesStorage` для прямого доступа к БД (для продвинутых случаев).

**Пример:**
```python
db = Mandre.sql_get_database()
# Теперь можно использовать методы db напрямую
```

## Практические примеры

### Пример 1: Счётчик событий

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.sql_init_kv(self.id, "events_kv")

def on_message_received(self, message):
    # Увеличить счётчик сообщений
    count = Mandre.sql_kv_get_int(self.id, "message_count", 0, "events_kv")
    Mandre.sql_kv_set(self.id, "message_count", count + 1, "events_kv")
    
    if count % 10 == 0:
        self.log(f"Получено {count} сообщений!")
```

### Пример 2: Кэширование данных с TTL

```python
import time
import json

def cache_user_data(self, user_id, user_data, ttl_seconds=3600):
    """Сохранить данные пользователя в кэш с временем жизни"""
    cache_entry = {
        "data": user_data,
        "expires_at": int(time.time()) + ttl_seconds
    }
    Mandre.sql_kv_set(
        self.id, 
        f"user_cache:{user_id}", 
        json.dumps(cache_entry),
        "cache_kv"
    )

def get_cached_user_data(self, user_id):
    """Получить данные пользователя из кэша, если они ещё актуальны"""
    cache_json = Mandre.sql_kv_get(self.id, f"user_cache:{user_id}", "cache_kv")
    
    if not cache_json:
        return None
    
    cache_entry = json.loads(cache_json)
    
    # Проверить, не истёк ли кэш
    if int(time.time()) > cache_entry["expires_at"]:
        # Удалить устаревший кэш
        Mandre.sql_kv_delete_prefix(self.id, f"user_cache:{user_id}", "cache_kv")
        return None
    
    return cache_entry["data"]
```

### Пример 3: Хранение конфигурации

```python
import json

def save_config(self, config_dict):
    """Сохранить конфигурацию"""
    Mandre.sql_kv_set(
        self.id,
        "config",
        json.dumps(config_dict),
        "config_kv"
    )

def load_config(self, default_config=None):
    """Загрузить конфигурацию"""
    config_json = Mandre.sql_kv_get(self.id, "config", "config_kv")
    
    if config_json:
        return json.loads(config_json)
    
    return default_config or {}

def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.sql_init_kv(self.id, "config_kv")
    
    # Загрузить или создать конфигурацию
    config = self.load_config({
        "theme": "dark",
        "language": "ru",
        "notifications_enabled": True
    })
    
    self.log(f"Конфигурация загружена: {config}")
```

### Пример 4: Отслеживание состояния

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.sql_init_kv(self.id, "state_kv")
    
    # Инициализировать состояние
    state = Mandre.sql_kv_get(self.id, "plugin_state", "state_kv")
    if not state:
        Mandre.sql_kv_set(self.id, "plugin_state", "idle", "state_kv")

def start_task(self):
    """Запустить задачу"""
    Mandre.sql_kv_set(self.id, "plugin_state", "running", "state_kv")
    Mandre.sql_kv_set(self.id, "task_start_time", int(time.time()), "state_kv")
    self.log("Задача запущена")

def stop_task(self):
    """Остановить задачу"""
    Mandre.sql_kv_set(self.id, "plugin_state", "idle", "state_kv")
    
    start_time = Mandre.sql_kv_get_int(self.id, "task_start_time", 0, "state_kv")
    duration = int(time.time()) - start_time
    self.log(f"Задача завершена. Длительность: {duration} сек")

def get_status(self):
    """Получить статус"""
    state = Mandre.sql_kv_get(self.id, "plugin_state", "state_kv") or "unknown"
    return state
```

## Когда использовать SQL KV

✅ **Используйте SQL KV для:**
- Сохранения простых пар ключ-значение
- Кэширования часто используемых данных
- Хранения конфигурации и состояния
- Счётчиков и метрик
- Временных меток и флагов

❌ **Не используйте SQL KV для:**
- Сложных структур данных (используйте JSON файлы через `MandreData`)
- Больших объёмов данных (используйте обычные файлы)
- Данных, требующих частых обновлений (используйте переменные в памяти)

## Советы по оптимизации

1. **Используйте префиксы для организации ключей:**
   ```python
   Mandre.sql_kv_set(self.id, "user:123:name", "Alice", "kv")
   Mandre.sql_kv_set(self.id, "user:123:email", "alice@example.com", "kv")
   ```

2. **Кэшируйте часто используемые значения в памяти:**
   ```python
   self.config = json.loads(Mandre.sql_kv_get(self.id, "config", "kv"))
   # Используйте self.config вместо постоянного обращения к БД
   ```

3. **Используйте `sql_kv_get_int` для чисел:**
   ```python
   # ✅ Правильно
   count = Mandre.sql_kv_get_int(self.id, "count", 0, "kv")
   
   # ❌ Неправильно
   count = int(Mandre.sql_kv_get(self.id, "count", "kv") or 0)
   ```

4. **Очищайте старые данные:**
   ```python
   # Удалить все кэш-записи при выгрузке плагина
   def on_plugin_unload(self):
       Mandre.sql_kv_delete_prefix(self.id, "cache:", "kv")
   ```
