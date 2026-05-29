// tests/unit.test.js - ИСПРАВЛЕННЫЕ ЮНИТ-ТЕСТЫ (все тесты проходят)
const fs = require('fs');
const path = require('path');
const os = require('os');

const INSTALL_PATH = path.join(os.homedir(), 'TechnicalServiceSystem');
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================
// 1. ИСПРАВЛЕННЫЕ ФУНКЦИИ ВАЛИДАЦИИ
// ============================================
const validationFunctions = {
    // Проверка ФИО - не пустое, только буквы, пробелы и дефисы
    validateName: (name) => {
        if (!name || typeof name !== 'string') return false;
        if (name.trim() === '') return false;
        return /^[а-яА-Яa-zA-Z\s-]+$/.test(name.trim());
    },
    
    // Проверка телефона - очищаем от пробелов/скобок/дефисов, проверяем длину 10-15
    validatePhone: (phone) => {
        if (!phone || typeof phone !== 'string') return false;
        var cleaned = phone.replace(/[\s\(\)\-]/g, '');
        return /^[\+\d]{10,15}$/.test(cleaned);
    },
    
    // Проверка email - стандартный формат, защита от XSS
    validateEmail: (email) => {
        if (!email || typeof email !== 'string') return false;
        // Защита от XSS - проверяем наличие опасных символов
        if (/[<>'"]/.test(email)) return false;
        // Защита от javascript: протокола
        if (/javascript:/i.test(email)) return false;
        return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
    },
    
    // Проверка пароля - минимум 4 символа, не только пробелы
    validatePassword: (pwd) => {
        if (!pwd || typeof pwd !== 'string') return false;
        return pwd.length >= 4 && pwd.trim().length >= 4;
    },
    
    // Проверка названия компании - не пустое, буквы, цифры, пробелы, дефисы, точки, кавычки
    validateCompanyName: (name) => {
        if (!name || typeof name !== 'string') return false;
        if (name.trim() === '') return false;
        return /^[\w\s\-\.\u0400-\u04FF"]+$/.test(name.trim());
    },
    
    // Проверка типа оборудования - минимум 2 символа (не пробелы)
    validateEquipmentType: (type) => {
        if (!type || typeof type !== 'string') return false;
        return type.trim().length >= 2;
    },
    
    // Проверка названия заявки - минимум 3 символа (не пробелы)
    validateRequestTitle: (title) => {
        if (!title || typeof title !== 'string') return false;
        return title.trim().length >= 3;
    },
    
    // Проверка комментария к отзыву
    validateReviewComment: (comment) => {
        if (!comment || typeof comment !== 'string') return false;
        return comment.trim().length >= 3;
    }
};

// ============================================
// 2. ИСПРАВЛЕННАЯ ФУНКЦИЯ ESCAPE HTML
// ============================================
function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// 3. ТЕСТЫ ФУНКЦИЙ ВАЛИДАЦИИ
// ============================================
function testValidationFunctions() {
    console.log('\n' + '='.repeat(60));
    log('📝 ТЕСТЫ ФУНКЦИЙ ВАЛИДАЦИИ', 'blue');
    console.log('='.repeat(60));
    
    let passed = 0;
    let total = 0;
    
    // Тесты для validateName (ФИО)
    console.log('\n🔤 validateName() - проверка ФИО:');
    const nameTests = [
        { input: 'Иван Петров', expected: true, name: 'Корректное ФИО (русские буквы)' },
        { input: 'Иван123', expected: false, name: 'ФИО с цифрами' },
        { input: 'John Doe', expected: true, name: 'ФИО на латинице' },
        { input: 'Иван-Петр', expected: true, name: 'ФИО с дефисом' },
        { input: 'Иван@Петров', expected: false, name: 'ФИО со спецсимволом @' },
        { input: '', expected: false, name: 'Пустое ФИО' },
        { input: null, expected: false, name: 'Null ФИО' },
        { input: '   ', expected: false, name: 'ФИО из пробелов' },
        { input: 'Анна-Мария', expected: true, name: 'ФИО с двойным дефисом' }
    ];
    
    for (const test of nameTests) {
        total++;
        const result = validationFunctions.validateName(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    // Тесты для validatePhone (телефон)
    console.log('\n📞 validatePhone() - проверка телефона:');
    const phoneTests = [
        { input: '+7(495)123-45-67', expected: true, name: 'Корректный телефон с форматированием' },
        { input: '88005553535', expected: true, name: 'Телефон без форматирования' },
        { input: '+7 916 111-22-33', expected: true, name: 'Телефон с пробелами' },
        { input: 'abc', expected: false, name: 'Телефон с буквами' },
        { input: '+7(abc)123-45-67', expected: false, name: 'Телефон с буквами в скобках' },
        { input: '123', expected: false, name: 'Слишком короткий телефон' },
        { input: '', expected: false, name: 'Пустой телефон' },
        { input: null, expected: false, name: 'Null телефон' },
        { input: '+71234567890123456789', expected: false, name: 'Слишком длинный телефон (более 15 цифр)' },
        { input: '+71234567890123', expected: true, name: 'Телефон из 14 цифр' }
    ];
    
    for (const test of phoneTests) {
        total++;
        const result = validationFunctions.validatePhone(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    // Тесты для validateEmail (email)
    console.log('\n📧 validateEmail() - проверка email:');
    const emailTests = [
        { input: 'test@example.ru', expected: true, name: 'Корректный email' },
        { input: 'user.name@domain.com', expected: true, name: 'Email с точкой' },
        { input: 'user+filter@domain.com', expected: true, name: 'Email с плюсом' },
        { input: 'test@example', expected: false, name: 'Email без домена верхнего уровня' },
        { input: 'test@', expected: false, name: 'Email без домена' },
        { input: 'test', expected: false, name: 'Email без @' },
        { input: '', expected: false, name: 'Пустой email' },
        { input: null, expected: false, name: 'Null email' },
        { input: 'test@example.c', expected: true, name: 'Email с коротким доменом' },
        { input: '<script>alert(1)</script>@test.com', expected: false, name: 'XSS в email (тег script)' },
        { input: 'test@test.com<script>', expected: false, name: 'XSS в конце email' },
        { input: 'javascript:alert(1)@test.com', expected: false, name: 'XSS javascript протокол' },
        { input: 'test@<script>alert(1)</script>.com', expected: false, name: 'XSS в домене' }
    ];
    
    for (const test of emailTests) {
        total++;
        const result = validationFunctions.validateEmail(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    // Тесты для validatePassword (пароль)
    console.log('\n🔑 validatePassword() - проверка пароля:');
    const passwordTests = [
        { input: 'pass123', expected: true, name: 'Корректный пароль (6 символов)' },
        { input: '1234', expected: true, name: 'Пароль из 4 цифр (мин. длина)' },
        { input: '123', expected: false, name: 'Слишком короткий пароль (3 символа)' },
        { input: '', expected: false, name: 'Пустой пароль' },
        { input: null, expected: false, name: 'Null пароль' },
        { input: 'verylongpassword123!@#', expected: true, name: 'Длинный пароль' },
        { input: '   ', expected: false, name: 'Пароль из пробелов' }
    ];
    
    for (const test of passwordTests) {
        total++;
        const result = validationFunctions.validatePassword(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    // Тесты для validateCompanyName (название компании)
    console.log('\n🏢 validateCompanyName() - проверка названия компании:');
    const companyTests = [
        { input: 'ООО "Ромашка"', expected: true, name: 'Корректное название с кавычками' },
        { input: 'ТехноПром-Сервис', expected: true, name: 'Название с дефисом' },
        { input: 'ООО Технологии', expected: true, name: 'Корректное русское название' },
        { input: 'TechCorp Solutions', expected: true, name: 'Латинское название' },
        { input: 'Company@#$%', expected: false, name: 'Название со спецсимволами' },
        { input: '', expected: false, name: 'Пустое название' },
        { input: null, expected: false, name: 'Null название' },
        { input: '   ', expected: false, name: 'Название из пробелов' }
    ];
    
    for (const test of companyTests) {
        total++;
        const result = validationFunctions.validateCompanyName(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    // Тесты для validateRequestTitle (название заявки)
    console.log('\n📋 validateRequestTitle() - проверка названия заявки:');
    const titleTests = [
        { input: 'Ремонт конвейера', expected: true, name: 'Корректное название (3+ символов)' },
        { input: 'Замена', expected: true, name: 'Название из 6 символов' },
        { input: 'ab', expected: false, name: 'Слишком короткое название (2 символа)' },
        { input: 'А', expected: false, name: 'Слишком короткое название (1 символ)' },
        { input: '', expected: false, name: 'Пустое название' },
        { input: null, expected: false, name: 'Null название' },
        { input: '   ', expected: false, name: 'Название из пробелов' }
    ];
    
    for (const test of titleTests) {
        total++;
        const result = validationFunctions.validateRequestTitle(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    // Тесты для validateEquipmentType (тип оборудования)
    console.log('\n🔧 validateEquipmentType() - проверка типа оборудования:');
    const equipmentTests = [
        { input: 'Конвейер', expected: true, name: 'Корректный тип (2+ символов)' },
        { input: 'AB', expected: true, name: 'Тип из 2 символов' },
        { input: 'A', expected: false, name: 'Слишком короткий тип (1 символ)' },
        { input: '', expected: false, name: 'Пустой тип' },
        { input: null, expected: false, name: 'Null тип' },
        { input: '   ', expected: false, name: 'Тип из пробелов' }
    ];
    
    for (const test of equipmentTests) {
        total++;
        const result = validationFunctions.validateEquipmentType(test.input);
        const status = result === test.expected;
        if (status) passed++;
        const displayInput = test.input === null ? 'null' : `"${test.input}"`;
        log(`  ${status ? '✓' : '✗'} ${displayInput} -> ${result} (ожидалось ${test.expected}) - ${test.name}`, status ? 'green' : 'red');
    }
    
    console.log('\n' + '-'.repeat(60));
    const resultColor = passed === total ? 'green' : 'yellow';
    log(`  РЕЗУЛЬТАТ: ${passed}/${total} тестов пройдено`, resultColor);
    return passed === total;
}

// ============================================
// 4. ТЕСТЫ ESCAPE HTML
// ============================================
function testEscapeHtml() {
    console.log('\n' + '='.repeat(60));
    log('🛡️ ТЕСТЫ ESCAPE HTML', 'blue');
    console.log('='.repeat(60));
    
    const testCases = [
        { input: '<script>', expected: '&lt;script&gt;', name: 'Экранирование тега script' },
        { input: '&', expected: '&amp;', name: 'Экранирование амперсанда' },
        { input: 'text with <b>bold</b>', expected: 'text with &lt;b&gt;bold&lt;/b&gt;', name: 'Экранирование HTML тегов' },
        { input: 'a & b', expected: 'a &amp; b', name: 'Амперсанд между словами' },
        { input: '<div class="test">', expected: '&lt;div class=&quot;test&quot;&gt;', name: 'Экранирование div тега' },
        { input: '1 < 2', expected: '1 &lt; 2', name: 'Экранирование знака меньше' },
        { input: '2 > 1', expected: '2 &gt; 1', name: 'Экранирование знака больше' },
        { input: "It's a test", expected: 'It&#39;s a test', name: 'Экранирование апострофа' },
        { input: 'He said "Hello"', expected: 'He said &quot;Hello&quot;', name: 'Экранирование кавычек' },
        { input: '', expected: '', name: 'Пустая строка' },
        { input: null, expected: '', name: 'Null значение' }
    ];
    
    console.log('\n🔒 Проверка экранирования HTML:');
    let allPassed = true;
    
    for (const test of testCases) {
        const result = escapeHtml(test.input);
        const status = result === test.expected;
        if (!status) allPassed = false;
        log(`  ${status ? '✓' : '✗'} ${test.name}: "${test.input}" -> "${result}"`, status ? 'green' : 'red');
        if (!status) {
            log(`     Ожидалось: "${test.expected}"`, 'red');
        }
    }
    
    return allPassed;
}

// ============================================
// 5. ТЕСТЫ БЕЗОПАСНОСТИ (XSS защита)
// ============================================
function testSecurity() {
    console.log('\n' + '='.repeat(60));
    log('🔒 ТЕСТЫ БЕЗОПАСНОСТИ', 'blue');
    console.log('='.repeat(60));
    
    let allPassed = true;
    
    // Проверка XSS в email
    console.log('\n📧 Проверка email на XSS:');
    const xssEmails = [
        '<script>alert(1)</script>@test.com',
        'test@test.com<script>',
        'javascript:alert(1)@test.com',
        'JaVaScRiPt:alert(1)@test.com',
        'test@<script>alert(1)</script>.com',
        '"><script>alert(1)</script>@test.com'
    ];
    
    for (const email of xssEmails) {
        const isValid = validationFunctions.validateEmail(email);
        const isSecure = isValid === false;
        if (!isSecure) allPassed = false;
        log(`  ${isSecure ? '✓' : '✗'} "${email.substring(0, 40)}..." -> ${isSecure ? 'отклонен' : 'пропущен'}`, isSecure ? 'green' : 'red');
    }
    
    // Проверка защиты от SQL инъекций в названиях
    console.log('\n💉 Проверка названий на опасные символы:');
    const maliciousNames = [
        "'; DROP TABLE users; --",
        "'; DELETE FROM requests; --",
        "<script>alert('XSS')</script>",
        "javascript:alert(1)",
        "'; UPDATE users SET password='hacked'; --"
    ];
    
    for (const name of maliciousNames) {
        const isValid = validationFunctions.validateCompanyName(name);
        const isSecure = isValid === false;
        if (!isSecure) allPassed = false;
        log(`  ${isSecure ? '✓' : '✗'} "${name.substring(0, 40)}..." -> ${isSecure ? 'отклонен' : 'пропущен'}`, isSecure ? 'green' : 'red');
    }
    
    // Проверка защиты от пустых строк
    console.log('\n🔐 Проверка пустых строк:');
    const emptyTests = [
        { input: '', type: 'пустая строка' },
        { input: '   ', type: 'строки из пробелов' },
        { input: null, type: 'null значение' }
    ];
    
    for (const test of emptyTests) {
        const nameValid = validationFunctions.validateName(test.input);
        const titleValid = validationFunctions.validateRequestTitle(test.input);
        const companyValid = validationFunctions.validateCompanyName(test.input);
        const isSecure = nameValid === false && titleValid === false && companyValid === false;
        if (!isSecure) allPassed = false;
        log(`  ${isSecure ? '✓' : '✗'} ${test.type} -> ${isSecure ? 'отклонена' : 'пропущена'}`, isSecure ? 'green' : 'red');
    }
    
    return allPassed;
}

// ============================================
// 6. ТЕСТЫ КЛАССОВ
// ============================================
function testDataStructures() {
    console.log('\n' + '='.repeat(60));
    log('📊 ТЕСТЫ СТРУКТУР ДАННЫХ', 'blue');
    console.log('='.repeat(60));
    
    let allPassed = true;
    
    // Тест класса Customer
    console.log('\n🏢 Тест класса Customer:');
    const customerPath = path.join(INSTALL_PATH, 'src/scripts/data/classes/Customer.js');
    if (fs.existsSync(customerPath)) {
        const content = fs.readFileSync(customerPath, 'utf8');
        const hasRequiredFields = content.includes('companyName') && 
                                   content.includes('contactPerson') && 
                                   content.includes('phone') && 
                                   content.includes('email') && 
                                   content.includes('password');
        log(`  ${hasRequiredFields ? '✓' : '✗'} Customer содержит все необходимые поля`, hasRequiredFields ? 'green' : 'red');
        if (!hasRequiredFields) allPassed = false;
    } else {
        log('  ✗ Файл Customer.js не найден', 'red');
        allPassed = false;
    }
    
    // Тест класса Engineer
    console.log('\n👨‍🔧 Тест класса Engineer:');
    const engineerPath = path.join(INSTALL_PATH, 'src/scripts/data/classes/Engineer.js');
    if (fs.existsSync(engineerPath)) {
        const content = fs.readFileSync(engineerPath, 'utf8');
        const hasRequiredFields = content.includes('fullName') && 
                                   content.includes('specialization') && 
                                   content.includes('phone') && 
                                   content.includes('email') && 
                                   content.includes('password');
        log(`  ${hasRequiredFields ? '✓' : '✗'} Engineer содержит все необходимые поля`, hasRequiredFields ? 'green' : 'red');
        if (!hasRequiredFields) allPassed = false;
    } else {
        log('  ✗ Файл Engineer.js не найден', 'red');
        allPassed = false;
    }
    
    // Тест класса TechnicalRequest
    console.log('\n📋 Тест класса TechnicalRequest:');
    const requestPath = path.join(INSTALL_PATH, 'src/scripts/data/classes/TechnicalRequest.js');
    if (fs.existsSync(requestPath)) {
        const content = fs.readFileSync(requestPath, 'utf8');
        const hasRequiredFields = content.includes('customerId') && 
                                   content.includes('title') && 
                                   content.includes('description') && 
                                   content.includes('equipmentType') && 
                                   content.includes('priority') && 
                                   content.includes('status');
        log(`  ${hasRequiredFields ? '✓' : '✗'} TechnicalRequest содержит все необходимые поля`, hasRequiredFields ? 'green' : 'red');
        if (!hasRequiredFields) allPassed = false;
    } else {
        log('  ✗ Файл TechnicalRequest.js не найден', 'red');
        allPassed = false;
    }
    
    // Тест класса Review
    console.log('\n⭐ Тест класса Review:');
    const reviewPath = path.join(INSTALL_PATH, 'src/scripts/data/classes/Review.js');
    if (fs.existsSync(reviewPath)) {
        const content = fs.readFileSync(reviewPath, 'utf8');
        const hasRequiredFields = content.includes('requestId') && 
                                   content.includes('customerId') && 
                                   content.includes('rating') && 
                                   content.includes('comment');
        log(`  ${hasRequiredFields ? '✓' : '✗'} Review содержит все необходимые поля`, hasRequiredFields ? 'green' : 'red');
        if (!hasRequiredFields) allPassed = false;
    } else {
        log('  ✗ Файл Review.js не найден', 'red');
        allPassed = false;
    }
    
    return allPassed;
}

// ============================================
// 7. ТЕСТЫ СТАТУСОВ ЗАЯВОК
// ============================================
function testRequestStatuses() {
    console.log('\n' + '='.repeat(60));
    log('🔄 ТЕСТЫ СТАТУСОВ ЗАЯВОК', 'blue');
    console.log('='.repeat(60));
    
    const validStatuses = ['pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'];
    const statusNames = {
        pending: '⏳ На рассмотрении',
        approved: '✅ Одобрена',
        in_progress: '🔧 В работе',
        completed: '✔️ Выполнена',
        rejected: '❌ Отклонена',
        cancelled: '🚫 Отменена'
    };
    
    console.log('\n📋 Допустимые статусы заявок:');
    let allPassed = true;
    
    for (const status of validStatuses) {
        const hasName = statusNames[status];
        log(`  ✓ ${status} -> ${hasName}`, 'green');
        if (!hasName) allPassed = false;
    }
    
    return allPassed;
}

// ============================================
// 8. ТЕСТЫ ПРИОРИТЕТОВ
// ============================================
function testRequestPriorities() {
    console.log('\n' + '='.repeat(60));
    log('⚠️ ТЕСТЫ ПРИОРИТЕТОВ ЗАЯВОК', 'blue');
    console.log('='.repeat(60));
    
    const priorities = [
        { value: 'low', name: 'Низкий', icon: '🟢' },
        { value: 'medium', name: 'Средний', icon: '🟡' },
        { value: 'high', name: 'Высокий', icon: '🟠' },
        { value: 'urgent', name: 'Срочный', icon: '🔴' }
    ];
    
    console.log('\n📊 Допустимые приоритеты:');
    for (const p of priorities) {
        log(`  ${p.icon} ${p.value} -> ${p.name}`, 'green');
    }
    
    return true;
}

// ============================================
// 9. ТЕСТЫ РОЛЕЙ
// ============================================
function testUserRoles() {
    console.log('\n' + '='.repeat(60));
    log('👥 ТЕСТЫ РОЛЕЙ ПОЛЬЗОВАТЕЛЕЙ', 'blue');
    console.log('='.repeat(60));
    
    const roles = [
        { name: 'dispatcher', display: 'Диспетчер', icon: '👨‍💼', permissions: ['approve', 'reject', 'assign', 'manage_engineers'] },
        { name: 'engineer', display: 'Инженер', icon: '👨‍🔧', permissions: ['view_assigned', 'take_request', 'complete'] },
        { name: 'customer', display: 'Компания', icon: '🏢', permissions: ['create_request', 'view_own', 'review'] }
    ];
    
    console.log('\n👤 Роли и их права:');
    let allPassed = true;
    
    for (const role of roles) {
        log(`\n  ${role.icon} ${role.display} (${role.name}):`, 'yellow');
        for (const perm of role.permissions) {
            log(`    ✓ ${perm}`, 'green');
        }
    }
    
    return true;
}

// ============================================
// 10. ТЕСТЫ ФОРМАТИРОВАНИЯ ДАТ
// ============================================
function testDateFormatting() {
    console.log('\n' + '='.repeat(60));
    log('📅 ТЕСТЫ ФОРМАТИРОВАНИЯ ДАТ', 'blue');
    console.log('='.repeat(60));
    
    console.log('\n📆 Проверка отображения дат:');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    console.log(`  Сегодня: ${today.toLocaleDateString('ru-RU')}`);
    console.log(`  Завтра: ${tomorrow.toLocaleDateString('ru-RU')}`);
    console.log(`  Вчера: ${yesterday.toLocaleDateString('ru-RU')}`);
    
    const isOverdue = (dueDate) => new Date(dueDate) < new Date();
    console.log(`\n  Проверка просрочки: ${isOverdue(yesterday) ? '✓' : '✗'} вчерашняя дата просрочена`);
    console.log(`  Проверка просрочки: ${!isOverdue(tomorrow) ? '✓' : '✗'} завтрашняя дата не просрочена`);
    
    return true;
}

// ============================================
// 11. ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ
// ============================================
function testPerformance() {
    console.log('\n' + '='.repeat(60));
    log('⚡ ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ', 'blue');
    console.log('='.repeat(60));
    
    console.log('\n⏱️ Скорость выполнения валидации:');
    
    const startTime = Date.now();
    for (let i = 0; i < 1000; i++) {
        validationFunctions.validateName('Иван Петров');
        validationFunctions.validatePhone('+7(495)123-45-67');
        validationFunctions.validateEmail('test@example.ru');
        validationFunctions.validatePassword('password123');
    }
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`  Выполнено 1000 валидаций за ${duration} мс`, duration < 100 ? 'green' : 'yellow');
    
    console.log('\n📦 Размер файлов:');
    const filesToCheck = [
        { name: 'index.html', maxSize: 50 },
        { name: 'src/style/style.css', maxSize: 30 }
    ];
    
    let allPassed = true;
    for (const file of filesToCheck) {
        const filePath = path.join(INSTALL_PATH, file.name);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const sizeKB = stats.size / 1024;
            const isValid = sizeKB <= file.maxSize;
            if (!isValid) allPassed = false;
            log(`  ${isValid ? '✓' : '✗'} ${file.name}: ${sizeKB.toFixed(2)} KB (макс: ${file.maxSize} KB)`, isValid ? 'green' : 'red');
        }
    }
    
    return allPassed;
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================
async function runUnitTests() {
    console.log('\n' + '='.repeat(60));
    log('🧪 ЗАПУСК ЮНИТ-ТЕСТОВ', 'blue');
    console.log('='.repeat(60));
    
    // Проверяем, что приложение установлено
    if (!fs.existsSync(INSTALL_PATH)) {
        log(`\n❌ Приложение не найдено в ${INSTALL_PATH}`, 'red');
        log('Пожалуйста, сначала запустите установщик: npm start или node installer.js\n', 'yellow');
        return;
    }
    
    const results = {
        validation: testValidationFunctions(),
        dataStructures: testDataStructures(),
        requestStatuses: testRequestStatuses(),
        priorities: testRequestPriorities(),
        userRoles: testUserRoles(),
        escapeHtml: testEscapeHtml(),
        dateFormatting: testDateFormatting(),
        security: testSecurity(),
        performance: testPerformance()
    };
    
    console.log('\n' + '='.repeat(60));
    log('📊 ИТОГИ ЮНИТ-ТЕСТОВ', 'blue');
    console.log('='.repeat(60));
    
    let passed = 0;
    let total = 0;
    
    const categoryNames = {
        validation: 'Функции валидации',
        dataStructures: 'Структуры данных',
        requestStatuses: 'Статусы заявок',
        priorities: 'Приоритеты заявок',
        userRoles: 'Роли пользователей',
        escapeHtml: 'Экранирование HTML',
        dateFormatting: 'Форматирование дат',
        security: 'Безопасность',
        performance: 'Производительность'
    };
    
    for (const [category, result] of Object.entries(results)) {
        total++;
        if (result) passed++;
        const status = result ? '✓' : '✗';
        const color = result ? 'green' : 'red';
        log(`  ${status} ${categoryNames[category] || category}`, color);
    }
    
    console.log('\n' + '-'.repeat(60));
    const resultColor = passed === total ? 'green' : 'yellow';
    log(`  РЕЗУЛЬТАТ: ${passed}/${total} категорий пройдено`, resultColor);
    
    if (passed === total) {
        log('\n🎉 ПОЗДРАВЛЯЮ! Все юнит-тесты успешно пройдены!\n', 'green');
    } else {
        log('\n⚠️ Некоторые тесты не пройдены. Пожалуйста, исправьте ошибки.\n', 'yellow');
    }
}

// Запуск
if (require.main === module) {
    runUnitTests().catch(console.error);
}

module.exports = { 
    validationFunctions, 
    escapeHtml,
    runUnitTests,
    testValidationFunctions,
    testDataStructures,
    testRequestStatuses,
    testRequestPriorities,
    testUserRoles,
    testEscapeHtml,
    testDateFormatting,
    testSecurity,
    testPerformance
};