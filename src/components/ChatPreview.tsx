
import { useState, useEffect } from 'react';

const messages = [
  { id: 1, content: "Hi there! How are you today?", isSender: false },
  { id: 2, content: "I'm doing well, thanks for asking! How about you?", isSender: true },
  { id: 3, content: "I'm good too. What brings you here today?", isSender: false },
  { id: 4, content: "Just looking to chat with new people and maybe make some friends.", isSender: true },
  { id: 5, content: "That's great! What are some of your interests?", isSender: false }
];

export function ChatPreview() {
  const [visibleMessages, setVisibleMessages] = useState<typeof messages>([]);
  
  useEffect(() => {
    const showMessages = async () => {
      for (let i = 0; i < messages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVisibleMessages(prev => [...prev, messages[i]]);
      }
    };
    
    showMessages();
    
    return () => {
      setVisibleMessages([]);
    };
  }, []);
  
  return (
    <section className="py-20 bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Seamless Chat Experience</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Our intuitive interface makes conversations flow naturally and effortlessly
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            {/* Chat header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                  <span className="font-medium text-teal-500">KT</span>
                </div>
                <div>
                  <h3 className="font-medium">KindTiger42</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="sr-only">More options</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="h-96 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4">
                {visibleMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={message.isSender ? 'chat-bubble-teal' : 'chat-bubble-coral'}
                      style={{ maxWidth: '80%' }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center px-4 py-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent focus:outline-none text-gray-700 dark:text-gray-200"
                  />
                  <button className="p-1 text-gray-500 hover:text-teal-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="p-1 ml-1 text-gray-500 hover:text-teal-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <button className="p-3 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
