/**
 * FutureNav - Main JavaScript
 * script.js - Interactive functionality for the futuristic navigation experience
 * Updated: Sept 22, 2025
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const navbar = document.getElementById("navbar");
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const sections = document.querySelectorAll("section");

  // ===============================
  // MOBILE MENU
  // ===============================
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenuButton.classList.toggle("active");
      if (mobileMenu.classList.contains("open")) {
        mobileMenu.style.height = "0";
        mobileMenu.classList.remove("open");
      } else {
        mobileMenu.classList.add("open");
        mobileMenu.style.height = `${mobileMenu.scrollHeight}px`;
      }
    });
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuButton.classList.remove("active");
      mobileMenu.style.height = "0";
      mobileMenu.classList.remove("open");
    });
  });

  // =================================
  // NAVBAR SCROLL + SECTION HIGHLIGHT
  // =================================
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    highlightCurrentSection();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });

        targetSection.classList.add("section-highlight");
        setTimeout(() => {
          targetSection.classList.remove("section-highlight");
        }, 1000);
      }
    });
  });

  function highlightCurrentSection() {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
    mobileNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  // Intersection animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
        }
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach((section) => {
    section.classList.add("section-hidden");
    observer.observe(section);
  });
  highlightCurrentSection();

  // ===============================
  // QUIZ FUNCTIONALITY
  // ===============================
  const quizMapDiv = document.getElementById("quiz-map");
  if (quizMapDiv) {
    const quizQuestion = document.getElementById("quiz-question");
    const quizOptions = document.getElementById("quiz-options");
    const quizFeedback = document.getElementById("quiz-feedback");
    const nextBtn = document.getElementById("next-btn");

    // Create Retry + Score UI
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "🔄 Retry Quiz";
    retryBtn.className =
      "hidden mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-[#7EA16B] transition";

    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "mt-4 text-lg font-bold text-white";

    quizFeedback.insertAdjacentElement("afterend", retryBtn);
    retryBtn.insertAdjacentElement("afterend", scoreDisplay);

    // Leaflet Map (no-label basemap)
    const quizMap = L.map("quiz-map").setView([20, 90], 4);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }).addTo(quizMap);

    let currentLayer;
    let score = 0; // Track score

    // Question bank
    const questions = [
      {
        question: "Which bay is highlighted?",
        geojson: "json_files/bayofbengal.geojson.json",
        options: ["Bay of Bengal", "Bay of Biscay", "Brunei Bay", "Baffin Bay"],
        answer: "Bay of Bengal"
      },
      {
        question: "Which island is highlighted?",
        geojson: "json_files/sri_lanka.json",
        options: ["Sri Lanka", "Madagascar", "Sumatra", "Taiwan"],
        answer: "Sri Lanka"
      },
      {
        question: "Which sea is this?",
        geojson: "json_files/South_China_Sea.json",
        options: ["South China Sea", "East China Sea", "Philippine Sea", "Bay of Bengal"],
        answer: "South China Sea"
      },
      {
        question: "What island chain is this?",
        geojson: "json_files/philippines.json",
        options: ["Philippines", "Indonesia", "Japan", "Maldives"],
        answer: "Philippines"
      },
      {
        question: "Identify this island",
        geojson: "json_files/java.json",
        options: ["Sumatra", "Borneo", "Java", "Sulawesi"],
        answer: "Java"
      },
      {
        question: "Which island is this?",
        geojson: "json_files/borneo.json",
        options: ["Borneo", "Sulawesi", "Papua New Guinea", "Madagascar"],
        answer: "Borneo"
      },
      {
        question: "What sea is highlighted?",
        geojson: "json_files/Eastern_china_sea.json",
        options: ["East China Sea", "South China Sea", "Sea of Japan", "Philippine Sea"],
        answer: "East China Sea"
      },
      {
        question: "Which ocean is this?",
        geojson: "json_files/indian_ocean.json",
        options: ["Indian Ocean", "Pacific Ocean", "Atlantic Ocean", "Southern Ocean"],
        answer: "Indian Ocean"
      }
    ];

    let currentQuestionIndex = 0;

    // Shuffle helper
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function loadQuestion(index) {
      const q = questions[index];

      // Clear old layer
      if (currentLayer) quizMap.removeLayer(currentLayer);

      // Load GeoJSON
      fetch(q.geojson)
        .then((res) => res.json())
        .then((data) => {
          currentLayer = L.geoJSON(data, {
            style: {
              color: "yellow",
              weight: 2,
              fillColor: "orange",
              fillOpacity: 0.5
            }
          }).addTo(quizMap);

          quizMap.fitBounds(currentLayer.getBounds());
        });

      // Update UI
      quizQuestion.textContent = q.question;
      quizFeedback.textContent = "";
      quizOptions.innerHTML = "";
      scoreDisplay.textContent = "";
      retryBtn.classList.add("hidden");
      nextBtn.classList.add("hidden"); // hide NEXT until answered

      // Shuffle options
      const shuffledOptions = shuffle([...q.options]);
      shuffledOptions.forEach((opt) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.className =
          "px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-[#7EA16B] transition";
        btn.addEventListener("click", () => checkAnswer(opt, q.answer, btn));
        quizOptions.appendChild(btn);
      });
    }

    function checkAnswer(selected, correct, btn) {
      if (selected === correct) {
        quizFeedback.textContent = " Correct!";
        quizFeedback.style.color = "#7EA16B";
        btn.style.backgroundColor = "#7EA16B";
        btn.style.color = "black";
        score += 1;
      } else {
        quizFeedback.textContent = " Incorrect!";
        quizFeedback.style.color = "red";
        btn.style.backgroundColor = "red";
        score -= 1;
      }
      // Now allow moving forward
      nextBtn.classList.remove("hidden");
    }

    nextBtn.addEventListener("click", () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex);
      } else {
        quizFeedback.textContent = "🎉 You’ve completed the quiz!";
        scoreDisplay.textContent = `🏆 Final Score: ${score} points`;
        nextBtn.classList.add("hidden");
        retryBtn.classList.remove("hidden");
      }
    });

    retryBtn.addEventListener("click", () => {
      currentQuestionIndex = 0;
      score = 0;
      loadQuestion(currentQuestionIndex);
    });

    // Start quiz
    loadQuestion(currentQuestionIndex);
  }
});
// ---------------------------
// Boat Quiz Game
// ---------------------------
const boatQuestions = [
  {
    question: "Which ocean borders East Africa?",
    options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Southern Ocean"],
    answer: "Indian Ocean"
  },
  {
    question: "Which country is NOT in South Asia?",
    options: ["Nepal", "Bhutan", "Thailand", "Sri Lanka"],
    answer: "Thailand"
  },
  {
    question: "What is the capital of Indonesia?",
    options: ["Bangkok", "Jakarta", "Kuala Lumpur", "Manila"],
    answer: "Jakarta"
  }
];

let qIndex = 0;        // question index
let boatPosition = 0;  // boat progress
let boatScore = 0;     // correct answers
let timerInterval;
let timeLeft = 30;

const boatQuestionEl = document.getElementById("boat-question");
const boatOptionsEl = document.getElementById("boat-options");
const boatFeedbackEl = document.getElementById("boat-feedback");
const boatNextBtn = document.getElementById("boat-next-btn");
const boatScoreEl = document.getElementById("boat-score");
const boatProgressEl = document.getElementById("boat-progress");
const boatIcon = document.getElementById("boat-icon");
const boatRetryBtn = document.getElementById("boat-retry-btn");

// Timer element
const timerEl = document.createElement("p");
timerEl.className = "text-gray-300 mb-3";
boatQuestionEl.parentNode.insertBefore(timerEl, boatOptionsEl);

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 30;
  timerEl.textContent = `⏳ Time left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏳ Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      boatFeedbackEl.textContent = " Time's up! The boat drifts back...";
      moveBoat(-1);
      endQuestion();
    }
  }, 1000);
}

function loadBoatQuestion() {
  let q = boatQuestions[qIndex];
  boatQuestionEl.textContent = q.question;
  boatOptionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-[#7EA16B] transition";
    btn.onclick = () => checkBoatAnswer(btn, opt, q.answer);
    boatOptionsEl.appendChild(btn);
  });

  boatFeedbackEl.textContent = "";
  boatNextBtn.classList.add("hidden");
  startTimer();
}

function updateBoatPosition() {
  let progress = (boatPosition / boatQuestions.length) * 100;
  boatProgressEl.style.width = progress + "%";
  boatIcon.style.left = `calc(${progress}% - 16px)`;
}

function moveBoat(step) {
  boatPosition = Math.max(0, Math.min(boatQuestions.length, boatPosition + step));
  updateBoatPosition();
}

function checkBoatAnswer(button, selected, correct) {
  clearInterval(timerInterval);

  // disable all options
  const allButtons = boatOptionsEl.querySelectorAll("button");
  allButtons.forEach(b => b.disabled = true);

  if (selected === correct) {
    boatFeedbackEl.textContent = " Correct!";
    boatScore++;
    moveBoat(1);
  } else {
    boatFeedbackEl.textContent = " Wrong! The boat drifts back...";
    moveBoat(-1);
  }

  endQuestion();
}

function endQuestion() {
  qIndex++;
  if (qIndex < boatQuestions.length) {
    boatNextBtn.classList.remove("hidden");
  } else {
    endBoatQuiz();
  }
}

function endBoatQuiz() {
  clearInterval(timerInterval);
  boatOptionsEl.innerHTML = "";
  timerEl.textContent = "";

  if (boatPosition === boatQuestions.length) {
    boatQuestionEl.textContent = "You reached the island!";
    boatFeedbackEl.textContent = `Final Score: ${boatScore}/${boatQuestions.length}`;
  } else {
    boatQuestionEl.textContent = "You Lost!";
    boatFeedbackEl.textContent = `Final Score: ${boatScore}/${boatQuestions.length} — The boat sank before reaching the island.`;
    boatIcon.classList.add("boat-sink");
  }

  boatNextBtn.classList.add("hidden");
  boatRetryBtn.classList.remove("hidden");
}

boatNextBtn.onclick = () => {
  if (qIndex < boatQuestions.length) {
    loadBoatQuestion();
  }
};

boatRetryBtn.onclick = () => {
  qIndex = 0;
  boatPosition = 0;
  boatScore = 0;
  boatScoreEl.textContent = 0;
  boatRetryBtn.classList.add("hidden");
  updateBoatPosition();
  loadBoatQuestion();
};
// Overlay elements
const boatOverlay = document.getElementById("boat-overlay");
const boatStartBtn = document.getElementById("boat-start-btn");

boatStartBtn.onclick = () => {
  boatOverlay.style.display = "none"; // hide overlay
  updateBoatPosition();
  loadBoatQuestion(); // start the quiz
};

// Start game
updateBoatPosition();
// wait until player presses play 

// ===== Course Schedule Carousel =====
const track = document.querySelector(".carousel-track");
const slides2 = Array.from(track.children);
const prevBtn2 = document.querySelector(".prev");
const nextBtn2 = document.querySelector(".next");
let currentSlide = 0;

function updateCarousel() {
  slides2.forEach((slide, index) => {
    slide.classList.remove("active");
    if (index === currentSlide) {
      slide.classList.add("active");
    }
  });

  const offset = -currentSlide * 100;
  track.style.transform = `translateX(${offset}%)`;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides2.length; // loop forward
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides2.length) % slides2.length; // loop backward
  updateCarousel();
}

nextBtn2.addEventListener("click", () => {
  nextSlide();
  resetAutoplay();
});

prevBtn2.addEventListener("click", () => {
  prevSlide();
  resetAutoplay();
});

// Auto-play every 5s
function startAutoplay() {
  autoPlayInterval = setInterval(nextSlide, 5000);
}

function resetAutoplay() {
  clearInterval(autoPlayInterval);
  startAutoplay();
}

// Init
updateCarousel();
startAutoplay();
