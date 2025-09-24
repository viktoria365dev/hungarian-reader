document.addEventListener("DOMContentLoaded", async () => {
  /* ---------------------------
     1. LOAD TEXT FROM .TXT FILE
  ---------------------------- */
  async function loadText(id) {
    const res = await fetch(`data/${id}.txt`);
    if (!res.ok) throw new Error("Text file not found");
    const raw = await res.text();

    const container = document.getElementById("huText");
    container.innerHTML = raw
      .split(/\n\s*\n/)
      .map((par) => `<p>${par.trim()}</p>`)
      .join("");
  }

  /* ---------------------------
     2. LOAD DICTIONARY FROM .JSON FILE
  ---------------------------- */
  async function loadDictionary(id) {
    const res = await fetch(`data/${id}.json`);
    if (!res.ok) throw new Error("Dictionary not found");
    return res.json();
  }

  /* ---------------------------
     3. DETECT TEXT ID AND LOAD CONTENT
  ---------------------------- */
  const mainEl = document.querySelector("[data-text-id]");
  let dict = {};
  if (mainEl) {
    const textId = mainEl.dataset.textId;

    // ✅ Handle "Mark as Read" button
    const markBtn = document.getElementById("markAsReadBtn");
    const unmarkBtn = document.getElementById("markAsUnreadBtn");
    const confirmMsg = document.getElementById("readConfirmation");
    const confirmed = JSON.parse(localStorage.getItem("confirmedReads")) || [];

    function updateReadUI(isRead) {
      if (markBtn) markBtn.style.display = isRead ? "none" : "inline-block";
      if (unmarkBtn) unmarkBtn.style.display = isRead ? "inline-block" : "none";
      if (confirmMsg) confirmMsg.style.display = isRead ? "block" : "none";
    }

    if (confirmed.includes(textId)) {
      updateReadUI(true);
    }

    if (markBtn) {
      markBtn.addEventListener("click", () => {
        if (!confirmed.includes(textId)) {
          confirmed.push(textId);
          localStorage.setItem("confirmedReads", JSON.stringify(confirmed));
          updateProgress();
        }
        updateReadUI(true);
      });
    }

    if (unmarkBtn) {
      unmarkBtn.addEventListener("click", () => {
        const index = confirmed.indexOf(textId);
        if (index !== -1) {
          confirmed.splice(index, 1);
          localStorage.setItem("confirmedReads", JSON.stringify(confirmed));
          updateProgress();
        }
        updateReadUI(false);
      });
    }

    // ✅ Track progress: store visited text ID
    const visited = JSON.parse(localStorage.getItem("visitedTexts")) || [];
    if (!visited.includes(textId)) {
      visited.push(textId);
      localStorage.setItem("visitedTexts", JSON.stringify(visited));
    }

    try {
      await loadText(textId);
      dict = await loadDictionary(textId);
      await loadQuestions(textId);
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------------------------
     4. TOOLTIP TRANSLATION LOGIC
  ---------------------------- */
  const container = document.getElementById("huText");
  if (container && Object.keys(dict).length) {
    const paragraphs = container.querySelectorAll("p");
    paragraphs.forEach((p) => {
      p.innerHTML = p.textContent.replace(
        /[\p{L}-]+(?=[\s.,!?;:"“”„]|$)/gu,
        (word) => {
          const def = dict[word.toLowerCase()];
          if (!def) return word;
          return `<span class="has-tooltip" tabindex="0" data-translation="${def}">${word}</span>`;
        }
      );
    });
  }

  /* ---------------------------
     5. INTERACTION TIP TEXT
  ---------------------------- */
  const tipEl = document.getElementById("interactionTip");
  if (tipEl) {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    tipEl.textContent = isTouch
      ? "Tip: Tap a word to see its translation and add it to My Words."
      : "Tip: Hover over a word to see its translation, or click to add it to My Words.";
  }

  /* ---------------------------
     6. WORD BANK LOGIC WITH MODAL
  ---------------------------- */
  const openBtn = document.getElementById("openMyWords");
  const closeBtn = document.getElementById("closeMyWords");
  const modal = document.getElementById("myWordsModal");
  const myWordsList = document.getElementById("myWordsList");

  let savedWords = JSON.parse(localStorage.getItem("myWords")) || [];

  function renderMyWords() {
    myWordsList.innerHTML = "";
    savedWords.forEach(({ word, translation }, index) => {
      const li = document.createElement("li");
      const textSpan = document.createElement("span");
      textSpan.innerHTML = `<strong>${word}</strong> – ${translation}`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.classList.add("delete-word");
      delBtn.addEventListener("click", () => {
        savedWords.splice(index, 1);
        localStorage.setItem("myWords", JSON.stringify(savedWords));
        renderMyWords();
      });
      li.appendChild(textSpan);
      li.appendChild(delBtn);
      myWordsList.appendChild(li);
    });
  }

  const clearBtn = document.getElementById("clearMyWords");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      savedWords = [];
      localStorage.removeItem("myWords");
      renderMyWords();
    });
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("has-tooltip")) {
      const rawWord = e.target.textContent.trim();
      const normalizedWord = rawWord.toLowerCase();
      const translation = e.target.dataset.translation;

      if (
        !savedWords.some((item) => item.word.toLowerCase() === normalizedWord)
      ) {
        savedWords.push({ word: rawWord, translation });
        localStorage.setItem("myWords", JSON.stringify(savedWords));
      }
    }
  });

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      renderMyWords();
      modal.style.display = "block";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  /* ---------------------------
   6b. LOAD CARDS ON INDEX PAGE
 ---------------------------- */
  const cardsContainer = document.getElementById("cardsContainer");

  if (cardsContainer) {
    async function loadCards() {
      const res = await fetch("data/cards.json");
      if (!res.ok) throw new Error("Failed to load cards");
      const cards = await res.json();

      cardsContainer.innerHTML = cards
        .map((card) => {
          return `
          <a href="./${card.id}.html" class="card" data-level="${card.level}">
            <img src="${card.image}" alt="${card.title}" />
            <div class="card-content">
              <h3>${card.title}</h3>
              <p>${card.description}</p>
              <div class="difficulty">
                <span class="level-text ${card.level}">${capitalize(
            card.level
          )}</span>
                <div class="difficulty-bar ${card.level}">
                  <div class="difficulty-fill"></div>
                </div>
              </div>
            </div>
          </a>
        `;
        })
        .join("");
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    await loadCards();
  }

  /* ---------------------------
     7. DIFFICULTY FILTER LOGIC
  ---------------------------- */
  const filterSelect = document.getElementById("levelFilter");
  const cards = document.querySelectorAll(".cards-container .card");

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const selected = filterSelect.value;
      cards.forEach((card) => {
        const level = card.dataset.level;
        const shouldShow = selected === "all" || level === selected;
        if (shouldShow) {
          card.style.display = "";
          void card.offsetWidth;
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
          setTimeout(() => {
            if (card.classList.contains("hidden")) {
              card.style.display = "none";
            }
          }, 300);
        }
      });
    });
  }

  /* ---------------------------
     7. COMPREHENSION QUESTIONS
  ---------------------------- */

  async function loadQuestions(id) {
    const res = await fetch("data/questions.json");
    if (!res.ok) return;
    const allQuestions = await res.json();
    const questions = allQuestions[id];
    if (!questions) return;

    const container = document.getElementById("questionsContainer");
    if (!container) return;

    container.innerHTML = questions
      .map((q, i) => {
        const options = q.options
          .map(
            (opt) =>
              `<label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label>`
          )
          .join("<br>");
        return `
        <div class="mb-3 question-block" data-answer="${q.answer}">
          <p><strong>${q.question}</strong></p>
          ${options}
          <p class="feedback mt-2" style="display:none;"></p>
          <p class="answer text-success mt-1" style="display:none;">✔️ ${q.answer}</p>
        </div>
      `;
      })
      .join("");

    container.addEventListener("change", (e) => {
      const selected = e.target.value;
      const block = e.target.closest(".question-block");
      const correct = block.dataset.answer;
      const feedbackEl = block.querySelector(".feedback");
      const answerEl = block.querySelector(".answer");

      if (selected === correct) {
        feedbackEl.innerHTML = `<span class="text-success">✅ Correct!</span>`;
      } else {
        feedbackEl.innerHTML = `<span class="text-danger">❌ Incorrect: <strong>${selected}</strong></span>`;
      }

      feedbackEl.style.display = "block";
      answerEl.style.display = "block";
    });
  }

  const progressEl = document.getElementById("progressSummary");
  const progressBar = document.getElementById("progressBar");
  const progressBadge = document.getElementById("progressBadge");

  async function updateProgress() {
    const visited = JSON.parse(localStorage.getItem("confirmedReads")) || [];
    const savedWords = JSON.parse(localStorage.getItem("myWords")) || [];

    let totalTexts = 0;
    try {
      const res = await fetch("data/cards.json");
      if (res.ok) {
        const cards = await res.json();
        totalTexts = new Set(cards.map((card) => card.id)).size;
      }
    } catch (err) {
      console.error("Could not load cards.json", err);
    }

    const percent = totalTexts
      ? Math.round((visited.length / totalTexts) * 100)
      : 0;

    if (progressEl) {
      progressEl.textContent = `You've read ${
        visited.length
      } of ${totalTexts} texts and saved ${savedWords.length} word${
        savedWords.length !== 1 ? "s" : ""
      }.`;
    }

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
      progressBar.setAttribute("aria-valuenow", percent);
      progressBar.textContent = `${percent}%`;
    }

    if (progressBadge) {
      if (percent === 100) {
        progressBadge.style.display = "block";
      } else {
        progressBadge.style.display = "none";
      }
    }
  }

  await updateProgress();
});
