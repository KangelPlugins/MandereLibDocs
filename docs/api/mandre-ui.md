# MandreUI API

Модуль для создания UI элементов и диалогов.

## Импорт

```python
from mandre_lib import MandreUI
```

## Методы

### show()

Показывает диалог с выбором из списка.

```python
MandreUI.show(title, items, on_select, message=None, cancel_text=None)
```

**Параметры:**
- `title` (str) - заголовок диалога
- `items` (list[str]) - список вариантов для выбора
- `on_select` (callable) - callback функция: `(index: int, text: str) -> None`
- `message` (str, optional) - дополнительное сообщение
- `cancel_text` (str, optional) - текст кнопки отмены

**Возвращает:** None

**Пример:**

```python
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
```

---

### ripple()

Показывает ripple эффект на экране.

```python
MandreUI.ripple(intensity=1.0, vibrate=False)
```

**Параметры:**
- `intensity` (float, optional) - интенсивность эффекта (по умолчанию 1.0)
- `vibrate` (bool, optional) - включить вибрацию (по умолчанию False)

**Возвращает:** None

**Пример:**

```python
# Простой ripple
MandreUI.ripple()

# С вибрацией и увеличенной интенсивностью
MandreUI.ripple(intensity=2.0, vibrate=True)
```

---

### select_chat()

Показывает селектор для выбора чата или пользователя.

```python
MandreUI.select_chat(title, on_select, search_hint=None, cancel_text=None)
```

**Параметры:**
- `title` (str) - заголовок диалога
- `on_select` (callable) - callback: `(chat_info: dict) -> None`
- `search_hint` (str, optional) - подсказка в поиске
- `cancel_text` (str, optional) - текст кнопки отмены

**chat_info содержит:**
- `title` (str) - название чата
- `id` (int) - ID чата
- `obj` - объект чата/пользователя (TLRPC)

**Возвращает:** None

**Пример:**

```python
def select_target_chat(self):
    MandreUI.select_chat(
        title="Выберите чат",
        on_select=self.on_chat_selected,
        search_hint="Поиск чата...",
        cancel_text="Отмена"
    )

def on_chat_selected(self, chat_info):
    self.log(f"Выбран: {chat_info['title']} (ID: {chat_info['id']})")
    self.set_setting("selected_chat_id", chat_info['id'])
```

---

### setup_settings_bottom_bar()

Настраивает навигационную панель в настройках плагина.

```python
MandreUI.setup_settings_bottom_bar(
    plugin_instance,
    items,
    active_index_key,
    bg_color=None,
    active_color=None,
    inactive_color=None
)
```

**Параметры:**
- `plugin_instance` (BasePlugin) - экземпляр плагина (self)
- `items` (list[dict]) - список вкладок
- `active_index_key` (str) - ключ для сохранения активной вкладки
- `bg_color` (int, optional) - цвет фона панели
- `active_color` (int, optional) - цвет активной вкладки
- `inactive_color` (int, optional) - цвет неактивной вкладки

**Структура элемента items:**
```python
{
    "text": "Название",
    "icon": "msg_settings",
    "on_click": lambda: callback()
}
```

**Возвращает:** None

**Пример:**

```python
from android.graphics import Color

def on_plugin_load(self):
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
        }
    ]
    
    MandreUI.setup_settings_bottom_bar(
        plugin_instance=self,
        items=items,
        active_index_key="current_tab",
        bg_color=Color.argb(210, 50, 50, 55),
        active_color=Color.WHITE,
        inactive_color=Color.rgb(140, 140, 140)
    )

def switch_tab(self, index):
    self.set_setting("current_tab", index)
    Mandre.apply_and_refresh_settings(self)
```

---

## Примеры использования

### Меню действий

```python
def show_actions(self):
    actions = [
        "📊 Статистика",
        "🗑️ Очистить",
        "📤 Экспорт",
        "⚙️ Настройки"
    ]
    
    MandreUI.show(
        title="Действия",
        items=actions,
        on_select=self.handle_action
    )

def handle_action(self, index, text):
    if index == 0:
        self.show_stats()
    elif index == 1:
        self.clear_data()
    elif index == 2:
        self.export_data()
    elif index == 3:
        self.open_settings()
```

### Подтверждение

```python
def confirm_delete(self):
    MandreUI.show(
        title="Удалить все данные?",
        items=["✅ Да, удалить", "❌ Отмена"],
        on_select=lambda i, t: self.delete_all() if i == 0 else None,
        message="Это действие нельзя отменить!"
    )
```

### Выбор темы

```python
def select_theme(self):
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
def forward_message(self, message):
    def on_selected(chat_info):
        self.send_to_chat(chat_info['id'], message)
        BulletinHelper.show_success(f"Отправлено в {chat_info['title']}")
    
    MandreUI.select_chat(
        title="Выберите получателя",
        on_select=on_selected,
        search_hint="Поиск..."
    )
```

### Навигация с вкладками

```python
from android.graphics import Color
from ui.settings import Header, Text, Switch

def on_plugin_load(self):
    Mandre.use_persistent_storage(self)
    
    tabs = [
        {"text": "Общие", "icon": "msg_settings", "on_click": lambda: self.tab(0)},
        {"text": "Данные", "icon": "msg_storage", "on_click": lambda: self.tab(1)},
        {"text": "О плагине", "icon": "msg_info", "on_click": lambda: self.tab(2)}
    ]
    
    MandreUI.setup_settings_bottom_bar(
        plugin_instance=self,
        items=tabs,
        active_index_key="tab",
        bg_color=Color.argb(210, 50, 50, 55),
        active_color=Color.WHITE,
        inactive_color=Color.rgb(140, 140, 140)
    )

def tab(self, index):
    self.set_setting("tab", index)
    Mandre.apply_and_refresh_settings(self)

def create_settings(self):
    tab = self.get_setting("tab", 0)
    
    if tab == 0:
        return [
            Header(text="Общие настройки"),
            Switch(
                text="Включить",
                value=self.get_setting("enabled", True),
                on_change=lambda v: self.set_setting("enabled", v)
            )
        ]
    elif tab == 1:
        return [
            Header(text="Управление данными"),
            Text(text="Экспорт", icon="msg_shareout", on_click=lambda _: self.export())
        ]
    elif tab == 2:
        return [
            Header(text="О плагине"),
            Text(text=f"Версия: {__version__}")
        ]
```

### Динамический список

```python
def show_items(self):
    items = MandreData.read_persistent_json(self.id, "items.json", [])
    
    if not items:
        BulletinHelper.show_info("Список пуст")
        return
    
    # Форматируем для отображения
    display_items = [f"{i+1}. {item['name']}" for i, item in enumerate(items)]
    
    MandreUI.show(
        title="Выберите элемент",
        items=display_items,
        on_select=lambda i, t: self.open_item(items[i])
    )
```

### Ripple с обратной связью

```python
def on_action_complete(self):
    # Визуальная обратная связь
    MandreUI.ripple(intensity=1.5, vibrate=True)
    BulletinHelper.show_success("Готово!")

def on_error(self):
    # Более слабый эффект для ошибки
    MandreUI.ripple(intensity=0.5, vibrate=False)
    BulletinHelper.show_error("Ошибка")
```

## Иконки для вкладок

Доступные иконки (из Telegram):

- `msg_settings` - настройки
- `msg_storage` - хранилище
- `msg_info` - информация
- `msg_stats` - статистика
- `msg_log` - лог
- `msg_delete` - удалить
- `msg_shareout` - экспорт
- `msg_input` - импорт
- `msg_saved` - сохранено
- `msg_retry` - повтор
- `msg_switch` - переключатель
- `msg_voicechat` - голос
- `msg_select` - выбор

## Лучшие практики

### 1. UI из главного потока

```python
# ✅ Правильно
def background_task(self):
    result = long_operation()
    run_on_ui_thread(lambda: MandreUI.show(
        title="Результат",
        items=[result],
        on_select=lambda i, t: None
    ))

# ❌ Неправильно
def background_task(self):
    result = long_operation()
    MandreUI.show(title="Результат", items=[result])  # Краш!
```

### 2. Короткие списки

```python
# Не создавайте очень длинные списки
if len(items) > 50:
    items = items[:50]  # Ограничиваем
```

### 3. Понятные названия

```python
# ✅ Хорошо
items = ["📊 Показать статистику", "🗑️ Удалить данные"]

# ❌ Плохо
items = ["Option 1", "Option 2"]
```

## См. также

- [UI компоненты](/guide/ui) - подробное руководство
- [Mandre](/api/mandre) - основной модуль
- [Примеры](/examples/calculator) - примеры использования
