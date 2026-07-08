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
    <div className="overflow-y-auto p-4 space-y-2 bg-white">
      {messages.map((msg) => {
        const isMe = msg.sender === myEmail;

        return (
          <div
            key={msg.id}
            // className={`flex ${
            //   isMe
            //     ? "justify-end"
            //     : "justify-start"
            // }`}
          >
            <div>
              <div className="text-sm text-zinc-500">
                {msg.name}님의 말:
              </div>

              <div
                className={`text-sm max-w-sm ${
                  isMe
                    ? "text-gray-700"
                    : "text-[#649b61]"
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