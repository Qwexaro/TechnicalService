// installer.js - ИСПРАВЛЕННАЯ ВЕРСИЯ (исправлен цвет текста диспетчера)
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const INSTALL_PATH = path.join(os.homedir(), 'TechnicalServiceSystem');
const PORT = 8080;


console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║     🔧 УСТАНОВЩИК СИСТЕМЫ УПРАВЛЕНИЯ ЗАЯВКАМИ НА ТО             ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');
console.log(`📂 Папка установки: ${INSTALL_PATH}\n`);

function createDirectories() {
    const dirs = ['', 'src', 'src/scripts', 'src/scripts/database', 'src/scripts/database/init',
        'src/scripts/data', 'src/scripts/data/classes', 'src/scripts/alerts',
        'src/scripts/modals', 'src/scripts/modals/close', 'src/scripts/modals/show',
        'src/scripts/login', 'src/scripts/login/show', 'src/scripts/register', 'src/scripts/register/show',
        'src/scripts/request', 'src/scripts/request/show', 'src/scripts/request/submit',
        'src/scripts/request/view', 'src/scripts/request/approve', 'src/scripts/request/complete',
        'src/scripts/request/assign', 'src/scripts/rejects', 'src/scripts/rejects/confirm',
        'src/scripts/rejects/show', 'src/scripts/review', 'src/scripts/review/show',
        'src/scripts/review/submit', 'src/scripts/engineer', 'src/scripts/engineer/add',
        'src/scripts/engineer/delete', 'src/scripts/engineer/edit', 'src/scripts/logout',
        'src/scripts/renders', 'src/style'];
    
    console.log('📁 Создание структуры папок...');
    for (const dir of dirs) {
        const fullPath = path.join(INSTALL_PATH, dir);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    }
    console.log('  ✓ Папки созданы\n');
}

// ИСПРАВЛЕННАЯ функция escapeHtml
const escapeHtmlFn = `function escapeHtml(str){if(!str)return '';return str.replace(/[&<>]/g,function(m){if(m==='&')return '&amp;';if(m==='<')return '&lt;';if(m==='>')return '&gt;';return m;}).replace(/"/g,'&quot;').replace(/'/g,'&#39;')}`;

// ИСПРАВЛЕННЫЕ функции валидации
const validationFunctions = `
// Функции валидации (ИСПРАВЛЕННЫЕ)
function validateName(name){if(!name || name.trim()==='')return false;return /^[а-яА-Яa-zA-Z\\s-]+$/.test(name.trim());}
function validatePhone(phone){if(!phone)return false;var cleaned = phone.replace(/[\\s\\(\\)\\-]/g,'');return /^[\\+\\d]{10,15}$/.test(cleaned);}
function validateEmail(email){if(!email)return false;return /^[^\\s@]+@([^\\s@]+\\.)+[^\\s@]+$/.test(email) && !/[<>'"]/.test(email);}
function validatePassword(pwd){return pwd && pwd.length>=4 && pwd.trim().length>=4;}
function validateCompanyName(name){if(!name || name.trim()==='')return false;return /^[\\w\\s\\-\\.\\u0400-\\u04FF"]+$/.test(name.trim());}
function validateEquipmentType(type){return type && type.trim().length>=2;}
function validateRequestTitle(title){return title && title.trim().length>=3;}
function validateComment(comment){return comment && comment.trim().length>=3;}
function validateReviewComment(comment){return comment && comment.trim().length>=3;}
`;

const files = {
    'index.html': `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Система управления заявками на ТО</title><link rel="stylesheet" href="src/style/style.css"></head>
<body>
<div class="navbar"><div class="logo">🔧 Система управления заявками на ТО</div><div class="nav-links" id="navLinks"><button class="button button-primary" onclick="showLogin()">Вход</button><button class="button button-primary" onclick="showRegister()">Регистрация компании</button></div></div>
<div class="container" id="mainContent"></div>

<!-- Модальные окна -->
<div id="loginModal" class="modal"><div class="modal-content"><h2>Вход в систему</h2><div id="loginAlert" class="alert"></div><div class="form-group"><label>Логин/Email/Компания</label><input type="text" id="loginUsername"></div><div class="form-group"><label>Пароль</label><input type="password" id="loginPassword"></div><button class="button button-primary" onclick="login()">Войти</button><button class="button" onclick="closeModal('loginModal')">Отмена</button></div></div>

<div id="registerModal" class="modal"><div class="modal-content"><h2>Регистрация компании</h2><div id="registerAlert" class="alert"></div><div class="form-group"><label>Название компании *</label><input type="text" id="regCompanyName"></div><div class="form-group"><label>Контактное лицо *</label><input type="text" id="regContactPerson"></div><div class="form-group"><label>Телефон *</label><input type="tel" id="regPhone"></div><div class="form-group"><label>Email *</label><input type="email" id="regEmail"></div><div class="form-group"><label>Пароль *</label><input type="password" id="regPassword"></div><button class="button button-primary" onclick="register()">Зарегистрировать</button><button class="button" onclick="closeModal('registerModal')">Отмена</button></div></div>

<div id="requestModal" class="modal"><div class="modal-content"><h2>📝 Новая заявка</h2><div class="form-group"><label>Название *</label><input type="text" id="requestTitle"></div><div class="form-group"><label>Тип оборудования *</label><input type="text" id="requestEquipment"></div><div class="form-group"><label>Описание *</label><textarea id="requestDescription" rows="3"></textarea></div><div class="form-group"><label>Приоритет</label><select id="requestPriority"><option value="low">🟢 Низкий</option><option value="medium" selected>🟡 Средний</option><option value="high">🟠 Высокий</option><option value="urgent">🔴 Срочный</option></select></div><div class="form-group"><label>Срок выполнения</label><input type="date" id="requestDueDate"></div><button class="button button-primary" onclick="submitRequest()">Отправить</button><button class="button" onclick="closeModal('requestModal')">Отмена</button></div></div>

<div id="requestDetailModal" class="modal"><div class="modal-content" style="max-width:600px"><h2>Детали заявки</h2><div id="requestDetailContent"></div><div id="requestActions"></div><button class="button" onclick="closeModal('requestDetailModal')">Закрыть</button></div></div>

<div id="rejectModal" class="modal"><div class="modal-content"><h2>Отклонение</h2><textarea id="rejectReason" rows="3" placeholder="Причина отклонения"></textarea><button class="button btn-danger" onclick="confirmReject()">Отклонить</button><button class="button" onclick="closeModal('rejectModal')">Отмена</button></div></div>

<div id="reviewModal" class="modal"><div class="modal-content"><h2>⭐ Отзыв</h2><select id="reviewRating"><option value="5">⭐⭐⭐⭐⭐ Отлично</option><option value="4">⭐⭐⭐⭐ Хорошо</option><option value="3">⭐⭐⭐ Удовлетворительно</option><option value="2">⭐⭐ Плохо</option><option value="1">⭐ Ужасно</option></select><textarea id="reviewComment" rows="3" placeholder="Комментарий"></textarea><button class="button button-primary" onclick="submitReview()">Отправить</button><button class="button" onclick="closeModal('reviewModal')">Отмена</button></div></div>

<div id="engineerModal" class="modal"><div class="modal-content"><h2 id="engineerModalTitle">Добавить инженера</h2><div class="form-group"><label>ФИО *</label><input type="text" id="engineerFullName"></div><div class="form-group"><label>Специализация *</label><input type="text" id="engineerSpecialization"></div><div class="form-group"><label>Телефон</label><input type="tel" id="engineerPhone"></div><div class="form-group"><label>Email</label><input type="email" id="engineerEmail"></div><div class="form-group"><label>Квалификация</label><input type="text" id="engineerQualification"></div><div class="form-group"><label>Пароль *</label><input type="password" id="engineerPassword"></div><button class="button button-primary" onclick="saveEngineer()">Сохранить</button><button class="button" onclick="closeModal('engineerModal')">Отмена</button></div></div>

<div id="assignEngineerModal" class="modal"><div class="modal-content"><h2>Назначить инженера</h2><select id="assignEngineerSelect"></select><button class="button button-primary" onclick="assignEngineer()">Назначить</button><button class="button" onclick="closeModal('assignEngineerModal')">Отмена</button></div></div>

<div id="changePasswordModal" class="modal"><div class="modal-content"><h2>Смена пароля</h2><div id="changePwdAlert" class="alert"></div><div class="form-group"><label>Новый пароль</label><input type="password" id="newPassword"></div><div class="form-group"><label>Подтверждение пароля</label><input type="password" id="confirmPassword"></div><button class="button button-primary" onclick="changePassword()">Сохранить</button><button class="button" onclick="closeModal('changePasswordModal')">Отмена</button></div></div>

<script src="src/scripts/database/db.js"></script>
<script src="src/scripts/data/classes/Customer.js"></script>
<script src="src/scripts/data/classes/Engineer.js"></script>
<script src="src/scripts/data/classes/TechnicalRequest.js"></script>
<script src="src/scripts/data/classes/Review.js"></script>
<script src="src/scripts/alerts/showAlert.js"></script>
<script src="src/scripts/modals/close/closeModal.js"></script>
<script src="src/scripts/modals/show/showModal.js"></script>
<script src="src/scripts/login/show/showLogin.js"></script>
<script src="src/scripts/login/Login.js"></script>
<script src="src/scripts/register/show/showRegister.js"></script>
<script src="src/scripts/register/register.js"></script>
<script src="src/scripts/request/show/showRequestModal.js"></script>
<script src="src/scripts/request/submit/submitRequest.js"></script>
<script src="src/scripts/request/view/viewRequestDetail.js"></script>
<script src="src/scripts/request/approve/approveRequest.js"></script>
<script src="src/scripts/request/complete/completeRequest.js"></script>
<script src="src/scripts/request/assign/assignEngineer.js"></script>
<script src="src/scripts/rejects/confirm/confirmReject.js"></script>
<script src="src/scripts/rejects/show/showRejectModal.js"></script>
<script src="src/scripts/review/show/showReviewModal.js"></script>
<script src="src/scripts/review/submit/submitReview.js"></script>
<script src="src/scripts/engineer/add/addEngineer.js"></script>
<script src="src/scripts/engineer/delete/deleteEngineer.js"></script>
<script src="src/scripts/engineer/edit/editEngineer.js"></script>
<script src="src/scripts/logout/logout.js"></script>
<script src="src/scripts/renders/renderGuestView.js"></script>
<script src="src/scripts/renders/renderCustomerView.js"></script>
<script src="src/scripts/renders/renderEngineerView.js"></script>
<script src="src/scripts/renders/renderDispatcherView.js"></script>
<script src="src/scripts/renders/renderContent.js"></script>
<script src="src/scripts/database/init/initData.js"></script>
<script src="src/scripts/script.js"></script>
</body>
</html>`,

    // ИСПРАВЛЕННЫЙ CSS - добавлен контрастный цвет для текста диспетчера и других элементов
    'src/style/style.css': `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh}
.navbar{background:white;padding:1rem 2rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;position:sticky;top:0;z-index:100;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.logo{font-size:1.5rem;font-weight:bold;color:#667eea}
.button{padding:0.5rem 1rem;border:none;border-radius:8px;cursor:pointer;transition:all 0.2s}
.button-primary{background:#667eea;color:white}
.button-primary:hover{transform:scale(1.05)}
.btn-danger{background:#ef4444;color:white}
.button-success{background:#10b981;color:white}
.container{max-width:1200px;margin:0 auto;padding:2rem}
.form-group{margin-bottom:1rem}
.form-group label{display:block;margin-bottom:0.5rem;font-weight:500}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:8px}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:1000}
.modal-content{background:white;border-radius:16px;padding:2rem;max-width:500px;width:90%;max-height:80vh;overflow-y:auto}
.alert{padding:0.75rem;border-radius:8px;margin-bottom:1rem;display:none}
.alert-success{background:#d1fae5;color:#065f46}
.alert-error{background:#fee2e2;color:#991b1b}
.admin-section{background:white;border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.admin-section h3{margin-bottom:1rem;color:#333}
.requests-table{width:100%;overflow-x:auto;margin-top:1rem}
.requests-table table{width:100%;border-collapse:collapse}
.requests-table th,.requests-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #e2e8f0}
.requests-table th{background:#f1f5f9;font-weight:600;color:#1e293b;font-size:0.9rem}
.requests-table td{font-size:0.9rem;vertical-align:middle}
.requests-table tr:hover td{background:#f8fafc}
.tabs-container{display:flex;gap:0.5rem;border-bottom:2px solid #e2e8f0;margin-bottom:1.5rem;flex-wrap:wrap}
.tab-btn{padding:0.5rem 1rem;background:none;border:none;cursor:pointer;border-radius:8px 8px 0 0;font-size:0.9rem}
.tab-btn.active{color:#667eea;border-bottom:2px solid #667eea;background:#eef2ff}
.stats{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}
.stat-card{background:#f8fafc;padding:1rem;border-radius:8px;flex:1;text-align:center;min-width:100px}
.stat-card:hover{background:#eef2ff}
.stat-number{font-size:1.8rem;font-weight:bold;color:#667eea}
.stat-label{font-size:0.8rem;color:#666;margin-top:0.25rem}
.user-menu{display:flex;align-items:center;gap:1rem}
.user-menu span{color:#1e293b;font-weight:600;background:#eef2ff;padding:0.25rem 0.75rem;border-radius:20px}
.engineer-card{background:#f8fafc;padding:0.75rem;margin-bottom:0.5rem;border-radius:8px;border-left:3px solid #667eea}
.engineer-card strong{color:#333}
.engineer-card .details{font-size:0.85rem;color:#666;margin-top:0.25rem;display:block}
.error-border{border-color:#ef4444 !important;background-color:#fef2f2}
.nav-links{display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap}
.nav-links span{color:#1e293b;font-weight:600;background:#eef2ff;padding:0.25rem 0.75rem;border-radius:20px}
@media(max-width:768px){.container{padding:1rem}.navbar{flex-direction:column}.modal-content{padding:1.5rem}.stat-card{padding:0.5rem}.stat-number{font-size:1.2rem}.tabs-container{flex-direction:column;gap:0}.tab-btn{border-radius:8px}.requests-table th,.requests-table td{padding:8px 12px}}`,

    'src/scripts/database/db.js': `class TechnicalServiceDB {
    constructor(){this.dbName='TechnicalServiceDB';this.dbVersion=8;this.db=null}
    async init(){return new Promise((r,j)=>{const req=indexedDB.open(this.dbName,this.dbVersion);req.onerror=e=>j(e.target.error);req.onsuccess=e=>{this.db=e.target.result;r(this.db)};req.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains('customers')){const s=db.createObjectStore('customers',{keyPath:'id',autoIncrement:true});s.createIndex('companyName','companyName',{unique:true})}if(!db.objectStoreNames.contains('engineers')){db.createObjectStore('engineers',{keyPath:'id',autoIncrement:true})}if(!db.objectStoreNames.contains('requests')){db.createObjectStore('requests',{keyPath:'id',autoIncrement:true})}if(!db.objectStoreNames.contains('dispatcher')){db.createObjectStore('dispatcher',{keyPath:'id'})}if(!db.objectStoreNames.contains('reviews')){db.createObjectStore('reviews',{keyPath:'id',autoIncrement:true})}}})}
    async getAllCustomers(){return this._getAll('customers')}
    async getCustomerByCompanyName(n){const c=await this._getAll('customers');return c.find(c=>c.companyName===n)}
    async addCustomer(c){return this._add('customers',c)}
    async updateCustomer(c){return this._update('customers',c)}
    async getAllEngineers(){return this._getAll('engineers')}
    async addEngineer(e){return this._add('engineers',e)}
    async updateEngineer(e){return this._update('engineers',e)}
    async deleteEngineer(id){return this._delete('engineers',id)}
    async getAllRequests(){return this._getAll('requests')}
    async addRequest(r){return this._add('requests',r)}
    async updateRequest(r){return this._update('requests',r)}
    async deleteRequest(id){return this._delete('requests',id)}
    async getDispatcher(){const d=await this._getAll('dispatcher');return d[0]||null}
    async saveDispatcher(d){return this._update('dispatcher',d)}
    async getAllReviews(){return this._getAll('reviews')}
    async addReview(r){return this._add('reviews',r)}
    async _getAll(s){if(!this.db)return[];return new Promise((r,j)=>{try{const t=this.db.transaction([s],'readonly');const req=t.objectStore(s).getAll();req.onsuccess=()=>r(req.result||[]);req.onerror=()=>j(req.error)}catch(e){r([])}})}
    async _add(s,d){return new Promise((r,j)=>{if(!this.db)j('DB not init');const t=this.db.transaction([s],'readwrite');const req=t.objectStore(s).add(d);req.onsuccess=()=>r(req.result);req.onerror=()=>j(req.error)})}
    async _update(s,d){return new Promise((r,j)=>{if(!this.db)j('DB not init');const t=this.db.transaction([s],'readwrite');const req=t.objectStore(s).put(d);req.onsuccess=()=>r(req.result);req.onerror=()=>j(req.error)})}
    async _delete(s,id){return new Promise((r,j)=>{if(!this.db)j('DB not init');const t=this.db.transaction([s],'readwrite');const req=t.objectStore(s).delete(id);req.onsuccess=()=>r();req.onerror=()=>j(req.error)})}
    async deleteDatabase(){return new Promise((r,j)=>{const req=indexedDB.deleteDatabase(this.dbName);req.onsuccess=()=>{this.db=null;r()};req.onerror=()=>j(req.error)})}}
const techDB=new TechnicalServiceDB();`,

    'src/scripts/database/init/initData.js': `const initData=async()=>{try{await techDB.init();let d=await techDB.getDispatcher();if(!d){d={id:0,userName:'dispatcher',password:'dispatcher123',fullName:'Диспетчер',isAdmin:true,firstLogin:true};await techDB.saveDispatcher(d)}let cdb=await techDB.getAllCustomers();if(!cdb||cdb.length===0){const initC=[{companyName:'ТехноПром Сервис',contactPerson:'Иван Петров',phone:'+7(495)123-45-67',email:'info@technoprom.ru',password:'company123',firstLogin:true},{companyName:'ЭнергоТех',contactPerson:'Сергей Иванов',phone:'+7(812)765-43-21',email:'contact@energotech.ru',password:'company123',firstLogin:true},{companyName:'ПромРешения',contactPerson:'Алексей Сидоров',phone:'+7(343)987-65-43',email:'info@promreshenie.ru',password:'company123',firstLogin:true}];for(const c of initC){const id=await techDB.addCustomer(c);customers.push(new Customer(id,c.companyName,c.contactPerson,c.phone,c.email,c.password))}}else{customers=cdb.map(c=>new Customer(c.id,c.companyName,c.contactPerson,c.phone,c.email,c.password))}let edb=await techDB.getAllEngineers();if(!edb||edb.length===0){edb=[]}engineers=edb.map(e=>new Engineer(e.id,e.fullName,e.specialization,e.phone,e.email,e.password,e.qualification));let rdb=await techDB.getAllRequests();if(!rdb||rdb.length===0){rdb=[]}requests=rdb.map(r=>{const req=new TechnicalRequest(r.id,r.customerId,r.title,r.description,r.equipmentType,r.priority,new Date(r.dueDate));req.status=r.status;req.engineerId=r.engineerId;req.rejectReason=r.rejectReason||'';req.customerCompanyName=r.customerCompanyName;return req});let rvdb=await techDB.getAllReviews();reviews=rvdb||[];renderContent()}catch(e){console.error(e);showAlert('Ошибка загрузки данных','error')}};
window.resetDatabase=async()=>{await techDB.deleteDatabase();localStorage.clear();sessionStorage.clear();location.reload()};`,

    'src/scripts/data/classes/Customer.js': `class Customer{constructor(id,companyName,contactPerson,phone,email,password,address,inn){this.id=id;this.companyName=companyName;this.contactPerson=contactPerson;this.phone=phone;this.email=email;this.password=password;this.address=address||'';this.inn=inn||'';this.createdAt=new Date();this.isActive=true;this.firstLogin=false}}`,
    'src/scripts/data/classes/Engineer.js': `class Engineer{constructor(id,fullName,specialization,phone,email,password,qualification){this.id=id;this.fullName=fullName;this.specialization=specialization;this.phone=phone||'';this.email=email||'';this.password=password;this.qualification=qualification||'';this.isActive=true;this.createdAt=new Date();this.completedRequests=0;this.firstLogin=false}}`,
    'src/scripts/data/classes/TechnicalRequest.js': `class TechnicalRequest{constructor(id,customerId,title,description,equipmentType,priority,dueDate){this.id=id;this.customerId=customerId;this.title=title;this.description=description;this.equipmentType=equipmentType;this.priority=priority;this.status='pending';this.engineerId=null;this.createdAt=new Date();this.updatedAt=new Date();this.dueDate=dueDate;this.completedAt=null;this.rejectReason='';this.customerCompanyName=''}}`,
    'src/scripts/data/classes/Review.js': `class Review{constructor(id,requestId,customerId,rating,comment){this.id=id;this.requestId=requestId;this.customerId=customerId;this.rating=rating;this.comment=comment;this.createdAt=new Date()}}`,

    'src/scripts/alerts/showAlert.js': `let showAlert=(message,type)=>{const a=document.createElement('div');a.className='alert alert-'+type;a.textContent=message;a.style.display='block';document.querySelector('.container').insertBefore(a,document.querySelector('.container').firstChild);setTimeout(()=>a.remove(),3000)}`,
    'src/scripts/modals/close/closeModal.js': `let closeModal=(id)=>{const el=document.getElementById(id);if(el)el.style.display='none'}`,
    'src/scripts/modals/show/showModal.js': `let showModal=(id)=>{const el=document.getElementById(id);if(el)el.style.display='flex'}`,

    'src/scripts/login/show/showLogin.js': `let showLogin=()=>{document.getElementById('loginUsername').value='';document.getElementById('loginPassword').value='';showModal('loginModal')}`,
    'src/scripts/login/Login.js': `let login=async()=>{const u=document.getElementById('loginUsername').value,p=document.getElementById('loginPassword').value;const d=await techDB.getDispatcher();if(d&&u===d.userName&&p===d.password){currentUser={id:d.id,userName:d.userName,fullName:d.fullName,isAdmin:true,role:'dispatcher',firstLogin:d.firstLogin===true};saveUserSession(currentUser);closeModal('loginModal');if(currentUser.firstLogin===true){showAlert('Необходимо сменить пароль при первом входе','warning');showChangePasswordModal();}else{renderContent()}return}const eng=engineers.find(e=>(e.email===u||e.fullName===u)&&e.password===p);if(eng&&eng.isActive){currentUser={id:eng.id,fullName:eng.fullName,specialization:eng.specialization,role:'engineer',completedRequests:eng.completedRequests,firstLogin:eng.firstLogin===true};saveUserSession(currentUser);closeModal('loginModal');if(currentUser.firstLogin===true){showAlert('Необходимо сменить пароль при первом входе','warning');showChangePasswordModal();}else{renderContent()}return}const cust=customers.find(c=>(c.email===u||c.companyName===u)&&c.password===p);if(cust){currentUser={id:cust.id,companyName:cust.companyName,role:'customer',firstLogin:cust.firstLogin===true};saveUserSession(currentUser);closeModal('loginModal');if(currentUser.firstLogin===true){showAlert('Необходимо сменить пароль при первом входе','warning');showChangePasswordModal();}else{renderContent()}return}const a=document.getElementById('loginAlert');a.textContent='Неверные данные';a.className='alert alert-error';a.style.display='block';setTimeout(()=>a.style.display='none',3000)}`,

    'src/scripts/logout/logout.js': `let logout=()=>{currentUser=null;saveUserSession(null);renderContent();showAlert('Вы вышли','success')}`,

    'src/scripts/register/show/showRegister.js': `let showRegister=()=>{const fields=['regCompanyName','regContactPerson','regPhone','regEmail','regPassword'];fields.forEach(f=>{const el=document.getElementById(f);if(el)el.value=''});const alertDiv=document.getElementById('registerAlert');if(alertDiv)alertDiv.style.display='none';showModal('registerModal')}`,
    'src/scripts/register/register.js': `let register=async()=>{const n=document.getElementById('regCompanyName')?.value,cp=document.getElementById('regContactPerson')?.value,ph=document.getElementById('regPhone')?.value,em=document.getElementById('regEmail')?.value,pw=document.getElementById('regPassword')?.value;if(!n||!cp||!ph||!em||!pw){showAlert('Заполните все поля','error');return}if(!validateCompanyName(n)){showAlert('Название компании содержит недопустимые символы','error');return}if(!validateName(cp)){showAlert('Контактное лицо должно содержать только буквы','error');return}if(!validatePhone(ph)){showAlert('Введите корректный номер телефона','error');return}if(!validateEmail(em)){showAlert('Введите корректный email','error');return}if(!validatePassword(pw)){showAlert('Пароль должен быть не менее 4 символов','error');return}const existing=await techDB.getCustomerByCompanyName(n);if(existing){showAlert('Компания уже зарегистрирована','error');return}const id=await techDB.addCustomer({companyName:n,contactPerson:cp,phone:ph,email:em,password:pw,firstLogin:true});customers.push(new Customer(id,n,cp,ph,em,pw));closeModal('registerModal');showAlert('Регистрация успешна! Пожалуйста, войдите','success')}`,

    'src/scripts/request/show/showRequestModal.js': `let showRequestModal=()=>{const t=new Date(),di=document.getElementById('requestDueDate');if(di){di.min=t.toISOString().split('T')[0];di.value=t.toISOString().split('T')[0]}document.getElementById('requestTitle').value='';document.getElementById('requestEquipment').value='';document.getElementById('requestDescription').value='';document.getElementById('requestPriority').value='medium';showModal('requestModal')}`,
    'src/scripts/request/submit/submitRequest.js': `let submitRequest=async()=>{if(!currentUser||currentUser.role!=='customer'){showAlert('Войдите как компания','error');closeModal('requestModal');return}const t=document.getElementById('requestTitle')?.value,eq=document.getElementById('requestEquipment')?.value,d=document.getElementById('requestDescription')?.value,p=document.getElementById('requestPriority')?.value,dd=document.getElementById('requestDueDate')?.value;if(!t||!eq||!d||!dd){showAlert('Заполните все поля','error');return}if(!validateRequestTitle(t)){showAlert('Название заявки должно быть не менее 3 символов','error');return}if(!validateEquipmentType(eq)){showAlert('Укажите тип оборудования','error');return}const selectedDate=new Date(dd),today=new Date();today.setHours(0,0,0,0);if(selectedDate<today){showAlert('Дата не может быть в прошлом','error');return}const id=await techDB.addRequest({customerId:currentUser.id,title:t,description:d,equipmentType:eq,priority:p,dueDate:new Date(dd),status:'pending',customerCompanyName:currentUser.companyName,createdAt:new Date(),updatedAt:new Date()});const req=new TechnicalRequest(id,currentUser.id,t,d,eq,p,new Date(dd));req.customerCompanyName=currentUser.companyName;requests.push(req);closeModal('requestModal');showAlert('Заявка создана','success');renderContent()}`,
    'src/scripts/request/view/viewRequestDetail.js': `let viewRequestDetail=(id)=>{const r=requests.find(x=>x.id===id);if(!r){showAlert('Заявка не найдена','error');return}const pn={low:'🟢 Низкий',medium:'🟡 Средний',high:'🟠 Высокий',urgent:'🔴 Срочный'},sn={pending:'⏳ На рассмотрении',approved:'✅ Одобрена',in_progress:'🔧 В работе',completed:'✔️ Выполнена',rejected:'❌ Отклонена'},eng=r.engineerId?engineers.find(e=>e.id===r.engineerId):null;const contentDiv=document.getElementById('requestDetailContent');if(contentDiv){contentDiv.innerHTML='<h3 style="margin-bottom:1rem">'+escapeHtml(r.title)+'</h3><div class="form-group"><label>🏢 Компания:</label><p>'+escapeHtml(r.customerCompanyName)+'</p></div><div class="form-group"><label>🔧 Оборудование:</label><p>'+escapeHtml(r.equipmentType)+'</p></div><div class="form-group"><label>📝 Описание:</label><p style="background:#f8fafc;padding:0.75rem;border-radius:8px">'+escapeHtml(r.description)+'</p></div><div class="form-group"><label>⏰ Срок:</label><p>'+new Date(r.dueDate).toLocaleDateString()+'</p></div>'+(eng?'<div class="form-group"><label>👨‍🔧 Инженер:</label><p>'+escapeHtml(eng.fullName)+'</p></div>':'')+(r.rejectReason?'<div class="form-group"><label>❌ Причина отказа:</label><p style="color:#ef4444">'+escapeHtml(r.rejectReason)+'</p></div>':'')}const actionsDiv=document.getElementById('requestActions');if(actionsDiv){actionsDiv.innerHTML='';if(currentUser&&currentUser.isAdmin){if(r.status==='pending')actionsDiv.innerHTML+='<button class="button button-success" onclick="approveRequest('+r.id+')">✅ Одобрить</button><button class="button btn-danger" onclick="showRejectModal('+r.id+')">❌ Отклонить</button>';if(r.status==='approved'&&!r.engineerId)actionsDiv.innerHTML+='<button class="button button-primary" onclick="showAssignEngineerModal('+r.id+')">👨‍🔧 Назначить</button>'}if(currentUser&&currentUser.role==='engineer'){if(r.engineerId===currentUser.id&&r.status==='approved')actionsDiv.innerHTML+='<button class="button button-primary" onclick="startWorkRequest('+r.id+')">🔧 Начать</button>';if(r.engineerId===currentUser.id&&r.status==='in_progress')actionsDiv.innerHTML+='<button class="button button-success" onclick="completeRequest('+r.id+')">✅ Завершить</button>'}if(currentUser&&currentUser.role==='customer'&&r.status==='completed'){if(!reviews.find(rev=>rev.requestId===r.id))actionsDiv.innerHTML+='<button class="button button-primary" onclick="showReviewModal('+r.id+')">⭐ Отзыв</button>'}if(currentUser&&currentUser.role==='customer'&&(r.status==='pending'||r.status==='approved'))actionsDiv.innerHTML+='<button class="button btn-danger" onclick="cancelRequest('+r.id+')">❌ Отменить</button>'}showModal('requestDetailModal')};${escapeHtmlFn}`,
    'src/scripts/request/approve/approveRequest.js': `let approveRequest=async(id)=>{const r=requests.find(x=>x.id===id);if(r&&r.status==='pending'){r.status='approved';r.updatedAt=new Date();await techDB.updateRequest({id:r.id,customerId:r.customerId,title:r.title,description:r.description,equipmentType:r.equipmentType,priority:r.priority,status:r.status,engineerId:r.engineerId,dueDate:r.dueDate,rejectReason:r.rejectReason,customerCompanyName:r.customerCompanyName,updatedAt:r.updatedAt});showAlert('Заявка одобрена','success');closeModal('requestDetailModal');renderContent()}}`,
    'src/scripts/request/complete/completeRequest.js': `let startWorkRequest=async(id)=>{const r=requests.find(x=>x.id===id);if(r&&r.status==='approved'&&r.engineerId===currentUser.id){r.status='in_progress';r.updatedAt=new Date();await techDB.updateRequest({id:r.id,customerId:r.customerId,title:r.title,description:r.description,equipmentType:r.equipmentType,priority:r.priority,status:r.status,engineerId:r.engineerId,dueDate:r.dueDate,rejectReason:r.rejectReason,customerCompanyName:r.customerCompanyName,updatedAt:r.updatedAt});showAlert('Работа начата','success');closeModal('requestDetailModal');renderContent()}};let completeRequest=async(id)=>{const r=requests.find(x=>x.id===id);if(r&&r.status==='in_progress'&&r.engineerId===currentUser.id){r.status='completed';r.completedAt=new Date();r.updatedAt=new Date();const e=engineers.find(x=>x.id===currentUser.id);if(e){e.completedRequests++;await techDB.updateEngineer({id:e.id,fullName:e.fullName,specialization:e.specialization,phone:e.phone,email:e.email,password:e.password,qualification:e.qualification,isActive:e.isActive,completedRequests:e.completedRequests})}await techDB.updateRequest({id:r.id,customerId:r.customerId,title:r.title,description:r.description,equipmentType:r.equipmentType,priority:r.priority,status:r.status,engineerId:r.engineerId,dueDate:r.dueDate,rejectReason:r.rejectReason,customerCompanyName:r.customerCompanyName,completedAt:r.completedAt,updatedAt:r.updatedAt});showAlert('Заявка выполнена','success');closeModal('requestDetailModal');renderContent()}};let cancelRequest=async(id)=>{const r=requests.find(x=>x.id===id);if(r&&(r.status==='pending'||r.status==='approved')){if(confirm('Отменить заявку?')){r.status='cancelled';r.updatedAt=new Date();await techDB.updateRequest({id:r.id,customerId:r.customerId,title:r.title,description:r.description,equipmentType:r.equipmentType,priority:r.priority,status:r.status,engineerId:r.engineerId,dueDate:r.dueDate,rejectReason:r.rejectReason,customerCompanyName:r.customerCompanyName,updatedAt:r.updatedAt});showAlert('Заявка отменена','warning');closeModal('requestDetailModal');renderContent()}}}`,
    'src/scripts/request/assign/assignEngineer.js': `let currentAssignId=null;let showAssignEngineerModal=async(id)=>{currentAssignId=id;const sel=document.getElementById('assignEngineerSelect');if(sel){sel.innerHTML='<option value="">-- Выберите инженера --</option>'+engineers.filter(e=>e.isActive).map(e=>'<option value="'+e.id+'">'+escapeHtml(e.fullName)+' - '+escapeHtml(e.specialization)+' (Выполнено: '+e.completedRequests+')</option>').join('')}showModal('assignEngineerModal')};let assignEngineer=async()=>{const eid=parseInt(document.getElementById('assignEngineerSelect')?.value);if(!eid){showAlert('Выберите инженера','error');return}const r=requests.find(x=>x.id===currentAssignId);if(r){r.engineerId=eid;r.updatedAt=new Date();await techDB.updateRequest({id:r.id,customerId:r.customerId,title:r.title,description:r.description,equipmentType:r.equipmentType,priority:r.priority,status:r.status,engineerId:r.engineerId,dueDate:r.dueDate,rejectReason:r.rejectReason,customerCompanyName:r.customerCompanyName,updatedAt:r.updatedAt});showAlert('Инженер назначен','success');closeModal('assignEngineerModal');closeModal('requestDetailModal');renderContent()}};${escapeHtmlFn}`,

    'src/scripts/rejects/confirm/confirmReject.js': `let confirmReject=async()=>{const r=document.getElementById('rejectReason')?.value;if(!r||!r.trim()){showAlert('Укажите причину отклонения','error');return}const req=requests.find(x=>x.id===window.currentRejectId);if(req){req.status='rejected';req.rejectReason=r.trim();req.updatedAt=new Date();await techDB.updateRequest({id:req.id,customerId:req.customerId,title:req.title,description:req.description,equipmentType:req.equipmentType,priority:req.priority,status:req.status,engineerId:req.engineerId,dueDate:req.dueDate,rejectReason:req.rejectReason,customerCompanyName:req.customerCompanyName,updatedAt:req.updatedAt});showAlert('Заявка отклонена','warning');closeModal('rejectModal');renderContent()}}`,
    'src/scripts/rejects/show/showRejectModal.js': `let showRejectModal=(id)=>{window.currentRejectId=id;const el=document.getElementById('rejectReason');if(el)el.value='';showModal('rejectModal')}`,

    'src/scripts/review/show/showReviewModal.js': `let showReviewModal=(id)=>{window.currentReviewId=id;const ratingEl=document.getElementById('reviewRating');if(ratingEl)ratingEl.value='5';const commentEl=document.getElementById('reviewComment');if(commentEl)commentEl.value='';showModal('reviewModal')}`,
    'src/scripts/review/submit/submitReview.js': `let submitReview=async()=>{const r=parseInt(document.getElementById('reviewRating')?.value||5),c=document.getElementById('reviewComment')?.value;if(!c||!c.trim()){showAlert('Оставьте комментарий','error');return}if(!validateReviewComment(c)){showAlert('Комментарий должен быть не менее 3 символов','error');return}await techDB.addReview({requestId:window.currentReviewId,customerId:currentUser.id,rating:r,comment:c.trim(),createdAt:new Date()});showAlert('Спасибо за отзыв!','success');closeModal('reviewModal');renderContent()}`,

    'src/scripts/engineer/add/addEngineer.js': `let showAddEngineerModal=()=>{const fields=['engineerFullName','engineerSpecialization','engineerPhone','engineerEmail','engineerQualification','engineerPassword'];fields.forEach(f=>{const el=document.getElementById(f);if(el)el.value=''});const titleEl=document.getElementById('engineerModalTitle');if(titleEl)titleEl.textContent='Добавить инженера';window.currentEditId=null;showModal('engineerModal')};let saveEngineer=async()=>{const fn=document.getElementById('engineerFullName')?.value,sp=document.getElementById('engineerSpecialization')?.value,ph=document.getElementById('engineerPhone')?.value,em=document.getElementById('engineerEmail')?.value,q=document.getElementById('engineerQualification')?.value,pw=document.getElementById('engineerPassword')?.value;if(!fn||!sp||!pw){showAlert('Заполните обязательные поля','error');return}if(!validateName(fn)){showAlert('ФИО должно содержать только буквы','error');return}if(ph&&!validatePhone(ph)){showAlert('Введите корректный номер телефона','error');return}if(em&&!validateEmail(em)){showAlert('Введите корректный email','error');return}if(!validatePassword(pw)){showAlert('Пароль должен быть не менее 4 символов','error');return}if(window.currentEditId){const e=engineers.find(x=>x.id===window.currentEditId);if(e){e.fullName=fn.trim();e.specialization=sp.trim();if(ph)e.phone=ph.trim();if(em)e.email=em.trim();if(q)e.qualification=q.trim();if(pw)e.password=pw;await techDB.updateEngineer({id:e.id,fullName:e.fullName,specialization:e.specialization,phone:e.phone,email:e.email,password:e.password,qualification:e.qualification,isActive:e.isActive,completedRequests:e.completedRequests});showAlert('Инженер обновлен','success')}}else{const id=await techDB.addEngineer({fullName:fn.trim(),specialization:sp.trim(),phone:ph?ph.trim():'',email:em?em.trim():'',password:pw,qualification:q?q.trim():'',firstLogin:true});engineers.push(new Engineer(id,fn.trim(),sp.trim(),ph?ph.trim():'',em?em.trim():'',pw,q?q.trim():''));showAlert('Инженер добавлен','success')}closeModal('engineerModal');renderContent()}`,
    'src/scripts/engineer/delete/deleteEngineer.js': `let deleteEngineer=async(id)=>{const e=engineers.find(x=>x.id===id);if(e&&confirm('Удалить '+e.fullName+'?')){await techDB.deleteEngineer(id);const idx=engineers.findIndex(x=>x.id===id);if(idx!==-1)engineers.splice(idx,1);showAlert('Инженер удален','success');renderContent()}};let toggleEngineerStatus=async(id)=>{const e=engineers.find(x=>x.id===id);if(e){e.isActive=!e.isActive;await techDB.updateEngineer({id:e.id,fullName:e.fullName,specialization:e.specialization,phone:e.phone,email:e.email,password:e.password,qualification:e.qualification,isActive:e.isActive,completedRequests:e.completedRequests});showAlert('Статус изменен','success');renderContent()}}`,
    'src/scripts/engineer/edit/editEngineer.js': `let showEditEngineerModal=(id)=>{const e=engineers.find(x=>x.id===id);if(e){document.getElementById('engineerFullName').value=e.fullName;document.getElementById('engineerSpecialization').value=e.specialization;document.getElementById('engineerPhone').value=e.phone||'';document.getElementById('engineerEmail').value=e.email||'';document.getElementById('engineerQualification').value=e.qualification||'';document.getElementById('engineerPassword').value='';document.getElementById('engineerModalTitle').textContent='Редактировать инженера';window.currentEditId=id;showModal('engineerModal')}}`,

    'src/scripts/renders/renderGuestView.js': `let renderGuestView=c=>{c.innerHTML='<div class="admin-section" style="text-align:center;padding:3rem"><h2>🔧 Система управления заявками на ТО</h2><p>Авторизуйтесь для создания заявок</p><div class="stats" style="justify-content:center;margin-top:2rem"><div class="stat-card"><div class="stat-number">📋</div><div class="stat-label">Создание заявок</div></div><div class="stat-card"><div class="stat-number">✅</div><div class="stat-label">Одобрение</div></div><div class="stat-card"><div class="stat-number">🔧</div><div class="stat-label">Выполнение</div></div></div><div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem"><button class="button button-primary" onclick="showLogin()">Вход</button><button class="button button-primary" onclick="showRegister()">Регистрация</button></div></div>'}`,
    
    'src/scripts/renders/renderCustomerView.js': `let renderCustomerView=c=>{const ur=requests.filter(r=>r.customerId===currentUser.id);c.innerHTML='<h2>🏢 '+escapeHtml(currentUser.companyName)+'</h2><div class="admin-section"><h3>📊 Мои заявки</h3><div class="stats"><div class="stat-card"><div class="stat-number">'+ur.length+'</div><div class="stat-label">Всего</div></div><div class="stat-card"><div class="stat-number">'+ur.filter(r=>r.status==='pending').length+'</div><div class="stat-label">⏳ На рассмотрении</div></div><div class="stat-card"><div class="stat-number">'+ur.filter(r=>r.status==='in_progress').length+'</div><div class="stat-label">🔧 В работе</div></div><div class="stat-card"><div class="stat-number">'+ur.filter(r=>r.status==='completed').length+'</div><div class="stat-label">✔️ Выполнены</div></div></div></div><div class="admin-section"><h3>📋 Список заявок</h3><div class="requests-table"><table><thead><tr><th>ID</th><th>Название</th><th>Оборудование</th><th>Приоритет</th><th>Статус</th><th></th></tr></thead><tbody>'+(ur.length?ur.map(r=>'<tr><td>#'+r.id+'</td><td>'+escapeHtml(r.title)+'</td><td>'+escapeHtml(r.equipmentType)+'</td><td>'+(r.priority==='urgent'?'🔴 Срочный':r.priority==='high'?'🟠 Высокий':r.priority==='medium'?'🟡 Средний':'🟢 Низкий')+'</td><td><span style="color:'+(r.status==='completed'?'green':r.status==='rejected'?'red':'orange')+'">'+(r.status==='pending'?'⏳ На рассмотрении':r.status==='approved'?'✅ Одобрена':r.status==='in_progress'?'🔧 В работе':r.status==='completed'?'✔️ Выполнена':'❌ Отклонена')+'</span></td><td><button class="button button-primary" onclick="viewRequestDetail('+r.id+')">Просмотр</button></td></tr>').join(''):'<tr><td colspan="6" style="text-align:center">Нет заявок</td></tr>')+'</tbody></table></div></div><div style="text-align:center;margin-top:1rem"><button class="button button-primary" onclick="showRequestModal()" style="font-size:1rem;padding:0.75rem 1.5rem">➕ Новая заявка</button><button class="button" onclick="showChangePasswordModal()" style="margin-left:1rem">🔑 Сменить пароль</button></div>'}`,
    
    'src/scripts/renders/renderEngineerView.js': `let renderEngineerView=c=>{const mr=requests.filter(r=>r.engineerId===currentUser.id),av=requests.filter(r=>r.status==='approved'&&!r.engineerId);c.innerHTML='<h2>👨‍🔧 '+escapeHtml(currentUser.fullName)+' <span style="font-size:0.9rem;color:#666">('+escapeHtml(currentUser.specialization)+')</span></h2><div class="admin-section"><h3>📊 Моя статистика</h3><div class="stats"><div class="stat-card"><div class="stat-number">'+currentUser.completedRequests+'</div><div class="stat-label">Выполнено</div></div><div class="stat-card"><div class="stat-number">'+mr.filter(r=>r.status==='in_progress').length+'</div><div class="stat-label">В работе</div></div><div class="stat-card"><div class="stat-number">'+mr.filter(r=>r.status==='approved').length+'</div><div class="stat-label">Ожидают</div></div></div></div><div class="admin-section"><h3>📋 Мои заявки</h3><div class="requests-table"><table><thead><tr><th>ID</th><th>Компания</th><th>Оборудование</th><th>Приоритет</th><th>Статус</th><th></th></tr></thead><tbody>'+(mr.length?mr.map(r=>'<tr><td>#'+r.id+'</td><td>'+escapeHtml(r.customerCompanyName)+'</td><td>'+escapeHtml(r.equipmentType)+'</td><td>'+(r.priority==='urgent'?'🔴 Срочный':r.priority==='high'?'🟠 Высокий':r.priority==='medium'?'🟡 Средний':'🟢 Низкий')+'</td><td>'+(r.status==='approved'?'✅ Ожидает':r.status==='in_progress'?'🔧 В работе':'✔️ Выполнена')+'</td><td><button class="button button-primary" onclick="viewRequestDetail('+r.id+')">Просмотр</button></td></tr>').join(''):'<tr><td colspan="6" style="text-align:center">Нет заявок</td><tr>')+'</tbody></table></div></div><div class="admin-section"><h3>🆓 Доступные заявки</h3><div class="requests-table"><table><thead><tr><th>ID</th><th>Компания</th><th>Оборудование</th><th>Приоритет</th><th></th></tr></thead><tbody>'+(av.length?av.map(r=>'<tr><td>#'+r.id+'</td><td>'+escapeHtml(r.customerCompanyName)+'</td><td>'+escapeHtml(r.equipmentType)+'</td><td>'+(r.priority==='urgent'?'🔴 Срочный':r.priority==='high'?'🟠 Высокий':r.priority==='medium'?'🟡 Средний':'🟢 Низкий')+'</td><td><button class="button button-success" onclick="takeRequest('+r.id+')">🔧 Взять в работу</button></td></tr>').join(''):'<tr><td colspan="5" style="text-align:center">Нет доступных заявок</td></tr>')+'</tbody></table></div></div><div style="text-align:center;margin-top:1rem"><button class="button" onclick="showChangePasswordModal()">🔑 Сменить пароль</button></div>'}`,
    
    'src/scripts/renders/renderDispatcherView.js': `let renderDispatcherView=c=>{const p=requests.filter(r=>r.status==='pending'),a=requests.filter(r=>r.status==='approved'),ip=requests.filter(r=>r.status==='in_progress'),cm=requests.filter(r=>r.status==='completed'),rj=requests.filter(r=>r.status==='rejected');c.innerHTML='<div class="user-menu"><span>👨‍💼 Диспетчер: '+currentUser.fullName+'</span><button class="button" onclick="showChangePasswordModal()">🔑 Сменить пароль</button></div><h2>📊 Панель диспетчера</h2><div class="admin-section"><h3>Статистика</h3><div class="stats"><div class="stat-card"><div class="stat-number">'+p.length+'</div><div class="stat-label">⏳ Ожидают</div></div><div class="stat-card"><div class="stat-number">'+a.length+'</div><div class="stat-label">✅ Одобрены</div></div><div class="stat-card"><div class="stat-number">'+ip.length+'</div><div class="stat-label">🔧 В работе</div></div><div class="stat-card"><div class="stat-number">'+cm.length+'</div><div class="stat-label">✔️ Выполнены</div></div><div class="stat-card"><div class="stat-number">'+rj.length+'</div><div class="stat-label">❌ Отклонены</div></div></div></div><div class="admin-section"><div class="tabs-container"><button class="tab-btn active" onclick="showDispatcherRequests()">📋 Заявки</button><button class="tab-btn" onclick="showDispatcherEngineers()">👨‍🔧 Инженеры ('+engineers.filter(e=>e.isActive).length+')</button></div><div id="dispatcherRequests"><div class="requests-table"><table><thead><tr><th>ID</th><th>Компания</th><th>Оборудование</th><th>Приоритет</th><th>Статус</th><th></th></tr></thead><tbody>'+(requests.length?requests.map(r=>'<tr><td>#'+r.id+'</td><td>'+escapeHtml(r.customerCompanyName)+'</td><td>'+escapeHtml(r.equipmentType)+'</td><td>'+(r.priority==='urgent'?'🔴 Срочный':r.priority==='high'?'🟠 Высокий':r.priority==='medium'?'🟡 Средний':'🟢 Низкий')+'</td><td><span style="color:'+(r.status==='completed'?'green':r.status==='rejected'?'red':'orange')+'">'+(r.status==='pending'?'⏳ Ожидает':r.status==='approved'?'✅ Одобрена':r.status==='in_progress'?'🔧 В работе':r.status==='completed'?'✔️ Выполнена':'❌ Отклонена')+'</span></td><td><button class="button button-primary" onclick="viewRequestDetail('+r.id+')">Просмотр</button></td></tr>').join(''):'<tr><td colspan="6" style="text-align:center">Нет заявок</td></tr>')+'</tbody></table></div></div><div id="dispatcherEngineers" style="display:none"><button class="button button-primary" onclick="showAddEngineerModal()" style="margin-bottom:1rem">➕ Добавить инженера</button>'+(engineers.length?engineers.map(e=>'<div class="engineer-card"><strong>'+escapeHtml(e.fullName)+'</strong><span class="details">📞 '+escapeHtml(e.phone||'не указан')+' | 📧 '+escapeHtml(e.email||'не указан')+' | 🔧 '+escapeHtml(e.specialization)+' | 🎓 '+escapeHtml(e.qualification||'-')+' | ✅ Выполнено: '+e.completedRequests+' | '+(e.isActive?'🟢 Активен':'🔴 Неактивен')+'</span><div style="margin-top:0.5rem"><button class="button" onclick="showEditEngineerModal('+e.id+')">✏️ Редактировать</button><button class="button btn-danger" onclick="deleteEngineer('+e.id+')">🗑️ Удалить</button><button class="button '+(e.isActive?'btn-warning':'button-success')+'" onclick="toggleEngineerStatus('+e.id+')">'+(e.isActive?'🔴 Деактивировать':'🟢 Активировать')+'</button></div></div>').join(''):'<p>Нет инженеров. Нажмите "Добавить инженера"</p>')+'</div></div>'};window.showDispatcherRequests=()=>{const reqDiv=document.getElementById('dispatcherRequests');const engDiv=document.getElementById('dispatcherEngineers');if(reqDiv)reqDiv.style.display='block';if(engDiv)engDiv.style.display='none';document.querySelectorAll('.tab-btn').forEach((btn,i)=>btn.classList.toggle('active',i===0))};window.showDispatcherEngineers=()=>{const reqDiv=document.getElementById('dispatcherRequests');const engDiv=document.getElementById('dispatcherEngineers');if(reqDiv)reqDiv.style.display='none';if(engDiv)engDiv.style.display='block';document.querySelectorAll('.tab-btn').forEach((btn,i)=>btn.classList.toggle('active',i===1))}`,
    
    'src/scripts/renders/renderContent.js': `let renderContent=()=>{const c=document.getElementById('mainContent'),nav=document.getElementById('navLinks');if(!c)return;if(!currentUser){if(nav)nav.innerHTML='<button class="button button-primary" onclick="showLogin()">Вход</button><button class="button button-primary" onclick="showRegister()">Регистрация</button>';renderGuestView(c)}else if(currentUser.isAdmin){if(nav)nav.innerHTML='<span>👨‍💼 Диспетчер: '+(currentUser.fullName||'Admin')+'</span><button class="button btn-danger" onclick="logout()">Выйти</button>';renderDispatcherView(c)}else if(currentUser.role==='engineer'){if(nav)nav.innerHTML='<span>👨‍🔧 '+escapeHtml(currentUser.fullName)+'</span><button class="button btn-danger" onclick="logout()">Выйти</button>';renderEngineerView(c)}else{if(nav)nav.innerHTML='<span>🏢 '+escapeHtml(currentUser.companyName)+'</span><button class="button btn-danger" onclick="logout()">Выйти</button>';renderCustomerView(c)}};${escapeHtmlFn}`,
    
    'src/scripts/script.js': `let currentUser=null,customers=[],engineers=[],requests=[],reviews=[];${validationFunctions}const SESSION_KEY='tech_service_user';function saveUserSession(u){if(u)sessionStorage.setItem(SESSION_KEY,JSON.stringify(u));else sessionStorage.removeItem(SESSION_KEY)}function loadUserSession(){const s=sessionStorage.getItem(SESSION_KEY);if(s)try{currentUser=JSON.parse(s)}catch(e){}}function showChangePasswordModal(){document.getElementById('newPassword').value='';document.getElementById('confirmPassword').value='';showModal('changePasswordModal')}function changePassword(){const newPwd=document.getElementById('newPassword').value,confirmPwd=document.getElementById('confirmPassword').value;if(!newPwd||!confirmPwd){showAlert('Заполните все поля','error');return}if(newPwd!==confirmPwd){showAlert('Пароли не совпадают','error');return}if(!validatePassword(newPwd)){showAlert('Пароль должен быть не менее 4 символов','error');return}if(currentUser.isAdmin){currentUser.password=newPwd;currentUser.firstLogin=false;saveUserSession(currentUser);techDB.saveDispatcher({id:currentUser.id,userName:currentUser.userName,password:newPwd,fullName:currentUser.fullName,isAdmin:true,firstLogin:false});showAlert('Пароль успешно изменен!','success');closeModal('changePasswordModal');renderContent()}else if(currentUser.role==='engineer'){const engineer=engineers.find(e=>e.id===currentUser.id);if(engineer){engineer.password=newPwd;engineer.firstLogin=false;currentUser.password=newPwd;currentUser.firstLogin=false;saveUserSession(currentUser);techDB.updateEngineer({id:engineer.id,fullName:engineer.fullName,specialization:engineer.specialization,phone:engineer.phone,email:engineer.email,password:newPwd,qualification:engineer.qualification,isActive:engineer.isActive,completedRequests:engineer.completedRequests,firstLogin:false});showAlert('Пароль успешно изменен!','success');closeModal('changePasswordModal');renderContent()}}else{const customer=customers.find(c=>c.id===currentUser.id);if(customer){customer.password=newPwd;customer.firstLogin=false;currentUser.password=newPwd;currentUser.firstLogin=false;saveUserSession(currentUser);techDB.updateCustomer({id:customer.id,companyName:customer.companyName,contactPerson:customer.contactPerson,phone:customer.phone,email:customer.email,password:newPwd,address:customer.address,inn:customer.inn,isActive:customer.isActive,firstLogin:false});showAlert('Пароль успешно изменен!','success');closeModal('changePasswordModal');renderContent()}}}window.takeRequest=async(id)=>{const r=requests.find(x=>x.id===id);if(r&&r.status==='approved'&&!r.engineerId){r.engineerId=currentUser.id;r.status='in_progress';r.updatedAt=new Date();await techDB.updateRequest({id:r.id,customerId:r.customerId,title:r.title,description:r.description,equipmentType:r.equipmentType,priority:r.priority,status:r.status,engineerId:r.engineerId,dueDate:r.dueDate,rejectReason:r.rejectReason,customerCompanyName:r.customerCompanyName,updatedAt:r.updatedAt});showAlert('Заявка взята в работу','success');renderContent()}};document.addEventListener('DOMContentLoaded',async()=>{loadUserSession();await initData()})`
};

function createFiles() {
    console.log('📄 Создание файлов...');
    let count = 0;
    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(INSTALL_PATH, filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
        count++;
        if (count % 10 === 0) process.stdout.write('.');
    }
    console.log(`\n  ✓ Создано ${count} файлов\n`);
}

function createServerFile() {
    const serverPath = path.join(INSTALL_PATH, 'server.js');
    const serverContent = `const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const PUBLIC_DIR = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 - Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log('\\n========================================');
    console.log('🔧 Server running at http://localhost:' + PORT);
    console.log('========================================\\n');
    exec('start http://localhost:' + PORT);
});`;
    fs.writeFileSync(serverPath, serverContent);
    console.log('  ✓ server.js создан');
}

function createBatFile() {
    const batPath = path.join(INSTALL_PATH, 'start.bat');
    const batContent = `@echo off\nchcp 65001 >nul 2>&1\ntitle Technical Service System\ncolor 0A\necho.\necho ========================================\necho    Technical Service System\necho ========================================\necho.\necho Starting server...\necho.\nstart http://localhost:8080\nnode server.js\npause`;
    fs.writeFileSync(batPath, batContent);
    console.log('  ✓ start.bat создан');
}

function createInfoFile() {
    const infoPath = path.join(INSTALL_PATH, 'INFO.txt');
    const infoContent = `╔════════════════════════════════════════════════════════════════╗
║                    🎉 INSTALLATION COMPLETE!                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🔑 LOGIN CREDENTIALS:                                         ║
║                                                                ║
║  👨‍💼 DISPATCHER:                                               ║
║     Login: dispatcher, Password: dispatcher123                  ║
║                                                                ║
║  👨‍🔧 ENGINEERS:                                                ║
║     Инженеров нет. Диспетчер может добавить их через панель     ║
║                                                                ║
║  🏢 COMPANIES:                                                 ║
║     info@technoprom.ru / company123                            ║
║     contact@energotech.ru / company123                         ║
║     info@promreshenie.ru / company123                          ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🚀 TO START: Run start.bat                                    ║
║                                                                ║
║  🔒 ПРИ ПЕРВОМ ВХОДЕ:                                          ║
║     Система потребует сменить пароль (только один раз)          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝`;
    fs.writeFileSync(infoPath, infoContent);
    console.log('  ✓ INFO.txt создан');
}

function createShortcut() {
    if (process.platform === 'win32') {
        try {
            const desktopPath = path.join(os.homedir(), 'Desktop', 'ТехОбслуживание.bat');
            fs.writeFileSync(desktopPath, `@echo off\ncd /d "${INSTALL_PATH}"\nstart start.bat`);
            console.log('  ✓ Ярлык создан на рабочем столе');
        } catch(e) {}
    }
}

function main() {
    createDirectories();
    createFiles();
    createServerFile();
    createBatFile();
    createInfoFile();
    createShortcut();
    
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║              ✨ УСТАНОВКА УСПЕШНО ЗАВЕРШЕНА! ✨                  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    console.log(`📁 Папка установки: ${INSTALL_PATH}`);
    console.log('\n🚀 ДЛЯ ЗАПУСКА: Запустите файл start.bat\n');
    console.log('📖 Информация о входе в файле INFO.txt\n');
    console.log('🔒 ПРИ ПЕРВОМ ВХОДЕ: Система потребует сменить пароль (только один раз)\n');
    
    if (process.platform === 'win32') {
        try {
            execSync(`start explorer "${INSTALL_PATH}"`, { stdio: 'ignore', shell: true });
        } catch (e) {
            console.log('💡 Папка установки: ' + INSTALL_PATH);
        }
    }
}

main();