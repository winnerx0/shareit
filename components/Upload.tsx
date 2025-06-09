"use client";

import { Cloud } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "./ui/button";

const Upload = () => {
  const [sending, setSending] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {};

      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
  });

  function connect() {
    const ws = new WebSocket("ws://localhost:3005/ws");

    wsRef.current = ws;

    ws.onopen = function () {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = function (event) {
      console.log(event.data);
    };

    ws.onclose = function () {
      console.log("WebSocket connection closed, retrying...");
      setTimeout(connect, 1000); // Reconnect after 1 second
    };

    ws.onerror = function (error) {
      console.error("WebSocket error:", error);
    };
  }

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      {/* <p className="text-xl">
        {sending && socket.id === receiver
          ? "Receiving..."
          : sending && socket.id !== receiver
          ? "Sending..."
          : ""}
      </p> */}
      <div
        {...getRootProps()}
        className={buttonVariants({
          variant: "outline",
          className: "h-[300px] w-full max-w-[300px] flex flex-col gap-2",
        })}
      >
        <input {...getInputProps()} />

        <Cloud className="size-10" />
        <p className="text-sm text-wrap">Click or Drag n Drop To Upload</p>
      </div>
      {acceptedFiles.length > 0 &&
        acceptedFiles.map((file, index) => (
          <p
            className="text-wrap max-w-[300px] text-center text-sm"
            key={index}
          >
            {file.name}
          </p>
        ))}
      <Button
        className="w-full max-w-[300px]"
        onClick={async () => {
          if (!wsRef.current || sending) return;
        
          setSending(true);
        
          for (const file of acceptedFiles) {
            wsRef.current.send(
              JSON.stringify({
                name: file.name,
                fileType: file.type,
                size: file.size,
              })
            );
        
            await new Promise((res) => setTimeout(res, 100));
        
            const buffer = await file.arrayBuffer();
            wsRef.current.send(buffer);
          }
        
          setSending(false);
        }}

        disabled={sending}
      >
        Send
      </Button>
    </div>
  );
};

export default Upload;
