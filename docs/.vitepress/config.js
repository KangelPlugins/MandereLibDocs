export default {
  title: 'MandreLib',
  description: 'Универсальная библиотека для разработки плагинов exteraGram',
  lang: 'ru',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Руководство', link: '/guide/introduction' },
      { text: 'API', link: '/api/overview' },
      { text: 'Примеры', link: '/examples/calculator' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Начало работы',
          items: [
            { text: 'Введение', link: '/guide/introduction' },
            { text: 'Быстрый старт', link: '/guide/quick-start' },
            { text: 'Базовая интеграция', link: '/guide/integration' }
          ]
        },
        {
          text: 'Основные возможности',
          items: [
            { text: 'Хранилище данных', link: '/guide/storage' },
            { text: 'UI компоненты', link: '/guide/ui' },
            { text: 'Команды', link: '/guide/commands' },
            { text: 'Планировщик задач', link: '/guide/scheduler' }
          ]
        },
        {
          text: 'Дополнительно',
          items: [
            { text: 'Текст-в-речь', link: '/guide/tts' },
            { text: 'Аутентификация', link: '/guide/auth' },
            { text: 'Локализация', link: '/guide/localization' },
            { text: 'Deep Linking', link: '/guide/deep-linking' }
          ]
        },
        {
          text: 'Управление устройством',
          items: [
            { text: 'Отправка файлов', link: '/guide/share' },
            { text: 'Информация об устройстве', link: '/guide/device' },
            { text: 'Системные уведомления', link: '/guide/notifications' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Обзор', link: '/api/overview' },
            { text: 'Mandre', link: '/api/mandre' },
            { text: 'MandreData', link: '/api/mandre-data' },
            { text: 'MandreUI', link: '/api/mandre-ui' },
            { text: 'MandreTTS', link: '/api/mandre-tts' },
            { text: 'MandreAuth', link: '/api/mandre-auth' },
            { text: 'MandreShare', link: '/api/mandre-share' },
            { text: 'MandreDevice', link: '/api/mandre-device' },
            { text: 'MandreNotification', link: '/api/mandre-notification' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Примеры',
          items: [
            { text: 'Калькулятор', link: '/examples/calculator' },
            { text: 'Частые ошибки', link: '/examples/common-mistakes' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'telegram', link: 'https://t.me/swagnonher' }
    ],

    footer: {
      message: 'Документация создана при поддержке <a href="https://t.me/kangelplugins">KangelPlugins</a>',
      copyright: 'Copyright © 2025 MandreLib'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://t.me/swagnonher',
      text: 'Связаться с автором в Telegram'
    },

    lastUpdated: {
      text: 'Обновлено',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  }
}
