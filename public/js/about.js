// client-side rating + FAQ toggle logic
document.addEventListener('DOMContentLoaded', function () {
    
    // --- 1. Star Rating Interaction Logic ---
    const starEls = document.querySelectorAll('#stars .star');
    let selected = 0; // Stores the currently selected rating (1-5)

    // Function to visually update the stars using ★ and ☆
    function highlight(n) {
        starEls.forEach(s => {
            const v = Number(s.dataset.value);
            const isFilled = v <= n;
            s.classList.toggle('filled', isFilled);
            s.textContent = isFilled ? '★' : '☆';
        });
    }

    // Set up event listeners for mouse interaction
    starEls.forEach(st => {
        st.addEventListener('mouseover', () => {
            highlight(Number(st.dataset.value));
        });
        
        st.addEventListener('mouseout', () => {
            highlight(selected); // Revert to selected rating on mouse out
        });
        
        st.addEventListener('click', () => {
            selected = Number(st.dataset.value);
            highlight(selected); // Lock in the selected rating
        });
    });
    
    // --- 2. Review Form Submission (AJAX) Logic ---
    const form = document.getElementById('ratingForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim() || 'Anonymous';
            const comment = document.getElementById('comment').value.trim();
            
            if (selected < 1) {
                showMsg('Please select a star rating (1-5)', true);
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;

            try {
                const res = await fetch('/about/rate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating: selected, comment })
                });
                
                // Handle non-200 responses explicitly
                if (!res.ok) {
                     const errorData = await res.json();
                     return showMsg(errorData.error || `Server error: ${res.status}`, true);
                }

                const data = await res.json();
                
                // Success
                showMsg('Thanks! Your review is posted and the team has been notified.');
                
                // 1. Update Average and Count UI
                const avgNumberEl = document.querySelector('.avg-number');
                const countEl = document.querySelector('.count');
                const avgStarsEl = document.querySelector('.avg-stars');

                if (avgNumberEl) avgNumberEl.textContent = data.avg;
                if (countEl) countEl.textContent = data.count + ' reviews';
                if (avgStarsEl) {
                    const full = Math.round(data.avg);
                    avgStarsEl.innerHTML = '★'.repeat(full) + '☆'.repeat(5 - full);
                }
                
                // 2. Prepend New Review to List
                const rl = document.getElementById('reviewsList');
                const newReview = data.review; // Review object from server
                
                // Remove 'No reviews yet' message if present
                const noReviews = rl.querySelector('.no-reviews');
                if (noReviews) {
                    noReviews.remove();
                }

                // Create and insert the new review DOM element
                const div = document.createElement('div');
                div.className = 'review';
                div.innerHTML = `<div class="rhead"><strong>${escapeHtml(newReview.name) || 'Anonymous'}</strong> — <span class="rtime">${new Date(newReview.createdAt).toLocaleString()}</span></div>
                                 <div class="rstars">${'★'.repeat(newReview.rating)}${'☆'.repeat(5 - newReview.rating)}</div>
                                 ${newReview.comment ? `<p class="rcomment">${escapeHtml(newReview.comment)}</p>` : ''}`;

                rl.insertBefore(div, rl.firstChild);
                
                // 3. Reset Form and State
                selected = 0; 
                highlight(0);
                form.reset();
                
            } catch (err) {
                console.error('Fetch error:', err);
                showMsg('Network error - could not connect to server.', true);
            } finally {
                submitButton.textContent = 'Submit Review';
                submitButton.disabled = false;
            }
        });
    }

    // Helper function for status messages (uses styles defined in CSS)
    function showMsg(msg, isError) {
        const el = document.getElementById('ratingMessage');
        el.textContent = msg;
        el.style.color = isError ? '#ffb3c6' : '#b7f7d3'; 
        setTimeout(() => el.textContent = '', 4000); 
    }

    // Helper function for HTML escaping to prevent XSS
    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    // --- 3. FAQ Toggles Logic ---
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const content = item.querySelector('.faq-a');
            const isOpen = item.classList.contains('open');

            // Close all other open items
            document.querySelectorAll('.faq-item.open').forEach(i => {
                if (i !== item) {
                    i.classList.remove('open');
                    i.querySelector('.faq-a').style.maxHeight = 0;
                }
            });

            // Toggle the current item
            if (isOpen) {
                item.classList.remove('open');
                content.style.maxHeight = 0;
            } else {
                item.classList.add('open');
                // Set maxHeight to scrollHeight for dynamic transition
                content.style.maxHeight = content.scrollHeight + 50 + "px"; // Added buffer
            }
        });
    });

    // --- 4. Initial Average Stars Rendering ---
    const avgStarsEl = document.querySelector('.avg-stars');
    if (avgStarsEl) {
        const avg = Number(avgStarsEl.dataset.avg) || 0;
        const full = Math.round(avg);
        avgStarsEl.innerHTML = '★'.repeat(full) + '☆'.repeat(5 - full);
    }
});