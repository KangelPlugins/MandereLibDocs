# Синтетические каналы (Synthetic Channels)

Синтетические каналы позволяют создавать виртуальные чаты и каналы в приложении без сетевых запросов. Это полезно для отправки сообщений от плагина или создания специальных интерфейсов.

## Основной метод

### Регистрация синтетического канала

```python
Mandre.register_synthetic_channel(channel_id, title, megagroup=False, broadcast=True)
```

Создаёт или обновляет синтетический канал в `MessagesController`.

**Параметры:**
- `channel_id` — уникальный ID канала (обычно большое число)
- `title` — название канала/чата
- `megagroup` — является ли это мегагруппой (по умолчанию `False`)
- `broadcast` — является ли это каналом трансляции (по умолчанию `True`)

**Пример:**
```python
def on_plugin_load(self):
    # Создать синтетический канал "Уведомления плагина"
    Mandre.register_synthetic_channel(
        channel_id=777777777,
        title="Уведомления плагина",
        megagroup=False,
        broadcast=True
    )
    self.log("Синтетический канал создан")
```

## Как выбрать ID канала

Используйте большие числа, которые не конфликтуют с реальными ID:

```python
# ✅ Хорошие варианты
NOTIFICATIONS_CHANNEL_ID = 777777777
LOGS_CHANNEL_ID = 888888888
STATS_CHANNEL_ID = 999999999

# ❌ Плохие варианты (могут конфликтовать)
CHANNEL_ID = 123  # Слишком маленькое число
```

## Практические примеры

### Пример 1: Канал уведомлений плагина

```python
class NotificationPlugin(BasePlugin):
    NOTIFICATIONS_CHANNEL_ID = 777777777
    
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        
        # Создать канал для уведомлений
        Mandre.register_synthetic_channel(
            channel_id=self.NOTIFICATIONS_CHANNEL_ID,
            title="📢 Уведомления плагина",
            megagroup=False,
            broadcast=True
        )
        self.log("Канал уведомлений создан")
    
    def send_notification(self, message):
        """Отправить уведомление в синтетический канал"""
        # Здесь можно использовать API для отправки сообщения в канал
        self.log(f"Уведомление: {message}")
```

### Пример 2: Канал логов

```python
class LoggerPlugin(BasePlugin):
    LOGS_CHANNEL_ID = 888888888
    
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        
        # Создать канал для логов
        Mandre.register_synthetic_channel(
            channel_id=self.LOGS_CHANNEL_ID,
            title="📝 Логи плагина",
            megagroup=False,
            broadcast=True
        )
        self.log("Канал логов создан")
    
    def log_event(self, event_type, event_data):
        """Логировать событие"""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {event_type}: {event_data}"
        self.log(log_message)
        # Можно отправить в синтетический канал
```

### Пример 3: Канал статистики

```python
import json
import time

class StatsPlugin(BasePlugin):
    STATS_CHANNEL_ID = 999999999
    
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        Mandre.sql_init_kv(self.id, "stats_kv")
        
        # Создать канал для статистики
        Mandre.register_synthetic_channel(
            channel_id=self.STATS_CHANNEL_ID,
            title="📊 Статистика плагина",
            megagroup=False,
            broadcast=True
        )
        
        # Инициализировать счётчики
        if not Mandre.sql_kv_get(self.id, "stats:initialized", "stats_kv"):
            Mandre.sql_kv_set(self.id, "stats:messages_processed", 0, "stats_kv")
            Mandre.sql_kv_set(self.id, "stats:errors", 0, "stats_kv")
            Mandre.sql_kv_set(self.id, "stats:initialized", "true", "stats_kv")
    
    def record_message(self):
        """Записать обработанное сообщение"""
        count = Mandre.sql_kv_get_int(self.id, "stats:messages_processed", 0, "stats_kv")
        Mandre.sql_kv_set(self.id, "stats:messages_processed", count + 1, "stats_kv")
    
    def record_error(self):
        """Записать ошибку"""
        count = Mandre.sql_kv_get_int(self.id, "stats:errors", 0, "stats_kv")
        Mandre.sql_kv_set(self.id, "stats:errors", count + 1, "stats_kv")
    
    def get_stats(self):
        """Получить статистику"""
        return {
            "messages_processed": Mandre.sql_kv_get_int(self.id, "stats:messages_processed", 0, "stats_kv"),
            "errors": Mandre.sql_kv_get_int(self.id, "stats:errors", 0, "stats_kv"),
            "timestamp": time.time()
        }
```

### Пример 4: Мегагруппа для обсуждений

```python
class DiscussionPlugin(BasePlugin):
    DISCUSSION_GROUP_ID = 555555555
    
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        
        # Создать мегагруппу для обсуждений
        Mandre.register_synthetic_channel(
            channel_id=self.DISCUSSION_GROUP_ID,
            title="💬 Обсуждения",
            megagroup=True,  # Это мегагруппа, а не канал
            broadcast=False  # Разрешить ответы
        )
        self.log("Группа обсуждений создана")
```

## Фолбэк для совместимости

Если по какой-то причине `Mandre.register_synthetic_channel` недоступен, можно использовать прямой доступ к `MessagesController`:

```python
def create_synthetic_channel_fallback(channel_id, title, megagroup=False, broadcast=True):
    """Фолбэк для создания синтетического канала"""
    from client_utils import get_messages_controller
    from TLRPC import TL_channel
    
    mc = get_messages_controller()
    chat = mc.getChat(channel_id)
    
    if chat is None:
        ch = TL_channel()
        ch.id = channel_id
        ch.title = title
        ch.megagroup = megagroup
        ch.broadcast = broadcast
        mc.putChat(ch, True)
        return True
    
    return False
```

## Когда использовать синтетические каналы

✅ **Используйте синтетические каналы для:**
- Отправки уведомлений от плагина
- Логирования событий
- Отображения статистики
- Создания специальных интерфейсов
- Организации данных плагина

❌ **Не используйте синтетические каналы для:**
- Реальных чатов с пользователями (используйте обычные чаты)
- Хранения конфиденциальных данных (используйте SQL KV)
- Больших объёмов данных (используйте файлы)

## Советы по использованию

1. **Используйте константы для ID каналов:**
   ```python
   class MyPlugin(BasePlugin):
       NOTIFICATIONS_CHANNEL = 777777777
       LOGS_CHANNEL = 888888888
       
       def on_plugin_load(self):
           Mandre.register_synthetic_channel(
               self.NOTIFICATIONS_CHANNEL,
               "Уведомления"
           )
   ```

2. **Создавайте каналы один раз при загрузке:**
   ```python
   def on_plugin_load(self):
       # Безопасно вызывать несколько раз
       # Обновит существующий канал или создаст новый
       Mandre.register_synthetic_channel(777777777, "Канал")
   ```

3. **Используйте эмодзи в названиях:**
   ```python
   Mandre.register_synthetic_channel(777777777, "📢 Уведомления")
   Mandre.register_synthetic_channel(888888888, "📝 Логи")
   Mandre.register_synthetic_channel(999999999, "📊 Статистика")
   ```

4. **Комбинируйте с SQL KV для хранения данных:**
   ```python
   def on_plugin_load(self):
       # Создать канал
       Mandre.register_synthetic_channel(777777777, "Данные")
       
       # Инициализировать хранилище
       Mandre.sql_init_kv(self.id, "data_kv")
   ```

## Интеграция с другими компонентами

### С уведомлениями

```python
def on_plugin_load(self):
    # Создать канал
    Mandre.register_synthetic_channel(777777777, "Уведомления")
    
    # Отправить уведомление
    Mandre.Notification.show_simple(
        "Плагин готов",
        "Синтетический канал создан"
    )
```

### С командами

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.register_synthetic_channel(777777777, "Команды")
    Mandre.register_command(self, "status", self.cmd_status)

def cmd_status(self, plugin, args, params):
    """Показать статус плагина"""
    status = "Плагин работает нормально"
    params["message"] = status
    return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

### С SQL KV

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    Mandre.register_synthetic_channel(777777777, "Данные")
    Mandre.sql_init_kv(self.id, "channel_data")
    
    # Сохранить информацию о канале
    Mandre.sql_kv_set(self.id, "channel:id", "777777777", "channel_data")
    Mandre.sql_kv_set(self.id, "channel:title", "Данные", "channel_data")
```
