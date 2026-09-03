type KeywordContentProps = {
  content: string;
};

export default function KeywordContent({ content }: KeywordContentProps) {
  return (
    <div
      className="keyword-maze-html-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
