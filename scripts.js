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
    try {
      await loadText(textId);
      dict = await loadDictionary(textId);
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
        /\p{L}+(?=[\s.,!?;:"“”„]|$)/gu,
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
      const word = e.target.textContent.trim();
      const translation = e.target.dataset.translation;
      if (!savedWords.some((item) => item.word === word)) {
        savedWords.push({ word, translation });
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
});
