import type { Message } from '../types';

interface UserMessageProps {
  message: Message;
}

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex flex-col items-end gap-2 group">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-slate-400 font-medium">You</span>
      </div>
      <div className="max-w-[85%] md:max-w-[70%] bg-slate-100 text-slate-800 p-5 rounded-2xl rounded-tr-sm shadow-sm">
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      {message.attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          {message.attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl max-w-sm shadow-sm"
            >
              <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                <span className="material-symbols-outlined">picture_as_pdf</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-900 truncate">{att.filename}</span>
                <span className="text-xs text-slate-500">
                  {(att.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
