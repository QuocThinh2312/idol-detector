const screenHome = document.getElementById('screen-home');
const screenQuestion = document.getElementById('screen-question');
const pingValue = document.getElementById('ping-value');

let pingTimeout;
let groups = Array.from({ length: 7 }, () => []);
let currentStep = 0;
let userAnswers = new Array(7).fill(null);

function updatePing() {
  pingValue.innerText = Math.floor(Math.random() * 90) + 15;
  const randomDelay = Math.floor(Math.random() * 5000) + 2000;
  pingTimeout = setTimeout(updatePing, randomDelay);
}

function initPing() {
  clearTimeout(pingTimeout);
  updatePing();
}

function freezePing(errorPos, targetId) {
  clearTimeout(pingTimeout);
  const idStr = String(targetId).padStart(2, '0');
  pingValue.innerText = `${errorPos}${idStr}`;
}

function generateHammingGroups() {
  for (let i = 1; i <= 15; i++) {
    const d1 = (i >> 3) & 1;
    const d2 = (i >> 2) & 1;
    const d3 = (i >> 1) & 1;
    const d4 = i & 1;

    const p1 = d1 ^ d2 ^ d4;
    const p2 = d1 ^ d3 ^ d4;
    const p3 = d2 ^ d3 ^ d4;

    const bits = [p1, p2, d1, p3, d2, d3, d4];

    bits.forEach((bit, index) => {
      if (bit === 1) {
        groups[index].push(idols[i - 1]);
      }
    });
  }
}

function renderHomeGrid() {
  const grid = document.getElementById('idol-grid');
  grid.innerHTML = '';
  idols.forEach((idol) => {
    const div = document.createElement('div');
    div.className = 'flex flex-col items-center gap-1 md:gap-2 group cursor-pointer';
    div.innerHTML = `
            <div class="relative overflow-hidden rounded-[16px] ring-2 md:ring-4 ring-transparent group-hover:ring-rose-500 transition-all duration-300 w-full h-16 md:h-28 lg:h-40">
                <img src="${idol.img}" alt="${idol.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span class="text-[10px] md:text-sm lg:text-xl font-bold text-slate-300 group-hover:text-rose-400 transition-colors text-center px-1 truncate w-full">${idol.name}</span>
        `;
    grid.appendChild(div);
  });
}

function switchScreen(hideEl, showEl) {
  hideEl.classList.remove('opacity-100', 'scale-100');
  hideEl.classList.add('opacity-0', 'scale-95');

  setTimeout(() => {
    hideEl.classList.add('hidden');
    hideEl.classList.remove('flex');

    showEl.classList.remove('hidden');
    showEl.classList.add('flex');

    requestAnimationFrame(() => {
      showEl.classList.remove('opacity-0', 'scale-95');
      showEl.classList.add('opacity-100', 'scale-100');
    });
  }, 300);
}

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function renderQuestion() {
  document.getElementById('question-counter').innerText = `HỒ SƠ ${currentStep + 1} / 7`;
  document.getElementById('question-title').innerText = fileNames[currentStep];

  const btnNext = document.getElementById('btn-next');
  if (currentStep === 6) {
    btnNext.innerText = 'VỀ TRANG CHỦ';
    btnNext.className =
      'outline-none focus:outline-none focus:ring-0 select-none flex-1 py-3 md:py-4 lg:py-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm md:text-xl lg:text-2xl rounded-xl transition-all active:scale-95 shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)]';
  } else {
    btnNext.innerText = 'CÂU TIẾP THEO';
    btnNext.className =
      'outline-none focus:outline-none focus:ring-0 select-none flex-1 py-3 md:py-4 lg:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm md:text-xl lg:text-2xl rounded-xl transition-all active:scale-95 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]';
  }

  const dots = document.getElementById('progress-dots');
  dots.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('div');
    dot.className = `w-1.5 h-1.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-colors ${i <= currentStep ? 'bg-rose-500' : 'bg-slate-700'}`;
    dots.appendChild(dot);
  }

  const grid = document.getElementById('question-grid');
  grid.innerHTML = '';
  const shuffledIdols = shuffleArray([...groups[currentStep]]);

  shuffledIdols.forEach((idol) => {
    const div = document.createElement('div');
    div.className = 'flex flex-col items-center gap-2 md:gap-3';
    div.innerHTML = `
            <img src="${idol.img}" class="size-20 lg:size-40 rounded-[16px] object-cover ring-2 ring-slate-700">
            <span class="text-[10px] md:text-sm lg:text-xl font-bold text-slate-300 text-center leading-tight truncate w-full">${idol.name}</span>
        `;
    grid.appendChild(div);
  });
}

document.addEventListener('keydown', (e) => {
  if (screenQuestion.classList.contains('hidden')) return;

  const key = e.key.toLowerCase();
  let isKeyPressed = false;

  if (key === 'c') {
    userAnswers[currentStep] = 1;
    isKeyPressed = true;
  } else if (key === 'k') {
    userAnswers[currentStep] = 0;
    isKeyPressed = true;
  }

  if (isKeyPressed && currentStep === 6) {
    const result = calculateResult();
    freezePing(result.errorPos, result.id);
  }
});

document.getElementById('btn-back').addEventListener('click', () => {
  document.activeElement.blur();

  if (currentStep > 0) {
    if (currentStep === 6) {
      initPing();
    }
    currentStep--;
    renderTransition();
  } else {
    switchScreen(screenQuestion, screenHome);
    userAnswers.fill(null);
  }
});

document.getElementById('btn-next').addEventListener('click', () => {
  document.activeElement.blur();

  if (userAnswers[currentStep] === null) {
    return;
  }

  if (currentStep < 6) {
    currentStep++;
    renderTransition();
  } else {
    switchScreen(screenQuestion, screenHome);
  }
});

function renderTransition() {
  screenQuestion.classList.remove('opacity-100', 'scale-100');
  screenQuestion.classList.add('opacity-0', 'scale-95');

  setTimeout(() => {
    renderQuestion();
    screenQuestion.classList.remove('opacity-0', 'scale-95');
    screenQuestion.classList.add('opacity-100', 'scale-100');
  }, 200);
}

function calculateResult() {
  const r = [...userAnswers];
  const s1 = r[0] ^ r[2] ^ r[4] ^ r[6];
  const s2 = r[1] ^ r[2] ^ r[5] ^ r[6];
  const s3 = r[3] ^ r[4] ^ r[5] ^ r[6];

  const errorPos = (s3 << 2) | (s2 << 1) | s1;

  if (errorPos > 0) {
    r[errorPos - 1] ^= 1;
  }
  const id = (r[2] << 3) | (r[4] << 2) | (r[5] << 1) | r[6];
  return { errorPos, id };
}

document.getElementById('btn-start').addEventListener('click', () => {
  document.activeElement.blur();
  currentStep = 0;
  userAnswers.fill(null);
  initPing();
  switchScreen(screenHome, screenQuestion);
  renderQuestion();
});

generateHammingGroups();
renderHomeGrid();
initPing();
