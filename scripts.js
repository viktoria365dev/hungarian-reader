// window.addEventListener("DOMContentLoaded", () => {
//   const dict = new Map(
//     Object.entries({
//       a: "the",
//       gulyásleves: "goulash soup",
//       egy: "a",
//       híres: "famous",
//       magyar: "Hungarian",
//       étel: "dish",
//       ez: "this",
//       finom: "delicious",
//       meleg: "warm",
//       leves: "soup",
//       sok: "many",
//       hússal: "with meat",
//       burgonyával: "with potatoes",
//       és: "and",
//       zöldséggel: "with vegetables",
//       fő: "main",
//       összetevő: "ingredient",
//       marhahús: "beef",
//       levesben: "in the soup",
//       van: "there is",
//       hagyma: "onion",
//       paprika: "pepper",
//       sárgarépa: "carrot",
//       kömény: "cumin",
//       gulyásleveset: "goulash soup",
//       gyakran: "often",
//       eszik: "eats",
//       ebédre: "for lunch",
//       télen: "in winter",
//       nagyon: "very",
//       jó: "good",
//       mert: "because",
//       melegít: "warms",
//       szereti: "likes",
//       ezt: "this",
//       az: "the",
//       ételt: "dish",
//     })
//   );

//   const container = document.getElementById("huText");
//   if (!container) return;

//   container.innerHTML = container.innerHTML.replace(
//     /\p{L}+(?=[\s.,!?;:]|$)/gu,
//     (word) => {
//       const def = dict.get(word.toLowerCase());
//       if (!def) return word;

//       return `<span class="has-tooltip" tabindex="0" data-translation="${def}">${word}</span>`;
//     }
//   );
// });

window.addEventListener("DOMContentLoaded", () => {
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
  if (!container) return;

  container.innerHTML = container.innerHTML.replace(
    /\p{L}+(?=[\s.,!?;:]|$)/gu,
    (word) => {
      const def = dict[word.toLowerCase()];
      if (!def) return word;

      return `<span class="has-tooltip" tabindex="0" data-translation="${def}">${word}</span>`;
    }
  );
});
