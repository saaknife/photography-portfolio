(() => {
  const header = document.getElementById("siteHeader");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(document.querySelectorAll(".card"));
  const countEl = document.getElementById("worksCount");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxMeta = document.getElementById("lightboxMeta");
  const lightboxCount = document.getElementById("lightboxCount");
  const closeBtn = document.querySelector(".lightbox-close");
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");

  let visibleCards = cards.slice();
  let currentIndex = 0;
  let isOpen = false;
  let touchStartX = null;
  let galleryColumns = [];
  let columnCount = 0;
  let resizeTimer = null;

  function updateCount() {
    countEl.textContent = `${visibleCards.length} 件作品`;
  }

  function getColumnCount() {
    const width = window.innerWidth;
    if (width <= 620) return 1;
    if (width <= 1080) return 2;
    return 3;
  }

  function columnHeight(column) {
    let height = 0;
    column.querySelectorAll(".card:not([hidden])").forEach((card) => {
      height += card.getBoundingClientRect().height + 20;
    });
    return height;
  }

  function layoutGallery() {
    const gallery = document.getElementById("gallery");
    const count = getColumnCount();
    const currentCards = cards;

    if (count !== columnCount) {
      gallery.innerHTML = "";
      galleryColumns = [];
      for (let i = 0; i < count; i += 1) {
        const column = document.createElement("div");
        column.className = "gallery-col";
        gallery.appendChild(column);
        galleryColumns.push(column);
      }
      columnCount = count;
    } else {
      galleryColumns.forEach((column) => (column.innerHTML = ""));
    }

    currentCards
      .filter((card) => !card.hidden)
      .forEach((card) => {
        const shortest = galleryColumns.reduce((best, column) =>
          columnHeight(column) < columnHeight(best) ? column : best
        );
        shortest.appendChild(card);
      });
  }

  function applyFilter(name) {
    visibleCards = cards.filter((card) => name === "all" || card.dataset.filter === name);
    cards.forEach((card) => {
      card.hidden = !visibleCards.includes(card);
    });
    updateCount();
    layoutGallery();
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === btn));
      applyFilter(btn.dataset.filter);
    });
  });

  function showImage(index) {
    const card = visibleCards[index];
    if (!card) return;

    const button = card.querySelector(".card-btn");
    const image = card.querySelector("img");

    lightboxImg.classList.remove("is-loaded");
    lightboxImg.src = image.currentSrc || image.src;
    lightboxImg.alt = image.alt;
    lightboxTitle.textContent = button.dataset.title;
    lightboxMeta.textContent = button.dataset.meta;
    lightboxCount.textContent = `${index + 1} / ${visibleCards.length}`;
    currentIndex = index;

    if (lightboxImg.complete) {
      lightboxImg.classList.add("is-loaded");
    }
  }

  function openLightbox(index) {
    if (!visibleCards.length) return;
    isOpen = true;
    document.body.classList.add("no-scroll");
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    showImage(index);
    closeBtn.focus();
  }

  function closeLightbox() {
    isOpen = false;
    document.body.classList.remove("no-scroll");
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  function step(direction) {
    const next = (currentIndex + direction + visibleCards.length) % visibleCards.length;
    showImage(next);
  }

  cards.forEach((card) => {
    const button = card.querySelector(".card-btn");
    button.addEventListener("click", () => {
      openLightbox(visibleCards.indexOf(card));
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightboxImg.addEventListener("load", () => {
    lightboxImg.classList.add("is-loaded");
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      step(-1);
    } else if (event.key === "ArrowRight") {
      step(1);
    }
  });

  lightbox.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 48) {
        step(delta > 0 ? -1 : 1);
      }
      touchStartX = null;
    },
    { passive: true }
  );

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutGallery, 150);
  });
  onScroll();
  applyFilter("all");
})();
