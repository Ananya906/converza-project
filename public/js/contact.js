document.getElementById("emailForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const button = form.querySelector('button[type="submit"]');
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); 
    
    // 1. DISABLE BUTTON to prevent multiple submissions
    button.disabled = true;
    const originalButtonText = button.textContent;
    button.textContent = "Sending..."; 

    try {
        const res = await fetch("http://localhost:3000/send-email", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const errorResult = await res.json();
            throw new Error(errorResult.message || `Server error: ${res.status}`);
        }

        const result = await res.json();
        
        if (result.message && result.message.includes("success")) {
            showPopup("✅ Message sent successfully!", "success");
            form.reset(); // Clear form on success
        } else {
            showPopup("⚠️ Message sent, but server response was ambiguous.", "warning");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        
        const errorMessage = error.message.includes("Failed to fetch") 
                             ? "❌ Cannot connect to server. Check logs."
                             : error.message;
                             
        showPopup(errorMessage, "error");

    } finally {
        // 2. RE-ENABLE BUTTON, regardless of success or failure
        button.disabled = false;
        button.textContent = originalButtonText;
    }
});

function showPopup(message, type) {
    const popup = document.getElementById("popup");
    const popupText = document.getElementById("popup-text");
    const popupIcon = document.getElementById("popup-icon");

    popupText.textContent = message;
    
    let color = '#6D28D9'; // Primary color for success/warning
    let icon = '✅';

    if (type === "error") {
        color = '#DC2626'; // Red
        icon = '❌';
    } else if (type === "warning") {
        color = '#F59E0B'; // Amber/Yellow
        icon = '⚠️';
    }

    popup.style.borderLeft = `6px solid ${color}`;
    popupIcon.textContent = icon;
    
    // Show the popup
    popup.style.display = "flex";
    setTimeout(() => {
        popup.style.opacity = 1;
        popup.style.transform = 'translate(0, 0)';
    }, 10); 

    // Hide the popup after 4 seconds
    setTimeout(() => {
        popup.style.opacity = 0;
        popup.style.transform = 'translate(100%, 0)';
        setTimeout(() => {
            popup.style.display = "none";
        }, 300); 
    }, 4000);
}