package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"github.com/gorilla/websocket"
)

type File struct {
	Name     string `json:"name"`
	FileType string `json:"fileType"`
	Size     int64  `json:"size"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandler(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		fmt.Println("Error upgrading ", err)
		return
	}

	defer conn.Close()

	for {
		
		_, fileMetaData, err := conn.ReadMessage()

		if err != nil {
			fmt.Println("Error reading metadata ", err)
			return
		}

		var metadata File

		err = json.Unmarshal(fileMetaData, &metadata)

		if err != nil {
			fmt.Println("Error encoding file ", err)
			return
		}

		fmt.Println(metadata.Name)

		_, fileData, err := conn.ReadMessage()

		if err != nil {
			fmt.Println("Error reading file ", err)
			return
		}

		err = os.MkdirAll("upload", 0755)

		if err != nil {
			fmt.Println("Error making folder ", err)
			return
		}

		err = os.WriteFile(filepath.Join("upload/", metadata.Name), fileData, 0644)

		if err != nil {
			fmt.Println("Error writing file ", err)
			return
		}

		
		fmt.Println("Sent")
		
		conn.WriteMessage(websocket.TextMessage, []byte("Sent"))

	}
}

func main() {


	http.HandleFunc("/ws", wsHandler)

	fmt.Println("Lisening to port 3005")

	err := http.ListenAndServe(":3005", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
