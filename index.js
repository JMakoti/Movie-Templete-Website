let movies = [];
let currentMovieIndex = 0;
let player = null;

// Fetch movies.json and initialize
fetch('movies.json')
    .then(res => res.json())
    .then(data => {
        movies = data;
        renderMainContent(movies[0]);
        renderPopularCards(movies);
        renderSearchResults(movies);
        setupSearchFilter();
    });

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    if (movies.length > 0) {
        initializePlayer(movies[0]);
    }
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function initializePlayer(movie) {
    const videoId = extractVideoId(movie.trailer);
    if (videoId) {
        player = new YT.Player('youtube-player', {
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                mute: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                enablejsapi: 1
            },
            events: {
                onStateChange: onPlayerStateChange
            }
        });
    }
}

function extractVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        loadNextVideo();
    }
}

function loadNextVideo() {
    movies.push(movies.shift());
    renderPopularCards(movies, 'slide-left');
    currentMovieIndex = 0;
    const nextMovie = movies[currentMovieIndex];
    renderMainContent(nextMovie);
    
    const videoId = extractVideoId(nextMovie.trailer);
    if (player && videoId) {
        player.loadVideoById(videoId);
    }
}

function renderMainContent(movie) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <img id="title" src="${movie.title1 || ''}" alt="${movie.title || 'Movie title'}">
        <h3 class="company">${movie.company || ''}</h3>
        <p id="plot">${movie.extract || ''}</p>
        <div class="details">
            <h5 id="gen">${Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || ''}</h5>
            <h4 id="date">${movie.year || ''}</h4>
            <h3 id="rate"><span>IMDB</span><i class='bx bxs-star'></i>${movie.imdb || ''}</h3>
        </div>
    `;
    
    if (!player && window.YT && window.YT.Player) {
        initializePlayer(movie);
    } else if (player && movie.trailer) {
        const videoId = extractVideoId(movie.trailer);
        if (videoId) {
            player.loadVideoById(videoId);
        }
    }
}

function renderPopularCards(movies, animation = null) {
    const cardsContainer = document.getElementById('popular-cards');
    if (!cardsContainer) return;
    
    cardsContainer.classList.remove('slide-left', 'slide-right');

    const cards = movies.map((movie, idx) => `
        <a href="#" class="card ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
            <img src="${movie.sposter || movie.poster || ''}" alt="${movie.title || 'Movie poster'}" class="poster">
        </a>
    `).join('');
    cardsContainer.innerHTML = cards;

    if (animation) {
        void cardsContainer.offsetWidth;
        cardsContainer.classList.add(animation);
    }

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const idx = this.getAttribute('data-idx');
            currentMovieIndex = Number(idx);
            renderMainContent(movies[currentMovieIndex]);
        });
    });
}

function renderSearchResults(movies) {
    const search = document.querySelector('.search-results');
    if (!search) return;
    
    search.innerHTML = '';
    movies.forEach((movie, idx) => {
        let card = document.createElement('a');
        card.classList.add('card');
        card.href = `#`;
        card.setAttribute('data-idx', idx);
        card.innerHTML = `
            <img src="${movie.sposter || movie.poster || ''}" alt="${movie.title || 'Movie poster'}">
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
        });
        search.appendChild(card);
    });
}

function setupSearchFilter() {
    const search_input = document.getElementById("search_input");
    const search = document.querySelector('.search-results');
    if (!search_input || !search) return;
    
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

// Filter movies based on type
document.addEventListener('DOMContentLoaded', function() {
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
                const mainContent = document.getElementById('main-content');
                if (mainContent) mainContent.innerHTML = "<p>No movies found.</p>";
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
            movies.push(movies.shift());
            renderPopularCards(movies, 'slide-right');
            currentMovieIndex = 0;
            renderMainContent(movies[currentMovieIndex]);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            movies.unshift(movies.pop());
            renderPopularCards(movies, 'slide-left');
            currentMovieIndex = 0;
            renderMainContent(movies[currentMovieIndex]);
        });
    }
});