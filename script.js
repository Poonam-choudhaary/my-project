// DOM Elements
const manualBtn = document.getElementById('manualBtn');
const apiBtn = document.getElementById('apiBtn');
const manualForm = document.getElementById('manualForm');
const apiForm = document.getElementById('apiForm');
const formSection = document.getElementById('formSection');
const blogCardSection = document.getElementById('blogCardSection');
const savedBlogs = document.getElementById('savedBlogs');

// Show/Hide Forms
manualBtn.onclick = () => {
  manualForm.classList.remove('hidden');
  apiForm.classList.add('hidden');
  formSection.classList.remove('hidden');
  blogCardSection.innerHTML = '';
};
apiBtn.onclick = () => {
  apiForm.classList.remove('hidden');
  manualForm.classList.add('hidden');
  formSection.classList.remove('hidden');
  blogCardSection.innerHTML = '';
};

// Manual Blog Submission
manualForm.onsubmit = (e) => {
  e.preventDefault();
  const title = document.getElementById('manualTitle').value.trim();
  const desc = document.getElementById('manualDesc').value.trim();
  if (!title || !desc) return;
  showBlogCard({ title, body: desc });
  manualForm.reset();
};

// API Blog Submission
apiForm.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('apiTitle').value.trim().toLowerCase();
  if (!title) return;
  try {
    blogCardSection.innerHTML = `<div class="blog-card"><em>Searching...</em></div>`;
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    const found = data.find(post => post.title.toLowerCase() === title);
    if (found) {
      showBlogCard(found);
    } else {
      blogCardSection.innerHTML = '';
      alert('Blog not found!');
    }
  } catch (err) {
    blogCardSection.innerHTML = '';
    alert('Error fetching blogs!');
  }
  apiForm.reset();
};

// Show Blog Card (only one at a time)
function showBlogCard({ title, body }) {
  blogCardSection.innerHTML = `
    <div class="blog-card">
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(body)}</p>
      <button id="saveBtn">Save</button>
    </div>
  `;
  document.getElementById('saveBtn').onclick = () => saveBlog({ title, body });
}

// Save Blog to LocalStorage
function saveBlog(blog) {
  let blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
  blogs.push(blog);
  localStorage.setItem('blogs', JSON.stringify(blogs));
  blogCardSection.innerHTML = '';
  renderSavedBlogs();
}

// Render Saved Blogs
function renderSavedBlogs() {
  let blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
  savedBlogs.innerHTML = '';
  if (blogs.length === 0) {
    savedBlogs.innerHTML = `<p style="color:#888;">No saved blogs yet.</p>`;
    return;
  }
  blogs.forEach((blog, idx) => {
    const div = document.createElement('div');
    div.className = 'saved-blog-card';
    div.innerHTML = `
      <h3 contenteditable="false">${escapeHTML(blog.title)}</h3>
      <p contenteditable="false">${escapeHTML(blog.body)}</p>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;
    // Edit functionality
    div.querySelector('.editBtn').onclick = function () {
      const h3 = div.querySelector('h3');
      const p = div.querySelector('p');
      const editing = h3.isContentEditable;
      if (!editing) {
        h3.contentEditable = true;
        p.contentEditable = true;
        h3.focus();
        this.textContent = 'Save';
        h3.style.background = "#fffbe7";
        p.style.background = "#fffbe7";
      } else {
        h3.contentEditable = false;
        p.contentEditable = false;
        this.textContent = 'Edit';
        h3.style.background = "";
        p.style.background = "";
        blogs[idx] = { title: h3.textContent.trim(), body: p.textContent.trim() };
        localStorage.setItem('blogs', JSON.stringify(blogs));
        renderSavedBlogs();
      }
    };
    // Delete functionality
    div.querySelector('.deleteBtn').onclick = () => {
      if (confirm('Are you sure you want to delete this blog?')) {
        blogs.splice(idx, 1);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        renderSavedBlogs();
      }
    };
    savedBlogs.appendChild(div);
  });
}

// Helper: Escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

// Load saved blogs on page load
window.onload = renderSavedBlogs;
