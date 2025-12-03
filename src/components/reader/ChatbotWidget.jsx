import { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

function ChatbotWidget({ bookTitle, currentChapter, chapterContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Xin chào! Tôi là trợ lý đọc sách cho cuốn "${bookTitle}". Tôi có thể giúp bạn giải thích, dịch, hoặc trả lời câu hỏi về phần bạn đang đọc. Bạn muốn bắt đầu với điều gì?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeAssistantMessage = async (text) => {
    let current = '';
    const chars = text.split('');

    for (let i = 0; i < chars.length; i++) {
      current += chars[i];

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.typing) {
          return [
            ...prev.slice(0, -1),
            { role: 'assistant', content: current, typing: true }
          ];
        }
        return [...prev, { role: 'assistant', content: current, typing: true }];
      });

      await new Promise((res) => setTimeout(res, 12));
    }

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev.slice(0, -1),
        { role: 'assistant', content: last.content }
      ];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!API_KEY) throw new Error('Không tìm thấy API key');

      const conversationMessages = messages
        .filter((m) => !m.typing)
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `
                    Bạn là trợ lý đọc sách thân thiện.
                    Sách: "${bookTitle}"
                    Chương hiện tại: ${currentChapter?.title || currentChapter || 'không rõ chương'}

                    Yêu cầu:
                    - Giải thích dễ hiểu
                    - Trả lời ngắn gọn
                    - Có thể dùng ví dụ đơn giản
                    - Không nói như máy
                    `
              },
              ...conversationMessages,
              { role: 'user', content: userMessage }
            ],
            temperature: 0.6,
            max_tokens: 700,
            top_p: 0.9
          })
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Lỗi API');
      }

      const data = await response.json();
      const assistantText = data.choices[0].message.content;

      await typeAssistantMessage(assistantText);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: 'Giải thích chương này',
      prompt: 'Bạn có thể giải thích nhanh nội dung chính của chương này không?'
    },
    {
      label: 'Dịch sang tiếng Việt',
      prompt: 'Dịch ý chính của chương này sang tiếng Việt'
    },
    {
      label: 'Bài học rút ra',
      prompt: 'Những bài học quan trọng nhất từ chương này là gì?'
    },
    {
      label: 'Kiểm tra hiểu biết',
      prompt: 'Hãy hỏi tôi một câu để kiểm tra tôi hiểu chương này đến đâu'
    }
  ];

  const handleQuickAction = (prompt) => {
    setInput(prompt);
  };

  return (
    <>
      <button
        className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat với trợ lý AI"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              title="Đóng"
            >
              ✕
            </button>

            <div className="chatbot-title">
              <span className="chatbot-icon">🤖</span>
              <div>
                <h3>Trợ lý đọc sách AI</h3>
                <p className="chatbot-subtitle">{bookTitle}</p>
              </div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={loading}
              >
                {action.label}
              </button>
            ))}
          </div>

          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Hỏi tôi bất cứ điều gì về chương này..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={loading || !input.trim()}
            >
              {loading ? '...' : '➤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
