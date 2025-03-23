import { type FC, memo } from "react"
import ReactMarkdown, { type Options } from "react-markdown"

// Using the recommended approach where className is applied to a wrapper div
export const MemoizedReactMarkdown: FC<Options & { className?: string }> = memo(
  ({ className, children, ...props }) => {
    if (className) {
      return (
        <div className={className}>
          <ReactMarkdown {...props}>{children}</ReactMarkdown>
        </div>
      )
    }
    
    return <ReactMarkdown {...props}>{children}</ReactMarkdown>
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

