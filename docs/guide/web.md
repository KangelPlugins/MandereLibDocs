# Веб-рендеринг HTML → PNG (MandreWeb)

MandreWeb рендерит HTML-контент в PNG-изображение с помощью WebView и возвращает путь к файлу.

## Базовый пример

```python
def render_html_to_image(self):
    html_content = """
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset=\"UTF-8\">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
          .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <div class=\"card\">
          <h1>📊 Отчёт плагина</h1>
          <p>Генерация отчёта успешно завершена!</p>
          <p>Время: <script>document.write(new Date().toLocaleString('ru-RU'))</script></p>
        </div>
      </body>
    </html>
    """

    def on_result(success: bool, result_path: str):
        if success:
            self.log(f"Изображение сохранено: {result_path}")
            MandreSend.png(result_path, "📊 Сгенерированный отчёт")
        else:
            BulletinHelper.show_error(f"Ошибка рендеринга: {result_path}")

    MandreWeb.render_html_to_png(
        html=html_content,
        on_result=on_result,
        width=1024,
        height=768,
        bg_color=(240, 240, 240)
    )
```

## Динамические отчёты

```python
def generate_device_report(self):
    info = MandreDevice.get_device_info()

    html = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset=\"UTF-8\">
        <style>
          body {{ font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }}
          .report {{ background: #2d2d2d; padding: 20px; border-radius: 10px; }}
          h1 {{ color: #4CAF50; text-align: center; }}
          .info {{ margin: 10px 0; padding: 10px; background: #3d3d3d; border-radius: 5px; }}
          .label {{ font-weight: bold; color: #4CAF50; }}
        </style>
      </head>
      <body>
        <div class=\"report\">
          <h1>📱 Отчёт об устройстве</h1>
          <div class=\"info\"><span class=\"label\">Устройство:</span> {info.get('manufacturer', '?')} {info.get('model', '?')}</div>
          <div class=\"info\"><span class=\"label\">Android:</span> {info.get('android_version', '?')} (API {info.get('api_level', '?')})</div>
          <div class=\"info\"><span class=\"label\">Память:</span> {info.get('total_memory_mb', '?')} МБ</div>
          <div class=\"info\"><span class=\"label\">Экран:</span> {info.get('screen_width', '?')}x{info.get('screen_height', '?')}</div>
        </div>
      </body>
    </html>
    """

    def on_ready(success, path):
        if success:
            MandreSend.png(path, "📱 Отчёт об устройстве")
            BulletinHelper.show_success("Отчёт готов!")
        else:
            BulletinHelper.show_error("Не удалось создать отчёт")

    MandreWeb.render_html_to_png(html, on_ready, file_prefix="device_report_")
```

## Рендеринг графиков Chart.js

```python
def create_and_send_chart(self):
    html = """
    <canvas id=\"myChart\" width=\"400\" height=\"200\"></canvas>
    <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>
    <script>
      const ctx = document.getElementById('myChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май'],
          datasets: [{
            label: 'Продажи',
            data: [65, 59, 80, 81, 56],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        }
      });
    </script>
    """

    def on_ready(success, path):
        if success:
            MandreSend.png(path, "📈 График продаж")

    MandreWeb.render_html_to_png(html, on_ready)
```

## Советы

- Отдавайте предпочтение встроенным стилям и инлайн-скриптам.
- Используйте фиксированную ширину/высоту для предсказуемого результата.
- Комбинируйте с `MandreSend` для мгновенной отправки в чат.
