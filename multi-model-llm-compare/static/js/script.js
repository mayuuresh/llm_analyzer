document.addEventListener("DOMContentLoaded", () => {
  const promptForm = document.getElementById("prompt-form");
  const promptInput = document.getElementById("prompt-input");
  const chatContainer = document.getElementById("chat-container");
  const newChatButton = document.getElementById("new-chat");
  const chatHistory = document.getElementById("chat-history");
  const modelDetailsPanel = document.getElementById("model-details-panel");
  const closePanelButton = document.getElementById("close-panel");
  const panelContent = document.getElementById("panel-content");
  const loadingOverlay = document.getElementById("loading-overlay");

 
// Load conversations from localStorage
const loadConversations = () => {
  const savedConversations = localStorage.getItem('aiChatConversations');
  return savedConversations ? JSON.parse(savedConversations) : [];
};

// Save conversations to localStorage
const saveConversations = () => {
  localStorage.setItem('aiChatConversations', JSON.stringify(conversations));
};

// Initialize with saved conversations or empty array
const conversations = loadConversations();
let currentConversationId = conversations.length > 0 ? conversations[0].id : null;

  // Auto-resize textarea
  promptInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
    if (this.scrollHeight > 200) {
      this.style.overflowY = "auto";
    } else {
      this.style.overflowY = "hidden";
    }
  });

  // Create a new chat
  function createNewChat() {
    const conversationId = Date.now().toString();
    currentConversationId = conversationId;

    conversations.push({
      id: conversationId,
      messages: [],
      createdAt: new Date().toISOString()

    });
    conversations.unshift(newConversation); // Add to beginning of array
    saveConversations();

    chatContainer.innerHTML = `
      <div class="welcome-message">
        <h1>AI Model Comparison</h1>
        <p>Ask a question and get the best response from 5 different AI models.</p>
        <p>The system will evaluate responses from GPT-4, Llama, Mistral, DeepSeek, and Gemini to show you the most accurate one.</p>
      </div>
    `;

    updateChatHistory();
    promptInput.focus();
  }

  // Update chat history in sidebar
  function updateChatHistory() {
    chatHistory.innerHTML = "";
  
    conversations.forEach((conversation) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.dataset.conversationId = conversation.id;
  
      // Find first user message for title
      const firstUserMessage = conversation.messages.find(msg => msg.role === "user");
      let title = "New Chat";
      if (firstUserMessage) {
        title = firstUserMessage.content.length > 25
          ? firstUserMessage.content.substring(0, 25) + "..."
          : firstUserMessage.content;
      }
  
      // Create date string
      const date = new Date(conversation.createdAt);
      const dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      historyItem.innerHTML = `
        <div class="history-item-title">${title}</div>
        <div class="history-item-date">${dateStr}</div>
      `;
  
      if (conversation.id === currentConversationId) {
        historyItem.classList.add("active");
      }
  
      historyItem.addEventListener("click", () => {
        loadConversation(conversation.id);
      });
  
      chatHistory.appendChild(historyItem);
    });
  }
  // Load a conversation
  function loadConversation(conversationId) {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (!conversation) return;

    currentConversationId = conversationId;
    chatContainer.innerHTML = "";

    conversation.messages.forEach((message) => {
      addMessageToChat(
        message.role,
        message.content,
        message.model,
        message.allResponses
      );
    });
    if (conversations.length > 0) {
      loadConversation(conversations[0].id);
    } else {
      createNewChat();
    }
    updateChatHistory();
  }

  // Add a message to the chat
  function addMessageToChat(role, content, model = null, allResponses = null) {
    const welcomeMessage = chatContainer.querySelector(".welcome-message");
    if (welcomeMessage) {
        chatContainer.removeChild(welcomeMessage);
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${role}`;

    const formattedContent = formatMessageContent(content);

    if (role === "user") {
        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${formattedContent}</div>
            ${
                model
                    ? `
            <div class="message-meta">
                <span class="model-badge">${model}</span>
                ${
                    allResponses
                        ? '<button class="view-all-responses">View all responses</button>'
                        : ""
                }
            </div>`
                    : ""
            }
        `;
    }

    chatContainer.appendChild(messageDiv);
    
    // Add event listener for "View all responses" if it exists
    if (model && allResponses) {
        const viewAllBtn = messageDiv.querySelector(".view-all-responses");
        viewAllBtn.addEventListener("click", () => {
            showAllResponses(allResponses, content, model);
        });
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;

     if (currentConversationId) {
      const conversation = conversations.find(
        (conv) => conv.id === currentConversationId
      );
      if (conversation) {
        conversation.messages.push({
          role,
          content,
          model,
          allResponses,
          timestamp: new Date().toISOString()
        });
        saveConversations();
      }
    }


    updateChatHistory();
}
// Add this to your existing code
const clearHistoryButton = document.createElement("button");
clearHistoryButton.textContent = "Clear History";
clearHistoryButton.className = "clear-history";
clearHistoryButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all chat history?")) {
    localStorage.removeItem('aiChatConversations');
    conversations = [];
    currentConversationId = null;
    createNewChat();
  }
});

  // Improved markdown formatting function
  function formatMessageContent(content) {
    if (!content) return '';

    // Enhanced table processing that handles malformed tables
    content = content.replace(
        /((?:\|.*\|(?:\r?\n|\r))((?:\|.*\|(?:\r?\n|\r)?)+))/g, // Fixed the regular expression
        (match) => {
            // Split into lines and clean up
            const lines = match.split('\n')
                .filter(line => line.trim() && line.includes('|'))
                .map(line => line.trim());

            if (lines.length < 2) return match; // Not a valid table

            let tableHTML = '<table>';
            
            // Process each line
            lines.forEach((line, index) => {
                const cells = line.split('|')
                    .map(cell => cell.trim())
                    .filter(cell => cell); // Remove empty cells from split
                
                if (index === 0) {
                    // Header row
                    tableHTML += '<thead><tr>';
                    cells.forEach(cell => {
                        tableHTML += `<th>${cell}</th>`;
                    });
                    tableHTML += '</tr></thead><tbody>';
                } else {
                    // Data row
                    tableHTML += '<tr>';
                    cells.forEach(cell => {
                        // Handle empty cells
                        const content = cell || '&nbsp;';
                        tableHTML += `<td>${content}</td>`;
                    });
                    tableHTML += '</tr>';
                }
            });
            
            tableHTML += '</tbody></table>';
            return tableHTML;
        }
    );


    // Split content into lines
    let lines = content.split('\n');
    let formattedLines = [];
    let inCodeBlock = false;
    let inList = false;
    let listType = 'ul';

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          formattedLines.push('<pre><code>');
          inCodeBlock = true;
        } else {
          formattedLines.push('</code></pre>');
          inCodeBlock = false;
        }
        return;
      }

      if (inCodeBlock) {
        formattedLines.push(line);
        return;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        formattedLines.push(`<h1>${line.slice(2)}</h1>`);
      } else if (line.startsWith('## ')) {
        formattedLines.push(`<h2>${line.slice(3)}</h2>`);
      } else if (line.startsWith('### ')) {
        formattedLines.push(`<h3>${line.slice(4)}</h3>`);
      }
      // Handle bullet points
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          if (inList) formattedLines.push(`</${listType}>`);
          formattedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        formattedLines.push(`<li>${line.trim().slice(2)}</li>`);
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        if (!inList || listType !== 'ol') {
          if (inList) formattedLines.push(`</${listType}>`);
          formattedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        formattedLines.push(`<li>${line.trim().replace(/^\d+\.\s/, '')}</li>`);
      }
      // Close lists if next line is not a list item
      else {
        if (inList) {
          formattedLines.push(`</${listType}>`);
          inList = false;
        }
        // Handle bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle italic text
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Handle inline code
        line = line.replace(/`(.*?)`/g, '<code>$1</code>');
        
        if (line.trim()) {
          formattedLines.push(`<p>${line}</p>`);
        } else if (!inList) {
          formattedLines.push('<br>');
        }
      }
    });

    // Close any open lists at the end
    if (inList) {
      formattedLines.push(`</${listType}>`);
    }

    return formattedLines.join('\n');
  }

  // Show all model responses in the side panel
  function showAllResponses(responses, bestResponse, bestModel) {
    // Clear previous content
    panelContent.innerHTML = "";

    // Add header with comparison info
    const headerDiv = document.createElement("div");
    headerDiv.className = "panel-header-info";
    headerDiv.innerHTML = `
        <h3>Comparing Model Responses</h3>
        <p>The best response was selected from <strong>${Object.keys(responses).length}</strong> models.</p>
    `;
    panelContent.appendChild(headerDiv);

    // Add each model's response
    for (const [model, response] of Object.entries(responses)) {
        const responseDiv = document.createElement("div");
        responseDiv.className = "model-response";

        const isBest = model === bestModel;

        responseDiv.innerHTML = `
            <div class="model-response-header">
                <h4>${model}</h4>
                ${isBest ? '<span class="best-model-badge">Best Response</span>' : ''}
            </div>
            <div class="model-response-content">${formatMessageContent(response)}</div>
        `;

        panelContent.appendChild(responseDiv);
    }

    // Open the panel
    modelDetailsPanel.classList.add("open");
    
    // Scroll to top of panel
    panelContent.scrollTop = 0;
}


promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    promptForm.dispatchEvent(new Event("submit"));
  }
});

promptForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = promptInput.value.trim();
  if (!prompt) return;

  if (!currentConversationId) {
    createNewChat();
  }

  addMessageToChat("user", prompt);

  promptInput.value = "";
  promptInput.style.height = "auto";
  loadingOverlay.style.display = "flex";

  try {
    const response = await fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    addMessageToChat(
      "ai",
      data.response,
      data.best_model,
      data.all_responses
    );
  } catch (error) {
    console.error("Error:", error);
    addMessageToChat(
      "ai",
      "Sorry, there was an error processing your request. Please try again."
    );
  } finally {
    loadingOverlay.style.display = "none";
  }
});


  // Event listeners
  newChatButton.addEventListener("click", createNewChat);
  closePanelButton.addEventListener("click", () => {
    modelDetailsPanel.classList.remove("open");
  });

  // Initialize with a new chat
  createNewChat();
});