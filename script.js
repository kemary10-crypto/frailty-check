const ageGroups = [
  "20代以下", "30代", "40代", "50代", "60代", "70代以上"
];

const genders = [
  "男性", "女性", "回答しない"
];

const foodGroups = [
  { group: "主食", note: "ごはん、パン、麺", score: false },
  { group: "肉", note: "肉、ハム、ウインナー等", score: true },
  { group: "魚介類", note: "魚、貝、かまぼこ等", score: true },
  { group: "卵", note: "鶏卵、うずらの卵等", score: true },
  { group: "大豆・大豆製品", note: "豆腐、納豆等", score: true },
  { group: "牛乳・乳製品", note: "牛乳、ヨーグルト、チーズ等", score: true },
  { group: "緑黄色野菜", note: "にんじん、ほうれん草等", score: true },
  { group: "海藻類", note: "わかめ、ひじき、昆布、のり等", score: true },
  { group: "いも", note: "じゃがいも、さつまいも、里芋等", score: true },
  { group: "果物", note: "りんご、みかん、バナナ、柿等", score: true },
  { group: "油を使った料理", note: "炒め物、揚げ物、バター等", score: true }
];

let answers = {};
let currentIndex = 0;
let selectedAge = "";
let selectedGender = "";

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function goToAge() {
  const area = document.getElementById("age-buttons");
  area.innerHTML = "";
  ageGroups.forEach(a => {
    const btn = document.createElement("button");
    btn.textContent = a;
    btn.onclick = () => {
      selectedAge = a;
      goToGender();
    };
    area.appendChild(btn);
  });
  show("age-screen");
}

function goToGender() {
  const area = document.getElementById("gender-buttons");
  area.innerHTML = "";
  genders.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.onclick = () => {
      selectedGender = g;
      startCheck();
    };
    area.appendChild(btn);
  });
  show("gender-screen");
}

function startCheck() {
  currentIndex = 0;
  answers = {};
  showFood();
  show("check-screen");
}

function showFood() {
  const fg = foodGroups[currentIndex];
  document.getElementById("food-title").textContent = fg.group;
  document.getElementById("food-note").textContent = fg.note;
}

function answer(val) {
  answers[foodGroups[currentIndex].group] = val;
  currentIndex++;

  if (currentIndex >= foodGroups.length) {
    showResult();
  } else {
    showFood();
  }
}

function showResult() {
  let score = 0;
  foodGroups.forEach(fg => {
    if (fg.score && answers[fg.group]) score++;
  });

  document.getElementById("result-score").textContent = `今日の点数：${score}点`;

  const msg = score >= 7
    ? "目標クリア！バランスよく食べられています。"
    : "今日は7点未満でした。明日は少しだけ食品群を増やしてみましょう。";

  document.getElementById("result-message").textContent = msg;

  show("result-screen");
}

function saveAndRestart() {
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(localStorage.getItem("foodCheckData") || "{}");

  if (!data[today]) data[today] = [];

  let score = 0;
  foodGroups.forEach(fg => {
    if (fg.score && answers[fg.group]) score++;
  });

  data[today].push({
    age: selectedAge,
    gender: selectedGender,
    score,
    details: answers,
    time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  });

  localStorage.setItem("foodCheckData", JSON.stringify(data));

  location.reload();
}

function showHistory() {
  const data = JSON.parse(localStorage.getItem("foodCheckData") || "{}");
  const historyContent = document.getElementById("history-content");
  historyContent.innerHTML = "";

  if (Object.keys(data).length === 0) {
    historyContent.innerHTML = "<p style='color: #999; padding: 20px;'>記録がまだありません</p>";
    show("history-screen");
    return;
  }

  // 日付の降順でソート（新しい順）
  const sortedDates = Object.keys(data).sort().reverse();

  sortedDates.forEach(date => {
    const records = data[date];
    const dateObj = new Date(date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    records.forEach((record, idx) => {
      const item = document.createElement("div");
      item.className = "history-item";
      
      const summary = document.createElement("div");
      summary.className = "history-summary";
      summary.style.cursor = "pointer";
      summary.style.userSelect = "none";
      
      const scoreColor = record.score >= 7 ? "#4CAF50" : "#FF6B6B";
      summary.innerHTML = `
        <strong style="color: ${scoreColor}; font-size: 18px;">${record.score}点</strong>
        <span style="margin-left: 10px; color: #666;">${dateStr}</span>
        ${record.time ? `<span style="margin-left: 10px; color: #999; font-size: 14px;">${record.time}</span>` : ''}
        <span style="margin-left: 10px; color: #999; font-size: 14px;">年代: ${record.age} / 性別: ${record.gender}</span>
      `;

      const details = document.createElement("div");
      details.className = "history-details hidden";
      details.style.marginTop = "10px";
      details.style.paddingTop = "10px";
      details.style.borderTop = "1px dashed #ddd";
      
      let detailsHtml = "";
      foodGroups.forEach(fg => {
        const ate = record.details[fg.group];
        const icon = ate ? "✓" : "✗";
        const color = ate ? "#4CAF50" : "#ccc";
        detailsHtml += `<div style="font-size: 14px; color: #666; margin: 5px 0;">
          <span style="color: ${color}; font-weight: bold;">${icon}</span> ${fg.group}
        </div>`;
      });
      
      details.innerHTML = detailsHtml;

      // クリックで詳細展開/閉じる
      summary.onclick = () => {
        details.classList.toggle("hidden");
      };

      item.appendChild(summary);
      item.appendChild(details);
      historyContent.appendChild(item);
    });
  });

  show("history-screen");
}

function clearHistory() {
  if (confirm("本当にすべてのデータを削除してもよろしいですか？")) {
    localStorage.removeItem("foodCheckData");
    const historyContent = document.getElementById("history-content");
    historyContent.innerHTML = "<p style='color: #999; padding: 20px;'>データが削除されました</p>";
    setTimeout(() => {
      show("start-screen");
    }, 1500);
  }
}
