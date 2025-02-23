document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event triggered");

    //Constants and variables
    let isSubmitting = false;
    const token = localStorage.getItem("jwt");
    const userEmail = localStorage.getItem("email");
    const emailElement = document.getElementById("email");
    const postId = new URLSearchParams(window.location.search).get("id");

    //Check if user is logged in and redirect if necessary
    if (!token && window.location.pathname.includes("/post/edit.html")) {
        alert("You must be logged in to access this page.");
        window.location.href = "/account/login.html";
        return;
    }

    //Populate the email span
    if (emailElement) {
        emailElement.textContent = userEmail || "Not signed in";
    } else {
        console.error("Element with id 'email' not found.");
    }

    //Populate form data if on edit page
    if (postId) {
        populateFormWithPostData(postId);
    }

    //Add event listener for confirm button
    document.querySelector(".confirm-btn").addEventListener("click", async (event) => {
        event.preventDefault();

        const title = document.getElementById("blogTitle").value;
        const body = document.getElementById("blogContent").value;
        const publishDate = document.getElementById("publishDate").value;
        const mediaUrl = document.getElementById("blogImage").value;

        if (!title || !body || !publishDate) {
            alert("Please fill in all required fields.");
            return;
        }

        const updatedPostData = {
            title,
            body,
            published: publishDate,
            media: mediaUrl ? { url: mediaUrl } : {}
        };

        await editPost(postId, updatedPostData);
    });

    //Helper functions
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

    async function fetchPostById(postId) {
        try {
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

    async function editPost(postId, updatedPostData) {
        if (isSubmitting) return;
        isSubmitting = true;

        try {
            const response = await fetch(`https://v2.api.noroff.dev/blog/posts/VicB/${postId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedPostData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.errors ? errorData.errors[0].message : response.statusText}`);
            }

            alert("Post updated successfully!");
            console.log("Redirecting to post view page:", `post.html?id=${postId}`);
            window.location.href = `post.html?id=${postId}`;
        } catch (error) {
            console.error("Error updating post:", error);
            alert(error.message || "Failed to update post. Check console for details.");
        } finally {
            isSubmitting = false;
        }
    }
});
