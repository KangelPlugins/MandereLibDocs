# MandreAuth API

Модуль для запроса подтверждения личности через экран блокировки устройства.

## Импорт

```python
from mandre_lib import MandreAuth
```

## Методы

### request()

Запрашивает аутентификацию пользователя.

```python
MandreAuth.request(on_success, on_failure, title, description)
```

**Параметры:**
- `on_success` (callable) - callback при успешной аутентификации
- `on_failure` (callable) - callback при неудачной аутентификации
- `title` (str) - заголовок диалога
- `description` (str) - описание/подсказка

**Возвращает:** None

**Пример:**

```python
def request_auth(self):
    def on_success():
        BulletinHelper.show_success("✅ Доступ разрешён")
        self.perform_action()
    
    def on_failure():
        BulletinHelper.show_error("❌ Доступ запрещён")
    
    MandreAuth.request(
        on_success=on_success,
        on_failure=on_failure,
        title="Требуется подтверждение",
        description="Подтвердите свою личность"
    )
```

## См. также

- [Аутентификация](/guide/auth) - подробное руководство
- [Примеры](/examples/calculator) - примеры использования
