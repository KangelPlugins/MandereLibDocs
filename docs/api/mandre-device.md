# MandreDevice API

Модуль для получения информации о текущем устройстве Android.

## Импорт

```python
from mandre_lib import Mandre
```

## Методы

### get_device_info()

Возвращает подробную информацию об устройстве.

```python
device_info = Mandre.Device.get_device_info()
```

**Параметры:** Нет

**Возвращает:** dict - словарь с информацией об устройстве

**Структура ответа:**

```python
{
    "manufacturer": "Samsung",           # Производитель
    "model": "Galaxy S21",               # Модель устройства
    "android_version": "13",             # Версия Android
    "api_level": 33,                     # API Level
    "screen_width": 1080,                # Ширина экрана в пикселях
    "screen_height": 2400,               # Высота экрана в пикселях
    "total_memory_mb": 8192,             # Общая память в МБ
    "is_rooted": False                   # Наличие root
}
```

**При ошибке:**

```python
{
    "error": "Описание ошибки"
}
```

**Пример:**

```python
device_info = Mandre.Device.get_device_info()

if "error" in device_info:
    self.log(f"Ошибка: {device_info['error']}")
    return

self.log(f"Производитель: {device_info['manufacturer']}")
self.log(f"Модель: {device_info['model']}")
self.log(f"Android: {device_info['android_version']} (API {device_info['api_level']})")
self.log(f"Экран: {device_info['screen_width']}x{device_info['screen_height']}")
self.log(f"Память: {device_info['total_memory_mb']} МБ")
self.log(f"Root: {device_info['is_rooted']}")
```

---

### get_simple_info()

Возвращает краткую информацию об устройстве в виде строки.

```python
simple_info = Mandre.Device.get_simple_info()
```

**Параметры:** Нет

**Возвращает:** str - отформатированная строка

**Формат:** `"Производитель Модель (Android Версия, API Уровень)"`

**Пример:**

```python
simple_info = Mandre.Device.get_simple_info()
# Вернёт: "Samsung Galaxy S21 (Android 13, API 33)"

BulletinHelper.show_info(simple_info)
```

---

## Поля информации

### manufacturer

Производитель устройства (например, "Samsung", "Xiaomi", "Google").

### model

Модель устройства (например, "Galaxy S21", "Mi 11", "Pixel 6").

### android_version

Версия Android в виде строки (например, "13", "12", "11").

### api_level

API Level Android в виде числа (например, 33, 31, 30).

### screen_width

Ширина экрана в пикселях (например, 1080).

### screen_height

Высота экрана в пикселях (например, 2400).

### total_memory_mb

Общий объём оперативной памяти в мегабайтах (например, 8192).

### is_rooted

Флаг наличия root-доступа: `True` или `False`.

---

## Обработка ошибок

Всегда проверяйте наличие ключа `error`:

```python
info = Mandre.Device.get_device_info()

if "error" in info:
    BulletinHelper.show_error(f"Не удалось получить информацию: {info['error']}")
    return

# Безопасно используем данные
print(info['manufacturer'])
```

---

## Примеры

### Показ информации в сообщении

```python
def cmd_device(self, plugin, args, params):
    info = Mandre.Device.get_device_info()
    
    if "error" in info:
        params["message"] = f"❌ {info['error']}"
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    
    message = f"""📱 **Информация об устройстве**

🏭 Производитель: {info['manufacturer']}
📱 Модель: {info['model']}
🤖 Android: {info['android_version']} (API {info['api_level']})
📐 Экран: {info['screen_width']}x{info['screen_height']}
💾 Память: {info['total_memory_mb']} МБ
🔓 Root: {'Да' if info['is_rooted'] else 'Нет'}
"""
    
    params["message"] = message
    return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

### Экспорт в JSON

```python
def export_device_info(self):
    import tempfile
    import json
    
    device_info = Mandre.Device.get_device_info()
    
    if "error" in device_info:
        BulletinHelper.show_error(device_info['error'])
        return
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(device_info, f, ensure_ascii=False, indent=2)
        temp_path = f.name
    
    Mandre.Share.share_file(temp_path, "Device Info")
    BulletinHelper.show_success("Экспортировано!")
```

### Проверка совместимости

```python
def check_compatibility(self):
    info = Mandre.Device.get_device_info()
    
    if "error" in info:
        return False
    
    # Проверяем минимальные требования
    if info['api_level'] < 26:  # Android 8.0
        BulletinHelper.show_error("Требуется Android 8.0 или выше")
        return False
    
    if info['total_memory_mb'] < 2048:  # 2 ГБ
        BulletinHelper.show_warning("Рекомендуется минимум 2 ГБ памяти")
    
    return True
```

### Кэширование

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    last_update = self.get_setting("device_info_updated", 0)
    current_time = int(time.time())
    
    # Обновляем раз в 24 часа
    if current_time - last_update > 86400:
        device_info = Mandre.Device.get_device_info()
        MandreData.write_persistent_json(self.id, "device_cache.json", device_info)
        self.set_setting("device_info_updated", current_time)

def get_cached_device_info(self):
    return MandreData.read_persistent_json(self.id, "device_cache.json", {})
```

---

## Лучшие практики

### 1. Всегда проверяйте ошибки

```python
# ✅ Правильно
info = Mandre.Device.get_device_info()
if "error" in info:
    return

# ❌ Неправильно
info = Mandre.Device.get_device_info()
print(info['manufacturer'])  # Может упасть
```

### 2. Кэшируйте данные

```python
# ✅ Правильно - кэшируем на 24 часа
if need_update():
    info = Mandre.Device.get_device_info()
    cache_info(info)

# ❌ Неправильно - запрашиваем каждый раз
info = Mandre.Device.get_device_info()
```

### 3. Используйте простую версию где возможно

```python
# ✅ Правильно - для показа пользователю
simple = Mandre.Device.get_simple_info()
BulletinHelper.show_info(simple)

# ❌ Неправильно - избыточно
info = Mandre.Device.get_device_info()
BulletinHelper.show_info(f"{info['manufacturer']} {info['model']}")
```

---

## См. также

- [Информация об устройстве](/guide/device) - подробное руководство
- [MandreShare](/api/mandre-share) - отправка файлов
- [MandreNotification](/api/mandre-notification) - уведомления
