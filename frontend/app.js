let showStarredOnly = false;
let activeNoteId = null;
let allNotes = [];

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Panel helpers ──────────────────────────────────────────────

function showPanel(note) {
  activeNoteId = note.id;
  document.getElementById('panel-empty').style.display = 'none';
  document.getElementById('panel-view').style.display = 'block';
  document.getElementById('panel-edit').style.display = 'none';
  document.getElementById('panel-content').style.display = 'flex';
  document.getElementById('panel-content').style.flexDirection = 'column';
  document.getElementById('panel-toolbar').style.display = 'flex';

  document.getElementById('panel-title-display').textContent = note.title;
  document.getElementById('panel-body-display').textContent = note.content;

  const starBtn = document.getElementById('btn-star-note');
  starBtn.textContent = note.starred ? '★ 取消收藏' : '☆ 收藏';

  // highlight sidebar item
  document.querySelectorAll('#notes li').forEach(li => {
    li.classList.toggle('active', parseInt(li.dataset.id) === note.id);
  });
}

function showEditPanel(note) {
  document.getElementById('panel-empty').style.display = 'none';
  document.getElementById('panel-view').style.display = 'none';
  document.getElementById('panel-content').style.display = 'none';
  document.getElementById('panel-edit').style.display = 'flex';
  document.getElementById('panel-toolbar').style.display = 'none';

  document.getElementById('edit-title').value = note ? note.title : '';
  document.getElementById('edit-content').value = note ? note.content : '';
  document.getElementById('edit-title').focus();
}

function clearPanel() {
  activeNoteId = null;
  document.getElementById('panel-empty').style.display = 'block';
  document.getElementById('panel-view').style.display = 'none';
  document.getElementById('panel-content').style.display = 'flex';
  document.getElementById('panel-edit').style.display = 'none';
  document.getElementById('panel-toolbar').style.display = 'none';
  document.querySelectorAll('#notes li').forEach(li => li.classList.remove('active'));
}

// ── Note list ──────────────────────────────────────────────────

function renderNotes(notes) {
  allNotes = notes;
  const list = document.getElementById('notes');
  list.innerHTML = '';
  const visible = showStarredOnly ? notes.filter(n => n.starred) : notes;
  for (const n of visible) {
    const li = document.createElement('li');
    li.dataset.id = n.id;

    const title = document.createElement('div');
    title.className = 'note-card-title';
    title.textContent = n.title;

    const preview = document.createElement('div');
    preview.className = 'note-card-preview';
    preview.textContent = n.content;

    li.appendChild(title);
    li.appendChild(preview);

    if (n.starred) {
      const star = document.createElement('span');
      star.className = 'note-star';
      star.textContent = '★';
      li.appendChild(star);
    }

    li.onclick = () => showPanel(n);
    list.appendChild(li);

    if (n.id === activeNoteId) li.classList.add('active');
  }
}

async function loadNotes() {
  const notes = await fetchJSON('/notes/');
  renderNotes(notes);
  // refresh panel if a note is open
  if (activeNoteId !== null) {
    const updated = notes.find(n => n.id === activeNoteId);
    if (updated) showPanel(updated);
    else clearPanel();
  }
}

async function searchNotes(q) {
  const notes = await fetchJSON(`/notes/search/?q=${encodeURIComponent(q)}`);
  renderNotes(notes);
}

// ── Action items ───────────────────────────────────────────────

async function loadActions() {
  const list = document.getElementById('actions');
  list.innerHTML = '';
  const items = await fetchJSON('/action-items/');
  for (const a of items) {
    const li = document.createElement('li');
    if (a.completed) li.classList.add('done');
    li.textContent = a.description;
    if (!a.completed) {
      const btn = document.createElement('button');
      btn.textContent = '完成';
      btn.onclick = async () => {
        await fetchJSON(`/action-items/${a.id}/complete`, { method: 'PUT' });
        loadActions();
      };
      li.appendChild(btn);
    }
    list.appendChild(li);
  }
}

// ── Bootstrap ──────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {

  // New note button → show blank edit panel
  document.getElementById('new-note-btn').addEventListener('click', () => {
    activeNoteId = null;
    showEditPanel(null);
  });

  // Save (create or update)
  document.getElementById('btn-save').addEventListener('click', async () => {
    const title = document.getElementById('edit-title').value.trim();
    const content = document.getElementById('edit-content').value.trim();
    if (!title || !content) return;
    if (activeNoteId === null) {
      const note = await fetchJSON('/notes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      activeNoteId = note.id;
    } else {
      await fetchJSON(`/notes/${activeNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
    }
    await loadNotes();
  });

  // Cancel edit
  document.getElementById('btn-cancel').addEventListener('click', () => {
    if (activeNoteId !== null) {
      const note = allNotes.find(n => n.id === activeNoteId);
      if (note) { showPanel(note); return; }
    }
    clearPanel();
  });

  // Edit button in toolbar
  document.getElementById('btn-edit-note').addEventListener('click', () => {
    const note = allNotes.find(n => n.id === activeNoteId);
    if (note) showEditPanel(note);
  });

  // Star/unstar in toolbar
  document.getElementById('btn-star-note').addEventListener('click', async () => {
    const note = allNotes.find(n => n.id === activeNoteId);
    if (!note) return;
    await fetchJSON(`/notes/${note.id}/${note.starred ? 'unstar' : 'star'}`, { method: 'PUT' });
    await loadNotes();
  });

  // Extract action items from current note
  document.getElementById('btn-extract-note').addEventListener('click', async () => {
    if (activeNoteId === null) return;
    const items = await fetchJSON(`/notes/${activeNoteId}/extract`, { method: 'POST' });
    await loadActions();
    const btn = document.getElementById('btn-extract-note');
    if (items.length === 0) {
      btn.textContent = '⚡ 無可提取（用 ! 或 todo:）';
    } else {
      btn.textContent = `⚡ 已提取 ${items.length} 項`;
    }
    setTimeout(() => { btn.textContent = '⚡ 提取待辦'; }, 3000);
  });

  // Delete in toolbar
  document.getElementById('btn-delete-note').addEventListener('click', async () => {
    if (activeNoteId === null) return;
    const res = await fetch(`/notes/${activeNoteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    clearPanel();
    await loadNotes();
  });

  // Search
  document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = document.getElementById('search-q').value.trim();
    if (q) await searchNotes(q);
    else await loadNotes();
  });

  document.getElementById('search-clear').addEventListener('click', async () => {
    document.getElementById('search-q').value = '';
    await loadNotes();
  });

  document.getElementById('starred-toggle').addEventListener('click', async () => {
    showStarredOnly = !showStarredOnly;
    const btn = document.getElementById('starred-toggle');
    btn.textContent = showStarredOnly ? '✦ 所有筆記' : '★ 收藏';
    btn.classList.toggle('active', showStarredOnly);
    await loadNotes();
  });

  // Action item form
  document.getElementById('action-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('action-desc').value;
    await fetchJSON('/action-items/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    e.target.reset();
    loadActions();
  });

  // Hidden legacy form (kept for test compatibility)
  document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    await fetchJSON('/notes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    e.target.reset();
    loadNotes();
  });

  loadNotes();
  loadActions();
});
