// tests/installer.test.js - Тесты для установщика с автоматической установкой
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Конфигурация тестов
const TEST_INSTALL_PATH = path.join(os.tmpdir(), 'TechnicalServiceSystem_Test');
const SOURCE_INSTALL_PATH = path.join(os.homedir(), 'TechnicalServiceSystem');

// Цвета для вывода тестов
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function printTestHeader() {
    console.log('\n' + '='.repeat(60));
    log('🧪 ЗАПУСК ТЕСТОВ УСТАНОВЩИКА', 'blue');
    console.log('='.repeat(60) + '\n');
}

function printTestResult(name, passed, message = '') {
    const status = passed ? '✓ ПРОЙДЕН' : '✗ НЕ ПРОЙДЕН';
    const color = passed ? 'green' : 'red';
    log(`  ${status} ${name}`, color);
    if (message && !passed) {
        log(`    → ${message}`, 'red');
    }
}

// Рекурсивное копирование папки
function copyFolderSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Автоматическая установка тестовой среды
function setupTestEnvironment() {
    log('\n🔧 НАСТРОЙКА ТЕСТОВОЙ СРЕДЫ...', 'yellow');
    
    // Удаляем старую тестовую установку, если есть
    if (fs.existsSync(TEST_INSTALL_PATH)) {
        log('  Очистка старой тестовой установки...', 'dim');
        fs.rmSync(TEST_INSTALL_PATH, { recursive: true, force: true });
    }
    
    // Проверяем, существует ли исходная установка
    if (!fs.existsSync(SOURCE_INSTALL_PATH)) {
        log('  Основная установка не найдена. Запускаем установщик...', 'yellow');
        
        // Запускаем установщик
        try {
            // Создаем временный скрипт для установки в тестовую папку
            const installerPath = path.join(__dirname, '..', 'installer.js');
            if (fs.existsSync(installerPath)) {
                // Модифицируем переменную INSTALL_PATH в installer.js для тестов
                let installerContent = fs.readFileSync(installerPath, 'utf8');
                installerContent = installerContent.replace(
                    /const INSTALL_PATH = path\.join\(os\.homedir\(\), 'TechnicalServiceSystem'\);/,
                    `const INSTALL_PATH = '${TEST_INSTALL_PATH}';`
                );
                
                // Сохраняем временный установщик
                const tempInstaller = path.join(os.tmpdir(), 'temp_installer.js');
                fs.writeFileSync(tempInstaller, installerContent);
                
                // Запускаем установщик
                log('  Запуск установщика в тестовую папку...', 'dim');
                require(tempInstaller);
                
                // Удаляем временный файл
                fs.unlinkSync(tempInstaller);
            } else {
                throw new Error('installer.js не найден');
            }
        } catch (error) {
            log(`  Ошибка запуска установщика: ${error.message}`, 'red');
            // Если не удалось запустить установщик, копируем из существующей установки
            if (fs.existsSync(SOURCE_INSTALL_PATH)) {
                log('  Копирование из существующей установки...', 'yellow');
                copyFolderSync(SOURCE_INSTALL_PATH, TEST_INSTALL_PATH);
            } else {
                log('  Нет исходной установки для копирования!', 'red');
                process.exit(1);
            }
        }
    } else {
        // Копируем из основной установки
        log('  Копирование из основной установки...', 'dim');
        copyFolderSync(SOURCE_INSTALL_PATH, TEST_INSTALL_PATH);
    }
    
    // Проверяем, что тестовая установка создана
    if (fs.existsSync(TEST_INSTALL_PATH)) {
        log('  ✅ Тестовая установка успешно создана', 'green');
        return true;
    } else {
        log('  ❌ Не удалось создать тестовую установку', 'red');
        return false;
    }
}

// 1. Тесты структуры папок
function testDirectories() {
    console.log('\n📁 Тесты структуры папок:');
    
    const requiredDirs = [
        'src',
        'src/scripts',
        'src/scripts/database',
        'src/scripts/database/init',
        'src/scripts/data',
        'src/scripts/data/classes',
        'src/scripts/alerts',
        'src/scripts/modals',
        'src/scripts/modals/close',
        'src/scripts/modals/show',
        'src/scripts/login',
        'src/scripts/login/show',
        'src/scripts/register',
        'src/scripts/register/show',
        'src/scripts/request',
        'src/scripts/request/show',
        'src/scripts/request/submit',
        'src/scripts/request/view',
        'src/scripts/request/approve',
        'src/scripts/request/complete',
        'src/scripts/request/assign',
        'src/scripts/rejects',
        'src/scripts/rejects/confirm',
        'src/scripts/rejects/show',
        'src/scripts/review',
        'src/scripts/review/show',
        'src/scripts/review/submit',
        'src/scripts/engineer',
        'src/scripts/engineer/add',
        'src/scripts/engineer/delete',
        'src/scripts/engineer/edit',
        'src/scripts/logout',
        'src/scripts/renders',
        'src/style'
    ];
    
    let allPassed = true;
    for (const dir of requiredDirs) {
        const exists = fs.existsSync(path.join(TEST_INSTALL_PATH, dir));
        printTestResult(`Папка ${dir}`, exists);
        if (!exists) allPassed = false;
    }
    return allPassed;
}

// 2. Тесты наличия файлов
function testFiles() {
    console.log('\n📄 Тесты наличия файлов:');
    
    const requiredFiles = [
        'index.html',
        'server.js',
        'start.bat',
        'INFO.txt',
        'src/style/style.css',
        'src/scripts/database/db.js',
        'src/scripts/database/init/initData.js',
        'src/scripts/data/classes/Customer.js',
        'src/scripts/data/classes/Engineer.js',
        'src/scripts/data/classes/TechnicalRequest.js',
        'src/scripts/data/classes/Review.js',
        'src/scripts/alerts/showAlert.js',
        'src/scripts/modals/close/closeModal.js',
        'src/scripts/modals/show/showModal.js',
        'src/scripts/login/show/showLogin.js',
        'src/scripts/login/Login.js',
        'src/scripts/register/show/showRegister.js',
        'src/scripts/register/register.js',
        'src/scripts/request/show/showRequestModal.js',
        'src/scripts/request/submit/submitRequest.js',
        'src/scripts/request/view/viewRequestDetail.js',
        'src/scripts/request/approve/approveRequest.js',
        'src/scripts/request/complete/completeRequest.js',
        'src/scripts/request/assign/assignEngineer.js',
        'src/scripts/rejects/confirm/confirmReject.js',
        'src/scripts/rejects/show/showRejectModal.js',
        'src/scripts/review/show/showReviewModal.js',
        'src/scripts/review/submit/submitReview.js',
        'src/scripts/engineer/add/addEngineer.js',
        'src/scripts/engineer/delete/deleteEngineer.js',
        'src/scripts/engineer/edit/editEngineer.js',
        'src/scripts/logout/logout.js',
        'src/scripts/renders/renderGuestView.js',
        'src/scripts/renders/renderCustomerView.js',
        'src/scripts/renders/renderEngineerView.js',
        'src/scripts/renders/renderDispatcherView.js',
        'src/scripts/renders/renderContent.js',
        'src/scripts/script.js'
    ];
    
    let allPassed = true;
    for (const file of requiredFiles) {
        const exists = fs.existsSync(path.join(TEST_INSTALL_PATH, file));
        printTestResult(`Файл ${file}`, exists);
        if (!exists) allPassed = false;
    }
    return allPassed;
}

// 3. Тесты содержимого файлов
function testFileContent() {
    console.log('\n🔍 Тесты содержимого файлов:');
    let allPassed = true;
    
    // Проверка index.html
    const indexPath = path.join(TEST_INSTALL_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        const checks = [
            { name: 'DOCTYPE объявлен', test: /<!DOCTYPE html>/i.test(content) },
            { name: 'Мета-тег charset', test: /<meta[^>]*charset=["\']?UTF-8/i.test(content) },
            { name: 'Заголовок страницы', test: /<title>.*<\/title>/i.test(content) },
            { name: 'Наличие модальных окон', test: /<div id="loginModal"/.test(content) },
            { name: 'Подключение CSS', test: /<link[^>]*style\.css/.test(content) },
            { name: 'Подключение JS скриптов', test: /<script src="src\/scripts\//.test(content) }
        ];
        for (const check of checks) {
            printTestResult(`index.html: ${check.name}`, check.test);
            if (!check.test) allPassed = false;
        }
    } else {
        printTestResult('index.html существует', false);
        allPassed = false;
    }
    
    // Проверка CSS
    const cssPath = path.join(TEST_INSTALL_PATH, 'src/style/style.css');
    if (fs.existsSync(cssPath)) {
        const content = fs.readFileSync(cssPath, 'utf8');
        const checks = [
            { name: 'Стили для navbar', test: /\.navbar\s*{/.test(content) },
            { name: 'Стили для кнопок', test: /\.button\s*{/.test(content) },
            { name: 'Стили для модальных окон', test: /\.modal\s*{/.test(content) },
            { name: 'Стили для таблиц', test: /\.requests-table/.test(content) },
            { name: 'Медиа-запросы', test: /@media\s*\(max-width:\s*768px\)/.test(content) }
        ];
        for (const check of checks) {
            printTestResult(`style.css: ${check.name}`, check.test);
            if (!check.test) allPassed = false;
        }
    } else {
        printTestResult('style.css существует', false);
        allPassed = false;
    }
    
    // Проверка db.js
    const dbPath = path.join(TEST_INSTALL_PATH, 'src/scripts/database/db.js');
    if (fs.existsSync(dbPath)) {
        const content = fs.readFileSync(dbPath, 'utf8');
        const checks = [
            { name: 'Класс TechnicalServiceDB', test: /class TechnicalServiceDB/.test(content) },
            { name: 'Метод init', test: /async\s+init\s*\(/.test(content) },
            { name: 'Метод getAllCustomers', test: /getAllCustomers/.test(content) },
            { name: 'Метод addEngineer', test: /addEngineer/.test(content) },
            { name: 'Метод addRequest', test: /addRequest/.test(content) },
            { name: 'Экземпляр techDB', test: /const techDB\s*=\s*new TechnicalServiceDB/.test(content) }
        ];
        for (const check of checks) {
            printTestResult(`db.js: ${check.name}`, check.test);
            if (!check.test) allPassed = false;
        }
    } else {
        printTestResult('db.js существует', false);
        allPassed = false;
    }
    
    return allPassed;
}

// 4. Тесты синтаксиса JavaScript файлов
function testJavaScriptSyntax() {
    console.log('\n⚙️ Тесты синтаксиса JavaScript:');
    let allPassed = true;
    
    const jsFiles = [
        'src/scripts/database/db.js',
        'src/scripts/data/classes/Customer.js',
        'src/scripts/data/classes/Engineer.js',
        'src/scripts/data/classes/TechnicalRequest.js',
        'src/scripts/data/classes/Review.js',
        'src/scripts/alerts/showAlert.js',
        'src/scripts/login/Login.js',
        'src/scripts/register/register.js',
        'src/scripts/request/submit/submitRequest.js',
        'src/scripts/request/view/viewRequestDetail.js',
        'src/scripts/script.js'
    ];
    
    for (const jsFile of jsFiles) {
        const filePath = path.join(TEST_INSTALL_PATH, jsFile);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                // Простая проверка на незакрытые скобки
                const openBraces = (content.match(/{/g) || []).length;
                const closeBraces = (content.match(/}/g) || []).length;
                const openParens = (content.match(/\(/g) || []).length;
                const closeParens = (content.match(/\)/g) || []).length;
                
                const bracesMatch = openBraces === closeBraces;
                const parensMatch = openParens === closeParens;
                
                printTestResult(`${jsFile}: синтаксис скобок`, bracesMatch && parensMatch);
                if (!bracesMatch || !parensMatch) allPassed = false;
            } catch (e) {
                printTestResult(`${jsFile}: проверка синтаксиса`, false, e.message);
                allPassed = false;
            }
        } else {
            printTestResult(`${jsFile} существует`, false);
            allPassed = false;
        }
    }
    return allPassed;
}

// 5. Тесты валидации
function testValidationFunctions() {
    console.log('\n✅ Тесты функций валидации:');
    let allPassed = true;
    
    // Проверяем, что функции валидации присутствуют в script.js
    const scriptPath = path.join(TEST_INSTALL_PATH, 'src/scripts/script.js');
    if (fs.existsSync(scriptPath)) {
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        const validationFunctions = [
            'validateName', 'validatePhone', 'validateEmail', 
            'validatePassword', 'validateCompanyName', 
            'validateEquipmentType', 'validateRequestTitle'
        ];
        
        for (const func of validationFunctions) {
            const hasFunction = content.includes(`function ${func}`);
            printTestResult(`Функция ${func} объявлена`, hasFunction);
            if (!hasFunction) allPassed = false;
        }
    } else {
        printTestResult('script.js существует', false);
        allPassed = false;
    }
    
    return allPassed;
}

// 6. Тесты server.js
function testServerFile() {
    console.log('\n🌐 Тесты серверного файла:');
    let allPassed = true;
    
    const serverPath = path.join(TEST_INSTALL_PATH, 'server.js');
    if (fs.existsSync(serverPath)) {
        const content = fs.readFileSync(serverPath, 'utf8');
        const checks = [
            { name: 'Создание HTTP сервера', test: /http\.createServer/.test(content) },
            { name: 'Прослушивание порта', test: /server\.listen\s*\(\s*PORT\s*,/.test(content) },
            { name: 'Обработка статических файлов', test: /fs\.readFile/.test(content) },
            { name: 'MIME типы', test: /mimeTypes/.test(content) },
            { name: 'Автоматическое открытие браузера', test: /exec\s*\(\s*['"]start/.test(content) }
        ];
        for (const check of checks) {
            printTestResult(`server.js: ${check.name}`, check.test);
            if (!check.test) allPassed = false;
        }
    } else {
        printTestResult('server.js существует', false);
        allPassed = false;
    }
    return allPassed;
}

// 7. Тесты start.bat
function testBatFile() {
    console.log('\n🪟 Тесты start.bat:');
    let allPassed = true;
    
    const batPath = path.join(TEST_INSTALL_PATH, 'start.bat');
    if (fs.existsSync(batPath)) {
        const content = fs.readFileSync(batPath, 'utf8');
        const checks = [
            { name: 'Команда chcp для кодировки', test: /chcp\s+65001/.test(content) },
            { name: 'Заголовок окна', test: /title\s+Technical\s+Service\s+System/.test(content) },
            { name: 'Цвет консоли', test: /color\s+0A/.test(content) },
            { name: 'Запуск сервера', test: /node\s+server\.js/.test(content) },
            { name: 'Пауза после выполнения', test: /pause/.test(content) }
        ];
        for (const check of checks) {
            printTestResult(`start.bat: ${check.name}`, check.test);
            if (!check.test) allPassed = false;
        }
    } else {
        printTestResult('start.bat существует', false);
        allPassed = false;
    }
    return allPassed;
}

// 8. Тесты размера файлов
function testFileSizes() {
    console.log('\n📊 Тесты размеров файлов:');
    let allPassed = true;
    
    const filesToCheck = [
        'index.html',
        'src/style/style.css',
        'src/scripts/database/db.js',
        'src/scripts/script.js'
    ];
    
    for (const file of filesToCheck) {
        const filePath = path.join(TEST_INSTALL_PATH, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const sizeKB = stats.size / 1024;
            const isValid = sizeKB > 0;
            printTestResult(`${file}: ${sizeKB.toFixed(2)} KB`, isValid);
            if (!isValid) allPassed = false;
        }
    }
    return allPassed;
}

// 9. Тесты INFO.txt
function testInfoFile() {
    console.log('\nℹ️ Тесты INFO.txt:');
    let allPassed = true;
    
    const infoPath = path.join(TEST_INSTALL_PATH, 'INFO.txt');
    if (fs.existsSync(infoPath)) {
        const content = fs.readFileSync(infoPath, 'utf8');
        const checks = [
            { name: 'Содержит логин диспетчера', test: /dispatcher/.test(content) },
            { name: 'Содержит пароль диспетчера', test: /dispatcher123/.test(content) },
            { name: 'Содержит информацию о компаниях', test: /technoprom/.test(content) },
            { name: 'Содержит инструкцию по запуску', test: /start\.bat/.test(content) },
            { name: 'Содержит информацию о смене пароля', test: /сменить пароль|change password/i.test(content) }
        ];
        for (const check of checks) {
            printTestResult(`INFO.txt: ${check.name}`, check.test);
            if (!check.test) allPassed = false;
        }
    } else {
        printTestResult('INFO.txt существует', false);
        allPassed = false;
    }
    return allPassed;
}

// 10. Тесты CSS валидации
function testCSSValidation() {
    console.log('\n🎨 Тесты CSS:');
    let allPassed = true;
    
    const cssPath = path.join(TEST_INSTALL_PATH, 'src/style/style.css');
    if (fs.existsSync(cssPath)) {
        const content = fs.readFileSync(cssPath, 'utf8');
        
        const importantClasses = [
            '.navbar', '.button', '.modal', '.container', '.admin-section',
            '.requests-table', '.tabs-container', '.tab-btn', '.stats', '.stat-card'
        ];
        
        for (const className of importantClasses) {
            const hasClass = content.includes(className);
            printTestResult(`CSS класс ${className}`, hasClass);
            if (!hasClass) allPassed = false;
        }
    }
    return allPassed;
}

// 11. Тесты модальных окон в HTML
function testModalsInHTML() {
    console.log('\n🪟 Тесты модальных окон:');
    let allPassed = true;
    
    const indexPath = path.join(TEST_INSTALL_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        const modals = [
            'loginModal', 'registerModal', 'requestModal', 'requestDetailModal',
            'rejectModal', 'reviewModal', 'engineerModal', 'assignEngineerModal', 'changePasswordModal'
        ];
        
        for (const modal of modals) {
            const hasModal = content.includes(`id="${modal}"`);
            printTestResult(`Модальное окно ${modal}`, hasModal);
            if (!hasModal) allPassed = false;
        }
    }
    return allPassed;
}

// Очистка тестовой установки
function cleanupTestEnvironment() {
    log('\n🧹 ОЧИСТКА ТЕСТОВОЙ СРЕДЫ...', 'yellow');
    if (fs.existsSync(TEST_INSTALL_PATH)) {
        fs.rmSync(TEST_INSTALL_PATH, { recursive: true, force: true });
        log('  ✅ Тестовая установка удалена', 'green');
    }
}

// Главная функция запуска тестов
async function runAllTests() {
    printTestHeader();
    
    // Автоматическая настройка тестовой среды
    const setupSuccess = setupTestEnvironment();
    if (!setupSuccess) {
        log('❌ Не удалось настроить тестовую среду', 'red');
        return;
    }
    
    var results = {
        directories: testDirectories(),
        files: testFiles(),
        content: testFileContent(),
        syntax: testJavaScriptSyntax(),
        validation: testValidationFunctions(),
        server: testServerFile(),
        bat: testBatFile(),
        sizes: testFileSizes(),
        info: testInfoFile(),
        css: testCSSValidation(),
        modals: testModalsInHTML()
    };
    
    console.log('\n' + '='.repeat(60));
    log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ', 'blue');
    console.log('='.repeat(60));
    
    var totalTests = 0;
    var passedTests = 0;
    
    for (var category in results) {
        if (results.hasOwnProperty(category)) {
            var passed = results[category];
            totalTests++;
            if (passed) passedTests++;
            var status = passed ? '✓' : '✗';
            var color = passed ? 'green' : 'red';
            log('  ' + status + ' ' + category, color);
        }
    }
    
    console.log('\n' + '-'.repeat(60));
    var resultColor = passedTests === totalTests ? 'green' : 'yellow';
    log('  Итого: ' + passedTests + ' из ' + totalTests + ' тестов пройдено', resultColor);
    
    if (passedTests === totalTests) {
        log('\n🎉 ПОЗДРАВЛЯЮ! Все тесты успешно пройдены!\n', 'green');
    } else {
        log('\n⚠️ Некоторые тесты не пройдены. Пожалуйста, исправьте ошибки.\n', 'yellow');
    }
    
    // Очистка тестовой среды (опционально)
    // cleanupTestEnvironment();
}

// Запуск тестов
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests, setupTestEnvironment };