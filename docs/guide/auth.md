# Аутентификация

MandreAuth позволяет запросить подтверждение личности пользователя через экран блокировки устройства (отпечаток пальца, PIN, пароль и т.д.).

## Базовое использование

```python
from mandre_lib import MandreAuth
from ui.bulletin import BulletinHelper

def request_auth(self):
    def on_success():
        self.log("Пользователь подтвердил личность!")
        BulletinHelper.show_success("✅ Доступ разрешён")
    
    def on_failure():
        self.log("Аутентификация не удалась")
        BulletinHelper.show_error("❌ Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Требуется подтверждение",
        description="Пожалуйста, подтвердите свою личность для доступа"
    )
```

## Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `on_success` | function | Callback при успешной аутентификации |
| `on_failure` | function | Callback при неудачной аутентификации |
| `title` | str | Заголовок диалога аутентификации |
| `description` | str | Описание/подсказка |

## Примеры использования

### Защита команды

```python
def cmd_delete(self, plugin, args, params):
    """Команда .delete - удалить данные (с аутентификацией)"""
    
    def on_auth_success():
        # Выполняем удаление после подтверждения
        self.delete_all_data()
        BulletinHelper.show_success("Данные удалены")
    
    def on_auth_failure():
        BulletinHelper.show_error("Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_auth_success,
        on_failure=on_auth_failure,
        title="Подтвердите удаление",
        description="Требуется аутентификация для удаления данных"
    )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Защита настроек

```python
def create_settings(self):
    return [
        Header(text="Настройки"),
        Text(
            text="Опасные настройки",
            icon="msg_settings",
            on_click=lambda _: self.open_secure_settings()
        )
    ]

def open_secure_settings(self):
    """Открыть защищённые настройки"""
    def on_success():
        # Показываем защищённые настройки
        self.show_secure_settings_dialog()
    
    def on_failure():
        BulletinHelper.show_error("Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Защищённые настройки",
        description="Требуется аутентификация"
    )
```

### Защита экспорта данных

```python
def cmd_export(self, plugin, args, params):
    """Команда .export - экспортировать данные"""
    
    def on_auth_success():
        # Экспортируем данные
        data = self.export_all_data()
        BulletinHelper.show_success("Данные экспортированы")
        self.log(f"Экспорт: {data}")
    
    def on_auth_failure():
        BulletinHelper.show_warning("Экспорт отменён")
    
    MandreAuth.request(
        on_success=on_auth_success,
        on_failure=on_auth_failure,
        title="Экспорт данных",
        description="Подтвердите экспорт конфиденциальных данных"
    )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Временная разблокировка

```python
def unlock_features(self):
    """Разблокировать функции на время"""
    
    def on_success():
        # Разблокируем на 5 минут
        self.set_setting("unlocked_until", time.time() + 300)
        BulletinHelper.show_success("Функции разблокированы на 5 минут")
    
    def on_failure():
        BulletinHelper.show_error("Разблокировка отменена")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Разблокировка функций",
        description="Требуется подтверждение личности"
    )

def is_unlocked(self):
    """Проверить, разблокированы ли функции"""
    unlocked_until = self.get_setting("unlocked_until", 0)
    return time.time() < unlocked_until
```

### Защита доступа к чату

```python
def cmd_open_secret(self, plugin, args, params):
    """Команда .open_secret - открыть секретный чат"""
    
    def on_success():
        # Открываем секретный чат
        secret_chat_id = self.get_setting("secret_chat_id")
        self.open_chat(secret_chat_id)
        BulletinHelper.show_success("Открываю секретный чат")
    
    def on_failure():
        BulletinHelper.show_error("Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Секретный чат",
        description="Подтвердите доступ к секретному чату"
    )
    
    return HookResult(strategy=HookStrategy.CANCEL)
```

### Многоуровневая защита

```python
def access_level_1(self):
    """Первый уровень доступа"""
    def on_success():
        BulletinHelper.show_success("Уровень 1 пройден")
        self.access_level_2()
    
    def on_failure():
        BulletinHelper.show_error("Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Уровень 1",
        description="Первое подтверждение"
    )

def access_level_2(self):
    """Второй уровень доступа"""
    def on_success():
        BulletinHelper.show_success("Полный доступ получен!")
        self.grant_full_access()
    
    def on_failure():
        BulletinHelper.show_error("Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Уровень 2",
        description="Финальное подтверждение"
    )
```

### Счётчик попыток

```python
def protected_action(self):
    """Действие с ограничением попыток"""
    attempts = self.get_setting("auth_attempts", 0)
    
    if attempts >= 3:
        BulletinHelper.show_error("Превышен лимит попыток")
        return
    
    def on_success():
        # Сбрасываем счётчик
        self.set_setting("auth_attempts", 0)
        self.perform_action()
        BulletinHelper.show_success("Действие выполнено")
    
    def on_failure():
        # Увеличиваем счётчик
        new_attempts = attempts + 1
        self.set_setting("auth_attempts", new_attempts)
        
        remaining = 3 - new_attempts
        if remaining > 0:
            BulletinHelper.show_warning(f"Осталось попыток: {remaining}")
        else:
            BulletinHelper.show_error("Лимит попыток исчерпан")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Защищённое действие",
        description=f"Попытка {attempts + 1} из 3"
    )
```

## Интеграция с настройками

```python
def create_settings(self):
    return [
        Header(text="Безопасность"),
        Switch(
            text="Требовать аутентификацию",
            description="Запрашивать подтверждение для важных действий",
            value=self.get_setting("require_auth", True),
            on_change=lambda v: self.set_setting("require_auth", v)
        ),
        Divider(),
        Header(text="Защищённые действия"),
        Text(
            text="Удалить все данные",
            icon="msg_delete",
            red=True,
            on_click=lambda _: self.delete_with_auth()
        ),
        Text(
            text="Экспортировать данные",
            icon="msg_shareout",
            on_click=lambda _: self.export_with_auth()
        ),
        Text(
            text="Сбросить настройки",
            icon="msg_reset",
            on_click=lambda _: self.reset_with_auth()
        )
    ]

def delete_with_auth(self):
    """Удаление с проверкой настройки аутентификации"""
    if self.get_setting("require_auth", True):
        # Запрашиваем аутентификацию
        MandreAuth.request(
            on_success=self.delete_all_data,
            on_failure=lambda: BulletinHelper.show_error("Отменено"),
            title="Подтвердите удаление",
            description="Это действие нельзя отменить"
        )
    else:
        # Удаляем без аутентификации
        self.delete_all_data()
```

## Важные моменты

::: tip Системная аутентификация
MandreAuth использует системный механизм аутентификации Android (BiometricPrompt). Поддерживаются:
- Отпечаток пальца
- Распознавание лица
- PIN-код
- Пароль
- Графический ключ
:::

::: warning Доступность
Аутентификация работает только если на устройстве настроен хотя бы один метод блокировки экрана. Если блокировка не настроена, callback `on_failure` будет вызван сразу.
:::

::: info Безопасность
Библиотека не хранит биометрические данные. Вся аутентификация обрабатывается системой Android.
:::

## Обработка ошибок

```python
def safe_auth_request(self):
    """Безопасный запрос аутентификации"""
    try:
        MandreAuth.request(
            on_success=self.on_auth_ok,
            on_failure=self.on_auth_fail,
            title="Подтверждение",
            description="Требуется аутентификация"
        )
    except Exception as e:
        self.log(f"Ошибка аутентификации: {e}")
        BulletinHelper.show_error("Аутентификация недоступна")
```

## Лучшие практики

1. **Понятные сообщения** - объясняйте, зачем нужна аутентификация:
   ```python
   MandreAuth.request(
       on_success=callback,
       on_failure=callback,
       title="Удаление данных",
       description="Подтвердите удаление всех данных плагина"
   )
   ```

2. **Обратная связь** - всегда показывайте результат:
   ```python
   def on_success():
       BulletinHelper.show_success("✅ Доступ разрешён")
   
   def on_failure():
       BulletinHelper.show_error("❌ Доступ запрещён")
   ```

3. **Не злоупотребляйте** - запрашивайте аутентификацию только для действительно важных операций

## Следующие шаги

- [Локализация](/guide/localization) - перевод на другие языки
- [Deep Linking](/guide/deep-linking) - пользовательские ссылки
- [Примеры](/examples/calculator) - готовые примеры
