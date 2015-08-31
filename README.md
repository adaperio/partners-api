# Партнерский Программный Интерфейс Adaperio.ru

## Для работы с Adaperio через партнерский API нужно:

     1) Обратиться на support@adaperio.ru с просьбой выдать логин/пароль для партерской программы.

     2) Оплатить нужное кол-во отчетов. 

     3) Запустить тесты и убедиться, что они завершились без ошибок (тестовый номер а999му199 не приводит к снятию денег).

     4) Встроить API в свою систему.

## Для тестирования нужно:

     1) Добавить полученный от нас логин/пароль в файл test/adaperio_api_tst.js

     2) Установить нужные для тестирования пакеты: 
     npm install https fs crypto assert

     3) Установить нужный для тестирования фреймворк: 
     npm install -g mocha

     4) Запустить все тесты (с таймаутом 30 секунд): 
     mocha --reporter spec -t 30000

В результате выполнения тестов - вы произведете тестовую покупку и получите ссылку на отчет об автомобиле **а999му199**

## Примеры отчетов:
ГИБДД, регистрация, комплектация, ремонтные работы:
http://www.adaperio.ru/engine.html#/success?InvId=260296010&OutSum=350.000000&SignatureValue=07d964edd08c18afa8e2a65d7bf655b0

Документ об участии в ДТП + фото:
http://www.adaperio.ru/engine.html#/success?InvId=848359114&OutSum=350.000000&SignatureValue=300d11d9571e9a1c9c3bef587cb1846f

Данные о ДТП:
http://www.adaperio.ru/engine.html#/success?InvId=525436883&OutSum=150.000000&SignatureValue=eded3a4512ca93ce23d8cbedc1ef68bd

CARFAX: 
http://www.adaperio.ru/engine.html#/success?InvId=103577658&OutSum=350.000000&SignatureValue=53902d2cd12cad1571c478a2681f2cef

Такси:
http://www.adaperio.ru/engine.html#/success?InvId=467522148&SignatureValue=afcc08b3f5ce549829de7226b2521400

Залоговые аукционы:
http://www.adaperio.ru/engine.html#/success?InvId=313480536&SignatureValue=50798f6f4d097accbcde18542ad54fb2

## Описание API
Для работы используются REST-подобное API с JSON в качестве передаваемых данных. 
Адреса наших backend серверов: **https://api-partner.adaperio.ru**.
ВНИМАНИЕ: запрещено кэшировать IP адреса серверов. 

### 1. Получить данные о наличии информации об автомобиле

```javascript
GET /data_for_cars/v2/:num

Выполняется следующее: 
    1. Проверяется наличие данных об автомобиле;
    2. Возвращается тело в формате JSON c расшифровкой того, какие именно данные найдены.

Возвращается: 200 (OK);
              404 или 503 в случае непредвиденной ошибки или большой нагрузки на сервер;
              {"status":"Not found"} в теле ответа, если данные не найдены.

Внимание: метод может выполняться долгое время (вызов "блокирующий"), установите таймаут минимум 60 секунд.
```

Тело ответа:
```javascript
[{
     "nums":["а001кк12","а001кк14"]
     "vin":"XTA2*********1931",
     "carModel":"ВАЗ 21102 ЛЕГКОВОЙ",
     "year":"2000",

     // Стоимость конечного отчета - 150, 350, 450 рублей? 
     // В данный момент категорий всего 3:
     // 1 - обычные отчеты
     // 2 - отчеты с ремонтыми работами или ДТП или CARFAX
     // 3 - отчеты с ремонтными работами и CARFAX
     "priceCategory":"2",

     // ДТП (у автомобилей Мск региона ДТП может быть найдено после покупки отчета) 
     "accidentFound":false,

     // Найдены ли данные с аукционов
     “auctionsFound”:true,

     // Найдены ли фотографии ДТП/повреждений
     “picsFound":false,

     // Использование в качестве такси
     "taxiFound":false,

     // Найден ли пробег
     "milleageFound":true,

     // Фотографии автомобиля
     "autoNomerPics":[
          "http://img02.avto-nomer.ru/005/m/ru2609272.jpg" 
     ],

     // Найдены ли сведения из таможни
     "customsFound":false,

     // Есть ли информация о комплектации
     "equipInfoFound":false,

     // CARFAX отчет
     "carfaxInfoFound": true,

     // Данные о ремонтных работах
     "repairsFound": true

     ...
}
]
```

### 2. Получить данные о наличии информации об автомобиле по VIN

```javascript
GET /data_for_cars_by_vin/v2/:vin

Выполняется следующее: 
    1. Проверяется наличие данных об автомобиле;
    2. Возвращается тело в формате JSON c расшифровкой того, какие именно данные найдены.

Возвращается: 200 (OK);
              404 или 503 в случае непредвиденной ошибки или большой нагрузки на сервер;
              {"status":"Not found"} в теле ответа, если данные не найдены.

Внимание: метод может выполняться долгое время (вызов "блокирующий"), установите таймаут минимум 60 секунд.

Формат возвращаемых данных и поведение метода польностью идентичны методу #1.
```

### 3. Пройти аутентификацию 

```javascript
POST /partners/:login/authenticate/v2

Тело - JSON вида:
{ 
     password: '12345'
}

Выполняется следующее: 
    1. Проверяется логин/пароль;
    2. Возвращается JWT.

Возвращается: 200 (OK), если аутентификация пройдена; 
              401 (Unauthorized), если введен неверный логин/пароль;
              404 (Not Found), если произошла ошибка.

```

+ login - ваш логин;
+ password - ваш пароль.

В случае успеха - тело ответа будет содержать JSON вида:
```javascript
{ 
     token: 'KEEP_ME'    // JSON WebToken
}
```

### 4. Получить отчет

```javascript
GET /auth/partners/report_by_num/v3/:num?emails=test%40mail.ru&on_update_callback=www.my-site.ru

Заголовок Authorization должен иметь валидный token, полученный методом #3:
'Authorization': 'Bearer ' + token

Выполняется следующее:
    1. Проверяет токен.
    2. Проверяет остаток баланса на счету партнера.
    3. Уменьшает остаток баланса на 1.
    4. Возвращает статус 200 + ссылку на отчет.

Возвращается: 200 (OK), в случае успеха.
              401 (Unauthorized), если не валиден или истек токен.
              402 (Payment Required), если необходимо пополнить баланс.
              404 (Not Found), если произошла ошибка.

Внимание: метод может выполняться долгое время (вызов "блокирующий"), установите таймаут минимум 60 секунд.
```

+ num - гос.номер автомобиля в кодировке utf8 (кириллица), закодирован в 'URL encoding';
+ emails - список e-mail адресов получателей (разделенный запятыми), закодирован в 'URL encoding';
+ on_update_callback - (необязательный параметр), закодирован в 'URL encoding' - если через какое-то время наш отчет обновится - будет вызван этот URL запросом GET.

В случае успеха - тело ответа будет содержать JSON вида:
```javascript
{ 
     link: 'http://www.adaperio.ru/engine.html#/success?InvId=3269587&OutSum=100.000000&SignatureValue=1813ba713a5ee12abf0b7bb3e669d072',
     signature: 1813ba713a5ee12abf0b7bb3e669d072,
     invId: 3269587,

     // Стоимость конечного отчета - 150, 350, 450 рублей? 
     // В данный момент категорий всего 3:
     // 1 - обычные отчеты
     // 2 - отчеты с ремонтыми работами или ДТП или CARFAX
     // 3 - отчеты с ремонтными работами и CARFAX
     priceCategory:2
}
```

**link** и будет являться ссылкой, которую можно передать пользователю. Время жизни такой ссылки - месяц. 
**priceCategory** указывает на стоимость отчета для партнера (вас). В зависимости от объема информации - отчет может иметь различную стоимость.

Параметр **emails** обязателен. Как минимум - передавайте свой e-mail (а не клиентский), т.к. в некоторых случаях через какое-то время могут прийти повторные "обновления" отчетов. Вызвано это тем, что не все данные мы получаем быстро, поэтому после "догрузки" данных - мы отправляем повторный отчет на e-mail. Других механизмов взаимодействия с пользователем у нас нет. 

ВНИМАНИЕ: вызов этого метода возможен только из защищенного модуля (вашего backend’а), так как секретный пароль не должны быть доступен простому конечному пользователю. Если вызывать этот метод (даже с учетом https) из незащищенного приложения - пользователь сможет дизассемблировать его или просто перехватить пароль в памяти.

### 5. Получить отчет по VIN

```javascript
GET /auth/partners/report_by_vin/v3/:vin?emails=test%40mail.ru&on_update_callback=www.my-site.ru

Заголовок Authorization должен иметь валидный token, полученный методом #3:
'Authorization': 'Bearer ' + token

Выполняется следующее:
    1. Проверяет токен.
    2. Проверяет остаток баланса на счету партнера.
    3. Уменьшает остаток баланса на 1.
    4. Возвращает статус 200 + ссылку на отчет.

Возвращается: 200 (OK), в случае успеха.
              401 (Unauthorized), если не валиден или истек токен.
              402 (Payment Required), если необходимо пополнить баланс.
              404 (Not Found), если произошла ошибка.

Внимание: метод может выполняться долгое время (вызов "блокирующий"), установите таймаут минимум 60 секунд.
```

+ vin - VIN номер автомобиля (17 символов);
+ emails - список e-mail адресов получателей (разделенный запятыми), закодирован в 'URL encoding';
+ on_update_callback - (необязательный параметр), закодирован в 'URL encoding' - если через какое-то время наш отчет обновится - будет вызван этот URL запросом GET.

В случае успеха - тело ответа будет содержать JSON вида:
```javascript
{ 
     link: 'http://www.adaperio.ru/engine.html#/success?InvId=3269587&OutSum=100.000000&SignatureValue=1813ba713a5ee12abf0b7bb3e669d072',
     signature: 1813ba713a5ee12abf0b7bb3e669d072,
     invId: 3269587,

     // Стоимость конечного отчета - 150, 350, 450 рублей? 
     // В данный момент категорий всего 3:
     // 1 - обычные отчеты
     // 2 - отчеты с ремонтыми работами или ДТП или CARFAX
     // 3 - отчеты с ремонтными работами и CARFAX
     priceCategory:2
}
```

**link** и будет являться ссылкой, которую можно передать пользователю. Время жизни такой ссылки - месяц. 
**priceCategory** указывает на стоимость отчета для партнера (вас). В зависимости от объема информации - отчет может иметь различную стоимость.

Параметр **emails** обязателен. Как минимум - передавайте свой e-mail (а не клиентский), т.к. в некоторых случаях через какое-то время могут прийти повторные "обновления" отчетов. Вызвано это тем, что не все данные мы получаем быстро, поэтому после "догрузки" данных - мы отправляем повторный отчет на e-mail. Других механизмов взаимодействия с пользователем у нас нет. 

ВНИМАНИЕ: вызов этого метода возможен только из защищенного модуля (вашего backend’а), так как секретный пароль не должны быть доступен простому конечному пользователю. Если вызывать этот метод (даже с учетом https) из незащищенного приложения - пользователь сможет дизассемблировать его или просто перехватить пароль в памяти.

### 6. Послать письмо c pdf отчетом на e-mail (возможно несколько) по номеру заказа

```javascript
GET /auth/partners/orders/:invId/email_report/v3/?emails=test%40mail.ru

Заголовок Authorization должен иметь валидный token, полученный методом #3:
'Authorization': 'Bearer ' + token

Выполняется следующее:
    1. Проверяет токен.
    2. Находит заказ, который должен был сформирован методом №2.
    3. Формирует письмо с отчетом.
    4. Посылает его на указанные адреса.
    5. Возвращает статус 200.

Возвращается: 200 (OK), в случае успеха.
              401 (Unauthorized), если не валиден или истек токен.
              404 (Not Found), если произошла ошибка.
```

+ invId - значение получено из ссылки, которую вернул метод #4;
+ emails - список e-mail адресов получателей (разделенный запятыми), закодирован в 'URL encoding';

### 7. Получить конечный JSON по номеру заказа

Если вы не хотите переходить на наш сайт (см. ссылку из метода №2) или хотите разобрать/обработать данные самостоятельно - такая возможность имеется. Вы можете получить вместо html отчета только "сырые" данные в формате JSON. 

```javascript
GET /orders/:invId/cars/v2/?signature=b76c0883ca7c4c623315183f6ab2cb0e

Выполняется следующее:
    1. Находит заказ, который должен был сформирован методом №2.
    2. Проверяет signature.
    4. Возвращает тело в формате JSON с полными данными об автомобиле.

Возвращается: 200 (OK), в случае успеха.
              404 (Not Found), если произошла ошибка.
```

+ invId - значение получено из ссылки, которую вернул метод #4;
+ signature - значение получено из ссылки, которую вернул метод #4.

Описание формата данных смотрите в файле **json_format.js**

### 8. Проверить баланс

```javascript
GET /auth/partners/balance/v3

Заголовок Authorization должен иметь валидный token, полученный методом #3:
'Authorization': 'Bearer ' + token

Выполняется следующее:
    1. Проверяет токен.
    2. Проверяет баланс.
    3. Возвращает статус.

Возвращается: 200 (OK), если баланс не нулевой.
              401 (Unauthorized), если не валиден или истек токен.
              402 (Payment Required), если баланс нулевой.
              404 (Not Found), если произошла ошибка.
```

### 9. Получить ссылку на готовый pdf с отчетом по номеру заказа

```javascript
GET /auth/partners/orders/:invId/pdf_report/v3

Заголовок Authorization должен иметь валидный token, полученный методом #3:
'Authorization': 'Bearer ' + token

Выполняется следующее:
    1. Проверяет токен.
    2. Находит заказ, который должен был сформирован методом №2.
    3. Формирует pdf отчет.
    4. Загружает его на наш CDN и генерирует URL для него.
    5. Возвращает статус 200.

Возвращается: 200 (OK), в случае успеха.
              401 (Unauthorized), если не валиден или истек токен.
              404 (Not Found), если произошла ошибка.
```

+ invId - значение получено из ссылки, которую вернул метод №2;

В случае успеха - тело ответа будет содержать JSON вида:
```javascript
{ 
     link: 'http://cdn.adaperio.ru/cbb64aa4588248a0c1_adaperio_a999mu77.pdf',
}

ВНИМАНИЕ - данная ссылка имеет ограниченное время жизни (24 часа)!
```
