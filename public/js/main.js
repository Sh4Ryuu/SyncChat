document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.getElementById('chat-messages');
  const usersList = document.getElementById('users');
  const welcomeModal = document.getElementById('welcome-modal');
  const usernameForm = document.getElementById('username-form');
  const messageInput = document.getElementById('msg');
  const typingIndicator = document.getElementById('typing-indicator');
  
  // Socket.io connection
  const socket = io();
  
  // Connect to server and join chat
  usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get username
    const username = document.getElementById('username').value.trim();
    
    if (username) {
      // Emit username
      socket.emit('userJoin', username);
      
      // Hide welcome modal
      welcomeModal.classList.add('hidden');
    }
  });
  
  // Typing indicator logic
  let typingTimeout;
  
  messageInput.addEventListener('input', () => {
    if (!typingTimeout) {
      socket.emit('typing');
    }
    
    clearTimeout(typingTimeout);
    
    typingTimeout = setTimeout(() => {
      socket.emit('stopTyping');
      typingTimeout = null;
    }, 1000);
  });
  
  // Message submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get message text
    const msg = messageInput.value.trim();
    
    if (msg) {
      // Emit message to server
      socket.emit('chatMessage', msg);
      
      // Clear input
      messageInput.value = '';
      messageInput.focus();
      
      // Stop typing indicator
      socket.emit('stopTyping');
    }
  });
  
  // -------- Socket event listeners --------
  
  // Listen for messages
  socket.on('message', (message) => {
    displayMessage(message);
    
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  
  // User joined notification
  socket.on('userJoined', (username) => {
    const div = document.createElement('div');
    div.classList.add('system-message');
    div.innerText = `${username} has joined the chat`;
    chatMessages.appendChild(div);
    
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  
  // User left notification
  socket.on('userLeft', (username) => {
    const div = document.createElement('div');
    div.classList.add('system-message');
    div.innerText = `${username} has left the chat`;
    chatMessages.appendChild(div);
    
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  
  // Update users list
  socket.on('updateUsers', (users) => {
    updateUsersList(users);
  });
  
  // User typing indicator
  socket.on('userTyping', (username) => {
    typingIndicator.textContent = `${username} is typing...`;
  });
  
  socket.on('userStoppedTyping', () => {
    typingIndicator.textContent = '';
  });
  
  // -------- Helper functions --------
  
  // Output message to DOM
  function displayMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    // Check if this is the current user's message
    const username = document.getElementById('username').value.trim();
    if (message.username === username) {
      div.classList.add('self');
    }
    
    div.innerHTML = `
      <div class="meta">
        <span>${message.username}</span> <span>${message.time}</span>
      </div>
      <p class="text">
        ${message.text}
      </p>
    `;
    
    chatMessages.appendChild(div);
  }
  
  // Update users list in sidebar
  function updateUsersList(users) {
    usersList.innerHTML = '';
    
    if (users.length > 0) {
      users.forEach(user => {
        const li = document.createElement('li');
        li.innerText = user;
        usersList.appendChild(li);
      });
    }
  }
});