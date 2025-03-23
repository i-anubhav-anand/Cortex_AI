"use client"

import { useEffect, useState } from "react"

export default function DebugPage() {
  const [info, setInfo] = useState<any>({
    loaded: true,
    time: new Date().toISOString(),
    env: {},
    windowSize: "",
  })

  useEffect(() => {
    // Collect environment variables
    const envVars = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "not set",
      NEXT_PUBLIC_LOCAL_MODE_ENABLED: process.env.NEXT_PUBLIC_LOCAL_MODE_ENABLED || "not set",
      NEXT_PUBLIC_PRO_MODE_ENABLED: process.env.NEXT_PUBLIC_PRO_MODE_ENABLED || "not set",
    }

    setInfo({
      ...info,
      env: envVars,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: window.navigator.userAgent,
    })
  }, [])

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p className="mb-4">If you can see this page, basic React rendering is working.</p>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(info.env, null, 2)}</pre>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Browser Info</h2>
        <p>Window Size: {info.windowSize}</p>
        <p>User Agent: {info.userAgent}</p>
        <p>Time: {info.time}</p>
      </div>

      <div className="mt-4">
        <a href="/" className="text-blue-500 underline">
          Go to Home Page
        </a>
      </div>
    </div>
  )
}

