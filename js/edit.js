document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes("/FED1-PE1-vicbro00/post/create.html") || currentPage.includes("/FED1-PE1-vicbro00/post/edit.html")) {
        redirectIfNotLoggedIn();

        const userEmail = localStorage.getItem("email");
        document.getElementById("email").textContent = userEmail || "Not signed in";
    }

    // If on the edit page, populate the form
    if (currentPage.includes("/FED1-PE1-vicbro00/post/edit.html") && postId) {
        populateFormWithPostData(postId);
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

// Event listener for the edit button
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

    // Call the editPost function to update the post
    const updatedPostData = {
        title,
        body,
        published: publishDate,
        media: mediaUrl ? { url: mediaUrl } : {}
    };

    await editPost(postId, updatedPostData);
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
