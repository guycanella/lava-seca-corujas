import type { JSX, ReactElement, ReactNode } from 'react'

type ChildrenProps = {
  isTrue?: boolean
}

type ShowProps = {
  children: Array<ReactElement<ChildrenProps>> | ReactElement<ChildrenProps>
}

type ShowWhenProps = {
  isTrue: boolean
  children: ReactNode
}

type ShowElseProps = {
  children: ReactNode
}

export const Show = ({ children }: ShowProps) => {
  let when: ReactElement<ChildrenProps> | null = null
  let otherwise: ReactElement<ChildrenProps> | null = null

  const checkChildProps = (child: ReactElement<ChildrenProps>) => {
    if (child.props.isTrue === undefined) {
      otherwise = child
    } else if (!when && child.props.isTrue === true) {
      when = child
    }
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      checkChildProps(child)
    })
  }

  if (!Array.isArray(children)) {
    checkChildProps(children)
  }

  return when ?? otherwise
}

// eslint-disable-next-line react/display-name
Show.When = ({ children, isTrue }: ShowWhenProps) =>
  isTrue ? (children as JSX.Element) : null
Show.Else = ({ children }: ShowElseProps) => children as JSX.Element
