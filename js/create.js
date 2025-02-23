document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event triggered");

    //Constants and variables
    let isSubmitting = false;
    const token = localStorage.getItem("jwt");
    const userEmail = localStorage.getItem("email");
    const emailElement = document.getElementById("email");
    const postId = new URLSearchParams(window.location.search).get("id");

    //Check if user is logged in
    if (!token && (window.location.pathname.includes("/post/create.html") || window.location.pathname.includes("/post/edit.html"))) {
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

    //Add event listener for image preview
    if (window.location.pathname.includes("/post/create.html")) {
        document.getElementById("blogImage").addEventListener("input", function () {
            const imageUrl = this.value;
            const previewImage = document.getElementById("previewImage");

            if (imageUrl) {
                previewImage.src = imageUrl;
                previewImage.style.display = "block";
            } else {
                previewImage.style.display = "none";
            }
        });
    }

    //Add event listener for confirm button
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

    async function createPost(title, body, publishDate, mediaUrl = "") {
        if (isSubmitting) return;
        isSubmitting = true;

        if (mediaUrl && !(await validateImageUrl(mediaUrl))) {
            isSubmitting = false;
            return;
        }

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
        } finally {
            isSubmitting = false;
        }
    }

    function isValidImageUrl(url) {
        const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
        return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
    }

    async function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

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
});