let isSubmitting = false;

//Check if user is logged in
const token = localStorage.getItem("jwt");

if (!token && window.location.pathname.includes("/post/create.html")) {
    alert("You must be logged in to access this page.");
    window.location.href = "/account/login.html";
}

//Validate image URL format
function isValidImageUrl(url) {
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
    return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

//Check if the image exists
async function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

//Validate image URL
async function validateImageUrl(url) {
    if (!isValidImageUrl(url)) {
        alert("Invalid image URL: URL must end with a valid image file extension (e.g., .jpg, .png).");
        return false;
    }

    const imageExists = await checkImageExists(url);
    if (!imageExists) {
        alert("Invalid image URL: The image does not exist or cannot be accessed.");
        return false;
    }

    return true;
}

//Creates or updates a post
async function createPost(title, body, publishDate, mediaUrl = "") {
    if (mediaUrl && !(await validateImageUrl(mediaUrl))) {
        isSubmitting = false;
        return;
    }
    
    const username = localStorage.getItem("email");
    const postId = new URLSearchParams(window.location.search).get("id");
    const url = postId
        ? `https://v2.api.noroff.dev/blog/posts/VicB/${postId}`
        : `https://v2.api.noroff.dev/blog/posts/VicB`;

    const method = postId ? "PUT" : "POST";

    const postData = {
        title,
        body,
        published: publishDate,
        media: mediaUrl ? { url: mediaUrl } : {}
    };

    try {
        //Sends a request to create or update post
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.errors ? errorData.errors[0].message : response.statusText}`);
        }

        const data = await response.json();
        alert(postId ? "Post updated successfully!" : "Post created successfully!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("There was a problem:", error);
        alert(error.message || "Failed to save post. Check console for details.");
    }
}

//Checks if this is the create page
if (window.location.pathname.includes("/post/create.html")) {
    document.getElementById("blogImage").addEventListener("input", function () {
        const imageUrl = this.value;
        const previewImage = document.getElementById("previewImage");

        //Previews image
        if (imageUrl) {
            previewImage.src = imageUrl;
            previewImage.style.display = "block";
        } else {
            previewImage.style.display = "none";
        }
    });
} page: document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("/post/create.html") || currentPage.includes("/post/edit.html")) {
        redirectIfNotLoggedIn();

        const userEmail = localStorage.getItem("email");
        document.getElementById("email").textContent = userEmail || "Not signed in";
    }
});

//Post ID
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

//Fetches post by its ID
async function fetchPostById(postId) {
    try {
        const token = localStorage.getItem("jwt");

        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/VicB/${postId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch post");

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

//Fills the forms with the post ID data
async function populateFormWithPostData(postId) {
    if (!postId) {
        console.warn("No post ID provided.");
        return;
    }

    const post = await fetchPostById(postId);

    if (post) {

        document.getElementById("blogTitle").value = post.title;
        document.getElementById("blogContent").value = post.body;
        document.getElementById("publishDate").value = post.published?.split("T")[0] || new Date().toISOString().split("T")[0];
        document.getElementById("blogImage").value = post.media?.url || "";

        if (post.media?.url) {
            document.getElementById("previewImage").src = post.media.url;
            document.getElementById("previewImage").style.display = "block";
        }
    } else {
        console.warn("No post data found.");
    }
}

//Adds event listener when document is loaded
document.addEventListener("DOMContentLoaded", () => {
    populateFormWithPostData(postId);
});

//Event listener for button
document.getElementById("confirmBtn").addEventListener("click", async (event) => {
    event.preventDefault();

    const title = document.getElementById("blogTitle").value;
    const body = document.getElementById("blogContent").value;
    const publishDate = document.getElementById("publishDate").value;
    const mediaUrl = document.getElementById("blogImage").value;

    if (!title || !body || !publishDate) {
        alert("Please fill in all required fields.");
        return;
    }

    await createPost(title, body, publishDate, mediaUrl);
});

//Function to edit a post
async function editPost(postId, updatedPostData) {
    try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/VicB/${postId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPostData),
        });

        if (!response.ok) throw new Error("Failed to update post");

        alert("Post updated successfully!");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Error updating post:", error);
    }
}