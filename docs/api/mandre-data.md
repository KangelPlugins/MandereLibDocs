# MandreData API

Модуль для работы с персистентными данными плагина.

## Импорт

```python
from mandre_lib import MandreData
```

## Методы

### write_persistent_json()

Записывает данные в JSON файл.

```python
MandreData.write_persistent_json(plugin_id, filename, data)
```

**Параметры:**
- `plugin_id` (str) - ID плагина (self.id)
- `filename` (str) - имя файла (например, "config.json")
- `data` (dict/list) - данные для сохранения

**Возвращает:** None

**Потокобезопасность:** Да

**Пример:**

```python
data = {
    "users": [{"id": 1, "name": "Alice"}],
    "settings": {"theme": "dark"}
}

MandreData.write_persistent_json(self.id, "database.json", data)
```

---

### read_persistent_json()

Читает данные из JSON файла.

```python
data = MandreData.read_persistent_json(plugin_id, filename, default)
```

**Параметры:**
- `plugin_id` (str) - ID плагина (self.id)
- `filename` (str) - имя файла
- `default` (any) - значение по умолчанию если файл не существует

**Возвращает:** Данные из файла или default

**Потокобезопасность:** Да

**Пример:**

```python
# С default значением
data = MandreData.read_persistent_json(self.id, "config.json", {})

# Если файл не существует, вернёт {}
users = data.get("users", [])
```

---

### list_files_for_plugin()

Возвращает список всех файлов плагина.

```python
files = MandreData.list_files_for_plugin(plugin_id)
```

**Параметры:**
- `plugin_id` (str) - ID плагина (self.id)

**Возвращает:** list[str] - список имён файлов

**Пример:**

```python
files = MandreData.list_files_for_plugin(self.id)
self.log(f"Файлы плагина: {files}")

# Вывод: ['config.json', 'database.json', 'cache.json']
```

---

## Расположение файлов

Все файлы сохраняются в:
```
/storage/emulated/0/Android/data/org.telegram.messenger/files/exteraGram/plugins_data/<plugin_id>/
```

## Примеры использования

### Простое сохранение

```python
def save_settings(self):
    settings = {
        "enabled": True,
        "interval": 60,
        "notifications": True
    }
    
    MandreData.write_persistent_json(self.id, "settings.json", settings)
```

### Чтение с обработкой

```python
def load_settings(self):
    settings = MandreData.read_persistent_json(
        self.id,
        "settings.json",
        {"enabled": False, "interval": 30}
    )
    
    self.enabled = settings.get("enabled", False)
    self.interval = settings.get("interval", 30)
```

### База данных пользователей

```python
def add_user(self, user_id, username):
    """Добавить пользователя в базу"""
    db = MandreData.read_persistent_json(self.id, "users.json", {"users": []})
    
    # Проверяем, есть ли уже такой пользователь
    for user in db["users"]:
        if user["id"] == user_id:
            return False
    
    # Добавляем нового
    db["users"].append({
        "id": user_id,
        "username": username,
        "added_at": time.time()
    })
    
    MandreData.write_persistent_json(self.id, "users.json", db)
    return True

def get_user(self, user_id):
    """Получить пользователя по ID"""
    db = MandreData.read_persistent_json(self.id, "users.json", {"users": []})
    
    for user in db["users"]:
        if user["id"] == user_id:
            return user
    
    return None

def remove_user(self, user_id):
    """Удалить пользователя"""
    db = MandreData.read_persistent_json(self.id, "users.json", {"users": []})
    
    db["users"] = [u for u in db["users"] if u["id"] != user_id]
    
    MandreData.write_persistent_json(self.id, "users.json", db)
```

### Кэш с TTL

```python
import time

def set_cache(self, key, value, ttl=3600):
    """Сохранить в кэш с временем жизни"""
    cache = MandreData.read_persistent_json(self.id, "cache.json", {})
    
    cache[key] = {
        "value": value,
        "expires_at": time.time() + ttl
    }
    
    MandreData.write_persistent_json(self.id, "cache.json", cache)

def get_cache(self, key):
    """Получить из кэша"""
    cache = MandreData.read_persistent_json(self.id, "cache.json", {})
    
    if key not in cache:
        return None
    
    item = cache[key]
    
    # Проверяем срок действия
    if time.time() > item["expires_at"]:
        return None
    
    return item["value"]

def clear_expired_cache(self):
    """Очистить устаревший кэш"""
    cache = MandreData.read_persistent_json(self.id, "cache.json", {})
    current_time = time.time()
    
    # Удаляем устаревшие записи
    cache = {
        k: v for k, v in cache.items()
        if v["expires_at"] > current_time
    }
    
    MandreData.write_persistent_json(self.id, "cache.json", cache)
```

### История с ограничением размера

```python
def add_to_history(self, item, max_size=100):
    """Добавить в историю с ограничением размера"""
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    
    history.append({
        "item": item,
        "timestamp": time.time()
    })
    
    # Ограничиваем размер
    if len(history) > max_size:
        history = history[-max_size:]
    
    MandreData.write_persistent_json(self.id, "history.json", history)

def get_recent_history(self, limit=10):
    """Получить последние записи"""
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    return history[-limit:]
```

### Экспорт/импорт

```python
import json

def export_all_data(self):
    """Экспортировать все данные плагина"""
    files = MandreData.list_files_for_plugin(self.id)
    
    export_data = {}
    for filename in files:
        data = MandreData.read_persistent_json(self.id, filename, None)
        if data is not None:
            export_data[filename] = data
    
    # Конвертируем в JSON строку
    json_str = json.dumps(export_data, ensure_ascii=False, indent=2)
    return json_str

def import_all_data(self, json_str):
    """Импортировать данные"""
    try:
        import_data = json.loads(json_str)
        
        for filename, data in import_data.items():
            MandreData.write_persistent_json(self.id, filename, data)
        
        return True
    except Exception as e:
        self.log(f"Ошибка импорта: {e}")
        return False
```

### Статистика использования

```python
def track_usage(self, action):
    """Отслеживать использование функций"""
    stats = MandreData.read_persistent_json(self.id, "stats.json", {})
    
    if action not in stats:
        stats[action] = {
            "count": 0,
            "first_used": time.time(),
            "last_used": time.time()
        }
    
    stats[action]["count"] += 1
    stats[action]["last_used"] = time.time()
    
    MandreData.write_persistent_json(self.id, "stats.json", stats)

def get_stats(self):
    """Получить статистику"""
    return MandreData.read_persistent_json(self.id, "stats.json", {})
```

## Потокобезопасность

Все методы MandreData потокобезопасны и могут вызываться из любых потоков:

```python
from threading import Thread

def background_task(self):
    # Безопасно из фонового потока
    data = MandreData.read_persistent_json(self.id, "data.json", {})
    data["updated"] = time.time()
    MandreData.write_persistent_json(self.id, "data.json", data)

Thread(target=lambda: background_task(self)).start()
```

## Лучшие практики

### 1. Всегда указывайте default

```python
# ✅ Хорошо
data = MandreData.read_persistent_json(self.id, "config.json", {})

# ❌ Плохо
data = MandreData.read_persistent_json(self.id, "config.json")
```

### 2. Используйте осмысленные имена файлов

```python
# ✅ Хорошо
MandreData.write_persistent_json(self.id, "user_database.json", data)
MandreData.write_persistent_json(self.id, "settings.json", settings)

# ❌ Плохо
MandreData.write_persistent_json(self.id, "data.json", data)
MandreData.write_persistent_json(self.id, "file1.json", settings)
```

### 3. Ограничивайте размер данных

```python
# Не храните бесконечно растущие списки
if len(history) > 1000:
    history = history[-1000:]
```

### 4. Валидируйте загруженные данные

```python
data = MandreData.read_persistent_json(self.id, "config.json", {})

# Проверяем структуру
if "version" not in data:
    data["version"] = "1.0"

if "settings" not in data or not isinstance(data["settings"], dict):
    data["settings"] = {}
```

## См. также

- [Хранилище данных](/guide/storage) - подробное руководство
- [Mandre](/api/mandre) - основной модуль
- [Примеры](/examples/calculator) - примеры использования
