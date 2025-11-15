
// ==========================================
// Global Variables and Utilities
// ==========================================
const token = localStorage.getItem('token');
const currentUserId = localStorage.getItem('userId');

// Function to get auth headers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token
    };
}

// ==========================================
// Socket.IO Initialization and Management
// ==========================================
let socket;

function initializeSocket() {
    try {
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
            // Join the chat room when connected
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

        return socket;
    } catch (error) {
        console.error('Error initializing socket:', error);
        setTimeout(initializeSocket, 1000);
        return null;
    }
}

// ==========================================
// Call Event Listeners
// ==========================================
function initializeCallEventListeners() {
    // Handle incoming call
    socket.on('call_received', async ({ signal, from, name, isVideo }) => {
        console.log('Call received:', { signal, from, name, isVideo });
        
        // Store call data in localStorage for the call screen
        localStorage.setItem('incomingCall', JSON.stringify({
            signal,
            from,
            name,
            isVideo
        }));

        // Redirect to call screen
        window.location.href = `/call-screen?incoming=true&video=${isVideo}&chat=${currentChatId}`;
    });

    // Handle call accepted
    socket.on('call_accepted', ({ signal, isVideo }) => {
        console.log('Call accepted:', { signal, isVideo });
        stopAllRings();
        const callStatus = document.getElementById('callStatus');
        const callerAvatar = document.getElementById('callerAvatar');
        if (callStatus) callStatus.textContent = 'Connected';
        if (callerAvatar) callerAvatar.classList.remove('ringing-animation');
        peer.signal(signal);
    });

    // Handle call ended
    socket.on('call_ended', () => {
        console.log('Call ended');
        stopAllRings();
        const callStatus = document.getElementById('callStatus');
        if (callStatus) callStatus.textContent = 'Call ended';
        endCall();
    });

    // Handle call rejected
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

// ==========================================
// Chat List Functionality
// ==========================================
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
                <a href="/chat-window?chat=${chat._id}&token=${token}" class="flex items-center p-4 hover:bg-gray-50">
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

// ==========================================
// Chat Window Functionality
// ==========================================
let currentChatId = null;

async function initializeChat() {
    // try {
        const urlParams = new URLSearchParams(window.location.search);
        currentChatId = urlParams.get('chat');
        
        if (!currentChatId) {
            console.error('No chat ID provided');
            return;
        }

        // Initialize socket connection
        socket = initializeSocket();

        // Load chat details and messages
        await loadChatDetails();
        await loadMessages();
    // } catch (error) {
    //     console.error('Error initializing chat:', error);
    //     showErrorMessage('Error initializing chat');
    // }
}

async function loadChatDetails() {
    try {
        const response = await fetch(`/api/chats/${currentChatId}`, {
            headers: getAuthHeaders()
        });
        const chat = await response.json();
        
        // Update chat header
        document.getElementById('chatName').textContent = chat.name || 'Chat';
        document.getElementById('chatStatus').textContent = chat.status || 'Online';
        document.getElementById('chatAvatar').src = chat.avatar || 'https://randomuser.me/api/portraits/women/1.jpg';
    } catch (error) {
        console.error('Error loading chat details:', error);
        showErrorMessage('Error loading chat details');
    }
}

async function loadMessages() {
    // try {
        const response = await fetch(`/api/chats/${currentChatId}/messages`, {
            headers: getAuthHeaders()
        });
        const messages = await response.json();
        
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.innerHTML = '';

        messages.forEach(message => {
            appendMessage(message);
        });

        // Scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
    // } catch (error) {
    //     console.error('Error loading messages:', error);
    //     showErrorMessage('Error loading messages');
    // }
}

function appendMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    const isCurrentUser = message.sender._id === currentUserId;
    
    const messageElement = document.createElement('div');
    messageElement.className = `flex justify-${isCurrentUser ? 'end' : 'start'}`;
    
    messageElement.innerHTML = `
        <div class="${isCurrentUser ? 'bg-green-500 text-white' : 'bg-gray-200'} p-3 rounded-lg max-w-xs">
            <p>${message.content}</p>
            <span class="text-xs ${isCurrentUser ? 'text-green-200' : 'text-gray-600'} block text-right mt-1">
                ${new Date(message.createdAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                })}
                ${isCurrentUser ? '<i class="fas fa-check-double"></i>' : ''}
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
        
        // Emit message to socket
        socket.emit('new_message', {
            chatId: currentChatId,
            message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        showErrorMessage('Error sending message');
    }
}

// ==========================================
// UI Utilities
// ==========================================
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

function showTypingIndicator(show) {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = show ? 'flex' : 'none';
    }
}

// ==========================================
// Event Listeners
// ==========================================
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

let peer = null;
let localStream = null;
let remoteStream = null;
let currentCall = null;
let isVideoEnabled = true;
let isAudioEnabled = true;
let remoteUserId = null;
const incomingRing = document.getElementById('incomingRing');
const outgoingRing = document.getElementById('outgoingRing');

// Function to stop all ring sounds
function stopAllRings() {
    incomingRing.pause();
    incomingRing.currentTime = 0;
    outgoingRing.pause();
    outgoingRing.currentTime = 0;
}

// Initialize WebRTC
async function initializeCall(isVideo) {
    try {
        // Play outgoing ring sound
        outgoingRing.play().catch(error => console.log('Error playing outgoing ring:', error));

        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({
            video: isVideo,
            audio: true
        });

        // Show local video if it's a video call
        if (isVideo) {
            document.getElementById('localVideo').srcObject = localStream;
        }

        // Initialize PeerJS
        peer = new Peer(undefined, {
            host: 'localhost',
            port: 3001,
            path: '/',
            debug: 3,
            secure: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('open', (id) => {
            socket.emit('join_call_room', id);
        });

        peer.on('call', (call) => {
            call.answer(localStream);
            currentCall = call;

            call.on('stream', (stream) => {
                remoteStream = stream;
                const remoteVideo = document.getElementById('remoteVideo');
                remoteVideo.srcObject = stream;
                remoteVideo.classList.remove('hidden');
            });
        });

        setupCallControls();
    } catch (error) {
        console.error('Error initializing call:', error);
        alert('Error accessing camera/microphone');
        stopAllRings();
    }
}

// Setup call controls
function setupCallControls() {
    document.getElementById('toggleVideo').addEventListener('click', () => {
        if (localStream) {
            isVideoEnabled = !isVideoEnabled;
            localStream.getVideoTracks().forEach(track => {
                track.enabled = isVideoEnabled;
            });
            const icon = document.querySelector('#toggleVideo i');
            icon.className = isVideoEnabled ? 'fas fa-video text-2xl mb-1' : 'fas fa-video-slash text-2xl mb-1';
        }
    });

    document.getElementById('toggleAudio').addEventListener('click', () => {
        if (localStream) {
            isAudioEnabled = !isAudioEnabled;
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isAudioEnabled;
            });
            const icon = document.querySelector('#toggleAudio i');
            icon.className = isAudioEnabled ? 'fas fa-microphone text-2xl mb-1' : 'fas fa-microphone-slash text-2xl mb-1';
        }
    });

    document.getElementById('endCall').addEventListener('click', () => {
        stopAllRings();
        endCall();
    });
}

// End call
function endCall() {
    stopAllRings();
    if (currentCall) {
        currentCall.close();
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    socket.emit('end_call', { to: remoteUserId });
    window.location.href = '/chat-window';
}

// Voice call handler
async function voiceCall() {
    console.log(window.peer);
    try {
        const response = await fetch(`/api/chats/${currentChatId}`, {
            headers: getAuthHeaders()
        });
        const chat = await response.json();
        
        const otherParticipant = chat?.participants?.find(p => p._id !== currentUserId);
        if (!otherParticipant) {
            console.error('Could not find other participant');
            return;
        }
        
        console.log('Initiating voice call to:', {
            userToCall: otherParticipant._id,
            from: currentUserId,
            name: otherParticipant.name
        });

        // Initialize PeerJS for voice call
        peer = new window.Peer(undefined, {
            host: window.location.hostname,
            port: 3001,
            path: '/',
            debug: 3,
            secure: window.location.protocol === 'https:',
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('Peer connection opened with ID:', id);
            // Emit the call event
            socket.emit('call_user', {
                userToCall: otherParticipant._id,
                from: currentUserId,
                name: otherParticipant.name,
                isVideo: false,
                signalData: peer.signal()
            });
        });

        peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            if (err.type === 'peer-unavailable') {
                showErrorMessage('The other user is not available for calls.');
            } else {
                showErrorMessage('Error connecting to call server. Please try again.');
            }
        });

        // Then navigate to call screen
        window.location.href = `/call-screen?video=false&chat=${currentChatId}`;
    } catch (error) {
        console.error('Error initiating voice call:', error);
        showErrorMessage('Error starting voice call');
    }
}

// Update video call function to match the same configuration
async function videoCall() {
    try {
        const response = await fetch(`/api/chats/${currentChatId}`, {
            headers: getAuthHeaders()
        });
        const chat = await response.json();

        const otherParticipant = chat?.participants?.find(p => p._id !== currentUserId);
        if (!otherParticipant) {
            console.error('Could not find other participant');
            return;
        }
        
        console.log('Initiating video call to:', {
            userToCall: otherParticipant._id,
            from: currentUserId,
            name: otherParticipant.name
        });

        // Initialize PeerJS for video call
        peer = new Peer(undefined, {
            host: window.location.hostname,
            port: 3001,
            path: '/',
            debug: 3,
            secure: window.location.protocol === 'https:',
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('Peer connection opened with ID:', id);
            // Emit the call event
            socket.emit('call_user', {
                userToCall: otherParticipant._id,
                from: currentUserId,
                name: otherParticipant.name,
                isVideo: true,
                signalData: peer.signal()
            });
        });

        peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            if (err.type === 'peer-unavailable') {
                showErrorMessage('The other user is not available for calls.');
            } else {
                showErrorMessage('Error connecting to call server. Please try again.');
            }
        });

        // Then navigate to call screen
        window.location.href = `/call-screen?video=true&chat=${currentChatId}`;
    } catch (error) {
        console.error('Error initiating video call:', error);
        showErrorMessage('Error starting video call');
    }
}