let isSubmitting = false;

document.addEventListener("DOMContentLoaded", () => {
    //Check if on the create page
    if (window.location.pathname.includes("/FED1-PE1-vicbro00/post/create.html")) {
        const token = localStorage.getItem("jwt");
        const userEmail = localStorage.getItem("email");

        if (!token) {
            alert("You must be logged in to access this page.");
            window.location.href = "/FED1-PE1-vicbro00/account/login.html";
        }

        //Display the email on the create page
        const emailDisplayElement = document.getElementById("userEmailDisplay");

        if (emailDisplayElement && userEmail) {
            emailDisplayElement.textContent = userEmail;
        } else {
            console.error("Element for displaying user email not found or email not set in localStorage.");
        }

        const blogImageInput = document.getElementById("blogImage");
        const previewImage = document.getElementById("previewImage");

        if (blogImageInput && previewImage) {
            blogImageInput.addEventListener("input", function () {
                const imageUrl = this.value;

                if (imageUrl) {
                    previewImage.src = imageUrl;
                    previewImage.style.display = "block";
                } else {
                    previewImage.style.display = "none";
                }
            });
        } else {
            console.error("blogImage or previewImage element not found in the DOM.");
        }

        const confirmBtn = document.querySelector(".confirm-btn");

        if (confirmBtn) {
            confirmBtn.addEventListener("click", async (event) => {
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
        } else {
            console.error("Confirm button not found in the DOM.");
        }
    }
});

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
        window.location.href = "/FED1-PE1-vicbro00/index.html";
    } catch (error) {
        console.error("There was a problem:", error);
        alert(error.message || "Failed to save post. Check console for details.");
    }
}