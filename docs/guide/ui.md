# UI компоненты

MandreUI предоставляет готовые методы для создания диалогов, уведомлений и других UI элементов.

## Диалог с выбором

Простой способ показать пользователю список вариантов:

```python
from mandre_lib import MandreUI

def show_menu(self):
    MandreUI.show(
        title="Выберите действие",
        items=["Первое", "Второе", "Третье"],
        on_select=lambda index, text: self.handle_select(index, text),
        message="Какой вариант вам нравится?",
        cancel_text="Отмена"
    )

def handle_select(self, index, text):
    self.log(f"Выбран пункт {index}: {text}")
    BulletinHelper.show_success(f"Вы выбрали: {text}")
```

### Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `title` | str | Заголовок диалога |
| `items` | list[str] | Список вариантов |
| `on_select` | function | Callback при выборе: `(index, text) -> None` |
| `message` | str | Дополнительное сообщение (опционально) |
| `cancel_text` | str | Текст кнопки отмены (опционально) |

## Ripple эффект

Визуальная обратная связь с волновым эффектом:

```python
from mandre_lib import MandreUI

# Простой ripple в центре экрана
MandreUI.ripple()

# С вибрацией и увеличенной интенсивностью
MandreUI.ripple(intensity=2.0, vibrate=True)
```

### Параметры

- `intensity` (float): Интенсивность эффекта (по умолчанию 1.0)
- `vibrate` (bool): Включить вибрацию (по умолчанию False)

## Селектор чатов

Встроенный диалог для выбора чата или пользователя:

```python
from mandre_lib import MandreUI

def select_chat(self):
    MandreUI.select_chat(
        title="Выберите чат",
        on_select=self.handle_chat_select,
        search_hint="Поиск чата...",
        cancel_text="Отмена"
    )

def handle_chat_select(self, chat_info):
    """
    chat_info содержит:
    - 'title': название чата
    - 'id': ID чата
    - 'obj': объект чата или пользователя (TLRPC)
    """
    self.log(f"Выбран чат: {chat_info['title']} (ID: {chat_info['id']})")
    
    # Сохраняем выбранный чат
    self.set_setting("selected_chat_id", chat_info['id'])
    self.set_setting("selected_chat_title", chat_info['title'])
    
    BulletinHelper.show_success(f"Выбран: {chat_info['title']}")
```

### Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `title` | str | Заголовок диалога |
| `on_select` | function | Callback: `(chat_info: dict) -> None` |
| `search_hint` | str | Подсказка в поиске (опционально) |
| `cancel_text` | str | Текст кнопки отмены (опционально) |

## Навигационная панель

Добавление вкладок в нижней части экрана настроек:

```python
from mandre_lib import MandreUI, Mandre
from android.graphics import Color

def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    # Определяем вкладки
    items = [
        {
            "text": "Основные",
            "icon": "msg_settings",
            "on_click": lambda: self.switch_tab(0)
        },
        {
            "text": "Данные",
            "icon": "msg_storage",
            "on_click": lambda: self.switch_tab(1)
        },
        {
            "text": "О плагине",
            "icon": "msg_info",
            "on_click": lambda: self.switch_tab(2)
        }
    ]
    
    # Настраиваем панель
    MandreUI.setup_settings_bottom_bar(
        plugin_instance=self,
        items=items,
        active_index_key="current_tab",
        bg_color=Color.argb(210, 50, 50, 55),
        active_color=Color.WHITE,
        inactive_color=Color.rgb(140, 140, 140)
    )

def switch_tab(self, index):
    """Переключение вкладки"""
    self.set_setting("current_tab", index)
    Mandre.apply_and_refresh_settings(self)

def create_settings(self):
    """Создание UI в зависимости от активной вкладки"""
    tab = self.get_setting("current_tab", 0)
    
    if tab == 0:
        return self.create_main_settings()
    elif tab == 1:
        return self.create_data_settings()
    elif tab == 2:
        return self.create_about_settings()
```

### Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `plugin_instance` | BasePlugin | Экземпляр плагина |
| `items` | list[dict] | Список вкладок |
| `active_index_key` | str | Ключ для сохранения активной вкладки |
| `bg_color` | int | Цвет фона панели |
| `active_color` | int | Цвет активной вкладки |
| `inactive_color` | int | Цвет неактивной вкладки |

### Структура элемента вкладки

```python
{
    "text": "Название",           # Текст вкладки
    "icon": "msg_settings",       # Иконка (имя из Telegram)
    "on_click": lambda: func()    # Callback при клике
}
```

## Уведомления (Bulletin)

Хотя это не часть MandreUI, вот полезные методы для уведомлений:

```python
from ui.bulletin import BulletinHelper

# Успех (зелёный)
BulletinHelper.show_success("Операция выполнена!")

# Ошибка (красный)
BulletinHelper.show_error("Произошла ошибка")

# Информация (синий)
BulletinHelper.show_info("Информационное сообщение")

# Предупреждение (жёлтый)
BulletinHelper.show_warning("Внимание!")
```

## Примеры использования

### Меню действий

```python
def show_actions_menu(self):
    """Показать меню с действиями"""
    actions = [
        "📊 Показать статистику",
        "🗑️ Очистить данные",
        "📤 Экспортировать",
        "📥 Импортировать",
        "⚙️ Настройки"
    ]
    
    MandreUI.show(
        title="Действия",
        items=actions,
        on_select=self.handle_action
    )

def handle_action(self, index, text):
    if index == 0:
        self.show_statistics()
    elif index == 1:
        self.clear_data()
    elif index == 2:
        self.export_data()
    elif index == 3:
        self.import_data()
    elif index == 4:
        self.open_settings()
```

### Выбор темы

```python
def select_theme(self):
    """Выбор темы оформления"""
    themes = ["🌞 Светлая", "🌙 Тёмная", "🎨 Автоматическая"]
    current = self.get_setting("theme", 2)
    
    MandreUI.show(
        title="Выберите тему",
        items=themes,
        on_select=lambda i, t: self.apply_theme(i),
        message=f"Текущая: {themes[current]}"
    )

def apply_theme(self, theme_index):
    self.set_setting("theme", theme_index)
    BulletinHelper.show_success("Тема изменена")
    MandreUI.ripple(vibrate=True)
```

### Выбор получателя

```python
def forward_to_chat(self, message):
    """Переслать сообщение в выбранный чат"""
    def on_chat_selected(chat_info):
        # Отправляем сообщение в выбранный чат
        self.send_message_to_chat(chat_info['id'], message)
        BulletinHelper.show_success(f"Отправлено в {chat_info['title']}")
    
    MandreUI.select_chat(
        title="Выберите получателя",
        on_select=on_chat_selected,
        search_hint="Поиск..."
    )
```

### Подтверждение действия

```python
def confirm_delete(self):
    """Подтверждение удаления"""
    MandreUI.show(
        title="Удалить все данные?",
        items=["✅ Да, удалить", "❌ Отмена"],
        on_select=lambda i, t: self.delete_all() if i == 0 else None,
        message="Это действие нельзя отменить!"
    )
```

## Интеграция с настройками

Пример создания настроек с навигацией:

```python
from ui.settings import Header, Text, Switch, Divider, Input

def create_settings(self):
    tab = self.get_setting("current_tab", 0)
    
    if tab == 0:  # Основные
        return [
            Header(text="Основные настройки"),
            Switch(
                text="Включить функцию",
                value=self.get_setting("enabled", True),
                on_change=lambda v: self.set_setting("enabled", v)
            ),
            Text(
                text="Выбрать чат",
                icon="msg_select",
                on_click=lambda _: MandreUI.select_chat(
                    title="Выбор чата",
                    on_select=self.save_chat
                )
            )
        ]
    elif tab == 1:  # Данные
        return [
            Header(text="Управление данными"),
            Text(
                text="Экспортировать",
                icon="msg_shareout",
                on_click=lambda _: self.export_data()
            ),
            Text(
                text="Импортировать",
                icon="msg_input",
                on_click=lambda _: self.import_data()
            ),
            Divider(),
            Text(
                text="Очистить всё",
                icon="msg_delete",
                red=True,
                on_click=lambda _: self.confirm_delete()
            )
        ]
```

## Лучшие практики

::: tip UI из главного потока
Всегда вызывайте UI методы из главного потока:

```python
# ✅ Правильно
def background_task(self):
    result = some_operation()
    run_on_ui_thread(lambda: MandreUI.show(
        title="Готово",
        items=[result]
    ))

# ❌ Неправильно
def background_task(self):
    result = some_operation()
    MandreUI.show(title="Готово", items=[result])  # Может вызвать краш
```
:::

::: warning Короткие списки
Не создавайте диалоги с очень длинными списками (>50 элементов). Используйте пагинацию или поиск.
:::

## Следующие шаги

- [Команды](/guide/commands) - система команд
- [Планировщик](/guide/scheduler) - периодические задачи
- [Примеры](/examples/calculator) - готовые примеры
