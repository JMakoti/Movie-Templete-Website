// let left_btn = document.getElementsByClassName("bx-chevron-left")[0];
// let right_btn = document.getElementsByClassName("bx-chevron-right")[0];
// let cards = document.getElementsByClassName("cards")[0];
// let search = document.getElementsByClassName("search")[0];
// let search_input = document.getElementById("search_input");
// left_btn.addEventListener("click",()=>{
//     cards.scrollLeft -= 140;
// })
// right_btn.addEventListener("click",()=>{
//     cards.scrollLeft += 140;
// })


// let json_url = "movies.json"

// fetch(json_url).then(Response => Response.json())
//     .then((data)=>{
//         data.forEach((ele,i) => {
//             let { title ,imdb ,year ,sposter,bposter,href,genre,extract} = ele;
//             let card = document.createElement('a');
//             card.classList.add('card');
//             card.href = href;
//             card.innerHTML = `
//             <img src="${sposter}" alt="${title}" class="poster">
//             <div class="card_body">
//                 <img src="${bposter}" alt="">
//                 <div class="cont">
//                     <h4>${title}</h4>
//                     <div class="sub">
//                         <p>${genre},${year}</p>
//                         <h3><span>IMDB</span><i class='bx bxs-star' ></i>${imdb}</h3>
//                     </div>
//                 </div>
//             </div>            
//             `
//             cards.appendChild(card);  
//         });

//         // document.getElementById('title').innerText = data[0].title;
//         // // document.getElementById('title')[0].src = data[0].title;
//         document.getElementById('title').src = data[0].title1;
//         document.getElementsByTagName('video')[0].src = data[0].trailer;
//         document.getElementById('plot').innerText = data[0].extract;
//         document.getElementById('gen').innerText = data[0].genre;
//         document.getElementById('date').innerText = data[0].year;
//         document.getElementById('rate').innerHtml =`<span>IMDB</span><i class='bx bxs-star' ></i>${data[0].imdb}`;


//         // search data
//         data.forEach(element=>{
//             let { title ,imdb ,year ,sposter,href,genre,} = element;
//             let card = document.createElement('a');
//             card.classList.add('card');
//             card.href = href;
//             card.innerHTML = `
//             <img src="${sposter}" alt="${title}">
//                         <div class="cont">
//                             <h3>${title}</h3>
//                             <p>${genre} ,${year}, <span>IMDB</span><i class='bx bxs-star' ></i>${imdb}</p>
//                         </div>            
//             `
//             search.appendChild(card);
//         });

//         //search filter
//         search_input.addEventListener('keyup',()=>{
//             let filter = search_input.value.toUpperCase();
//             let a = search.getElementsByTagName('a');

//             for (let index = 0; index < a.length; index++) {
//                 let b = a[index].getElementsByClassName('cont')[0];
//                 let TextValue = b.textContent || b.innerText;
//                 if (TextValue.toUpperCase().indexOf(filter)>-1) {
//                     a[index].style.display ="flex";
//                     search.style.visibility ="visible"
//                     search.style.opacity =1;
                    
//                 } else {
//                     a[index].style.display = "none"
                    
//                 }
//                 if (search_input.value == 0) {
//                     search.style.visibility ="hidden"
//                     search.style.opacity = 0;                    
//                 }
                
//             }
//         });


//         //play and pause video
//         let video = document.getElementsByTagName('video')[0];
//         let play = document.getElementById('play');

//         play.addEventListener('click' ,()=>{
//             if (video.paused) {
//                 video.play();
//                 play.innerHTML = `play <i class='bx bx-pause-circle'></i>`
                
//             } else {
//                 video.pause();
//                 play.innerHTML = `watch <i class='bx bx-play-circle'></i>`
//             }
//         })
        

//         //filter series
//     }) 

// let movies = []; // Will hold movies from movies.json
let movies = "movies.json"
let currentMovieIndex = 0;

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

function renderMainContent(movie) {
    document.getElementById('main-content').innerHTML = `
        <img id="title" src="${movie.title1}" alt="">
        <p id="plot">${movie.extract}</p>
        <div class="details">
            <h6>${movie.type || ''}</h6>
            <h5 id="gen">${movie.genre}</h5>
            <h4 id="date">${movie.year}</h4>
            <h3 id="rate"><span>IMDB</span><i class='bx bxs-star'></i>${movie.imdb}</h3>
        </div>
    `;
    // Update video source
    document.querySelector('header video').src = movie.trailer;
}

function renderPopularCards(movies) {
    const cards = movies.map((movie, idx) => `
        <a href="#" class="card" data-idx="${idx}">
            <img src="${movie.sposter}" alt="" class="poster">
        </a>
    `).join('');
    document.getElementById('popular-cards').innerHTML = cards;

    // Add click listeners
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const idx = this.getAttribute('data-idx');
            renderMainContent(movies[idx]);
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
            <img src="${movie.sposter}" alt="${movie.title}">
            <div class="cont">
                <h3>${movie.title}</h3>
                <p>${movie.genre} ,${movie.year}, <span>IMDB</span><i class='bx bxs-star'></i>${movie.imdb}</p>
            </div>
        `;
        card.addEventListener('click', function(e) {
            e.preventDefault();
            renderMainContent(movies[idx]);
            document.querySelector('.search').style.visibility = "hidden";
            document.querySelector('.search').style.opacity = 0;
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
