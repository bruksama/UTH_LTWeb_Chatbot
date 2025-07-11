const firebaseConfig = {
  apiKey: "AIzaSyBxu_Ocz0Bpsg5P90NlV1JI8P2QgPmHdAI",
  authDomain: "uth-chatbot-a5815.firebaseapp.com",
  projectId: "uth-chatbot-a5815",
  storageBucket: "uth-chatbot-a5815.firebasestorage.app",
  messagingSenderId: "699604759720",
  appId: "1:699604759720:web:0d9fe4f7c6b75020543e9d",
  measurementId: "G-WEHGX8X81T",
};
firebase.initializeApp(firebaseConfig);

marked.use({
  breaks: true,
  gfm: true,
  pedantic: false,
});

document.addEventListener("DOMContentLoaded", function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "/login";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      firebase
        .auth()
        .signOut()
        .then(function () {
          window.location.href = "/login";
        });
    });
  }
});

// Sidebar toggle for mobile
const sidebar = document.querySelector(".sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebarBackdrop = document.querySelector(".sidebar-backdrop");

if (openSidebarBtn && sidebar) {
  openSidebarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.add("active");
    document.body.style.overflow = "hidden";
  });
}
if (closeSidebarBtn && sidebar) {
  closeSidebarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.remove("active");
    document.body.style.overflow = "";
  });
}

// Hide sidebar on click outside (mobile)
document.addEventListener("click", (e) => {
  if (
    window.innerWidth < 992 &&
    sidebar &&
    sidebar.classList.contains("active")
  ) {
    if (!sidebar.contains(e.target) && e.target !== openSidebarBtn) {
      sidebar.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
});

// Prevent click inside sidebar from closing it
sidebar.addEventListener("click", (e) => {
  if (window.innerWidth < 992) e.stopPropagation();
});

// Trap focus in sidebar when open (accessibility)
document.addEventListener("keydown", (e) => {
  if (sidebar.classList.contains("active") && e.key === "Tab") {
    const focusable = sidebar.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const quickReplies = document.getElementById("quickReplies");
const attachFileBtn = document.getElementById("attachFile");
const chatFormBtn = chatForm.querySelector("button");

let lastUserMessage = "";

function scrollToLastMessage() {
  if (chatMessages) {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }
}

// show loading indicator for bot
function showBotTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "d-flex mb-3 bot-typing";
  typingDiv.innerHTML = `<div class="bg-white border me-auto rounded-3 p-3 shadow-sm d-flex align-items-center gap-2" style="max-width: 70%; min-width: 60px;">
    <span class="dot-typing"></span>
  </div>`;
  chatMessages.appendChild(typingDiv);
  scrollToLastMessage();
  return typingDiv;
}

// remove loading indicator
function removeBotTyping() {
  const typing = chatMessages.querySelector(".bot-typing");
  if (typing) typing.remove();
}

function appendMessage(content, isBot = false) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "d-flex mb-3 animate__animated animate__fadeInUp";
  msgDiv.innerHTML = `<div class="${
    isBot ? "bg-white border me-auto" : "bg-primary text-white ms-auto"
  } rounded-3 p-3 shadow-sm" style="max-width: 70%;">${marked.parse(
    content
  )}</div>`;
  chatMessages.appendChild(msgDiv);
  scrollToLastMessage();
}

function shakeInput() {
  chatInput.classList.add("animate__animated", "animate__shakeX");
  setTimeout(() => {
    chatInput.classList.remove("animate__animated", "animate__shakeX");
  }, 600);
}

function renderSuggestions(suggestions) {
  const container = document.getElementById("chatSuggestions");
  if (!container) return;
  container.innerHTML = "";
  if (Array.isArray(suggestions) && suggestions.length > 0) {
    suggestions.slice(0, 3).forEach((sugg, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "btn btn-outline-secondary btn-sm me-2 mb-2 chat-suggestion-btn";
      btn.textContent = sugg;
      btn.setAttribute("tabindex", 0);
      btn.addEventListener("click", () => {
        chatInput.value = sugg;
        chatForm.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
      });
      container.appendChild(btn);
    });
  }
}

function clearSuggestions() {
  const container = document.getElementById("chatSuggestions");
  if (container) container.innerHTML = "";
}

if (chatForm && chatInput && chatMessages) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    chatFormBtn.disabled = true;
    const value = chatInput.value.trim();
    if (!value) {
      shakeInput();
      return;
    }
    clearSuggestions();
    // Lấy sessionId từ URL
    let match = window.location.pathname.match(/^\/chat\/(.+)$/);
    let sessionId = match ? match[1] : null;
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Bạn chưa đăng nhập!");
      return;
    }
    const token = await user.getIdToken();
    // Nếu chưa chọn phiên chat, tạo mới
    if (!sessionId) {
      const res = await fetch("/api/chat/newSession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title: "Đoạn hội thoại mới",
          botStyle: "default",
        }),
      });
      const data = await res.json();
      if (data.sessionId) {
        sessionId = data.sessionId;
        history.pushState({ sessionId }, "", `/chat/${sessionId}`);
        await loadSessions(token); // reload sidebar
      } else {
        alert("Không thể tạo phiên chat mới!");
        return;
      }
    }
    // Hiển thị tin nhắn user
    appendMessage(value, false);
    lastUserMessage = value;
    chatInput.value = "";
    chatInput.style.height = "auto";
    chatInput.focus();
    const typingDiv = showBotTyping();
    try {
      const res = await fetch("/api/chat/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ sessionId, msg: value }),
      });
      const data = await res.json();
      removeBotTyping();
      if (data.reply) {
        appendMessage(data.reply, true);
      } else {
        appendMessage("Bot không trả lời. Vui lòng thử lại.", true);
      }
      if (data.suggestions && Array.isArray(data.suggestions)) {
        renderSuggestions(data.suggestions);
      }
    } catch (err) {
      removeBotTyping();
      appendMessage("Lỗi gửi tin nhắn. Vui lòng thử lại.", true);
    }
    chatFormBtn.disabled = false;
  });
  chatInput.addEventListener("input", clearSuggestions);
}

// Add dot-typing animation CSS
(function addDotTypingStyle() {
  const style = document.createElement("style");
  style.innerHTML = `
  .dot-typing {
    display: inline-block;
    width: 24px;
    height: 8px;
    position: relative;
  }
  .dot-typing::before, .dot-typing::after, .dot-typing span {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #000;
    opacity: 0.7;
    animation: dotTyping 1s infinite linear;
  }
  .dot-typing::before {
    left: 0;
    animation-delay: 0s;
  }
  .dot-typing span {
    left: 8px;
    animation-delay: 0.2s;
  }
  .dot-typing::after {
    left: 16px;
    animation-delay: 0.4s;
  }
  @keyframes dotTyping {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.7; }
    40% { transform: scale(1); opacity: 1; }
  }
  `;
  document.head.appendChild(style);
})();

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", () => {
    if (sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// === SPA: URL & session navigation logic ===

// Khi click session: đổi URL và load messages
async function handleSessionClick(sessionId, token) {
  history.pushState({ sessionId }, "", `/chat/${sessionId}`);
  await loadSessionMessages(sessionId, token);
}

// Khi load trang hoặc popstate: nếu URL là /chat/:ssid thì load messages
async function handleInitialSessionLoad(token) {
  const match = window.location.pathname.match(/^\/chat\/(.+)$/);
  if (match) {
    const sessionId = match[1];
    await loadSessionMessages(sessionId, token);
  }
}

window.addEventListener("popstate", async (e) => {
  const match = window.location.pathname.match(/^\/chat\/(.+)$/);
  if (match && firebase.auth().currentUser) {
    const token = await firebase.auth().currentUser.getIdToken();
    await loadSessionMessages(match[1], token);
  }
});

// Hàm fetch last message bất đồng bộ cho 1 session
async function fetchAndSetLastMessage(sessionId, lastMsgElem) {
  const user = firebase.auth().currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  try {
    const res = await fetch(`/api/chat/session/${sessionId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (data.messages && data.messages.length > 0) {
      const last = data.messages[data.messages.length - 1].content;
      lastMsgElem.textContent = escapeHtml(
        last.length > 24 ? last.slice(0, 24) + "…" : last
      );
    } else {
      lastMsgElem.textContent = "";
    }
  } catch {
    lastMsgElem.textContent = "";
  }
}

// Sửa loadSessions để dùng handleSessionClick
async function loadSessions(token) {
  const chatList = document.getElementById("chatList");
  chatList.innerHTML =
    '<li class="list-group-item text-muted">Đang tải...</li>';
  try {
    const res = await fetch("/api/chat/sessions", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (!data.sessions || !data.sessions.length) {
      chatList.innerHTML =
        '<li class="list-group-item text-muted">Chưa có phiên chat nào</li>';
      return;
    }
    chatList.innerHTML = "";
    data.sessions.forEach((session) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item list-group-item-action chat-session-item border-0 py-2";
      li.style.cursor = "pointer";
      const wrap = document.createElement("div");
      wrap.className = "d-flex align-items-start gap-2 w-100";
      const icon = document.createElement("i");
      icon.className = "fa-regular fa-message mr-2 text-secondary";
      wrap.appendChild(icon);
      const textBlock = document.createElement("div");
      textBlock.className = "flex-grow-1 min-width-0";
      const title = document.createElement("div");
      title.className = "fw-semibold chat-session-title";
      title.textContent = session.title || "No title";
      textBlock.appendChild(title);
      const lastMsg = document.createElement("div");
      lastMsg.className = "text-muted text-truncate chat-session-lastmsg";
      lastMsg.style.maxWidth = "200px";
      let lastMessageText = session.lastMessage;
      if (lastMessageText) {
        lastMsg.textContent = escapeHtml(
          lastMessageText.length > 24
            ? lastMessageText.slice(0, 24) + "…"
            : lastMessageText
        );
      } else {
        lastMsg.textContent = "Đang tải...";
        fetchAndSetLastMessage(session.id, lastMsg);
      }
      textBlock.appendChild(lastMsg);
      wrap.appendChild(textBlock);
      const trashBtn = document.createElement("button");
      trashBtn.className =
        "btn btn-trash p-1 ms-2 d-flex align-items-center justify-content-center";
      trashBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
      trashBtn.onclick = async (e) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn xóa phiên chat này?")) return;
        const user = firebase.auth().currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        try {
          const res = await fetch(`/api/chat/session/${session.id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
          });
          if (res.ok) {
            li.remove();
            // Nếu đang xem session này thì clear chat
            const match = window.location.pathname.match(/^\/chat\/(.+)$/);
            if (match && match[1] === session.id) {
              history.pushState({}, "", "/");
              document.getElementById("chatMessages").innerHTML =
                '<div class="text-muted text-center py-4">Chọn một phiên chat để bắt đầu</div>';
            }
          } else {
            alert("Xóa phiên chat thất bại!");
          }
        } catch (err) {
          alert("Lỗi kết nối khi xóa phiên chat!");
        }
      };
      wrap.appendChild(trashBtn);
      li.appendChild(wrap);
      li.onclick = () => handleSessionClick(session.id, token);
      chatList.appendChild(li);
    });
  } catch (err) {
    chatList.innerHTML =
      '<li class="list-group-item text-danger">Lỗi tải phiên chat</li>';
  }
}

// Sửa DOMContentLoaded để load session theo URL nếu có

document.addEventListener("DOMContentLoaded", async () => {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) return;
    const token = await user.getIdToken();
    await loadSessions(token);
    await handleInitialSessionLoad(token);
  });
});

async function loadSessionMessages(sessionId, token) {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML =
    '<div class="text-center text-muted py-4">Đang tải tin nhắn...</div>';
  try {
    const res = await fetch(`/api/chat/session/${sessionId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (data.sessionTitle) {
      updateChatName(data.sessionTitle);
    } else {
      updateChatName();
    }
    if (!data.messages || !data.messages.length) {
      chatMessages.innerHTML =
        '<div class="text-center text-muted py-4">Chưa có tin nhắn nào</div>';
      return;
    }
    chatMessages.innerHTML = "";
    data.messages.forEach((msg) => {
      appendMessage(msg.content, msg.sender === "model");
    });
    // Scroll to last message
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    chatMessages.innerHTML =
      '<div class="text-danger text-center py-4">Lỗi tải tin nhắn</div>';
    updateChatName();
  }
}

function updateChatName(sessionTitle = "UTH Chatbot") {
  const chatNameElement = document.getElementById("chatName");
  if (chatNameElement) {
    chatNameElement.textContent = sessionTitle;
  }
}

// Settings Modal logic
const settingsModal = document.getElementById("settingsModal");
const settingsForm = document.getElementById("settingsForm");
const sessionNameInput = document.getElementById("sessionNameInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const deleteSessionBtn = document.getElementById("deleteSessionBtn");
const botStyleRadios = document.getElementsByName("botStyle");

let currentSessionId = null;

// Helper: get current sessionId from URL
function getCurrentSessionId() {
  const match = window.location.pathname.match(/^\/chat\/(.+)$/);
  return match ? match[1] : null;
}

// Helper: get/set API key in localStorage
function getStoredApiKey() {
  return localStorage.getItem("geminiApiKey") || "";
}
function setStoredApiKey(key) {
  localStorage.setItem("geminiApiKey", key);
}

// When modal opens, fill current info
settingsModal.addEventListener("show.bs.modal", async function () {
  currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  // Lấy thông tin session
  const res = await fetch(`/api/chat/session/${currentSessionId}`, {
    headers: { Authorization: "Bearer " + token },
  });
  const data = await res.json();
  sessionNameInput.value = data.sessionTitle || "";
  // Lấy style từ backend nếu có (giả sử trả về sessionBotStyle)
  let style = data.sessionBotStyle || "default";
  for (const radio of botStyleRadios) {
    radio.checked = radio.value === style;
  }
  // Lấy API key từ localStorage
  apiKeyInput.value = getStoredApiKey();
});

// Save changes
settingsForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!currentSessionId) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  const newTitle = sessionNameInput.value.trim();
  let newStyle = "default";
  for (const radio of botStyleRadios) {
    if (radio.checked) newStyle = radio.value;
  }
  // Đổi tên
  if (newTitle) {
    await fetch(`/api/chat/session/${currentSessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title: newTitle }),
    });
    updateChatName(newTitle);
    await loadSessions(token);
  }
  // Đổi style
  await fetch(`/api/chat/session/${currentSessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ botStyle: newStyle }),
  });
  // Lưu API key vào localStorage
  setStoredApiKey(apiKeyInput.value.trim());
  // Đóng modal
  const modal = bootstrap.Modal.getInstance(settingsModal);
  modal.hide();
});

// Xóa session
if (deleteSessionBtn) {
  deleteSessionBtn.addEventListener("click", async function () {
    if (!currentSessionId) return;
    if (!confirm("Bạn có chắc muốn xóa phiên chat này?")) return;
    const user = firebase.auth().currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    await fetch(`/api/chat/session/${currentSessionId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    // Quay về trang chủ
    window.location.href = "/";
  });
}

chatInput.addEventListener("input", function () {
  this.style.height = "auto";
  const newHeight = Math.min(this.scrollHeight, 7 * 24);
  this.style.height = newHeight + "px";
});

chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey && !chatFormBtn.disabled) {
    e.preventDefault();
    chatForm.requestSubmit();
  } else if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    const cursorPosition = this.selectionStart;
    const textBefore = this.value.substring(0, cursorPosition);
    const textAfter = this.value.substring(cursorPosition);
    this.value = textBefore + "\n" + textAfter;
    this.selectionStart = this.selectionEnd = cursorPosition + 1;
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 7 * 24) + "px";
  }
});

function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text.replace(/<[^>]*>/g, "");
}
