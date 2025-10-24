---
layout: home

hero:
  name: MandreLib
  text: Универсальная библиотека для exteraGram
  tagline: Готовые решения для разработки плагинов - сохранение данных, UI, команды, планировщик и многое другое
  actions:
    - theme: brand
      text: Начать работу
      link: /guide/introduction
    - theme: alt
      text: Посмотреть примеры
      link: /examples/calculator
    - theme: alt
      text: API Reference
      link: /api/overview

features:
  - icon: 💾
    title: Персистентное хранилище
    details: Автоматическое сохранение данных на диск с поддержкой JSON. Все данные восстанавливаются при перезагрузке плагина.
  
  - icon: 🎨
    title: UI компоненты
    details: Готовые диалоги, уведомления, селекторы чатов и навигационные панели для создания красивого интерфейса.
  
  - icon: ⚡
    title: Система команд
    details: Простая регистрация и обработка команд с автоматическим парсингом аргументов.
  
  - icon: ⏰
    title: Планировщик задач
    details: Выполнение функций по расписанию с поддержкой фоновых потоков и автоматической отменой.
  
  - icon: 🗣️
    title: Текст-в-речь
    details: Озвучивание текста с помощью системного TTS движка Android.
  
  - icon: 🔐
    title: Аутентификация
    details: Запрос подтверждения личности через экран блокировки устройства.
  
  - icon: 🌍
    title: Локализация
    details: Автоматический перевод строк плагина на язык пользователя с кэшированием.
  
  - icon: 🔗
    title: Deep Linking
    details: Регистрация пользовательских ссылок типа tg:// для открытия функций плагина.
  
  - icon: 📤
    title: Отправка файлов
    details: Простая отправка текста и файлов через системный диалог "Поделиться" Android.
  
  - icon: 📱
    title: Информация об устройстве
    details: Получение подробной информации о текущем устройстве и системе.
  
  - icon: 🔔
    title: Системные уведомления
    details: Показ профессиональных уведомлений Android в стиле мессенджеров.
---

## Быстрый старт

```python
from mandre_lib import Mandre, MandreData, MandreUI
from base_plugin import BasePlugin

class MyPlugin(BasePlugin):
    def on_plugin_load(self):
        # Активируем персистентное хранилище
        Mandre.use_persistent_storage(self)
        
        # Регистрируем команды
        Mandre.register_command(self, "hello", self.cmd_hello)
        Mandre.register_command(self, "device", self.cmd_device)
        
        self.log("Плагин загружен!")
    
    def cmd_hello(self, plugin, args, params):
        MandreUI.show(
            title="Привет!",
            items=["Вариант 1", "Вариант 2"],
            on_select=lambda i, t: self.log(f"Выбрано: {t}")
        )
        return None
    
    def cmd_device(self, plugin, args, params):
        # Показываем информацию об устройстве
        info = Mandre.Device.get_simple_info()
        params["message"] = f"📱 {info}"
        return HookResult(strategy=HookStrategy.MODIFY, params=params)
```

## Почему MandreLib?

- **Экономия времени** - все сложные вещи уже реализованы и протестированы
- **Простота использования** - интуитивный API с понятными методами
- **Надёжность** - потокобезопасность и автоматическая обработка ошибок
- **Гибкость** - используйте только те модули, которые нужны

::: tip Документация exteraGram
Для разработки плагинов также рекомендуется изучить [официальную документацию exteraGram](https://plugins.exteragram.app) — там описаны базовые возможности платформы и API.
:::
