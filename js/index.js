// Global state
let sortOrder = "newest";
let allPosts = [];
let filteredPosts = [];
let carouselPosts = [];
let currentSlide = 0;

const baseURL = window.location.origin;

//Fetch posts from the API
async function fetchPosts() {
    try {
        const response = await fetch("https://v2.api.noroff.dev/blog/posts/VicB", {
            headers: { "Authorization": `Bearer ${window.token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        allPosts = data.data;
        filteredPosts = [...allPosts];
        displayPosts(filteredPosts);

        //Carousel shows 3 latest posts
        carouselPosts = allPosts.sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 3);
        showSlide(currentSlide);
        createDots();
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

//Display posts in the blog grid
function displayPosts(posts) {
    const blogGrid = document.getElementById("blogGrid");
    if (!blogGrid) return;

    blogGrid.innerHTML = "";

    posts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post-item");

        const publishDate = new Date(post.created).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        let postContent = `
            <h3>${post.title}</h3>
            ${post.media?.url ? `
                <a href="post/index.html?id=${post.id}">
                    <img src="${post.media.url}" alt="${post.title || 'Blog post image'}">
                </a>
            ` : ""}
            <p class="post-date">Published on: ${publishDate}</p>
            <p>${post.body}</p>
            <button class="readMoreBtn" data-id="${post.id}">Read More</button>
        `;

        postElement.innerHTML = postContent;
        blogGrid.appendChild(postElement);
    });

    attachEventListeners();
}


//Event listeners to buttons
function attachEventListeners() {
    document.querySelectorAll(".readMoreBtn").forEach(button => {
        button.addEventListener("click", event => {
            const postId = event.target.dataset.id;
            window.location.href = `/post/index.html?id=${postId}`;
        });
    });
}

//Toggle sort order
function toggleSortOrder() {
    sortOrder = sortOrder === "newest" ? "oldest" : "newest";
    const sortButton = document.getElementById("sortingBtn");

    sortButton.innerHTML = `Sort by ${sortOrder === "newest" ? "Oldest" : "Newest"} 
        <i class="fa-solid fa-arrow-down${sortOrder === "newest" ? "" : " flip-vertical"}"></i>
    `;

    filteredPosts.sort((a, b) => {
        const dateA = new Date(a.created);
        const dateB = new Date(b.created);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    displayPosts(filteredPosts);
}

//Filter posts
function filterPosts(query) {
    filteredPosts = allPosts.filter(post => {
        const title = post.title.toLowerCase();
        const body = post.body.toLowerCase();
        return title.includes(query) || body.includes(query);
    });

    displayPosts(filteredPosts);
}

//Shows carousel slide
function showSlide(index) {
    const carouselContainer = document.getElementById("carouselContainer");
    if (!carouselContainer || carouselPosts.length === 0) return;

    const post = carouselPosts[index];
    carouselContainer.innerHTML = `
        <div class="slide">
            <h3>${post.title}</h3>
            <a href="post/index.html?id=${post.id}">
                ${post.media?.url ? `<img src="${post.media.url}" alt="${post.title}">` : ""}
            </a>
            <p class="post-date">Published on: ${new Date(post.created).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            })}</p>
            <button class="readMoreBtn" data-id="${post.id}">Read More</button>
        </div>
    `;

    attachCarouselEventListeners();

    updateDots(index);
}

function attachCarouselEventListeners() {
    const carouselReadMoreButtons = document.querySelectorAll("#carouselContainer .readMoreBtn");
    carouselReadMoreButtons.forEach(button => {
        button.addEventListener("click", event => {
            const postId = event.target.dataset.id;
            window.location.href = `/post/index.html?id=${postId}`;
        });
    });
}

//Creates carousel dots
function createDots() {
    const carouselDots = document.getElementById("carouselDots");
    if (!carouselDots) return;

    carouselDots.innerHTML = carouselPosts.map((_, i) => `
        <li class="carousel-dot ${i === currentSlide ? "active-dot" : ""}" data-index="${i}"></li>
    `).join("");

    document.querySelectorAll(".carousel-dot").forEach(dot => {
        dot.addEventListener("click", () => {
            currentSlide = parseInt(dot.dataset.index);
            showSlide(currentSlide);
        });
    });
}

function updateDots(index) {
    document.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active-dot", i === index);
    });
}

function changeSlide(direction) {
    currentSlide += direction;

    if (currentSlide >= carouselPosts.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = carouselPosts.length - 1;

    showSlide(currentSlide);
}

//Initialize the page
function initializePage() {
    fetchPosts();

    document.getElementById("sortingBtn").addEventListener("click", toggleSortOrder);

    document.getElementById("searchInput").addEventListener("input", (event) => {
        const searchQuery = event.target.value.trim().toLowerCase();
        filterPosts(searchQuery);
    });

    const slideBtnPrev = document.getElementById("slideBtnPrev");
    const slideBtnNext = document.getElementById("slideBtnNext");

    if (slideBtnPrev && slideBtnNext) {
        slideBtnPrev.addEventListener("click", () => changeSlide(-1));
        slideBtnNext.addEventListener("click", () => changeSlide(1));
    }
}

document.addEventListener("DOMContentLoaded", initializePage);