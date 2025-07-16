package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/gorilla/websocket"
)

type File struct {
	Name     string `json:"name"`
	FileType string `json:"fileType"`
	Size     int64  `json:"size"`
}

type Clients struct {
	clients []*websocket.Conn
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (c *Clients) Add(conn *websocket.Conn) {
	c.clients = append(c.clients, conn)
}

func (c *Clients) Remove(conn *websocket.Conn) {
	var newClients Clients;
	for _, k := range c.clients {
		if k == conn {
			continue
		}
		c.clients = append(newClients.clients, k)
		
	}
}

var c = &Clients{
	clients: make([]*websocket.Conn, 1024),
}

func wsHandler(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)

	c.Add(conn)

	if err != nil {
		fmt.Println("Error upgrading ", err)
		return
	}

	defer func() {
		c.Remove(conn)
		conn.Close()
	}()
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
		
		fmt.Println("Sent")

		for _, client := range c.clients {
			if client == conn {
				continue
			}
			client.WriteMessage(websocket.TextMessage, fileMetaData)

			client.WriteMessage(websocket.BinaryMessage, fileData)
		}

	}

}

func main() {

	http.HandleFunc("/ws", wsHandler)

	fmt.Println("Lisening to port 3005")

	err := http.ListenAndServe("172.20.10.4:3005", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
