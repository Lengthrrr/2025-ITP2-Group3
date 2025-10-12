/**
 * FutureNav - Main JavaScript
 * script.js - Interactive functionality for the futuristic navigation experience
 * March 24, 2025
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const navbar = document.getElementById("navbar");
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const sections = document.querySelectorAll("section");
  const bgElements = document.querySelectorAll(".fixed > div");

  // Mobile Menu Toggle
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

  // Close mobile menu when a link is clicked
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuButton.classList.remove("active");
      mobileMenu.style.height = "0";
      mobileMenu.classList.remove("open");
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    highlightCurrentSection();
  });

  // Smooth scroll for nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      
      // Only prevent default and smooth scroll for same-page links (starting with #)
      if (targetId.startsWith("#")) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 70; // Adjust for navbar height
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth"
          });

          // Highlight the section briefly
          targetSection.classList.add("section-highlight");
          setTimeout(() => {
            targetSection.classList.remove("section-highlight");
          }, 1000);
        }
      }
      // For links to other pages (like index.html#section), let the browser handle them naturally
    });
  });

  // Highlight active section in navbar
  function highlightCurrentSection() {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
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

  // Parallax effect for background elements
  /*
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      bgElements.forEach(element => {
        const speed = 20; // Adjust for more or less movement
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;
        
        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    });
  }
  */

  // Scroll animations for sections
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

  // Initialize active section on page load
  highlightCurrentSection();

  // Make header text visible with animation
  setTimeout(() => {
    const headerText = document.querySelector(".text-6xl");
    if (headerText) {
      headerText.style.opacity = 1;
      headerText.style.transform = "translateY(0)";
    }
  }, 300);

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
        geojson: "./json_files/bayofbengal.geojson.json",
        options: ["Bay of Bengal", "Bay of Biscay", "Brunei Bay", "Baffin Bay"],
        answer: "Bay of Bengal"
      },
      {
        question: "Which island is highlighted?",
        geojson: "./json_files/sri_lanka.json",
        options: ["Sri Lanka", "Madagascar", "Sumatra", "Taiwan"],
        answer: "Sri Lanka"
      },
      {
        question: "Which sea is this?",
        geojson: "./json_files/South_China_Sea.json",
        options: ["South China Sea", "East China Sea", "Philippine Sea", "Bay of Bengal"],
        answer: "South China Sea"
      },
      {
        question: "What island chain is this?",
        geojson: "./json_files/philippines.json",
        options: ["Philippines", "Indonesia", "Japan", "Maldives"],
        answer: "Philippines"
      },
      {
        question: "Identify this island",
        geojson: "./json_files/java.json",
        options: ["Sumatra", "Borneo", "Java", "Sulawesi"],
        answer: "Java"
      },
      {
        question: "Which island is this?",
        geojson: "./json_files/borneo.json",
        options: ["Borneo", "Sulawesi", "Papua New Guinea", "Madagascar"],
        answer: "Borneo"
      },
      {
        question: "What sea is highlighted?",
        geojson: "./json_files/Eastern_china_sea.json",
        options: ["East China Sea", "South China Sea", "Sea of Japan", "Philippine Sea"],
        answer: "East China Sea"
      },
      {
        question: "Which ocean is this?",
        geojson: "./json_files/indian_ocean.json",
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
        btn.className = [
          "px-4","py-2","bg-gray-800","text-white","rounded-lg",
          "hover:bg-[#7EA16B]","transition","border","border-transparent",
          "focus:outline-none","focus:ring-2","focus:ring-[#7EA16B]/40"
        ].join(' ');
        btn.addEventListener("click", () => checkAnswer(opt, q.answer, btn));
        quizOptions.appendChild(btn);
      });
    }

    function checkAnswer(selected, correct, btn) {
      // Prevent multiple clicks
      const allButtons = quizOptions.querySelectorAll('button');
      allButtons.forEach(b => { b.disabled = true; b.classList.add('cursor-not-allowed'); });

      const isCorrect = selected === correct;
      if (isCorrect) {
        quizFeedback.textContent = "Correct!";
        quizFeedback.style.color = "#7EA16B";
        btn.style.backgroundColor = "#7EA16B";
        btn.style.color = "#111827";
        btn.style.borderColor = "#7EA16B";
        btn.style.outline = "2px solid #7EA16B";
        btn.style.outlineOffset = "2px";
        score += 1;
      } else {
        quizFeedback.textContent = "Incorrect";
        quizFeedback.style.color = "#cc1414";
        btn.style.backgroundColor = "#cc1414";
        btn.style.borderColor = "#cc1414";
        btn.style.outline = "2px solid #cc1414";
        btn.style.outlineOffset = "2px";
        score -= 1;
        // Also highlight the correct answer for learning
        allButtons.forEach(b => {
          if (b.textContent === correct) {
            b.style.backgroundColor = "#166534"; // dark green
            b.style.borderColor = "#22c55e";
            b.style.outline = "2px solid #22c55e";
            b.style.outlineOffset = "2px";
          }
        });
      }
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

// Only initialize boat quiz if required elements exist
if (boatQuestionEl && boatOptionsEl && boatFeedbackEl && boatNextBtn && boatScoreEl && boatProgressEl && boatIcon && boatRetryBtn) {
  // Keep score display consistent
  function updateBoatScoreDisplay(){
    boatScoreEl.textContent = boatScore;
  }
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
      boatFeedbackEl.textContent = "Time's up! The boat drifts back...";
      // Treat timeout as incorrect answer with score penalty (min 0)
      boatScore = Math.max(0, boatScore - 1);
      updateBoatScoreDisplay();
      moveBoat(-1);
      endQuestion();
    }
  }, 1000);
}

function loadBoatQuestion() {
  let q = boatQuestions[qIndex];
  boatQuestionEl.textContent = q.question;
  boatOptionsEl.innerHTML = "";
  updateBoatScoreDisplay();

  // Shuffle options before rendering
  const shuffledOptions = shuffle([...q.options]);

  shuffledOptions.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-[#7EA16B] transition";
    btn.onclick = () => checkBoatAnswer(btn, opt, q.answer);
    boatOptionsEl.appendChild(btn);
  });

  boatFeedbackEl.textContent = "";
  boatFeedbackEl.style.color = ""; // reset color each question
  boatNextBtn.classList.add("hidden");
  startTimer();
}

// Add this shuffle helper if it doesn’t already exist
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
  allButtons.forEach(b => { b.disabled = true; b.classList.add('cursor-not-allowed'); });

  const isCorrect = selected === correct;
  if (isCorrect) {
    boatFeedbackEl.textContent = "Correct";
    boatFeedbackEl.style.color = "#7EA16B"; // green
    // style the chosen button
    button.style.backgroundColor = "#7EA16B";
    button.style.color = "#111827";
    button.style.border = "1px solid #7EA16B";
    button.style.outline = "2px solid #7EA16B";
    button.style.outlineOffset = "2px";
    boatScore++;
    updateBoatScoreDisplay();
    moveBoat(1);
  } else {
    boatFeedbackEl.textContent = "Incorrect";
    boatFeedbackEl.style.color = "#cc1414"; // red
    // highlight wrong selection
    button.style.backgroundColor = "#cc1414";
    button.style.border = "1px solid #cc1414";
    button.style.outline = "2px solid #cc1414";
    button.style.outlineOffset = "2px";
  // Penalize incorrect (min 0)
  boatScore = Math.max(0, boatScore - 1);
  updateBoatScoreDisplay();
  moveBoat(-1);
    // highlight correct answer
    allButtons.forEach(b => {
      if (b.textContent === correct) {
        b.style.backgroundColor = "#166534"; // dark green
        b.style.border = "1px solid #22c55e";
        b.style.outline = "2px solid #22c55e";
        b.style.outlineOffset = "2px";
      }
    });
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
  updateBoatScoreDisplay();
  boatRetryBtn.classList.add("hidden");
  updateBoatPosition();
  loadBoatQuestion();
};
  // No overlay: initialize immediately
  updateBoatPosition();
  loadBoatQuestion();
} else {
  console.warn("Boat quiz elements not found; skipping boat quiz initialization.");
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}

// ---------------------------
// Week Dropdown (Accordion) Logic
// ---------------------------
(function(){
  const toggles = document.querySelectorAll('.week-toggle');
  const closeOthers = (currentBtn) => {
    toggles.forEach(other => {
      if (other !== currentBtn) {
        const otherContent = document.getElementById(other.getAttribute('aria-controls'));
        collapse(otherContent, other);
      }
    });
  };

  function expand(panel, btn){
    if(!panel) return;
    // measure content height (inner wrapper)
    const inner = panel.querySelector('.week-content-inner');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    
    // Temporarily make visible to measure
    panel.style.maxHeight = 'none';
    panel.style.height = 'auto';
    const height = panel.scrollHeight;
    panel.style.height = '';
    panel.style.maxHeight = '0px';
    
    // Force reflow then animate
    panel.offsetHeight;
    panel.style.maxHeight = height + 'px';
    
    const arrow = btn.querySelector('.arrow');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }

  function collapse(panel, btn){
    if(!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    if(btn) btn.setAttribute('aria-expanded','false');
    panel.style.maxHeight = '0px';
    if(btn){
      const arrow = btn.querySelector('.arrow');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  }

  // Initialize all panels to 0 height
  document.querySelectorAll('.week-content-wrapper').forEach(p => {
    p.style.overflow = 'hidden';
    p.style.maxHeight = '0px';
  });

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const isOpen = panel.classList.contains('open');
      closeOthers(btn);
      if (isOpen) {
        collapse(panel, btn);
      } else {
        expand(panel, btn);
      }
    });
  });
})();


