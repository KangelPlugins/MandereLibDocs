# Пример: Калькулятор с историей

Полный пример плагина-калькулятора, использующего все основные возможности MandreLib.

## Описание

Плагин предоставляет:
- Команду `.calc` для вычисления выражений
- Автоматическое сохранение истории вычислений
- Периодическое автосохранение
- Настройки с просмотром истории
- Возможность очистки истории

## Полный код

```python
__id__ = "simple_calc"
__name__ = "Простой калькулятор"
__version__ = "1.0"
__author__ = "@you"
__description__ = "Калькулятор с сохранением истории"
__min_version__ = "11.9.0"

from base_plugin import BasePlugin, HookResult, HookStrategy
from ui.settings import Header, Text, Divider, Input
from ui.bulletin import BulletinHelper
from mandre_lib import Mandre, MandreData

class CalcPlugin(BasePlugin):
    def on_plugin_load(self):
        # Активируем MandreLib
        Mandre.use_persistent_storage(self)
        self.add_on_send_message_hook()
        
        # Регистрируем команду
        Mandre.register_command(self, "calc", self.cmd_calc)
        
        # Запускаем задачу для автосохранения истории
        Mandre.schedule_task(self, "save_history", 60, self.save_history)
        
        self.log("Калькулятор загружен")
    
    def on_send_message_hook(self, params):
        # Обработка команд
        return Mandre.handle_outgoing_command(params) or HookResult()
    
    def cmd_calc(self, plugin, args, params):
        """Вычислить выражение. Использование: .calc 2 + 2"""
        if not args:
            BulletinHelper.show_error("Введите выражение, например: .calc 2 + 2")
            return None
        
        try:
            # Вычисляем выражение
            result = eval(args)  # ⚠️ В реальном коде нужна валидация!
            
            # Сохраняем в историю
            history = MandreData.read_persistent_json(self.id, "history.json", [])
            history.append({"expression": args, "result": result})
            MandreData.write_persistent_json(self.id, "history.json", history)
            
            BulletinHelper.show_success(f"{args} = {result}")
            params["message"] = f"Результат: {args} = {result}"
            return HookResult(strategy=HookStrategy.MODIFY, params=params)
        except Exception as e:
            BulletinHelper.show_error(f"Ошибка: {e}")
            return None
    
    def save_history(self):
        """Автосохранение истории (вызывается каждые 60 секунд)"""
        self.log("История сохранена")
    
    def create_settings(self):
        history = MandreData.read_persistent_json(self.id, "history.json", [])
        
        items = [
            Header(text="История вычислений"),
        ]
        
        if not history:
            items.append(Text(text="История пуста"))
        else:
            for i, entry in enumerate(history[-10:]):  # Последние 10
                label = f"{entry['expression']} = {entry['result']}"
                items.append(Text(text=label, icon="msg_log"))
        
        items.extend([
            Divider(),
            Text(
                text="Очистить историю",
                icon="msg_delete",
                red=True,
                on_click=lambda _: self.clear_history()
            ),
        ])
        
        return items
    
    def clear_history(self):
        MandreData.write_persistent_json(self.id, "history.json", [])
        BulletinHelper.show_success("История очищена")
        Mandre.apply_and_refresh_settings(self)
    
    def on_plugin_unload(self):
        Mandre.cancel_task(self, "save_history")
        self.log("Калькулятор выгружен")
```

## Разбор кода

### Инициализация

```python
def on_plugin_load(self):
    # Активируем персистентное хранилище
    Mandre.use_persistent_storage(self)
    self.add_on_send_message_hook()
    
    # Регистрируем команду .calc
    Mandre.register_command(self, "calc", self.cmd_calc)
    
    # Автосохранение каждую минуту
    Mandre.schedule_task(self, "save_history", 60, self.save_history)
```

### Обработка команды

```python
def cmd_calc(self, plugin, args, params):
    # Проверяем наличие аргументов
    if not args:
        BulletinHelper.show_error("Введите выражение")
        return None
    
    try:
        # Вычисляем
        result = eval(args)
        
        # Сохраняем в историю
        history = MandreData.read_persistent_json(self.id, "history.json", [])
        history.append({"expression": args, "result": result})
        MandreData.write_persistent_json(self.id, "history.json", history)
        
        # Показываем результат
        BulletinHelper.show_success(f"{args} = {result}")
        
        # Изменяем сообщение
        params["message"] = f"Результат: {args} = {result}"
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
        
    except Exception as e:
        BulletinHelper.show_error(f"Ошибка: {e}")
        return None
```

### Настройки с историей

```python
def create_settings(self):
    # Загружаем историю
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    
    items = [Header(text="История вычислений")]
    
    # Показываем последние 10 записей
    if not history:
        items.append(Text(text="История пуста"))
    else:
        for entry in history[-10:]:
            label = f"{entry['expression']} = {entry['result']}"
            items.append(Text(text=label, icon="msg_log"))
    
    # Кнопка очистки
    items.extend([
        Divider(),
        Text(
            text="Очистить историю",
            icon="msg_delete",
            red=True,
            on_click=lambda _: self.clear_history()
        )
    ])
    
    return items
```

## Использование

1. Установите плагин в exteraGram
2. Используйте команду `.calc` для вычислений:
   ```
   .calc 2 + 2
   .calc 10 * 5 + 3
   .calc (100 - 20) / 4
   ```
3. Откройте настройки плагина для просмотра истории
4. Очистите историю при необходимости

## Улучшения

### Безопасное вычисление

Вместо `eval()` используйте безопасный парсер:

```python
import ast
import operator

def safe_eval(expr):
    """Безопасное вычисление математических выражений"""
    # Разрешённые операции
    operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.USub: operator.neg,
    }
    
    def eval_node(node):
        if isinstance(node, ast.Num):
            return node.n
        elif isinstance(node, ast.BinOp):
            left = eval_node(node.left)
            right = eval_node(node.right)
            return operators[type(node.op)](left, right)
        elif isinstance(node, ast.UnaryOp):
            operand = eval_node(node.operand)
            return operators[type(node.op)](operand)
        else:
            raise ValueError(f"Неподдерживаемая операция: {type(node)}")
    
    try:
        tree = ast.parse(expr, mode='eval')
        return eval_node(tree.body)
    except Exception as e:
        raise ValueError(f"Ошибка вычисления: {e}")

def cmd_calc(self, plugin, args, params):
    if not args:
        BulletinHelper.show_error("Введите выражение")
        return None
    
    try:
        result = safe_eval(args)
        # ... остальной код
    except ValueError as e:
        BulletinHelper.show_error(str(e))
        return None
```

### Статистика

Добавьте статистику использования:

```python
def cmd_calc(self, plugin, args, params):
    # ... вычисление ...
    
    # Обновляем статистику
    count = self.get_setting("calc_count", 0)
    self.set_setting("calc_count", count + 1)
    
    # ... сохранение в историю ...

def create_settings(self):
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    calc_count = self.get_setting("calc_count", 0)
    
    items = [
        Header(text="Статистика"),
        Text(text=f"Всего вычислений: {calc_count}"),
        Text(text=f"Записей в истории: {len(history)}"),
        Divider(),
        Header(text="История вычислений"),
        # ... остальное ...
    ]
```

### Экспорт истории

Добавьте возможность экспорта:

```python
def export_history(self):
    """Экспортировать историю в текст"""
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    
    if not history:
        BulletinHelper.show_error("История пуста")
        return
    
    # Формируем текст
    text = "📊 История вычислений:\n\n"
    for i, entry in enumerate(history, 1):
        text += f"{i}. {entry['expression']} = {entry['result']}\n"
    
    # Копируем в буфер или отправляем
    self.copy_to_clipboard(text)
    BulletinHelper.show_success("История скопирована в буфер")

def create_settings(self):
    # ... существующий код ...
    
    items.extend([
        Text(
            text="Экспортировать историю",
            icon="msg_shareout",
            on_click=lambda _: self.export_history()
        ),
        # ... остальное ...
    ])
```

### Избранные вычисления

Добавьте возможность сохранять избранные:

```python
def cmd_calc(self, plugin, args, params):
    # ... вычисление ...
    
    # Сохраняем с возможностью пометить как избранное
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    history.append({
        "expression": args,
        "result": result,
        "favorite": False,
        "timestamp": time.time()
    })
    MandreData.write_persistent_json(self.id, "history.json", history)
    
    # ... остальное ...

def toggle_favorite(self, index):
    """Переключить избранное"""
    history = MandreData.read_persistent_json(self.id, "history.json", [])
    if 0 <= index < len(history):
        history[index]["favorite"] = not history[index].get("favorite", False)
        MandreData.write_persistent_json(self.id, "history.json", history)
        Mandre.apply_and_refresh_settings(self)
```

## Следующие шаги

- [Частые ошибки](/examples/common-mistakes) - как избежать проблем
- [API Reference](/api/overview) - полная документация API
- [Руководство](/guide/introduction) - вернуться к руководству
