//Ensure the token is available
window.token = window.token || localStorage.getItem("jwt");

//Function to display posts on the page
async function fetchPosts() {
    try {
        //Fetches blogs from api
        const response = await fetch("https://v2.api.noroff.dev/blog/posts/VicB", {
            headers: { "Authorization": `Bearer ${window.token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        displayPosts(data.data);

    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

//Function to delete a post
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        //Sends a DELETE request to the api
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/VicB/${postId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${window.token}` }
        });

        if (!response.ok) throw new Error("Failed to delete post");

        alert("Post deleted successfully!");
        window.location.href = "/index.html";

    } catch (error) {
        console.error("Error deleting post:", error);
    }
}

//Attach event listeners to buttons
function attachEventListeners() {
    document.querySelectorAll(".editBtn, .deleteBtn, .readMoreBtn").forEach(button => {
        button.addEventListener("click", event => {
            const postId = event.target.dataset.id;
            if (button.classList.contains("editBtn")) {
                window.location.href = `/post/edit.html?id=${postId}`;
            } else if (button.classList.contains("deleteBtn")) {
                deletePost(postId);
            } else if (button.classList.contains("readMoreBtn")) {
                window.location.href = `/post/index.html?id=${postId}`;
            }
        });
    });
}

//Function to display posts
function displayPosts(posts) {
    const blogGrid = document.getElementById("blogGrid");
    if (!blogGrid) return;

    blogGrid.innerHTML = "";

    const isIndexPage = window.location.pathname === "/index.html";
    const isPostPage = window.location.pathname.includes("/post/index.html");

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
            ${post.media?.url ? `<img src="${post.media.url}" alt="${post.title || 'Blog post image'}">` : ""}
            <p class="post-date">Published on: ${publishDate}</p>
            <p>${post.body}</p>
        `;
        if (isIndexPage) {
            postContent += `<button onclick="viewPost('${post.id}')">Read More</button>`;
        } else if (!isPostPage) {
            postContent += `
                <button class="editBtn" data-id="${post.id}">Edit</button>
                <button class="deleteBtn" data-id="${post.id}">Delete</button>
            `;
        }

        postElement.innerHTML = postContent;
        blogGrid.appendChild(postElement);
    });

    attachEventListeners();
}

//Fetch posts when the page loads
document.addEventListener("DOMContentLoaded", fetchPosts);