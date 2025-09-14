document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------
     1. TOOLTIP TRANSLATION LOGIC
  ---------------------------- */
  const dict = {
    a: "the",
    gulyásleves: "goulash soup",
    egy: "a",
    híres: "famous",
    magyar: "Hungarian",
    étel: "dish",
    ez: "this",
    finom: "delicious",
    meleg: "warm",
    leves: "soup",
    sok: "many",
    hússal: "with meat",
    burgonyával: "with potatoes",
    és: "and",
    zöldséggel: "with vegetables",
    fő: "main",
    összetevő: "ingredient",
    marhahús: "beef",
    levesben: "in the soup",
    van: "there is",
    hagyma: "onion",
    paprika: "pepper",
    sárgarépa: "carrot",
    kömény: "cumin",
    gulyásleveset: "goulash soup",
    gyakran: "often",
    eszik: "eats",
    ebédre: "for lunch",
    télen: "in winter",
    nagyon: "very",
    jó: "good",
    mert: "because",
    melegít: "warms",
    szereti: "likes",
    ezt: "this",
    az: "the",
    ételt: "dish",
  };

  const container = document.getElementById("huText");
  if (container) {
    container.innerHTML = container.textContent.replace(
      /\p{L}+(?=[\s.,!?;:]|$)/gu,
      (word) => {
        const def = dict[word.toLowerCase()];
        if (!def) return word;
        return `<span class="has-tooltip" tabindex="0" data-translation="${def}">${word}</span>`;
      }
    );
  }

  /* --- WORD BANK LOGIC WITH MODAL --- */
  const openBtn = document.getElementById("openMyWords");
  const closeBtn = document.getElementById("closeMyWords");
  const modal = document.getElementById("myWordsModal");
  const myWordsList = document.getElementById("myWordsList");

  let savedWords = JSON.parse(localStorage.getItem("myWords")) || [];

  function renderMyWords() {
    myWordsList.innerHTML = "";
    savedWords.forEach(({ word, translation }, index) => {
      const li = document.createElement("li");

      // Create container for word + translation
      const textSpan = document.createElement("span");
      textSpan.innerHTML = `<strong>${word}</strong> – ${translation}`;

      // Create delete button
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

  // Clear All button
  const clearBtn = document.getElementById("clearMyWords");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      savedWords = [];
      localStorage.removeItem("myWords");
      renderMyWords();
    });
  }

  // Listen for clicks on tooltips
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

  // Open modal
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      renderMyWords();
      modal.style.display = "block";
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Close if clicking outside modal content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  /* ---------------------------
     2. DIFFICULTY FILTER LOGIC
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
          card.style.display = ""; // make sure it's in the layout
          // trigger reflow so animation plays when removing .hidden
          void card.offsetWidth;
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
          // after fade-out, remove from layout
          setTimeout(() => {
            if (card.classList.contains("hidden")) {
              card.style.display = "none";
            }
          }, 300); // match CSS transition time
        }
      });
    });
  }
});
