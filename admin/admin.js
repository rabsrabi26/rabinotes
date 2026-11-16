(() => {
  "use strict";
  const API = "https://rabinotes-auth.rabsrabi26.workers.dev";
  const LOCAL_MODE = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const LOCAL_KEY = "rabinotes-local-posts-v1";
  const $ = id => document.getElementById(id);
  const state = { posts: [], sha: null, selected: null, isNew: false, token: sessionStorage.getItem("rabinotes-session") || "" };

  function notice(message, type = "") {
    const el = $("notice");
    el.textContent = message;
    el.className = "notice " + type;
    el.hidden = false;
  }
  function clearNotice() { $("notice").hidden = true; }

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (state.token) headers.Authorization = "Bearer " + state.token;
    if (options.body) headers["Content-Type"] = "application/json";
    const response = await fetch(API + path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ").");
    return data;
  }

  function showLogin() {
    $("login-screen").hidden = false;
    $("app-screen").hidden = true;
    $("logout").hidden = true;
  }
  function showApp() {
    $("login-screen").hidden = true;
    $("app-screen").hidden = false;
    $("logout").hidden = false;
  }

  async function loadPosts() {
    const result = LOCAL_MODE
      ? { content: await fetch("/assets/posts.js").then(response => { if (!response.ok) throw new Error("Could not load /assets/posts.js. Check that Live Server is running from the project root."); return response.text(); }), sha: null }
      : await api("/api/posts");
    state.sha = result.sha;
    // Run the repository's own posts.js in a sandboxed frame, not in the CMS page.
    const frame = document.createElement("iframe");
    frame.sandbox = "allow-scripts";
    frame.hidden = true;
    document.body.appendChild(frame);
    const source = result.content.replace(/<\/script/gi, "<\\/script");
    const payload = "<!doctype html><script>" + source +
      "<\/script><script>parent.postMessage({type:'rabinotes-posts',posts:window.RABI_POSTS||[]},'*')<\/script>";
    const posts = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Could not read the current posts file.")), 5000);
      const listener = event => {
        if (event.source !== frame.contentWindow || event.data?.type !== "rabinotes-posts") return;
        clearTimeout(timeout);
        window.removeEventListener("message", listener);
        resolve(event.data.posts);
      };
      window.addEventListener("message", listener);
      frame.srcdoc = payload;
    }).finally(() => frame.remove());
    if (!Array.isArray(posts)) throw new Error("The posts file has an unexpected format.");
    const savedLocal = LOCAL_MODE ? localStorage.getItem(LOCAL_KEY) : null;
    state.posts = savedLocal ? JSON.parse(savedLocal) : posts;
    if (!Array.isArray(state.posts)) throw new Error("The saved local posts have an unexpected format.");
    renderList();
  }

  function renderList() {
    $("post-count").textContent = state.posts.length;
    const list = $("post-list");
    list.innerHTML = "";
    state.posts.forEach((post, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "post-item" + (state.selected === index && !state.isNew ? " active" : "");
      const title = document.createElement("strong");
      title.textContent = post.title || "Untitled post";
      const meta = document.createElement("small");
      meta.textContent = (post.category || "Uncategorized") + " · " + (post.date || "");
      button.append(title, meta);
      button.addEventListener("click", () => selectPost(index));
      list.appendChild(button);
    });
  }

  function selectPost(index) {
    state.selected = index;
    state.isNew = false;
    const post = state.posts[index];
    $("empty-editor").hidden = true;
    $("post-form").hidden = false;
    $("editor-mode").textContent = "EDIT POST";
    $("form-heading").textContent = "Edit post";
    $("delete-post").hidden = false;
    $("title").value = post.title || "";
    $("slug").value = post.slug || "";
    $("category").value = post.category || "Notes";
    $("tags").value = (post.tags || []).join(", ");
    $("date").value = post.date || new Date().toISOString().slice(0, 10);
    $("read").value = post.read || "3 min read";
    $("description").value = post.description || "";
    $("body").value = post.body || "";
    $("rich-editor").innerHTML = post.body || "";
    $("preview").hidden = true;
    $("rich-editor").hidden = false;
    $("preview-toggle").textContent = "Preview";
    renderList();
    clearNotice();
  }

  function newPost() {
    state.selected = null;
    state.isNew = true;
    $("empty-editor").hidden = true;
    $("post-form").hidden = false;
    $("editor-mode").textContent = "NEW POST";
    $("form-heading").textContent = "Create a post";
    $("delete-post").hidden = true;
    $("post-form").reset();
    $("category").value = "Notes";
    $("date").value = new Date().toISOString().slice(0, 10);
    $("read").value = "3 min read";
    $("preview").hidden = true;
    $("body").value = "";
    $("rich-editor").innerHTML = "";
    $("rich-editor").hidden = false;
    $("preview-toggle").textContent = "Preview";
    clearNotice();
  }

  function slugify(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  $("title").addEventListener("input", () => {
    if (state.isNew || !$("slug").dataset.edited) $("slug").value = slugify($("title").value);
  });
  $("slug").addEventListener("input", () => { $("slug").dataset.edited = "true"; });

  document.querySelectorAll(".editor-toolbar [data-command]").forEach(button => {
    button.addEventListener("click", () => {
      $("rich-editor").focus();
      const command = button.dataset.command;
      document.execCommand(command, false, button.dataset.value || null);
      syncEditor();
    });
  });
  document.querySelectorAll(".editor-toolbar [data-block]").forEach(button => {
    button.addEventListener("click", () => {
      $("rich-editor").focus();
      document.execCommand("formatBlock", false, button.dataset.block);
      syncEditor();
    });
  });
  $("insert-link").addEventListener("click", () => {
    const url = prompt("Enter the link URL (including https://):");
    if (!url) return;
    $("rich-editor").focus();
    document.execCommand("createLink", false, url);
    syncEditor();
  });
  $("rich-editor").addEventListener("input", syncEditor);

  $("preview-toggle").addEventListener("click", () => {
    const preview = $("preview");
    if (preview.hidden) {
      syncEditor();
      preview.innerHTML = $("body").value;
      preview.hidden = false;
      $("rich-editor").hidden = true;
      $("preview-toggle").textContent = "Back to editor";
    } else {
      preview.hidden = true;
      $("rich-editor").hidden = false;
      $("preview-toggle").textContent = "Preview";
    }
  });

  function formatBody(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    // Keep intentional HTML markup; otherwise convert plain text into safe paragraphs.
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    const escapeHtml = value => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    return text.split(/\n\s*\n/).map(paragraph =>
      "<p>" + escapeHtml(paragraph).replace(/\r?\n/g, "<br>") + "</p>"
    ).join("\n");
  }

  function syncEditor() {
    $("body").value = $("rich-editor").innerHTML.trim();
  }

  function readForm() {
    syncEditor();
    const title = $("title").value.trim();
    const slug = $("slug").value.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Use a URL slug with lowercase letters, numbers and hyphens.");
    const duplicate = state.posts.some((p, i) => p.slug === slug && (state.isNew || i !== state.selected));
    if (duplicate) throw new Error("That URL slug is already used by another post.");
    return {
      slug, title, category: $("category").value.trim() || "Notes",
      tags: [...new Set($("tags").value.split(",").map(tag => tag.trim()).filter(Boolean))],
      date: $("date").value,
      read: $("read").value.trim() || "3 min read",
      description: $("description").value.trim(),
      body: $("body").value || ""
    };
  }

  $("post-form").addEventListener("submit", async event => {
    event.preventDefault();
    clearNotice();
    const save = $("save-post");
    save.disabled = true;
    save.textContent = "Publishing…";
    try {
      const post = readForm();
      if (state.isNew) state.posts.unshift(post);
      else state.posts[state.selected] = post;
      const content = "/* Managed with RabiNotes CMS. */\nwindow.RABI_POSTS = " + JSON.stringify(state.posts, null, 2) + ";\n";
      if (LOCAL_MODE) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.posts));
      } else {
        const result = await api("/api/posts", {
          method: "PUT",
          body: JSON.stringify({ content, sha: state.sha })
        });
        state.sha = result.sha || state.sha;
      }
      state.selected = state.isNew ? 0 : state.selected;
      state.isNew = false;
      renderList();
      selectPost(state.selected);
      notice(LOCAL_MODE ? "Saved in this browser only. Your GitHub repository and website files have not been changed." : "Your post has been published to GitHub. The live site will update after deployment.", "success");
    } catch (error) {
      notice(error.message, "error");
      // Restore the authoritative version from GitHub if a save failed.
      try { await loadPosts(); } catch (_) {}
    } finally {
      save.disabled = false;
      save.textContent = "Publish changes";
    }
  });

  $("delete-post").addEventListener("click", async () => {
    if (state.selected === null || !confirm("Delete this post permanently?")) return;
    const index = state.selected;
    const old = state.posts[index];
    state.posts.splice(index, 1);
    try {
      const content = "/* Managed with RabiNotes CMS. */\nwindow.RABI_POSTS = " + JSON.stringify(state.posts, null, 2) + ";\n";
      if (LOCAL_MODE) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.posts));
      } else {
        const result = await api("/api/posts", {
          method: "PUT",
          body: JSON.stringify({ content, sha: state.sha })
        });
        state.sha = result.sha || state.sha;
      }
      state.selected = null;
      $("post-form").hidden = true;
      $("empty-editor").hidden = false;
      renderList();
      notice(LOCAL_MODE ? "Post removed from this browser's local test data only." : "Post deleted. The live site will update after deployment.", "success");
    } catch (error) {
      state.posts.splice(index, 0, old);
      renderList();
      notice(error.message, "error");
    }
  });

  $("new-post").addEventListener("click", newPost);
  $("logout").addEventListener("click", async () => {
    try { await api("/api/logout", { method: "POST" }); } catch (_) {}
    state.token = "";
    sessionStorage.removeItem("rabinotes-session");
    showLogin();
  });

  async function start() {
    if (LOCAL_MODE) {
      try {
        await loadPosts();
        showApp();
        $("save-status").textContent = "Local test mode: changes stay in this browser and are not sent to GitHub.";
        $("save-post").textContent = "Save locally";
        notice("Local test mode is active. You can create, edit, preview and delete test posts safely. Nothing is published online.", "success");
      } catch (error) {
        showLogin();
        notice(error.message, "error");
      }
      return;
    }
    const hash = new URLSearchParams(location.hash.slice(1));
    const code = hash.get("code");
    if (code) {
      history.replaceState(null, "", location.pathname + location.search);
      try {
        const result = await api("/auth/exchange", {
          method: "POST",
          body: JSON.stringify({ code })
        });
        state.token = result.token;
        sessionStorage.setItem("rabinotes-session", state.token);
      } catch (error) {
        notice(error.message, "error");
      }
    }

    if (!state.token) return showLogin();
    try {
      const me = await api("/api/me");
      if (me.login !== "rabsrabi26") throw new Error("This account is not authorized.");
      await loadPosts();
      showApp();
    } catch (error) {
      state.token = "";
      sessionStorage.removeItem("rabinotes-session");
      showLogin();
      notice(error.message, "error");
    }
  }

  start();
})();