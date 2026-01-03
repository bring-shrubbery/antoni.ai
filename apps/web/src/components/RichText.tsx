import { memo } from "react";
import Markdown from "react-markdown";

type RichTextProps = {
  text: string;
};

const Link: React.FC<React.JSX.IntrinsicElements["a"]> = memo(
  ({ href, children }) => {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
);

const components: Partial<{
  [TagName in keyof React.JSX.IntrinsicElements]: React.FunctionComponent<
    React.JSX.IntrinsicElements[TagName]
  >;
}> = {
  a: Link,
  ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-2">{children}</li>,
};

export const RichText: React.FC<RichTextProps> = ({ text }) => {
  return <Markdown components={components as any}>{text}</Markdown>;
};
