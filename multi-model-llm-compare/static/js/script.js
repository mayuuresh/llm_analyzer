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

  const conversations = [];
  let currentConversationId = null;

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
    // Generate a unique ID for the conversation
    const conversationId = Date.now().toString();
    currentConversationId = conversationId;

    // Add to conversations array
    conversations.push({
      id: conversationId,
      messages: [],
    });

    // Clear chat container
    chatContainer.innerHTML = `
              <div class="welcome-message">
                  <h1>AI Model Comparison</h1>
                  <p>Ask a question and get the best response from 5 different AI models.</p>
                  <p>The system will evaluate responses from GPT-4, Llama, Mistral, DeepSeek, and Gemini to show you the most accurate one.</p>
              </div>
          `;

    // Update chat history in sidebar
    updateChatHistory();

    // Focus on input
    promptInput.focus();
  }

  // Update chat history in sidebar
  function updateChatHistory() {
    chatHistory.innerHTML = "";

    conversations.forEach((conversation) => {
      // Get the first user message as the title, or use a default
      let title = "New Conversation";
      const firstUserMessage = conversation.messages.find(
        (msg) => msg.role === "user"
      );
      if (firstUserMessage) {
        title =
          firstUserMessage.content.length > 25
            ? firstUserMessage.content.substring(0, 25) + "..."
            : firstUserMessage.content;
      }

      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.textContent = title;
      historyItem.dataset.conversationId = conversation.id;

      if (conversation.id === currentConversationId) {
        historyItem.style.backgroundColor = "var(--highlight-color)";
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

    // Clear chat container
    chatContainer.innerHTML = "";

    // Add messages to chat container
    conversation.messages.forEach((message) => {
      addMessageToChat(
        message.role,
        message.content,
        message.model,
        message.allResponses
      );
    });

    // Update chat history highlighting
    updateChatHistory();
  }

  // Add a message to the chat
  function addMessageToChat(role, content, model = null, allResponses = null) {
    // Remove welcome message if it exists
    const welcomeMessage = chatContainer.querySelector(".welcome-message");
    if (welcomeMessage) {
      chatContainer.removeChild(welcomeMessage);
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${role}`;

    if (role === "user") {
      // For user messages, display immediately
      messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
      chatContainer.appendChild(messageDiv);
    } else {
      // For AI responses, create typing indicator first
      messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
                ${
                  model
                    ? `
                <div class="message-meta">
                    <span class="model-badge">${model}</span>
                    ${
                      allResponses
                        ? '<span class="view-all-responses">View all responses</span>'
                        : ""
                    }
                </div>`
                    : ""
                }
            `;

      chatContainer.appendChild(messageDiv);

      // Start typewriter effect after a short delay
      setTimeout(() => {
        typeWriterEffect(messageDiv, content, model, allResponses);
      }, 50);
    }

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Save message to current conversation
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
        });
      }
    }

    // Update chat history
    updateChatHistory();
  }
  function typeWriterEffect(messageDiv, fullText, model, allResponses) {
    const contentDiv = messageDiv.querySelector(".message-content");
    contentDiv.innerHTML = ""; // Clear typing indicator

    let i = 0;
    const speed = 20; // Adjust typing speed (lower = faster)
    const paragraphDelay = 500; // Delay between paragraphs

    function type() {
      if (i < fullText.length) {
        // Handle paragraph breaks
        if (
          fullText.substring(i, i + 4) === "<br>" ||
          fullText.substring(i, i + 6) === "<br />" ||
          fullText.substring(i, i + 7) === "<br/>"
        ) {
          const br = document.createElement("br");
          contentDiv.appendChild(br);
          i += fullText.substring(i, i + 7).startsWith("<br/>")
            ? 5
            : fullText.substring(i, i + 6).startsWith("<br />")
            ? 6
            : 4;
          setTimeout(type, paragraphDelay);
        } else {
          // Add character by character
          contentDiv.innerHTML += fullText.charAt(i);
          i++;
          setTimeout(type, speed);
        }

        // Scroll to bottom as text appears
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        // Typing complete - add model info if applicable
        if (model) {
          const metaHTML = `
                        <div class="message-meta">
                            <span class="model-badge">${model}</span>
                            ${
                              allResponses
                                ? '<span class="view-all-responses">View all responses</span>'
                                : ""
                            }
                        </div>
                    `;

          // Add event listener to "View all responses" if applicable
          if (allResponses) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = metaHTML;
            messageDiv.appendChild(tempDiv.firstChild);

            const viewAllButton = messageDiv.querySelector(
              ".view-all-responses"
            );
            viewAllButton.addEventListener("click", () => {
              showAllResponses(allResponses, fullText, model);
            });
          } else {
            messageDiv.innerHTML += metaHTML;
          }
        }
      }
    }

    type();
  }
  // Show all model responses in the side panel
  function showAllResponses(responses, bestResponse, bestModel) {
    panelContent.innerHTML = "";

    // Add each model's response
    for (const [model, response] of Object.entries(responses)) {
      const responseDiv = document.createElement("div");
      responseDiv.className = "model-response";

      const isBest = model === bestModel;

      responseDiv.innerHTML = `
                  <h4>
                      ${model}
                      ${
                        isBest
                          ? '<span class="model-badge">Best Response</span>'
                          : ""
                      }
                  </h4>
                  <div class="model-response-content">${response}</div>
              `;

      panelContent.appendChild(responseDiv);
    }

    // Open the panel
    modelDetailsPanel.classList.add("open");
  }

  // Handle form submission
  promptForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Create a new conversation if none exists
    if (!currentConversationId) {
      createNewChat();
    }

    // Add user message to chat
    addMessageToChat("user", prompt);

    // Clear input
    promptInput.value = "";
    promptInput.style.height = "auto";

    // Show loading overlay
    loadingOverlay.style.display = "flex";

    try {
      // Send request to API
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

      // Add AI response to chat
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
      // Hide loading overlay
      loadingOverlay.style.display = "none";
    }
  });

  // New chat button
  newChatButton.addEventListener("click", createNewChat);

  // Close panel button
  closePanelButton.addEventListener("click", () => {
    modelDetailsPanel.classList.remove("open");
  });

  // Initialize with a new chat
  createNewChat();
});
