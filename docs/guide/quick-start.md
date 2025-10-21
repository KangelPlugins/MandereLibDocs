# Быстрый старт

Создайте свой первый плагин с MandreLib за 5 минут!

::: warning Предварительные требования
Перед началом работы с MandreLib рекомендуется изучить [базовую документацию exteraGram](https://plugins.exteragram.app) для понимания основ разработки плагинов.
:::


## Минимальный пример

Создайте файл плагина со следующим содержимым:

```python
__id__ = "my_first_plugin"
__name__ = "Мой первый плагин"
__version__ = "1.0"
__author__ = "@yourname"
__description__ = "Простой плагин с MandreLib"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin
from mandre_lib import Mandre
from ui.bulletin import BulletinHelper

class MyFirstPlugin(BasePlugin):
    def on_plugin_load(self):
        # Активируем персистентное хранилище
        Mandre.use_persistent_storage(self)
        
        # Увеличиваем счётчик загрузок
        count = self.get_setting("load_count", 0)
        self.set_setting("load_count", count + 1)
        
        self.log(f"Плагин загружен {count + 1} раз!")
        BulletinHelper.show_success("Плагин загружен!")
```

::: tip Готово!
Теперь данные вашего плагина автоматически сохраняются и восстанавливаются при перезагрузке.
:::

## Добавляем команду

Расширим плагин командой `.hello`:

```python
from base_plugin import BasePlugin, HookResult
from mandre_lib import Mandre, MandreUI

class MyFirstPlugin(BasePlugin):
    def on_plugin_load(self):
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        # Регистрируем команду
        Mandre.register_command(self, "hello", self.cmd_hello)
    
    def on_send_message_hook(self, params):
        # Обрабатываем команды
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_hello(self, plugin, args, params):
        """Команда .hello - показывает приветствие"""
        MandreUI.show(
            title="Привет!",
            items=["Вариант 1", "Вариант 2", "Вариант 3"],
            on_select=lambda i, t: self.log(f"Выбрано: {t}"),
            message="Выберите один из вариантов"
        )
        return None  # Сообщение не отправится
```

## Добавляем планировщик

Запустим задачу, которая будет выполняться каждые 30 секунд:

```python
def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Запускаем периодическую задачу
    Mandre.schedule_task(
        self,
        task_name="auto_save",
        interval_seconds=30,
        callback=self.auto_save
    )

def auto_save(self):
    """Автосохранение каждые 30 секунд"""
    self.log("Автосохранение выполнено")
    # Здесь ваша логика

def on_plugin_unload(self):
    # Отменяем задачу при выгрузке
    Mandre.cancel_task(self, "auto_save")
```

## Полный пример

Объединим всё вместе:

```python
__id__ = "my_first_plugin"
__name__ = "Мой первый плагин"
__version__ = "1.0"
__author__ = "@yourname"
__description__ = "Плагин с командами и планировщиком"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin, HookResult
from mandre_lib import Mandre, MandreUI, MandreData
from ui.bulletin import BulletinHelper

class MyFirstPlugin(BasePlugin):
    def on_plugin_load(self):
        # Инициализация
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        # Команды
        Mandre.register_command(self, "hello", self.cmd_hello)
        Mandre.register_command(self, "stats", self.cmd_stats)
        
        # Планировщик
        Mandre.schedule_task(self, "counter", 60, self.increment_counter)
        
        self.log("Плагин загружен!")
    
    def on_send_message_hook(self, params):
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_hello(self, plugin, args, params):
        """Команда .hello"""
        MandreUI.show(
            title="Привет!",
            items=["Показать статистику", "Очистить данные"],
            on_select=self.handle_menu_select
        )
        return None
    
    def cmd_stats(self, plugin, args, params):
        """Команда .stats - показывает статистику"""
        counter = self.get_setting("counter", 0)
        loads = self.get_setting("load_count", 0)
        
        stats = f"📊 Статистика:\n"
        stats += f"Загрузок: {loads}\n"
        stats += f"Счётчик: {counter}"
        
        BulletinHelper.show_info(stats)
        return None
    
    def handle_menu_select(self, index, text):
        if index == 0:
            self.cmd_stats(None, "", {})
        elif index == 1:
            self.set_setting("counter", 0)
            BulletinHelper.show_success("Данные очищены")
    
    def increment_counter(self):
        """Увеличивает счётчик каждую минуту"""
        counter = self.get_setting("counter", 0)
        self.set_setting("counter", counter + 1)
    
    def on_plugin_unload(self):
        Mandre.cancel_task(self, "counter")
        self.log("Плагин выгружен")
```

## Что дальше?

- [Хранилище данных](/guide/storage) - подробнее о работе с данными
- [UI компоненты](/guide/ui) - все возможности интерфейса
- [Команды](/guide/commands) - продвинутая работа с командами
- [Примеры](/examples/calculator) - больше готовых примеров

::: warning Важно
Не забывайте вызывать `Mandre.cancel_task()` в `on_plugin_unload()` для всех запущенных задач!
:::
