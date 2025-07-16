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

  const connect = useCallback(() => {

    const ws = new WebSocket("ws://172.20.10.4:3005/ws");

    wsRef.current = ws;

    ws.onopen = function () {
      console.log("Connected to WebSocket server");
    };

    let fileName = "download.bin"; // fallback
    
    ws.onmessage = async function (event) {
      if (typeof event.data === "string") {
        try {
          const message = JSON.parse(event.data);
          console.log(message)
          if (message.name) {
            fileName = message.name;
            console.log(fileName)
          }
        } catch (e) {
          console.log("Invalid JSON message:", event.data);
        }
      } else if (event.data instanceof Blob) {
        const a = document.createElement("a");
        const url = URL.createObjectURL(event.data);
        a.href = url;
        a.download = fileName;
        a.click();
    
        URL.revokeObjectURL(url);
        console.log("Downloaded:", fileName);
      } else {
        console.log("Unknown message type", event.data);
      }
    };


    ws.onclose = function () {
      console.log("WebSocket connection closed, retrying...");
      setTimeout(connect, 1000); // Reconnect after 1 second
    };

    ws.onerror = function (error) {
      setSending(false);
      console.log("WebSocket error:", error);
    };

  }, [])

  useEffect(() => {
    connect();
  }, [connect]);

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
            wsRef.current?.send(
              JSON.stringify({
                name: file.name,
                fileType: file.type,
                size: file.size,
              }),
            );

            await new Promise((res) => setTimeout(res, 100));

            const buffer = await file.arrayBuffer();
            wsRef.current?.send(buffer);
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
