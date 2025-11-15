// Global variables
let socket;
let peer;
let currentChatId = null;
let currentUserId = null;
let currentCall = null;
let localStream = null;
let remoteStream = null;

// Utility functions
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
    };
}

function showErrorMessage(message) {
    // Implement your error display logic here
    console.error(message);
    alert(message);
}

// Socket.IO Initialization and Management
function initializeSocket() {
    try {
        const token = localStorage.getItem('token');
        socket = io({
            transports: ['websocket', 'polling'],
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
            if (currentChatId) {
                socket.emit('join_chat', {
                    chatId: currentChatId,
                    userId: currentUserId
                });
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            showErrorMessage('Connection error. Attempting to reconnect...');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setTimeout(initializeSocket, 1000);
        });

        // Initialize call event listeners
        initializeCallEventListeners();
        initializeChatEventListeners();

        return socket;
    } catch (error) {
        console.error('Error initializing socket:', error);
        setTimeout(initializeSocket, 1000);
        return null;
    }
}

// Chat Event Listeners
function initializeChatEventListeners() {
    socket.on('new_message', (message) => {
        appendMessage(message);
    });

    socket.on('message_read', ({ messageId, userId }) => {
        updateMessageStatus(messageId, 'read');
    });

    socket.on('user_typing', ({ userId, isTyping }) => {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = isTyping ? 'flex' : 'none';
        }
    });

    socket.on('user_joined', ({ userId, username, timestamp }) => {
        console.log(`${username} joined the chat`);
    });

    socket.on('user_left', ({ userId, username, timestamp }) => {
        console.log(`${username} left the chat`);
    });
}

// Call Event Listeners
function initializeCallEventListeners() {
    socket.on('call_received', async ({ signal, from, name, isVideo }) => {
        console.log('Call received:', { signal, from, name, isVideo });
        localStorage.setItem('incomingCall', JSON.stringify({
            signal,
            from,
            name,
            isVideo
        }));
        window.location.href = `/call-screen?incoming=true&video=${isVideo}&chat=${currentChatId}`;
    });

    socket.on('call_accepted', ({ signal, isVideo }) => {
        console.log('Call accepted:', { signal, isVideo });
        stopAllRings();
        const callStatus = document.getElementById('callStatus');
        const callerAvatar = document.getElementById('callerAvatar');
        if (callStatus) callStatus.textContent = 'Connected';
        if (callerAvatar) callerAvatar.classList.remove('ringing-animation');
        peer.signal(signal);
    });

    socket.on('call_ended', () => {
        console.log('Call ended');
        stopAllRings();
        const callStatus = document.getElementById('callStatus');
        if (callStatus) callStatus.textContent = 'Call ended';
        endCall();
    });

    socket.on('call_rejected', () => {
        console.log('Call rejected');
        stopAllRings();
        const callStatus = document.getElementById('callStatus');
        if (callStatus) callStatus.textContent = 'Call rejected';
        setTimeout(() => {
            window.location.href = '/chat-window';
        }, 2000);
    });
}

// Chat List Functions
async function loadChatList() {
    try {
        const response = await fetch('/api/chats/', {
            method: "GET",
            headers: getAuthHeaders()
        });

        const chatList = await response.json();
        const chatListElement = document.getElementById("chatList");
        
        if (!chatListElement) return;
        
        chatListElement.innerHTML = '';

        chatList.forEach(chat => {
            const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
            const lastMessageTime = chat.lastMessage 
                ? new Date(chat.lastMessage.createdAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                })
                : '';

            const lastMessageContent = chat.lastMessage 
                ? chat.lastMessage.content 
                : 'No messages yet';

            const unreadBadge = chat.unreadCount > 0 
                ? `<span class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">${chat.unreadCount}</span>`
                : '';

            chatListElement.innerHTML += `
                <a href="/chat-window?chat=${chat._id}" class="flex items-center p-4 hover:bg-gray-50">
                    <img src="${otherParticipant?.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'}" 
                         alt="${otherParticipant?.name || 'User'}" 
                         class="w-12 h-12 rounded-full mr-4">
                    <div class="flex-1">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold text-gray-800">${otherParticipant?.name || 'Unknown User'}</h3>
                            <span class="text-sm text-gray-500">${lastMessageTime}</span>
                        </div>
                        <p class="text-gray-600 text-sm truncate">${lastMessageContent}</p>
                    </div>
                    ${unreadBadge}
                </a>
            `;
        });
    } catch (error) {
        console.error('Error loading chat list:', error);
        showErrorMessage('Error loading chat list');
    }
}

// Chat Window Functions
async function initializeChat() {
    const urlParams = new URLSearchParams(window.location.search);
    currentChatId = urlParams.get('chat');
    
    if (!currentChatId) {
        console.error('No chat ID provided');
        return;
    }

    socket = initializeSocket();
    await loadChatDetails();
    await loadMessages();
}

async function loadChatDetails() {
    try {
        const response = await fetch(`/api/chats/${currentChatId}`, {
            headers: getAuthHeaders()
        });
        const chat = await response.json();
        
        // Update UI with chat details
        document.getElementById('chatName').textContent = chat.name;
        document.getElementById('chatAvatar').src = chat.avatar || '/default-avatar.png';
        document.getElementById('chatStatus').textContent = chat.isOnline ? 'Online' : 'Offline';
    } catch (error) {
        console.error('Error loading chat details:', error);
        showErrorMessage('Error loading chat details');
    }
}

async function loadMessages() {
    try {
        const response = await fetch(`/api/chats/${currentChatId}/messages`, {
            headers: getAuthHeaders()
        });
        const messages = await response.json();
        
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.innerHTML = '';
        
        messages.forEach(message => {
            appendMessage(message);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        showErrorMessage('Error loading messages');
    }
}

function appendMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`;
    
    messageElement.innerHTML = `
        <div class="${message.sender._id === currentUserId ? 'bg-green-500 text-white' : 'bg-gray-200'} p-3 rounded-lg max-w-xs">
            <p>${message.content}</p>
            <span class="text-xs ${message.sender._id === currentUserId ? 'text-green-200' : 'text-gray-600'} block text-right mt-1">
                ${new Date(message.createdAt).toLocaleTimeString()} 
                <i class="fas fa-check-double ${message.status === 'read' ? 'text-blue-500' : ''}"></i>
            </span>
        </div>
    `;
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    try {
        const response = await fetch(`/api/chats/${currentChatId}/messages`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content })
        });
        
        const message = await response.json();
        appendMessage(message);
        messageInput.value = '';
        
        socket.emit('new_message', {
            chatId: currentChatId,
            message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        showErrorMessage('Error sending message');
    }
}

// Call Functions
function videoCall() {
    initializeCall(true);
}

function voiceCall() {
    initializeCall(false);
}

async function initializeCall(isVideo) {
    try {
        const constraints = {
            audio: true,
            video: isVideo
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (isVideo) {
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = localStream;
            }
        }

        peer = new Peer(undefined, {
            host: window.location.hostname,
            port: 3001,
            path: '/',
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('Peer connection opened with ID:', id);
            socket.emit('join_call_room', id);
        });

        peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            if (err.type === 'peer-unavailable') {
                alert('The other user is not available for calls.');
            } else {
                alert('Error connecting to call server. Please try again.');
            }
            stopAllRings();
            window.location.href = '/chat-window';
        });

        peer.on('call', (call) => {
            console.log('Incoming call from peer:', call);
            call.answer(localStream);
            currentCall = call;

            call.on('stream', (stream) => {
                console.log('Received remote stream');
                remoteStream = stream;
                
                if (isVideo) {
                    const remoteVideo = document.getElementById('remoteVideo');
                    if (remoteVideo) {
                        remoteVideo.srcObject = stream;
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error initializing call:', error);
        showErrorMessage('Error initializing call');
    }
}

function endCall() {
    if (currentCall) {
        currentCall.close();
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
        peer.destroy();
    }
}

function stopAllRings() {
    const ringingElements = document.querySelectorAll('.ringing-animation');
    ringingElements.forEach(element => {
        element.classList.remove('ringing-animation');
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize socket
    socket = initializeSocket();

    // Initialize chat list if on chat list page
    if (document.getElementById('chatList')) {
        loadChatList();
    }
    
    // Initialize chat window if on chat window page
    if (document.getElementById('messageContainer')) {
        initializeChat();
        
        // Add message input event listeners
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        if (messageInput && sendButton) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            sendButton.addEventListener('click', sendMessage);
        }
    }

    // Initialize call screen if on call screen page
    if (document.getElementById('callerName')) {
        const urlParams = new URLSearchParams(window.location.search);
        const isVideo = urlParams.get('video') === 'true';
        const isIncoming = urlParams.get('incoming') === 'true';

        if (!isIncoming) {
            initializeCall(isVideo);
        }
    }

    // Add event listeners for call buttons
    const startVoiceCallBtn = document.getElementById('startVoiceCall');
    const startVideoCallBtn = document.getElementById('startVideoCall');
    
    if (startVoiceCallBtn) {
        startVoiceCallBtn.addEventListener('click', voiceCall);
    }
    
    if (startVideoCallBtn) {
        startVideoCallBtn.addEventListener('click', videoCall);
    }
}); 