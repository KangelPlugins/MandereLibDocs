# Информация об устройстве

**MandreDevice** предоставляет подробную информацию о текущем устройстве Android.

## Импорт

```python
from mandre_lib import Mandre
```

## Получение полной информации

Метод `get_device_info()` возвращает словарь с подробной информацией:

```python
def get_device_info(self):
    device_info = Mandre.Device.get_device_info()
    
    if "error" in device_info:
        self.log(f"Ошибка: {device_info['error']}")
        return
    
    self.log(f"Производитель: {device_info['manufacturer']}")
    self.log(f"Модель: {device_info['model']}")
    self.log(f"Android: {device_info['android_version']} (API {device_info['api_level']})")
    self.log(f"Экран: {device_info['screen_width']}x{device_info['screen_height']}")
    self.log(f"Всего памяти: {device_info['total_memory_mb']} МБ")
    self.log(f"Root: {device_info['is_rooted']}")
```

### Структура данных

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

## Краткая информация

Метод `get_simple_info()` возвращает отформатированную строку:

```python
def show_simple_device_info(self):
    simple_info = Mandre.Device.get_simple_info()
    # Вернёт: "Samsung Galaxy S21 (Android 13, API 33)"
    BulletinHelper.show_info(simple_info)
```

## Примеры использования

### Команда для показа информации

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    self.add_on_send_message_hook()
    Mandre.register_command(self, "device", self.cmd_device)

def on_send_message_hook(self, params):
    return Mandre.handle_outgoing_command(params) or HookResult()

def cmd_device(self, plugin, args, params):
    """Показать информацию об устройстве"""
    simple_info = Mandre.Device.get_simple_info()
    params["message"] = f"📱 {simple_info}"
    return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

### Детальная информация

```python
def cmd_device_full(self, plugin, args, params):
    """Полная информация об устройстве"""
    info = Mandre.Device.get_device_info()
    
    if "error" in info:
        params["message"] = f"❌ Ошибка: {info['error']}"
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

### Экспорт в файл

```python
def export_device_info(self):
    import tempfile
    import json
    
    device_info = Mandre.Device.get_device_info()
    
    if "error" in device_info:
        BulletinHelper.show_error(f"Ошибка: {device_info['error']}")
        return
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(device_info, f, ensure_ascii=False, indent=2)
        temp_file_path = f.name
    
    Mandre.Share.share_file(temp_file_path, "Информация об устройстве")
    BulletinHelper.show_success("Информация экспортирована!")
```

### HTML отчёт

```python
def generate_device_report(self):
    import tempfile
    
    device_info = Mandre.Device.get_device_info()
    if "error" in device_info:
        return
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Информация об устройстве</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        h1 {{ color: #0088cc; }}
        table {{ border-collapse: collapse; width: 100%; }}
        td, th {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #0088cc; color: white; }}
    </style>
</head>
<body>
    <h1>📱 Информация об устройстве</h1>
    <table>
        <tr><th>Параметр</th><th>Значение</th></tr>
        <tr><td>Производитель</td><td>{device_info['manufacturer']}</td></tr>
        <tr><td>Модель</td><td>{device_info['model']}</td></tr>
        <tr><td>Android</td><td>{device_info['android_version']} (API {device_info['api_level']})</td></tr>
        <tr><td>Экран</td><td>{device_info['screen_width']}x{device_info['screen_height']}</td></tr>
        <tr><td>Память</td><td>{device_info['total_memory_mb']} МБ</td></tr>
        <tr><td>Root</td><td>{'Да' if device_info['is_rooted'] else 'Нет'}</td></tr>
    </table>
</body>
</html>"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        temp_path = f.name
    
    Mandre.Share.share_file(temp_path, "Отчёт об устройстве")
```

### Кэширование информации

Информация об устройстве не меняется часто, поэтому её можно кэшировать:

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

## Обработка ошибок

Всегда проверяйте наличие ключа `error`:

```python
def safe_get_info(self):
    info = Mandre.Device.get_device_info()
    
    if "error" in info:
        BulletinHelper.show_error(f"Не удалось получить информацию: {info['error']}")
        return None
    
    return info
```

## Полный пример

```python
from base_plugin import BasePlugin, HookResult, HookStrategy
from mandre_lib import Mandre
from ui.bulletin import BulletinHelper
from ui.settings import Header, Text, Divider
import tempfile
import json

class DeviceInfoPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        Mandre.register_command(self, "device", self.cmd_device)
        Mandre.register_command(self, "devicefull", self.cmd_device_full)
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_device(self, plugin, args, params):
        """Краткая информация"""
        simple_info = Mandre.Device.get_simple_info()
        params["message"] = f"📱 {simple_info}"
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    
    def cmd_device_full(self, plugin, args, params):
        """Полная информация"""
        info = Mandre.Device.get_device_info()
        
        if "error" in info:
            params["message"] = f"❌ {info['error']}"
            return HookResult(strategy=HookStrategy.MODIFY, params=params)
        
        message = f"""📱 {info['manufacturer']} {info['model']}
🤖 Android {info['android_version']} (API {info['api_level']})
📐 {info['screen_width']}x{info['screen_height']}
💾 {info['total_memory_mb']} МБ
🔓 Root: {'Да' if info['is_rooted'] else 'Нет'}"""
        
        params["message"] = message
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
    
    def create_settings(self):
        return [
            Header(text="Информация об устройстве"),
            Text(
                text="Показать краткую информацию",
                icon="msg_info_solar",
                on_click=lambda _: self.show_simple()
            ),
            Text(
                text="Экспортировать в JSON",
                icon="msg_shareout",
                on_click=lambda _: self.export_json()
            ),
            Text(
                text="Создать HTML отчёт",
                icon="msg_share_solar",
                on_click=lambda _: self.export_html()
            )
        ]
    
    def show_simple(self):
        info = Mandre.Device.get_simple_info()
        BulletinHelper.show_info(info)
    
    def export_json(self):
        info = Mandre.Device.get_device_info()
        if "error" in info:
            BulletinHelper.show_error(info['error'])
            return
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump(info, f, ensure_ascii=False, indent=2)
            temp_path = f.name
        
        Mandre.Share.share_file(temp_path, "Device Info")
        BulletinHelper.show_success("Экспортировано!")
    
    def export_html(self):
        info = Mandre.Device.get_device_info()
        if "error" in info:
            return
        
        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Device Info</title></head>
<body>
<h1>📱 {info['manufacturer']} {info['model']}</h1>
<p>Android {info['android_version']} (API {info['api_level']})</p>
<p>Screen: {info['screen_width']}x{info['screen_height']}</p>
<p>Memory: {info['total_memory_mb']} MB</p>
</body></html>"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
            f.write(html)
            temp_path = f.name
        
        Mandre.Share.share_file(temp_path, "Device Report")
```

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

## См. также

- [MandreDevice API](/api/mandre-device) - полная справка
- [MandreShare](/guide/share) - отправка файлов
- [MandreNotification](/guide/notifications) - уведомления
