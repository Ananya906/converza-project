// ================= SLIDER =================
let next = document.querySelector('.next');
let prev = document.querySelector('.prev');

next.addEventListener('click', function(){
    let items = document.querySelectorAll('.item');
    document.querySelector('.slide').appendChild(items[0]);
});

prev.addEventListener('click', function(){
    let items = document.querySelectorAll('.item');
    document.querySelector('.slide').prepend(items[items.length - 1]);
});

// ================= SHARE POPUP =================
const shareButtons = document.querySelectorAll('.share-btn');

shareButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const eventId = btn.dataset.eventId;

    try {
      // call backend to get link
      const res = await fetch(`/generate-share-link/${eventId}`);
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      if (data.link) {
        const eventTitle = btn.parentElement.querySelector("h3").innerText;
        const shareUrl = data.link;

        // Fill modal
        document.getElementById("shareLink").value = shareUrl;
        document.getElementById("waShare").href = `https://wa.me/?text=${encodeURIComponent(eventTitle)} - ${shareUrl}`;
        document.getElementById("fbShare").href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        document.getElementById("xShare").href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(eventTitle)}`;
        document.getElementById("emailShare").href = `mailto:?subject=${encodeURIComponent(eventTitle)}&body=${shareUrl}`;

        // Show modal
        document.getElementById("shareModal").style.display = "flex";
      } else {
        alert("❌ Failed to get link from server.");
      }
    } catch (err) {
      console.error("Error generating share link:", err);
      alert("❌ Failed to generate link. Try again.");
    }
  });
});

// ================= MODAL FUNCTIONS =================
function closeModal() {
  document.getElementById("shareModal").style.display = "none";
}

function copyLink() {
  let link = document.getElementById("shareLink");
  link.select();
  document.execCommand("copy");
  alert("✅ Link copied: " + link.value);
}
