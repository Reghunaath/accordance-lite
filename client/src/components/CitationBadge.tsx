interface CitationBadgeProps {
  index: number;
  messageId: string;
}

export default function CitationBadge({ index, messageId }: CitationBadgeProps) {
  const handleClick = () => {
    const el = document.getElementById(`source-${messageId}-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-primary', 'ring-offset-1');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-primary', 'ring-offset-1');
      }, 2000);
    }
  };

  return (
    <sup
      onClick={handleClick}
      className="inline-flex align-top cursor-pointer text-primary hover:underline font-semibold bg-primary/10 px-1 rounded ml-0.5 text-xs select-none"
    >
      [{index}]
    </sup>
  );
}
