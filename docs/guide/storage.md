# Хранилище данных

Персистентное хранилище - самая полезная возможность MandreLib. Данные автоматически сохраняются на диск и восстанавливаются при перезагрузке.

## Автоматическое сохранение

После активации `Mandre.use_persistent_storage(self)` все настройки сохраняются автоматически:

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Восстановится из сохранённого файла
    count = self.get_setting("counter", 0)
    self.set_setting("counter", count + 1)
    self.log(f"Плагин загружался {count + 1} раз")
```

::: tip Как это работает
MandreLib перехватывает вызовы `set_setting()` и автоматически сохраняет данные в JSON файл в директории плагина.
:::

## Работа с JSON напрямую

Для более сложных структур данных используйте `MandreData`:

### Запись JSON

```python
from mandre_lib import MandreData

# Создаём структуру данных
my_data = {
    "users": [
        {"id": 1, "name": "Alice", "score": 100},
        {"id": 2, "name": "Bob", "score": 85}
    ],
    "settings": {
        "theme": "dark",
        "notifications": True
    },
    "version": "1.0"
}

# Сохраняем в файл
MandreData.write_persistent_json(self.id, "database.json", my_data)
```

### Чтение JSON

```python
# Читаем с дефолтным значением
loaded_data = MandreData.read_persistent_json(
    self.id, 
    "database.json", 
    default={"users": [], "settings": {}}
)

# Используем данные
users = loaded_data.get("users", [])
for user in users:
    self.log(f"User: {user['name']}, Score: {user['score']}")
```

### Список файлов плагина

```python
# Получить все файлы, созданные плагином
files = MandreData.list_files_for_plugin(self.id)
self.log(f"Файлы плагина: {files}")

# Пример вывода: ['config.json', 'database.json', 'cache.json']
```

## Примеры использования

### Счётчик сообщений

```python
def on_send_message_hook(self, params):
    # Увеличиваем счётчик
    count = self.get_setting("message_count", 0)
    self.set_setting("message_count", count + 1)
    
    # Каждое 10-е сообщение показываем статистику
    if count % 10 == 0:
        BulletinHelper.show_info(f"Отправлено {count} сообщений")
    
    return HookResult()
```

### База данных пользователей

```python
def add_user(self, user_id, username):
    # Загружаем базу
    db = MandreData.read_persistent_json(self.id, "users.json", {"users": []})
    
    # Добавляем пользователя
    db["users"].append({
        "id": user_id,
        "username": username,
        "added_at": time.time()
    })
    
    # Сохраняем
    MandreData.write_persistent_json(self.id, "users.json", db)

def get_user(self, user_id):
    db = MandreData.read_persistent_json(self.id, "users.json", {"users": []})
    
    for user in db["users"]:
        if user["id"] == user_id:
            return user
    return None
```

### Кэш данных

```python
import time

def get_cached_data(self, key, fetch_func, ttl=3600):
    """Получить данные с кэшированием
    
    Args:
        key: ключ кэша
        fetch_func: функция для получения данных
        ttl: время жизни кэша в секундах
    """
    cache = MandreData.read_persistent_json(self.id, "cache.json", {})
    
    # Проверяем кэш
    if key in cache:
        cached_item = cache[key]
        if time.time() - cached_item["timestamp"] < ttl:
            return cached_item["data"]
    
    # Получаем свежие данные
    data = fetch_func()
    
    # Сохраняем в кэш
    cache[key] = {
        "data": data,
        "timestamp": time.time()
    }
    MandreData.write_persistent_json(self.id, "cache.json", cache)
    
    return data
```

### История действий

```python
def add_to_history(self, action, details):
    """Добавить запись в историю"""
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    
    history.append({
        "action": action,
        "details": details,
        "timestamp": time.time()
    })
    
    # Ограничиваем размер истории
    if len(history) > 100:
        history = history[-100:]
    
    MandreData.write_persistent_json(self.id, "history.json", history)

def get_recent_history(self, limit=10):
    """Получить последние записи"""
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    return history[-limit:]
```

## Экспорт и импорт настроек

### Экспорт

```python
import json

def export_settings(self):
    """Экспортировать настройки в JSON строку"""
    settings = MandreData.read_persistent_json(self.id, "config.json", {})
    json_export = json.dumps(settings, ensure_ascii=False, indent=2)
    
    # Показываем пользователю или сохраняем в файл
    self.log(f"Экспорт настроек:\n{json_export}")
    return json_export
```

### Импорт

```python
def import_settings(self, json_string):
    """Импортировать настройки из JSON строки"""
    try:
        imported_settings = json.loads(json_string)
        MandreData.write_persistent_json(self.id, "config.json", imported_settings)
        BulletinHelper.show_success("Настройки импортированы")
        return True
    except Exception as e:
        BulletinHelper.show_error(f"Ошибка импорта: {e}")
        return False
```

## Потокобезопасность

::: tip Безопасность
Все операции с `MandreData` потокобезопасны. Можно безопасно читать и писать из фоновых потоков:

```python
from threading import Thread

def background_task(self):
    # Безопасно из фонового потока
    data = MandreData.read_persistent_json(self.id, "data.json", {})
    data["updated"] = time.time()
    MandreData.write_persistent_json(self.id, "data.json", data)

Thread(target=lambda: background_task(self)).start()
```
:::

## Расположение файлов

Все файлы плагина сохраняются в:
```
/storage/emulated/0/Android/data/org.telegram.messenger/files/exteraGram/plugins_data/<plugin_id>/
```

## Лучшие практики

1. **Используйте осмысленные имена файлов**
   ```python
   # ✅ Хорошо
   MandreData.write_persistent_json(self.id, "user_database.json", data)
   
   # ❌ Плохо
   MandreData.write_persistent_json(self.id, "data.json", data)
   ```

2. **Всегда указывайте default значения**
   ```python
   # ✅ Хорошо
   data = MandreData.read_persistent_json(self.id, "config.json", {})
   
   # ❌ Плохо (может вызвать ошибку)
   data = MandreData.read_persistent_json(self.id, "config.json")
   ```

3. **Ограничивайте размер данных**
   ```python
   # Не храните бесконечно растущие списки
   if len(history) > 1000:
       history = history[-1000:]  # Оставляем последние 1000
   ```

## Экспорт и импорт данных плагина (ZIP)

Экспортируйте все файлы плагина в ZIP-архив и импортируйте их обратно при необходимости (резервное копирование/перенос).

```python
from datetime import datetime
import zipfile, os
from android.os import Environment

def export_plugin_data(self):
    downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_name = f"mandrelib_data_{self.id}_{ts}.zip"
    zip_path = os.path.join(downloads.getAbsolutePath(), zip_name)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for filename in MandreData.list_files_for_plugin(self.id):
            file_path = MandreData.get_persistent_path(self.id, filename)
            zf.write(file_path, arcname=filename)

    BulletinHelper.show_success(f"Данные экспортированы в Downloads/{zip_name}")

def import_plugin_data(self, zip_path):
    # Полная очистка данных плагина
    MandreData.delete_persistent_plugin_data(self.id)

    # Целевая директория хранения данных плагина
    target_dir = File(MandreData._get_base_data_dir(), self.id)
    if not target_dir.exists():
        target_dir.mkdirs()

    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(target_dir.getAbsolutePath())

    BulletinHelper.show_success("Данные импортированы")
```

::: warning Важно
- Перед импортом убедитесь, что архив доверенный.
- Импорт перезапишет текущие данные плагина.
:::

## Следующие шаги

- [UI компоненты](/guide/ui) - создание интерфейса
- [Команды](/guide/commands) - обработка команд
- [Примеры](/examples/calculator) - готовые примеры
