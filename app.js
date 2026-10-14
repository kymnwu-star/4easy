(function () {
  'use strict';

  var STORAGE_KEY = 'poeasy-settings';
  var ACTIONS = ['call', 'hospital', 'youtube', 'welfare'];
  var NAMES = {
    call: '가족 전화',
    hospital: '병원 가기',
    youtube: '이동하기',
    welfare: '복지정보'
  };

  var root = document.documentElement;
  var settingsDialog = document.getElementById('settings');
  var noticeDialog = document.getElementById('notice');
  var form = document.getElementById('settings-form');
  var optLarge = document.getElementById('opt-large');
  var optContrast = document.getElementById('opt-contrast');
  var openBtn = document.getElementById('open-settings');
  var lastTrigger = null;

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && typeof data === 'object') return data;
    } catch (e) { /* ignore */ }
    return {};
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function getPhones(data) {
    return (data && data.phones) || {};
  }

  function cleanPhone(value) {
    // 숫자와 맨 앞의 + 만 남김
    var v = String(value || '').trim();
    var plus = v.charAt(0) === '+' ? '+' : '';
    return plus + v.replace(/[^0-9]/g, '');
  }

  function applyDisplay(data) {
    root.classList.toggle('large', !!data.large);
    root.classList.toggle('contrast', !!data.contrast);
  }

  function openDialog(dlg) {
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }
  function closeDialog(dlg) {
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }

  function openSettings() {
    var data = load();
    var phones = getPhones(data);
    ACTIONS.forEach(function (a) {
      form.elements[a].value = phones[a] || '';
    });
    optLarge.checked = !!data.large;
    optContrast.checked = !!data.contrast;
    openDialog(settingsDialog);
  }

  function showNotice(action) {
    document.getElementById('notice-text').textContent =
      '「' + NAMES[action] + '」 전화번호가 없어요.\n먼저 연락처를 설정해 주세요.';
    document.getElementById('notice-text').style.whiteSpace = 'pre-line';
    openDialog(noticeDialog);
  }

  // 카드 버튼
  document.querySelectorAll('.card[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-action');
      var number = cleanPhone(getPhones(load())[action]);
      if (!number) {
        lastTrigger = btn;
        showNotice(action);
        return;
      }
      window.location.href = 'tel:' + number;
    });
  });

  openBtn.addEventListener('click', openSettings);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var phones = {};
    ACTIONS.forEach(function (a) { phones[a] = form.elements[a].value.trim(); });
    var data = { phones: phones, large: optLarge.checked, contrast: optContrast.checked };
    save(data);
    applyDisplay(data);
    closeDialog(settingsDialog);
    openBtn.focus();
  });

  // 화면 옵션 즉시 미리보기
  optLarge.addEventListener('change', function () { root.classList.toggle('large', optLarge.checked); });
  optContrast.addEventListener('change', function () { root.classList.toggle('contrast', optContrast.checked); });

  // 저장 없이 닫힌 경우 저장된 값으로 복원
  settingsDialog.addEventListener('close', function () { applyDisplay(load()); });

  document.getElementById('notice-close').addEventListener('click', function () {
    closeDialog(noticeDialog);
    if (lastTrigger) lastTrigger.focus();
  });
  document.getElementById('notice-settings').addEventListener('click', function () {
    closeDialog(noticeDialog);
    openSettings();
  });

  applyDisplay(load());
})();
