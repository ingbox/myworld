"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws`);

    ws.onopen = () => {
      console.log("OPEN");

      ws.send("hello");
    };

    ws.onmessage = (e) => {
      console.log(e.data);
    };

    ws.onclose = (e) => {
      console.log("CLOSE", e.code);
    };

    ws.onerror = (e) => {
      console.log("ERROR", e);
    };

    return () => ws.close();
  }, []);

  return <div>test</div>;
}