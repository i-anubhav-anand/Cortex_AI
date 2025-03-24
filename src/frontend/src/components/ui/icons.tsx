"use client"

import React from "react"

export interface IconProps extends React.SVGAttributes<SVGElement> {}

export const Icons = {
  sparkles: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3l1.87 6.63L20.5 12l-6.63 1.87L12 20.5l-1.87-6.63L3.5 12l6.63-1.87L12 3z" />
    </svg>
  )
} 