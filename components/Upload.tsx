"use client";

import { socket } from "@/lib/utils";
import { Cloud } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button, buttonVariants } from "./ui/button";

const Upload = () => {
  const [sending, setSending] = useState<boolean>(false);
  const [data, setData] = useState({
    current: 0,
    total: 0,
  });
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

  const receivedFiles = new Map();

  useEffect(() => {
    socket.on("file-chunk", (data) => {
      if (data.senderId === socket.id) return;

      const key = data.fileName + data.senderId;
      if (!receivedFiles.has(key)) {
        receivedFiles.set(key, {
          fileType: data.fileType,
          chunks: [],
          received: 0,
          receivedBytes: 0,
          total: data.totalChunks,
        });
      }

      const fileData = receivedFiles.get(key);
      fileData.chunks[data.currentChunk] = data.chunk;
      fileData.receivedBytes += data.chunk.byteLength;

      fileData.received++;

      if (fileData.received === fileData.total) {
        const blob = new Blob(fileData.chunks, { type: fileData.fileType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        receivedFiles.delete(key);
      }
    });

    return () => {
      socket.off("file-chunk");
    };
  }, []);

  const CHUNK_SIZE = 64 * 1024; // 64KB

  const handleSend = async () => {
    if (acceptedFiles.length === 0) return;

    await new Promise((r) => setTimeout(r, 0));

    setSending(true);
    for (const file of acceptedFiles) {
      const totalSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE);

      let sentBytes = 0;
      setData({ current: 0, total: totalSize });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, arrayBuffer.byteLength);
        const chunk = new Uint8Array(arrayBuffer.slice(start, end));

        socket.emit("file-chunk", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          chunk,
          totalChunks,
          currentChunk: i,
        });
        sentBytes += chunk.byteLength;
        setData({ current: sentBytes, total: totalSize });
      }
    }
    await new Promise((r) => setTimeout(r, 5));
    setSending(false);
  };

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
      <p>
        {sending &&
          `${data.current / (1024 * 1024)} out of ${data.total / (1024 * 1024)}`}
      </p>

      <Button
        className="w-full max-w-[300px]"
        onClick={async () => {
          const file = acceptedFiles[0];
          wsRef.current?.send(
            JSON.stringify({
              name: file.name,
              fileType: file.type,
              size: file.size,
            }),
          );
          wsRef.current?.send(await file.arrayBuffer());
        }}
        disabled={sending}
      >
        Send
      </Button>
    </div>
  );
};

export default Upload;
