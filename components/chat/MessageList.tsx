import { ChatMessage } from "./ChatRoom";

interface Props {
  messages: ChatMessage[];
  myEmail: string;
}

export default function MessageList({
  messages,
  myEmail,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isMe = msg.sender === myEmail;

        return (
          <div
            key={msg.id}
            className={`flex ${
              isMe
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div>
              <div className="text-[10px] text-zinc-500">
                {msg.sender}
              </div>

              <div
                className={`rounded-lg px-3 py-2 max-w-sm ${
                  isMe
                    ? "bg-green-600"
                    : "bg-zinc-800"
                }`}
              >
                {msg.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}