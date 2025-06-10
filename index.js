let movies = "movies.json";
let currentMovieIndex = 0;
let autoSliderInterval = null;

// Fetch movies.json and initialize
fetch('movies.json')
    .then(res => res.json())
    .then(data => {
        movies = data;
        renderMainContent(movies[0]);
        renderPopularCards(movies);
        renderSearchResults(movies);
        setupSearchFilter();
        // startAutoSlider();
    });


function renderMainContent(movie) {
    document.getElementById('main-content').innerHTML = `
        <img id="title" src="${movie.title1 || ''}" alt="">
        <p id="plot">${movie.extract || ''}</p>
        <div class="details">
            <h6>${movie.type || ''}</h6>
            <h5 id="gen">${Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || ''}</h5>
            <h4 id="date">${movie.year || ''}</h4>
            <h3 id="rate"><span>IMDB</span><i class='bx bxs-star'></i>${movie.imdb || ''}</h3>
        </div>
    `;
    // Animate video fade out, change source, then fade in
    const video = document.querySelector('header iframe');
    if (!video) return; // Ensure video element exists
    video.classList.add('fade-out');
    setTimeout(() => {
        video.onended = null; // Remove previous event to avoid stacking
        video.src = movie.trailer && movie.trailer.trim() !== "" ? movie.trailer : "videos/default.mp4";
        // video.load();
        // video.autoplay = true;
        // video.muted = true; // Ensure autoplay works in all browsers
        // video.play().catch(() => { }); // Try to play immediately
        // video.oncanplay = function () {
        //     video.play().catch(() => { });
        // };
        video.onloadedmetadata = function () {
            // After trailer duration, prepend last card to the front (same as next button)
            if (autoSliderInterval) clearTimeout(autoSliderInterval);
            autoSliderInterval = setTimeout(() => {
                movies.push(movies.shift());
                renderPopularCards(movies, 'slide-left');
                currentMovieIndex = 0;
                renderMainContent(movies[currentMovieIndex]);
            }, video.duration * 1000);
            console.log(`Video duration: ${video.duration} seconds`);
        };
        video.onended = function () {
            // Also prepend last card to the front when trailer ends
            movies.push(movies.shift());
            renderPopularCards(movies, 'slide-left');
            currentMovieIndex = 0;
            renderMainContent(movies[currentMovieIndex]);
        };
        video.classList.remove('fade-out');
        video.classList.add('fade-in');
        setTimeout(() => {
            video.classList.remove('fade-in');
        }, 100); // match transition duration
    }, 400); // fade out duration
}


function renderPopularCards(movies, animation = null) {
    const cardsContainer = document.getElementById('popular-cards');
    // Remove previous animation classes
    cardsContainer.classList.remove('slide-left', 'slide-right');

    const cards = movies.map((movie, idx) => `
        <a href="#" class="card" data-idx="${idx}">
            <img src="${movie.sposter || movie.poster || ''}" alt="" class="poster">
        </a>
    `).join('');
    cardsContainer.innerHTML = cards;

    // Trigger animation if specified
    if (animation) {
        // Force reflow to restart animation
        void cardsContainer.offsetWidth;
        cardsContainer.classList.add(animation);
    }

    // Add click listeners
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function (e) {
            e.preventDefault();
            const idx = this.getAttribute('data-idx');
            currentMovieIndex = Number(idx);
            renderMainContent(movies[currentMovieIndex]);
            resetAutoSlider();
        });
    });
}

// --- Search Functionality ---

function renderSearchResults(movies) {
    const search = document.querySelector('.search-results');
    search.innerHTML = '';
    movies.forEach((movie, idx) => {
        let card = document.createElement('a');
        card.classList.add('card');
        card.href = `#`;
        card.setAttribute('data-idx', idx);
        card.innerHTML = `
            <img src="${movie.sposter || movie.poster || ''}" alt="${movie.title || ''}">
            <div class="cont">
                <h3>${movie.title || ''}</h3>
                <p>${Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || ''} ,${movie.year || ''}, <span>IMDB</span><i class='bx bxs-star'></i>${movie.imdb || ''}</p>
            </div>
        `;
        card.addEventListener('click', function (e) {
            e.preventDefault();
            currentMovieIndex = idx;
            renderMainContent(movies[idx]);
            search.style.visibility = "hidden";
            search.style.opacity = 0;
            resetAutoSlider();
        });
        search.appendChild(card);
    });
}

function setupSearchFilter() {
    const search_input = document.getElementById("search_input");
    const search = document.querySelector('.search-results');
    search_input.addEventListener('keyup', () => {
        let filter = search_input.value.toUpperCase();
        let a = search.getElementsByTagName('a');
        let hasResults = false;
        for (let index = 0; index < a.length; index++) {
            let b = a[index].getElementsByClassName('cont')[0];
            let TextValue = b.textContent || b.innerText;
            if (TextValue.toUpperCase().indexOf(filter) > -1 && filter.length > 0) {
                a[index].style.display = "flex";
                hasResults = true;
            } else {
                a[index].style.display = "none";
            }
        }
        if (hasResults) {
            search.style.visibility = "visible";
            search.style.opacity = 1;
        } else {
            search.style.visibility = "hidden";
            search.style.opacity = 0;
        }
        if (search_input.value.length === 0) {
            search.style.visibility = "hidden";
            search.style.opacity = 0;
        }
    });
}

// filter movies based on type
document.querySelectorAll('.logo_ul ul li a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const type = this.textContent.trim();
        let filteredMovies;
        if (type === "Home") {
            filteredMovies = movies;
        } else if (type === "Series") {
            filteredMovies = movies.filter(m => (m.type || "").toLowerCase() === "series");
        } else if (type === "Movies") {
            filteredMovies = movies.filter(m => (m.type || "").toLowerCase() === "movie");
        } else if (type === "Kids") {
            filteredMovies = movies.filter(m => (m.type || "").toLowerCase() === "kids");
        } else {
            filteredMovies = movies;
        }
        if (filteredMovies.length > 0) {
            currentMovieIndex = 0;
            renderMainContent(filteredMovies[0]);
        } else {
            document.getElementById('main-content').innerHTML = "<p>No movies found.</p>";
        }
        renderPopularCards(filteredMovies);
        renderSearchResults(filteredMovies);
    });
});

// Manual slider event listeners
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

if (nextBtn) {
    nextBtn.addEventListener('click', function () {
        // Move first card to the end (append)
        movies.push(movies.shift());
        renderPopularCards(movies, 'slide-right');
        currentMovieIndex = 0;
        renderMainContent(movies[currentMovieIndex]);
        resetAutoSlider();
    });

}
if (prevBtn) {
    prevBtn.addEventListener('click', function () {
        // Move last card to the front (prepend)
        movies.unshift(movies.pop());
        renderPopularCards(movies, 'slide-left');
        currentMovieIndex = 0;
        renderMainContent(movies[currentMovieIndex]);
        resetAutoSlider();
    });
}