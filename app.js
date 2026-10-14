(function () {
  'use strict';

  var STORAGE_KEY = 'poeasy-settings';
  var NAMES = {
    call: '가족 전화',
    hospital: '병원',
    welfare: '복지관'
  };
  var CHOICE_TITLES = { hospital: '병원 가기', welfare: '복지정보' };
  var CHOICE_CALL = { hospital: '병원에 전화하기', welfare: '복지관에 전화하기' };

  var KAKAO_T_STORE = 'https://play.google.com/store/apps/details?id=com.kakao.taxi';

  var root = document.documentElement;
  var settingsDialog = document.getElementById('settings');
  var noticeDialog = document.getElementById('notice');
  var choiceDialog = document.getElementById('choice');
  var form = document.getElementById('settings-form');
  var optLarge = document.getElementById('opt-large');
  var optContrast = document.getElementById('opt-contrast');
  var openBtn = document.getElementById('open-settings');
  var lastTrigger = null;
  var currentChoice = null;

  var isAndroid = /Android/i.test(navigator.userAgent);

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

  function getPhones(data) { return (data && data.phones) || {}; }
  function getPlaces(data) { return (data && data.places) || {}; }

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
    var places = getPlaces(data);
    form.elements['call'].value = phones.call || '';
    form.elements['hospital'].value = phones.hospital || '';
    form.elements['welfare'].value = phones.welfare || '';
    form.elements['place-hospital'].value = places.hospital || '';
    form.elements['place-welfare'].value = places.welfare || '';
    optLarge.checked = !!data.large;
    optContrast.checked = !!data.contrast;
    openDialog(settingsDialog);
  }

  function showNotice(message) {
    var el = document.getElementById('notice-text');
    el.textContent = message;
    el.style.whiteSpace = 'pre-line';
    openDialog(noticeDialog);
  }

  function dial(key) {
    var number = cleanPhone(getPhones(load())[key]);
    if (!number) {
      showNotice('「' + NAMES[key] + '」 전화번호가 없어요.\n먼저 연락처를 설정해 주세요.');
      return;
    }
    window.location.href = 'tel:' + number;
  }

  function openKakaoMap(key) {
    var place = String(getPlaces(load())[key] || '').trim();
    if (!place) {
      showNotice('「' + NAMES[key] + '」 이름이나 주소가 없어요.\n먼저 설정해 주세요.');
      return;
    }
    var q = encodeURIComponent(place);
    var web = 'https://m.map.kakao.com/actions/searchView?q=' + q;
    if (isAndroid) {
      window.location.href = 'intent://search?q=' + q +
        '#Intent;scheme=kakaomap;package=net.daum.android.map;' +
        'S.browser_fallback_url=' + encodeURIComponent(web) + ';end';
    } else {
      window.location.href = web;
    }
  }

  function openKakaoT() {
    if (isAndroid) {
      window.location.href = 'intent://launch#Intent;scheme=kakaot;package=com.kakao.taxi;' +
        'S.browser_fallback_url=' + encodeURIComponent(KAKAO_T_STORE) + ';end';
    } else {
      window.location.href = KAKAO_T_STORE;
    }
  }

  function openChoice(key) {
    currentChoice = key;
    document.getElementById('choice-title').textContent = CHOICE_TITLES[key];
    document.getElementById('choice-call').textContent = CHOICE_CALL[key];
    openDialog(choiceDialog);
  }

  // 카드 버튼
  document.querySelectorAll('.card[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-action');
      lastTrigger = btn;
      if (action === 'call') dial('call');
      else if (action === 'taxi') openKakaoT();
      else if (action === 'hospital' || action === 'welfare') openChoice(action);
    });
  });

  document.getElementById('choice-call').addEventListener('click', function () {
    var key = currentChoice;
    closeDialog(choiceDialog);
    dial(key);
  });
  document.getElementById('choice-map').addEventListener('click', function () {
    var key = currentChoice;
    closeDialog(choiceDialog);
    openKakaoMap(key);
  });
  document.getElementById('choice-close').addEventListener('click', function () {
    closeDialog(choiceDialog);
    if (lastTrigger) lastTrigger.focus();
  });

  openBtn.addEventListener('click', openSettings);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      phones: {
        call: form.elements['call'].value.trim(),
        hospital: form.elements['hospital'].value.trim(),
        welfare: form.elements['welfare'].value.trim()
      },
      places: {
        hospital: form.elements['place-hospital'].value.trim(),
        welfare: form.elements['place-welfare'].value.trim()
      },
      large: optLarge.checked,
      contrast: optContrast.checked
    };
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
