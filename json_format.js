
// Эти данные получаются с помощью метода cars_by_order
var result = {
// Базовые данные 
     carModel: "INFINITI FX5 PREMIUM",
     num: "т607ау190",
     vin: "JN1TANS50U0005180",
     body: "", // Номер кузова
     year: "2007",
     engineDisp: "3498", // Объем двигателя
     engineHp: "280",    // Мощность (л.с.)

// Пробег автомобиля
     // Максимальный пробег в КМ 
     milleage: "106000",
     // Массив пробегов
     milleageArr: [{year: "07-09-2012", milleage: "106000"}],

// Проверка контрольного символа VIN
     isVinOk: true,

// Документы об участии в ДТП
     docs: [
          {
               link: "http://cdn.adaperio.ru/data%2F%D0%BE100%D1%80%D1%81197.pdf",
               link_thumbnail: ""
          }
     ],

// Данные об участии в ДТП
     dtps: [
          {
               date: "17.04.2014",
               type: "Наезд на препятствие",
               damage: ""
          }
     ],

// История регистрационных действий за последние 5 лет
     regData: {
          Category: "В", 
          Displacement: "3498",         // Приоритет отдаётся полю engineDisp
          EngineNumber: "129547С", 
          MarkaRus: "ИНФИНИТИ FХ35 РRЕМIUМ",
          MaxWeight: "2530",
          NettoWeight: "2080",
          Power: "280",                 // Приоритет отдаётся полю engineHp
          SteeringWheelPlacement: "1",  
          Year: "2007"                  // Приоритет отдаётся полю year
     },

// Использование автомобиля в качестве такси
     taxiData: [
          {
               name: "Инфинити",
               owner: "Проташков Александр Владимирович",
               started: "14.01.2011",
               end: "14.01.2012"
          }
     ],

// Информация о розыске транспортного средства, в федеральной информационной системе МВД России
     gibddWanted: false,

// Информация о наложении ограничений в федеральной информационной системе МВД России
     gibddRestricted: true,
     restrictedArr: [
          {
               dateadd: "08.08.2014",
               dateogr: "08.08.2014",
               divid: "040",
               divtype: "6",
               gid: "43#000075178",
               ogrkod: "1",
               regid: "1133",
               regname: "Кировская область",
               tsmodel: "INFINIТI FХ-35 РRЕМIUМ",
               tsyear: "2007"
          }
     ],

// Информация о нахождении в залоге у банков
     // Завершилась ли проверка залогов успешно
     reestrGotResult: true,
     reestrResult: [],

// Проверка истории CARFAX
     carfax: {
          fullLink: "http://cdn.adaperio.ru/some_link",
          history: {
               accident: false
               totalLoss: false, 
               structuralDamage: false, 
               airbagDeployment: false, 
               odometrCheck: false,
               manufacturerRecall: false,
               warantyVoid: true
          },

          owners: [
               {
                    lastMilleage: 137680
                    ownership: "43 мес."
                    state: "Louisiana"
                    yearPurchased: "2001"
               }
          ]
     },

// Проверка истории на аукционах
     auctions: [
          {
               damage: [
                    "Передняя часть"
               ],
               date: "",
               odometr: "12298",
               photos: [
                    "http://img.copartimages.com//website/data/pix/20110517/17605611_1X.JPG"
               ],
          }
     ],

// Данные таможни
     customs: {
          country: "ЯПОНИЯ"
          date: "15.09.2008"
          model: "Infiniti FX5"
          odometer: ""
          price: "574719"     // таможенная стоимость в рублях
     },

// Комплектация
     equip: {
          model: "[S50] INFINITIFX45/35 ", 
          year: "07/2007", 
          engine: "[VQ35DE] VQ35DE TYPE ENGINE "
     },

// Ремонтные работы (по расчетам страховой компании)
     repairs: {
          vin: "JN1TANS50U0005180", 
          year: "", 
          make: "INFINITI [R] [47]", 
          engine: "",
          color: "",
          engineDisp: ""
          hp: "",
          repairs: [
               {
                    date: "02.08.2011",
                    items: [
                         {
                              changed: true,
                              paint: false,
                              partlyChanged: false,
                              partlyRepaired: false,
                              repaired: false,
                              title: "КРЕПЛ БАМПЕРА П62030-1CA0A"
                         }
                    ]
               }
          ]
     }
};
