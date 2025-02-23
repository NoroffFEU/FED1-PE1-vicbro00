document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("/FED1-PE1-vicbro00/post/create.html") || currentPage.includes("/FED1-PE1-vicbro00/post/edit.html")) {
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
document.getElementById("editBtn").addEventListener("click", async (event) => {
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
        window.location.href = "/FED1-PE1-vicbro00/index.html";

    } catch (error) {
        console.error("Error updating post:", error);
    }
}

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
        window.location.href = "/FED1-PE1-vicbro00/index.html";
    } catch (error) {
        console.error("There was a problem:", error);
        alert(error.message || "Failed to save post. Check console for details.");
    }
}