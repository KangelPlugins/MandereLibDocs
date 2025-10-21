# Планировщик задач

Планировщик MandreLib позволяет выполнять функции по расписанию с определённым интервалом.

## Базовое использование

```python
from mandre_lib import Mandre

def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Запустить задачу каждые 30 секунд
    Mandre.schedule_task(
        self,
        task_name="auto_check",
        interval_seconds=30,
        callback=self.check_something
    )

def check_something(self):
    """Эта функция будет вызвана каждые 30 секунд"""
    self.log("Проверка выполнена")
    
    # Ваша логика
    count = self.get_setting("check_count", 0)
    self.set_setting("check_count", count + 1)

def on_plugin_unload(self):
    # Отменить задачу при выгрузке плагина
    Mandre.cancel_task(self, "auto_check")
```

## Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `plugin_instance` | BasePlugin | Экземпляр плагина (self) |
| `task_name` | str | Уникальное имя задачи |
| `interval_seconds` | int | Интервал в секундах (минимум 1) |
| `callback` | function | Функция для вызова |

## Важные моменты

::: warning Фоновый поток
Задачи выполняются в фоновом потоке, не блокируя UI. Если нужно обновить UI, используйте `run_on_ui_thread()`.
:::

::: danger Отмена задач
При выгрузке плагина все его задачи автоматически отменяются, но лучше явно вызывать `cancel_task()` в `on_plugin_unload()`.
:::

::: tip Минимальный интервал
Минимальный интервал — 1 секунда. Для более частых проверок используйте другие подходы.
:::

## Примеры использования

### Автосохранение

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Автосохранение каждые 5 минут
    Mandre.schedule_task(
        self,
        task_name="auto_save",
        interval_seconds=300,  # 5 минут
        callback=self.auto_save
    )

def auto_save(self):
    """Автоматическое сохранение данных"""
    data = self.collect_data()
    MandreData.write_persistent_json(self.id, "backup.json", data)
    self.log("Автосохранение выполнено")
```

### Периодическая проверка

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Проверка каждые 60 секунд
    Mandre.schedule_task(
        self,
        task_name="check_updates",
        interval_seconds=60,
        callback=self.check_for_updates
    )

def check_for_updates(self):
    """Проверка обновлений"""
    try:
        # Ваша логика проверки
        has_updates = self.fetch_updates()
        
        if has_updates:
            # Показываем уведомление в UI потоке
            run_on_ui_thread(lambda: 
                BulletinHelper.show_info("Доступны обновления!")
            )
    except Exception as e:
        self.log(f"Ошибка проверки обновлений: {e}")
```

### Очистка кэша

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Очистка кэша каждый час
    Mandre.schedule_task(
        self,
        task_name="cache_cleanup",
        interval_seconds=3600,  # 1 час
        callback=self.cleanup_cache
    )

def cleanup_cache(self):
    """Очистка устаревшего кэша"""
    cache = MandreData.read_persistent_json(self.id, "cache.json", {})
    current_time = time.time()
    
    # Удаляем записи старше 24 часов
    cleaned_cache = {
        k: v for k, v in cache.items()
        if current_time - v.get("timestamp", 0) < 86400
    }
    
    removed = len(cache) - len(cleaned_cache)
    if removed > 0:
        MandreData.write_persistent_json(self.id, "cache.json", cleaned_cache)
        self.log(f"Удалено {removed} устаревших записей")
```

### Напоминания

```python
def schedule_reminder(self, minutes, text):
    """Создать напоминание"""
    task_name = f"reminder_{int(time.time())}"
    
    def remind():
        run_on_ui_thread(lambda: 
            BulletinHelper.show_info(f"⏰ Напоминание: {text}")
        )
        # Отменяем задачу после выполнения
        Mandre.cancel_task(self, task_name)
    
    Mandre.schedule_task(
        self,
        task_name=task_name,
        interval_seconds=minutes * 60,
        callback=remind
    )
    
    # Сохраняем напоминание
    reminders = self.get_setting("active_reminders", [])
    reminders.append(task_name)
    self.set_setting("active_reminders", reminders)
```

### Мониторинг состояния

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Мониторинг каждые 10 секунд
    Mandre.schedule_task(
        self,
        task_name="monitor",
        interval_seconds=10,
        callback=self.monitor_state
    )

def monitor_state(self):
    """Мониторинг состояния плагина"""
    # Проверяем различные метрики
    memory_usage = self.get_memory_usage()
    task_count = len(self.get_setting("active_tasks", []))
    
    # Логируем если есть проблемы
    if memory_usage > 100:  # МБ
        self.log(f"⚠️ Высокое использование памяти: {memory_usage}MB")
    
    if task_count > 10:
        self.log(f"⚠️ Много активных задач: {task_count}")
```

## Множественные задачи

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Запускаем несколько задач
    tasks = [
        ("fast_check", 10, self.fast_check),
        ("medium_check", 60, self.medium_check),
        ("slow_check", 300, self.slow_check),
    ]
    
    for name, interval, callback in tasks:
        Mandre.schedule_task(self, name, interval, callback)

def on_plugin_unload(self):
    # Отменяем все задачи
    for name in ["fast_check", "medium_check", "slow_check"]:
        Mandre.cancel_task(self, name)
```

## Условное выполнение

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    Mandre.schedule_task(
        self,
        task_name="conditional_task",
        interval_seconds=30,
        callback=self.conditional_task
    )

def conditional_task(self):
    """Задача выполняется только при определённых условиях"""
    # Проверяем условие
    if not self.get_setting("task_enabled", True):
        return  # Пропускаем выполнение
    
    # Проверяем время
    current_hour = datetime.now().hour
    if current_hour < 9 or current_hour > 18:
        return  # Работаем только с 9 до 18
    
    # Выполняем задачу
    self.do_something()
```

## Работа с UI

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    Mandre.schedule_task(
        self,
        task_name="ui_update",
        interval_seconds=5,
        callback=self.update_ui
    )

def update_ui(self):
    """Обновление UI из фоновой задачи"""
    # Получаем данные в фоновом потоке
    data = self.fetch_data()
    
    # Обновляем UI в главном потоке
    run_on_ui_thread(lambda: self.display_data(data))

def display_data(self, data):
    """Отображение данных (вызывается в UI потоке)"""
    BulletinHelper.show_info(f"Обновлено: {data}")
```

## Обработка ошибок

```python
def safe_task(self):
    """Задача с обработкой ошибок"""
    try:
        # Ваша логика
        result = self.do_something_risky()
        self.log(f"Задача выполнена: {result}")
        
    except ConnectionError as e:
        self.log(f"Ошибка соединения: {e}")
        # Можно попробовать позже
        
    except Exception as e:
        self.log(f"Неожиданная ошибка: {e}")
        # Логируем и продолжаем работу
```

## Динамическое управление

```python
def cmd_start_task(self, plugin, args, params):
    """Команда для запуска задачи"""
    if not self.get_setting("task_running", False):
        Mandre.schedule_task(
            self,
            task_name="dynamic_task",
            interval_seconds=30,
            callback=self.dynamic_task
        )
        self.set_setting("task_running", True)
        BulletinHelper.show_success("Задача запущена")
    else:
        BulletinHelper.show_warning("Задача уже запущена")
    
    return HookResult(strategy=HookStrategy.CANCEL)

def cmd_stop_task(self, plugin, args, params):
    """Команда для остановки задачи"""
    if self.get_setting("task_running", False):
        Mandre.cancel_task(self, "dynamic_task")
        self.set_setting("task_running", False)
        BulletinHelper.show_success("Задача остановлена")
    else:
        BulletinHelper.show_warning("Задача не запущена")
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

## Счётчик выполнений

```python
def tracked_task(self):
    """Задача со счётчиком выполнений"""
    count = self.get_setting("task_executions", 0)
    self.set_setting("task_executions", count + 1)
    
    self.log(f"Задача выполнена {count + 1} раз")
    
    # Останавливаем после N выполнений
    if count + 1 >= 100:
        Mandre.cancel_task(self, "tracked_task")
        self.log("Задача завершена после 100 выполнений")
```

## Лучшие практики

::: tip Именование задач
Используйте понятные имена задач:

```python
# ✅ Хорошо
Mandre.schedule_task(self, "auto_backup", 300, self.backup)

# ❌ Плохо
Mandre.schedule_task(self, "task1", 300, self.backup)
```
:::

::: warning Тяжёлые операции
Не выполняйте очень тяжёлые операции в задачах. Разбивайте на части:

```python
def heavy_task(self):
    # ❌ Плохо - блокирует поток надолго
    for i in range(1000000):
        process(i)
    
    # ✅ Хорошо - обрабатываем порциями
    batch_size = 100
    start = self.get_setting("process_index", 0)
    for i in range(start, min(start + batch_size, 1000000)):
        process(i)
    self.set_setting("process_index", start + batch_size)
```
:::

::: danger Очистка
Всегда отменяйте задачи при выгрузке:

```python
def on_plugin_unload(self):
    # Отменяем все задачи
    Mandre.cancel_task(self, "task1")
    Mandre.cancel_task(self, "task2")
    Mandre.cancel_task(self, "task3")
```
:::

## Следующие шаги

- [Текст-в-речь](/guide/tts) - озвучивание текста
- [Аутентификация](/guide/auth) - запрос подтверждения
- [Примеры](/examples/calculator) - готовые примеры
