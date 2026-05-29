// tests/e2e.test.js - End-to-End тесты веб-приложения
const fs = require('fs');
const path = require('path');
const os = require('os');

const APP_PATH = path.join(os.homedir(), 'TechnicalServiceSystem');
const URL = 'http://localhost:8080';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function log(message, color) {
    color = color || 'reset';
    console.log(colors[color] + message + colors.reset);
}

// Простой HTTP запрос для проверки доступности сервера
function checkServer() {
    return new Promise(function(resolve) {
        var http = require('http');
        var req = http.get(URL, function(res) {
            resolve(true);
        });
        req.on('error', function() {
            resolve(false);
        });
        req.setTimeout(3000, function() {
            req.destroy();
            resolve(false);
        });
    });
}

async function delay(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

// Простые тесты без puppeteer (для совместимости)
async function runE2ETests() {
    console.log('\n' + '='.repeat(60));
    log('🧪 ЗАПУСК E2E ТЕСТОВ ВЕБ-ПРИЛОЖЕНИЯ', 'blue');
    console.log('='.repeat(60) + '\n');
    
    // Проверяем, что приложение установлено
    if (!fs.existsSync(APP_PATH)) {
        log('❌ Приложение не найдено в ' + APP_PATH, 'red');
        log('Пожалуйста, сначала запустите установщик\n', 'red');
        return;
    }
    
    log('✅ Приложение установлено в: ' + APP_PATH, 'green');
    
    // Проверяем наличие основных файлов
    var requiredFiles = ['index.html', 'server.js', 'start.bat'];
    var allFilesExist = true;
    
    for (var i = 0; i < requiredFiles.length; i++) {
        var filePath = path.join(APP_PATH, requiredFiles[i]);
        var exists = fs.existsSync(filePath);
        log('  ' + (exists ? '✓' : '✗') + ' Файл ' + requiredFiles[i], exists ? 'green' : 'red');
        if (!exists) allFilesExist = false;
    }
    
    // Проверяем server.js синтаксис
    var serverPath = path.join(APP_PATH, 'server.js');
    if (fs.existsSync(serverPath)) {
        var content = fs.readFileSync(serverPath, 'utf8');
        var hasHttp = content.indexOf('require(\'http\')') !== -1;
        var hasCreateServer = content.indexOf('createServer') !== -1;
        var hasListen = content.indexOf('listen') !== -1;
        
        log('  ' + (hasHttp ? '✓' : '✗') + ' server.js: импорт http', hasHttp ? 'green' : 'red');
        log('  ' + (hasCreateServer ? '✓' : '✗') + ' server.js: создание сервера', hasCreateServer ? 'green' : 'red');
        log('  ' + (hasListen ? '✓' : '✗') + ' server.js: прослушивание порта', hasListen ? 'green' : 'red');
    }
    
    // Проверяем index.html
    var indexPath = path.join(APP_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
        var htmlContent = fs.readFileSync(indexPath, 'utf8');
        var hasLoginModal = htmlContent.indexOf('loginModal') !== -1;
        var hasRegisterModal = htmlContent.indexOf('registerModal') !== -1;
        var hasRequestModal = htmlContent.indexOf('requestModal') !== -1;
        var hasStyle = htmlContent.indexOf('style.css') !== -1;
        
        log('  ' + (hasLoginModal ? '✓' : '✗') + ' index.html: модальное окно входа', hasLoginModal ? 'green' : 'red');
        log('  ' + (hasRegisterModal ? '✓' : '✗') + ' index.html: модальное окно регистрации', hasRegisterModal ? 'green' : 'red');
        log('  ' + (hasRequestModal ? '✓' : '✗') + ' index.html: модальное окно заявки', hasRequestModal ? 'green' : 'red');
        log('  ' + (hasStyle ? '✓' : '✗') + ' index.html: подключение CSS', hasStyle ? 'green' : 'red');
    }
    
    // Проверяем start.bat
    var batPath = path.join(APP_PATH, 'start.bat');
    if (fs.existsSync(batPath)) {
        var batContent = fs.readFileSync(batPath, 'utf8');
        var hasNode = batContent.indexOf('node') !== -1;
        var hasPause = batContent.indexOf('pause') !== -1;
        
        log('  ' + (hasNode ? '✓' : '✗') + ' start.bat: запуск node', hasNode ? 'green' : 'red');
        log('  ' + (hasPause ? '✓' : '✗') + ' start.bat: пауза после выполнения', hasPause ? 'green' : 'red');
    }
    
    // Проверяем INFO.txt
    var infoPath = path.join(APP_PATH, 'INFO.txt');
    if (fs.existsSync(infoPath)) {
        var infoContent = fs.readFileSync(infoPath, 'utf8');
        var hasDispatcher = infoContent.indexOf('dispatcher') !== -1;
        var hasPassword = infoContent.indexOf('dispatcher123') !== -1;
        
        log('  ' + (hasDispatcher ? '✓' : '✗') + ' INFO.txt: логин диспетчера', hasDispatcher ? 'green' : 'red');
        log('  ' + (hasPassword ? '✓' : '✗') + ' INFO.txt: пароль диспетчера', hasPassword ? 'green' : 'red');
    }
    
    // Проверка сервера
    log('\n🌐 Проверка доступности сервера...', 'yellow');
    var serverAvailable = await checkServer();
    if (serverAvailable) {
        log('  ✓ Сервер доступен по адресу: ' + URL, 'green');
    } else {
        log('  ✗ Сервер недоступен. Запустите start.bat перед тестированием', 'red');
        log('    Команда для запуска: cd ' + APP_PATH + ' && start start.bat', 'yellow');
    }
    
    console.log('\n' + '='.repeat(60));
    log('📊 ИТОГИ E2E ТЕСТИРОВАНИЯ', 'blue');
    console.log('='.repeat(60));
    log('\n  Для полного E2E тестирования требуется запущенный сервер', 'yellow');
    log('  Запустите start.bat и выполните тесты в браузере вручную\n', 'yellow');
}

// Запуск тестов
if (require.main === module) {
    runE2ETests().catch(console.error);
}

module.exports = { runE2ETests };