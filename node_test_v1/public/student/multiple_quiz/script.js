document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // GEO-CLUE FACT HUNT
  // ===============================

  const boatQuestions = window.boatQuestions || []; // from EJS
  let currentIndex = 0;
  let currentClueIndex = 0;
  let attempts = 3;
  let roundPoints = 20;
  let totalScore = 0;
  let locked = false;

  const clueEl = document.getElementById("fact-hunt-clue");
  const guessEl = document.getElementById("fact-hunt-guess");
  const resultEl = document.getElementById("fact-hunt-result");
  const scoreEl = document.getElementById("fact-hunt-score");
  const triesEl = document.getElementById("fh-tries");
  const startBtn = document.getElementById("fh-start");
  const submitBtn = document.getElementById("fh-submit");

  // Shuffle helper
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startQuiz() {
    shuffle(boatQuestions);
    currentIndex = 0;
    totalScore = 0;
    startQuestion();
    startBtn.style.display = "none";
    submitBtn.style.display = "inline-block";
  }

  function startQuestion() {
    if (currentIndex >= boatQuestions.length) return endQuiz();

    locked = false;
    currentClueIndex = 0;
    attempts = 3;
    roundPoints = 20;

    const q = boatQuestions[currentIndex];

    clueEl.innerText = `Clue 1: ${q.clues[currentClueIndex] || ""}`;
    resultEl.innerText = "";
    guessEl.value = "";
    guessEl.disabled = false;
    submitBtn.disabled = false;
    scoreEl.innerText = `Score: ${roundPoints}`;
    triesEl.innerText = `Attempts left: ${attempts}`;
  }

  function submitGuess() {
    if (locked) return;
    const q = boatQuestions[currentIndex];
    const guess = guessEl.value.trim().toLowerCase();
    if (!guess) return;

    if (guess === q.answer.toLowerCase()) {
      totalScore += roundPoints;
      resultEl.innerText = `✅ Correct! It was ${q.answer}. (+${roundPoints} pts)`;
      scoreEl.innerText = `Total Score: ${totalScore}`;
      lockInput();
      nextQuestion();
    } else {
      attempts--;
      if (attempts > 0) {
        resultEl.innerText = `❌ Incorrect. Try again! (${attempts} left)`;
        triesEl.innerText = `Attempts left: ${attempts}`;
      } else {
        // Show next clue or reveal answer
        currentClueIndex++;
        if (currentClueIndex < q.clues.length) {
          roundPoints = Math.max(0, roundPoints - 5);
          attempts = 3;
          clueEl.innerText = `Clue ${currentClueIndex + 1}: ${q.clues[currentClueIndex]}`;
          resultEl.innerText = `💡 Another clue! (-5 points)`;
          scoreEl.innerText = `Score: ${roundPoints}`;
          triesEl.innerText = `Attempts left: ${attempts}`;
          if (roundPoints <= 0) revealAnswer(q);
        } else {
          revealAnswer(q);
        }
      }
    }
  }

  function revealAnswer(q) {
    roundPoints = 0;
    scoreEl.innerText = `Score: ${roundPoints}`;
    resultEl.innerText = `📘 Out of points! The correct answer was ${q.answer}.`;
    lockInput();
    nextQuestion();
  }

  function lockInput() {
    locked = true;
    guessEl.disabled = true;
    submitBtn.disabled = true;
  }

  function nextQuestion() {
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < boatQuestions.length) {
        startQuestion();
      } else {
        endQuiz();
      }
    }, 2000);
  }

  function endQuiz() {
    clueEl.innerText = `🎉 Quiz complete! Your final score: ${totalScore} points.`;
    submitBtn.style.display = "none";
    startBtn.style.display = "inline-block";
    startBtn.innerText = "Restart Quiz";
    triesEl.innerText = `Attempts left: —`;
    guessEl.disabled = true;
  }

  startBtn.addEventListener("click", startQuiz);
  submitBtn.addEventListener("click", submitGuess);
});
