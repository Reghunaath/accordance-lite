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
    <button
      onClick={handleClick}
      className="align-super inline-flex cursor-pointer text-primary hover:underline font-semibold bg-primary/10 px-1 rounded ml-0.5 text-xs select-none focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
      aria-label={`Go to source ${index}`}
    >
      [{index}]
    </button>
  );
}
