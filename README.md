# adaperio-partners-api
API description/test code for Adaperio.ru service partners

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

**1. Search if we have some information**

```javascript
GET /v1/data_for_cars/:num

Input: 
Returns: 200 + JSON data as a payload if something is found 
         404 if nothing found or Error
```

**2. Generate new order ID (InvId) for Partner**

```javascript
POST /v1/partner_orders

Input: body has num
Returns: 200 + new order ID if OK
         404 on Error
Will:
    1. Create new item in DB with new random and unique OrderID
    2. Set state to 'waiting payment'
    3. Return 200 + new OrderID as result
```

**3. Complete order**

```javascript
POST /v1/buy_order/:orderId?OutSum=nOutSum&SignatureValue=sSignatureValue

Input: 
Returns: 200 if OK
         404 on Error
Will:
    1. Check signature
    2. Find order by nInvId
    3. Update order state: 'waiting payment' -> 'finished'
    4. Return 200.
```


**4. Get results**

```javascript
GET /v1/cars_by_order/:orderId

Input: Body must contain VALID signature 
Returns: 200 + JSON payload if OK
         404 on Error
Will:
    1. Check signature
    2. Find order by orderId
    3. Check if state is 'finished' (i.e. we "received money")
    4. Return Car JSON (with documents), 200 result
```


