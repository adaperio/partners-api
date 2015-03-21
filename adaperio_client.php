<?php

/**
 * @author Sergey Zholobov
 * @copyright 2015
 * @email sergey@f5f5.ru
 */

class Curl 
{
    const GET = 1;
    const POST = 2;
    
    private $_url; //адрес страницы
    private $_urlParams = array(); //параметры запроса
    private $_method; //метод отправки
    private $_postParams = array(); //параметры POST
    private $_handle; //дескриптор подключения
    
    public $response; //обработанный ответ
    public $responseRaw; //сырой ответ от сервера
    public $responseHeaders = array(); //ассоциативный массив заголовков ответа
    
    public $curlErrorCode; //код ошибки курла
    public $curlErrorMessage; //текст ошибки курла
    public $curlError = false; //флаг наличия ошибки курла
    
    public $httpStatusCode; //код ошибки
    public $httpError = false; //флаг ошибки code >= 300
    
    public $error = false; //ошибка выполнения запроса
    public $errorCode; //код ошибки (curl или htpp)
    
    /**
     * Curl::__construct()
     * 
     * @param mixed $url - адрес страницы
     * @param mixed $params - параметры запроса
     * @param mixed $method - метод отправки
     * @param mixed $postParams - параметры POST
     * @return
     */
    public function __construct($url, $params = array(), $method = Curl::GET, $postParams = array())
    {
        $this->_url = $url;
        $this->_method = $method;
        $this->_postParams = $postParams;
        $this->_urlParams = $params;
        
        $this->_handle = curl_init($this->_url . (!empty($this->_urlParams) ? '?' . http_build_query($this->_urlParams) : ''));
        $this->setOpt(CURLINFO_HEADER_OUT, true);
        $this->setOpt(CURLOPT_RETURNTRANSFER, true);
    }
    
    /**
     * Curl::setOpt()
     * Установка опции cURL
     * @param mixed $name
     * @param mixed $value
     * @return
     */
    public function setOpt($name, $value)
    {
        curl_setopt($this->_handle, $name, $value);
        return $this;
    }
    
    /**
     * Curl::setOpts()
     * Пакетная установка опций cURL
     * @param mixed $params - array(KEY => VALUE)
     * @return
     */
    public function setOpts($params = array())
    {
        curl_setopt_array($this->_handle, $params);
        return $this;
    }
    
    /**
     * Curl::_get()
     * Установка параметров для GET запроса
     * @return
     */
    protected function _get()
    {
        $this->setOpt(CURLOPT_CUSTOMREQUEST, 'GET');
        $this->setOpt(CURLOPT_HTTPGET, true);
    }
    
    /**
     * Curl::_post()
     * Установка параметров для POST запроса
     * @return
     */
    protected function _post()
    {
        $this->setOpt(CURLOPT_CUSTOMREQUEST, 'POST');
        $this->setOpt(CURLOPT_POST, true);
        $this->setOpt(CURLOPT_POSTFIELDS, $this->_postParams);
    }
    
    /**
     * Curl::_getResponseHeader()
     * Разобрать заголовок ответа
     * @param mixed $handle
     * @param mixed $header
     * @return
     */
    protected function _getResponseHeader($handle, $header) 
    {
        if (trim($header)) {
            if (stripos($header, 'HTTP/') === 0) {
                $this->responseHeaders['Status-Line'] = trim($header);
            } else {
                $this->responseHeaders[trim(substr($header, 0, stripos($header, ":")))] = trim(substr($header, stripos($header, ":")+1));
            }
        }
        return strlen($header);
    }
    
    /**
     * Curl::_getResponse()
     * Получить ответ в зависимости от типа
     * @return mixed
     */
    protected function _getResponse()
    {
        $response = $this->responseRaw;
        if (isset($this->responseHeaders['Content-Type'])) {
            if (preg_match('%^application\/(?:json|vnd\.(?U:.+)\+json)%i', $this->responseHeaders['Content-Type'])) {
                $json = json_decode($response, false);
                if ($json !== null) {
                    $response = $json;
                }
            } elseif (preg_match('%^(?:text/|application/(?:atom\+|rss\+)?)xml%i', $this->responseHeaders['Content-Type'])) {
                $xml = @simplexml_load_string($response);
                if (!($xml === false)) {
                    $response = $xml;
                }
            }
        }
        return $response;
    }
    
    /**
     * Curl::exec()
     * Выполнить запрос
     * @return Curl
     */
    public function exec()
    {
        $this->setOpt(CURLOPT_HEADER, false);
        $this->setopt(CURLOPT_HEADERFUNCTION, array($this, '_getResponseHeader'));
        
        switch ($this->_method) {
            case self::GET:
                $this->_get();
                break;
            case self::POST:
                $this->_post();
                break;
        }
        
        $this->responseRaw = curl_exec($this->_handle);
        $this->curlErrorCode = curl_errno($this->_handle);
        
        $this->requestHeaders = curl_getinfo($this->_handle, CURLINFO_HEADER_OUT);

        $this->curlErrorMessage = curl_error($this->_handle);
        $this->curlError = !($this->curlErrorCode === 0);
        $this->httpStatusCode = curl_getinfo($this->_handle, CURLINFO_HTTP_CODE);
        $this->httpError = $this->httpStatusCode >= 400;
        $this->error = $this->curlError || $this->httpError;
        $this->errorCode = $this->error ? ($this->curlError ? $this->curlErrorCode : $this->httpStatusCode) : 0;
        
        if (!$this->error) {
            $this->response = $this->_getResponse();
        }
        
        return $this;
    }
    
}

class AdaperioException extends Exception {};

class AdaperioFrontendException extends AdaperioException {};
class AdaperioBackendException extends AdaperioException {};

class AdaperioInvalidCarIDException extends AdaperioFrontendException {};

class AdaperioInvalidAuthDataException extends AdaperioBackendException {};
class AdaperioZeroBalanceException extends AdaperioBackendException {};
class AdaperioUnknownException extends AdaperioBackendException {};
class AdaperioCurlException extends AdaperioBackendException {};
class AdaperioReportRequiredException extends AdaperioBackendException {};

class Adaperio
{
    const SERVER = 'https://partner.api.adaperio.ru/';
    
    const CAR_NUM = 1;
    const CAR_VIN = 2;
    
    protected static $_email; //email владельца аккаунта
    protected static $_login; //логин партрёна
    protected static $_password; //пароль партнёра
    
    protected $_id; //vin или номер
    protected $_idType; //тип входных данных (vin или номер)
    
    protected $_info; //краткая информация об автомобиле
    protected $_report; //ссылка на полный отчёт
    protected $_raw; //отчёт в json
    
    /**
     * Adaperio::__construct()
     * 
     * @param mixed $numOrVin - vin или номер автомобиля
     * @return
     */
    public function __construct($numOrVin)
    {
        if (preg_match('%^[авекмнорстухАВЕКМНОРСТУХ]{1}[0-9]{3}[авекмнорстухАВЕКМНОРСТУХ]{2}[1-9]{1}[0-9]{1,2}$%u', trim($numOrVin))) {
            $this->_id = $numOrVin;
            $this->_idType = self::CAR_NUM;
        } elseif (preg_match('%^[a-h,A-H,j-n,J-N,p-z,P-Z,0-9]{9}[a-h,A-H,j-n,J-N,p,P,r-t,R-T,v-z,V-Z,0-9]{1}[a-h,A-H,j-n,J-N,p-z,P-Z,0-9]{1}[0-9]{1,6}$%u', trim($numOrVin))) {
            $this->_id = $numOrVin;
            $this->_idType = self::CAR_VIN;
        } else {
            throw new AdaperioInvalidCarIDException('Введён некорректный номер или VIN автомобиля');
        }
    }
    
    /**
     * Adaperio::_exec()
     * Выполняет запрос к серверу
     * @param mixed $url - адрес страницы
     * @param mixed $params - параметры запроса
     * @param mixed $method - метод отправки
     * @param mixed $postParams - параметры POST
     * @return
     */
    protected function _exec($url, $params = array(), $method = Curl::GET, $postParams = array())
    {
        if (stripos($url, "http") === false) {
            $url = self::SERVER . ltrim($url, "/");
        }
        $curl = new Curl($url, $params, $method, $postParams);
        if (stripos($url, "https") === 0) {
            $curl->setOpt(CURLOPT_SSL_VERIFYPEER, false);
        }
        
        $curl->exec();
        
        //print_r($curl);
        
        if ($curl->error && $curl->curlError) {
            throw new AdaperioCurlException(sprintf('cURL Error #%s: %s', $curl->curlErrorCode, $curl->curlErrorMessage));
        } elseif ($curl->error && $curl->httpError) {
            switch($curl->httpStatusCode) {
                case 401:
                    throw new AdaperioInvalidAuthDataException('Неверный логин или пароль');
                case 402:
                    throw new AdaperioZeroBalanceException('Необходимо пополнить баланс');
                default:
                    throw new AdaperioUnknownException('Произошла неизвестная ошибка');
            }    
        } else {
            return $curl;
        }
        
    }
    
    /**
     * Adaperio::setAuthData()
     * Заполняет данные авторизации партнёра
     * @param mixed $login - логин
     * @param mixed $password - пароль
     * @param mixed $email - email
     * @return
     */
    public static function setAuthData($login, $password, $email) 
    {
        self::$_email = $email;
    	self::$_login = $login;
        self::$_password = $password;
    }
    
    /**
     * Adaperio::checkBalance()
     * Проверяет баланс
     * @return boolean
     */
    public static function checkBalance()
    {
        $curl = $this->_exec(sprintf('v1/partners/%s/balance', self::$_login), array('password'=>self::$_password));
        return true;
    }
    
    /**
     * Adaperio::checkCar()
     * Возвращает краткую информацию о машине
     * @return stdClass
     */
    public function checkCar()
    {
        switch($this->_idType) {
            case self::CAR_NUM:
                $curl = $this->_exec(sprintf('v1/data_for_cars/%s', urlencode($this->_id)));
                break;
            case self::CAR_VIN:
                $curl = $this->_exec(sprintf('v1/data_for_cars_by_vin/%s', urlencode($this->_id)));
                break;    
        }
        
        $this->_info = $curl->response[0];
        
        return $this->_info;
    }
    
    /**
     * Adaperio::getReport()
     * Возвращает ссылку на отчёт
     * @param mixed $emails - адреса получателей
     * @return stdClass
     */
    public function getReport($emails = array())
    {
        if (is_array($emails)) {
            $emails = array_map("trim", $emails);
            $emails = implode(",", $emails);
        }
        if (empty($emails)) {
            $emails = self::$_email;
        }
        switch($this->_idType) {
            case self::CAR_NUM:
                $curl = $this->_exec(sprintf('v2/partners/%s/report_by_num/%s', self::$_login, urlencode($this->_id)), array("password"=>self::$_password, "emails"=>$emails));
                break;
            case self::CAR_VIN:
                $curl = $this->_exec(sprintf('v2/partners/%s/report_by_vin/%s', self::$_login, urlencode($this->_id)), array("password"=>self::$_password, "emails"=>$emails));
                break;    
        }
        
        $this->_report = $curl->response;
        
        return $this->_report;
    }
    
    /**
     * Adaperio::getRawReport()
     * Возвращает отчёт в виде json
     * @param mixed $id - invId полученного ранее отчёта
     * @param mixed $crc - signature полученного ранее отчёта 
     * @param bool $buyReport - сгенерировать исключение или купить отчёт, если он не был куплен ранее
     * @return stdClass
     */
    public function getRawReport($id = null, $crc = null, $buyReport = false)
    {
        if ((empty($id) || empty($crc)) && empty($this->_report)) {
            if ($buyReport) {
                $this->getReport(self::$_email);
            } else {
                throw new AdaperioReportRequiredException('Необходимо сначало купить отчёт');
            }
        }
        if (empty($id)) {
            $id = $this->_report->invId;
        }
        if (empty($crc)) {
            $crc = $this->_report->signature;
        }
        
        $curl = $this->_exec(sprintf('v1/cars_by_order/%s', $id), array('signature'=>$crc));
        
        $this->_raw = $curl->response;
         
        return $this->_raw;
    }
    
    /**
     * Adaperio::sendReport()
     * Отправляет копию отчёта на email
     * @param mixed $emails - адреса получателей
     * @param mixed $id - invId полученного ранее отчёта
     * @param bool $buyReport - сгенерировать исключение или купить отчёт, если он не был куплен ранее
     * @return
     */
    public function sendReport($emails = null, $id = null, $buyReport = false)
    {
        if (empty($id) && empty($this->_report)) {
            if ($buyReport) {
                $this->getReport($emails);
            } else {
                throw new AdaperioReportRequiredException('Необходимо сначала купить отчёт');
            }
        }
        if (empty($id)) {
            $id = $this->_report->invId;
        }
        
        if (is_array($emails)) {
            $emails = array_map("trim", $emails);
            $emails = implode(",", $emails);
        }
        if (empty($emails)) {
            $emails = self::$_email;
        }
        $curl = $this->_exec(sprintf('/v2/partners/%s/orders/%s/email_report/%s', self::$_login, $id, urlencode($emails)), array('password'=>self::$_password));
        
        return true;
    }
}


/**
 * Пример использования
 */

Adaperio::setAuthData('*****', '*******', '****@yandex.ru'); 

try {
    $adaperio = new Adaperio('а999му199');
    $info = $adaperio->checkCar();
    $report = $adaperio->getReport();
    $raw = $adaperio->getRawReport();
    $email = $adaperio->sendReport();
    
    echo "<pre>";
    print_r ($info);
    print_r ($report);
    print_r ($raw);
    var_dump($email);
    echo "</pre>";
    
} catch (AdaperioFrontendException $e) {
    // Тут ловим все сообщения для пользователя
    echo $e->getMessage();
} catch (AdaperioBackendException $e) {
    // Тут ловим все сообщения для админа
    echo "Ошибка обработка данных";
} catch (Exception $e) {
    // Тут ловим остальные ошибки
    echo "Ошибка сервера";
}

?>