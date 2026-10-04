const STORAGE_KEY = 'healthPredictorApp';
const defaultState = {
  users: [
    {
      name: 'admin',
      email: 'admin@example.com',
      password: '1234',
      profile: { age: 35, gender: 'Male', height: 170, weight: 72 }
    },
    {
      name: 'Fajle Rabbi',
      email: 'fajlerabbi@example.com',
      password: 'demo123',
      profile: { age: 35, gender: 'Male', height: 170, weight: 72 }
    }
  ],
  currentUser: {
    email: 'admin@example.com',
    name: 'admin'
  },
  reminders: [
    { title: 'Take morning walk', detail: '30 minutes outdoor walk', due: 'Today, 7:30 AM' },
    { title: 'Hydration goal', detail: 'Drink 2 liters of water', due: 'Today, 2:00 PM' },
    { title: 'Blood pressure check', detail: 'Measure and note readings', due: 'Tomorrow, 9:00 AM' }
  ],
  healthInfo: [
    { title: 'Heart health', detail: 'Balance exercise, sleep, and sodium intake for stronger cardiovascular health.' },
    { title: 'Nutrition', detail: 'Choose fresh vegetables, whole grains, and lean protein for sustainable energy.' },
    { title: 'Stress management', detail: 'Regular breathing exercises and adequate sleep reduce long-term health risks.' }
  ],
  settings: [
    { key: 'notifications', label: 'Daily notifications', enabled: true },
    { key: 'darkMode', label: 'Dark mode', enabled: false },
    { key: 'weeklyReports', label: 'Weekly summary emails', enabled: true }
  ],
  history: []
};

let appState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState;

const appShell = document.getElementById('appShell');
const navItems = document.querySelectorAll('.nav-item[data-target]');
const sections = document.querySelectorAll('.content-section');
const historyList = document.getElementById('historyList');
const reminderList = document.getElementById('reminderList');
const infoList = document.getElementById('infoList');
const settingsList = document.getElementById('settingsList');
const predictionForm = document.getElementById('predictionForm');
const riskResult = document.getElementById('riskResult');
const scoreRing = document.getElementById('scoreRing');
const accountModal = document.getElementById('accountModal');
const accountLoginForm = document.getElementById('accountLoginForm');
const accountRegisterForm = document.getElementById('accountRegisterForm');
const switchAccountBtn = document.getElementById('switchAccountBtn');
const closeAccountModalBtn = document.getElementById('closeAccountModal');
const closeAccountModalRegisterBtn = document.getElementById('closeAccountModalRegister');
const accountTabs = document.querySelectorAll('.account-tab');

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function getCurrentUser() {
  return appState.currentUser ? appState.users.find(user => user.email === appState.currentUser.email) : null;
}

function renderAuthState() {
  const user = getCurrentUser();
  if (user) {
    appShell.classList.add('active');
    document.getElementById('headerName').textContent = user.name;
    document.getElementById('headerEmail').textContent = user.email;
    document.getElementById('welcomeTitle').textContent = `Welcome, ${user.name.split(' ')[0]}`;
    document.getElementById('headerAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('profileAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileAge').textContent = user.profile?.age || 35;
    document.getElementById('profileGender').textContent = user.profile?.gender || 'Male';
    document.getElementById('profileHeight').textContent = `${user.profile?.height || 170} cm`;
    document.getElementById('profileWeight').textContent = `${user.profile?.weight || 72} kg`;
  } else {
    appShell.classList.add('active');
  }
}

function updateDashboard() {
  const history = appState.history.filter(item => item.userEmail === appState.currentUser?.email);
  const total = history.length;
  document.getElementById('predictionCount').textContent = total;
  const latest = history[0];
  const score = latest ? latest.score : 32;
  document.getElementById('overallRiskValue').textContent = `${score}%`;
  document.getElementById('healthScoreValue').textContent = Math.max(50, 100 - score);
  document.getElementById('reminderCount').textContent = appState.reminders.length;
}

function renderHistory() {
  const history = appState.history.filter(item => item.userEmail === appState.currentUser?.email).slice(0, 6);
  historyList.innerHTML = history.length ? history.map(item => `
    <div class="history-item">
      <strong>${new Date(item.date).toLocaleDateString()}</strong>
      <small>${item.symptoms}</small>
      <div class="risk-pill ${item.levelClass}">${item.riskLabel}</div>
    </div>
  `).join('') : '<div class="history-item"><strong>No predictions yet</strong><small>Create your first risk assessment from the Prediction tab.</small></div>';
  document.getElementById('historyBadge').textContent = `${history.length} records`;
}

function renderReminders() {
  reminderList.innerHTML = appState.reminders.map(item => `
    <div class="reminder-item">
      <strong>${item.title}</strong>
      <small>${item.detail}</small><br />
      <small>${item.due}</small>
    </div>
  `).join('');
}

function renderHealthInfo() {
  infoList.innerHTML = appState.healthInfo.map(item => `
    <div class="info-item">
      <strong>${item.title}</strong>
      <small>${item.detail}</small>
    </div>
  `).join('');
}

function renderSettings() {
  settingsList.innerHTML = appState.settings.map(setting => `
    <div class="setting-item">
      <div>
        <strong>${setting.label}</strong>
        <small>Manage your personal health preferences</small>
      </div>
      <button class="toggle ${setting.enabled ? 'active' : ''}" data-setting="${setting.key}" aria-label="Toggle ${setting.label}"></button>
    </div>
  `).join('');
}

function calculateRisk(data) {
  let score = 0;
  score += Math.min(25, (data.age - 18) * 0.45);
  score += data.bloodPressure > 130 ? 18 : data.bloodPressure > 110 ? 8 : 2;
  score += data.cholesterol > 220 ? 18 : data.cholesterol > 180 ? 10 : 4;
  score += data.bmi > 30 ? 16 : data.bmi > 25 ? 8 : 2;
  score += data.smoking === '1' ? 16 : 0;
  score += data.exercise === '0' ? 12 : data.exercise === '1' ? 4 : 0;
  score += data.stress === '3' ? 9 : data.stress === '2' ? 5 : 2;

  const rounded = Math.min(92, Math.max(8, Math.round(score)));

  let riskLabel = 'Low';
  let levelClass = 'pill-low';
  let statusText = 'Low risk detected';
  let trigger = 'Stable health markers';
  let action = 'Maintain healthy habits';
  let symptoms = 'No major concerns reported';

  if (rounded >= 60) {
    riskLabel = 'High';
    levelClass = 'pill-high';
    statusText = 'High risk detected';
    trigger = 'Elevated cardiovascular risk factors';
    action = 'Consult a healthcare professional immediately';
    symptoms = 'Chest pain, dizziness, or shortness of breath';
  } else if (rounded >= 35) {
    riskLabel = 'Moderate';
    levelClass = 'pill-moderate';
    statusText = 'Moderate risk detected';
    trigger = 'Elevated blood pressure';
    action = 'Consult a doctor within 2 weeks';
    symptoms = 'Chest discomfort, fatigue';
  }

  return {
    score: rounded,
    riskLabel,
    levelClass,
    statusText,
    trigger,
    action,
    symptoms
  };
}

function updateRiskCard(result) {
  scoreRing.style.setProperty('--score', result.score);
  document.getElementById('scoreValue').textContent = `${result.score}%`;
  document.getElementById('riskStatus').textContent = result.statusText;
  document.getElementById('riskStatus').style.background = result.score >= 60 ? 'rgba(255, 93, 108, 0.08)' : result.score >= 35 ? 'rgba(255,181,71,0.14)' : 'rgba(30,200,165,0.12)';
  document.getElementById('riskStatus').style.borderColor = result.score >= 60 ? 'rgba(255,93,108,0.18)' : result.score >= 35 ? 'rgba(255,181,71,0.2)' : 'rgba(30,200,165,0.18)';
  document.getElementById('riskCategory').textContent = result.riskLabel;
  document.getElementById('riskTrigger').textContent = result.trigger;
  document.getElementById('riskAction').textContent = result.action;
  document.getElementById('riskSymptoms').textContent = result.symptoms;
}

function validateLogin(email, password) {
  const user = appState.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    alert('Invalid email or password. Please try again.');
    return false;
  }
  appState.currentUser = { email: user.email, name: user.name };
  saveState();
  renderAuthState();
  updateDashboard();
  renderHistory();
  return true;
}

function handlePrediction(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) return;

  const formData = {
    age: Number(document.getElementById('age').value),
    gender: document.getElementById('gender').value,
    bloodPressure: Number(document.getElementById('bloodPressure').value),
    cholesterol: Number(document.getElementById('cholesterol').value),
    bmi: Number(document.getElementById('bmi').value),
    smoking: document.getElementById('smoking').value,
    exercise: document.getElementById('exercise').value,
    stress: document.getElementById('stress').value,
    symptoms: document.getElementById('symptoms').value.trim()
  };

  const result = calculateRisk(formData);
  updateRiskCard(result);

  const item = {
    userEmail: user.email,
    date: new Date().toISOString(),
    symptoms: formData.symptoms || 'General health assessment',
    score: result.score,
    riskLabel: result.riskLabel,
    levelClass: result.levelClass
  };

  appState.history.unshift(item);
  saveState();
  renderHistory();
  updateDashboard();
}

function logout() {
  appState.currentUser = null;
  saveState();
  accountModal.classList.add('hidden');
  renderAuthState();
}

function openAccountSwitch() {
  accountModal.classList.remove('hidden');
}

function closeAccountSwitch() {
  accountModal.classList.add('hidden');
}

function handleAccountLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmailModal').value.trim();
  const password = document.getElementById('loginPasswordModal').value.trim();

  const user = appState.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    alert('Invalid email or password.');
    return;
  }

  appState.currentUser = { email: user.email, name: user.name };
  saveState();
  closeAccountSwitch();
  renderAuthState();
  updateDashboard();
  renderHistory();
}

function handleAccountRegister(event) {
  event.preventDefault();
  const name = document.getElementById('regNameModal').value.trim();
  const email = document.getElementById('regEmailModal').value.trim();
  const password = document.getElementById('regPasswordModal').value.trim();

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  if (appState.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
    alert('This email is already registered.');
    return;
  }

  const newUser = {
    name,
    email,
    password,
    profile: { age: 30, gender: 'Male', height: 170, weight: 70 }
  };

  appState.users.push(newUser);
  appState.currentUser = { name, email };
  saveState();
  closeAccountSwitch();
  renderAuthState();
  updateDashboard();
  renderHistory();
  accountRegisterForm.reset();
}

function switchAccountTab(tabName) {
  accountTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.accountTab === tabName));
  accountLoginForm.classList.toggle('active', tabName === 'login');
  accountRegisterForm.classList.toggle('active', tabName === 'register');
}

function attachNavEvents() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      if (targetId) {
        sections.forEach(section => section.classList.toggle('active', section.id === targetId));
        document.querySelectorAll('.nav-item[data-target]').forEach(el => el.classList.toggle('active', el.dataset.target === targetId));
      }
    });
  });

  document.querySelectorAll('.quick-action[data-nav]').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.nav;
      sections.forEach(section => section.classList.toggle('active', section.id === targetId));
      document.querySelectorAll('.nav-item[data-target]').forEach(el => el.classList.toggle('active', el.dataset.target === targetId));
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);
  switchAccountBtn.addEventListener('click', openAccountSwitch);
  closeAccountModalBtn.addEventListener('click', closeAccountSwitch);
  closeAccountModalRegisterBtn.addEventListener('click', closeAccountSwitch);
  accountLoginForm.addEventListener('submit', handleAccountLogin);
  accountRegisterForm.addEventListener('submit', handleAccountRegister);
  accountTabs.forEach(tab => {
    tab.addEventListener('click', () => switchAccountTab(tab.dataset.accountTab));
  });
}

function attachSettingsEvents() {
  settingsList.addEventListener('click', (event) => {
    const target = event.target.closest('.toggle');
    if (!target) return;
    const key = target.dataset.setting;
    const setting = appState.settings.find(item => item.key === key);
    if (!setting) return;
    setting.enabled = !setting.enabled;
    target.classList.toggle('active', setting.enabled);
    saveState();
  });
}

predictionForm.addEventListener('submit', handlePrediction);
attachNavEvents();
attachSettingsEvents();

renderAuthState();
renderReminders();
renderHealthInfo();
renderSettings();
renderHistory();
updateDashboard();
updateRiskCard(calculateRisk({
  age: 35,
  bloodPressure: 120,
  cholesterol: 190,
  bmi: 26.5,
  smoking: '0',
  exercise: '1',
  stress: '2'
}));
