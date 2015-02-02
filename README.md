# adaperio-partners-api

## Для работы с Adaperio через партнерский API нужно:

     1) Обратиться на **support@adaperio.ru** с просьбой выдать логин/пароль для партерской программы.

     2) Обговорить модель покупки отчетов (предоплата или по факту покупки).

     3) Запустить тесты и убедиться, что они завершились без ошибок.

     4) Встроить API в свою систему.

## Для тестирования API:

     1) Добавить полученный от нас логин/пароль в файл **test/adaperio_api_tst.js**

     2) Установить нужные для тестирования пакеты: **npm install https fs crypto assert**

     3) Установить нужный для тестирования фреймворк: **npm install -g mocha**

     4) Запустить все тесты: **mocha reporter --spec**

В результате выполнения тестов, вы произведете тестовую покупку и получите ссылку на отчет об автомобиле **а999му99**

## Описание открытого партнерского API:
Для работы используются REST-подобное API с JSON в качестве передаваемых данных. 

**1. Получить данные о наличии информации о данном автомобиле**

```javascript
GET /v1/data_for_cars/:num

Will: 
    1. Check if data exists.
    2. Return 200 + JSON data.

Returns: 200 + JSON data as a payload if something is found 
         404 if nothing found or Error
```

**2. Создать новый заказ**

```javascript
POST /v1/partner_orders

Will:
    1. Create new item in DB with new random and unique OrderID.
    2. Set state to 'waiting payment'.
    3. Return 200 + new OrderID.

Body: {"num":"а001кк12”,”login”:”your_login_here”,”email”:”your_email_here@mail.com”}
     num - utf8 (cyrillic); 
     login - your login;
     email - your email;

Returns: 200 + new order ID if OK
         404 on Error

Request Headers:
         Content-Type: application/json
         Content-Length: <body length>
```
Ответ содержит идентификатор созданного отчета: **{“id”:”3269587”}**. Его необходимо передать в следующий метод.

**3. Завершить заказ**

```javascript
POST /v1/buy_order/:orderId

Body: {"OutSum":"100.000000”,”SignatureValue":"f2c60992ac7d90a906fcb36761da6294"}

Will:
    1. Check signature.
    2. Find order by nInvId.
    3. Update order state: 'waiting payment' -> 'finished'.
    4. Return 200 + JSON.

Returns: 200 + JSON if OK
         404 on Error

Request Headers:
         Content-Type: application/json
         Content-Length: <body length>
```
ВНИМАНИЕ: вызов этого метода возможен только из защищенного модуля (вашего backend’а), так как ни сумма, ни секретный пароль не должны быть доступны простому конечному пользователю. Если вызывать этот метод (даже с учетом https) из незащищенного приложения - пользователь сможет дизассемблировать его или просто перехватить пароль в памяти.

В случае успеха - тело ответа будет содержать JSON вида:
{ link: 'http://www.adaperio.ru/engine.html#/success?InvId=3269587&OutSum=200.000000&SignatureValue=1813ba713a5ee12abf0b7bb3e669d072' }

link и будет являться конечной ссылкой, которую можно передать пользователю. SignatureValue в ссылке не имеет ничего общего с секретной подписью из метода 2. 
Время жизни такой ссылки - месяц. 

