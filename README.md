# ShareIt

This is a simple local file sharing platform built using React and Tailwind CSS. It allows users to easily upload files via drag-and-drop or by clicking a button.

## Features

* **Drag-and-Drop Upload:** Easily upload files by dragging them into the designated area.

* **Click-to-Upload:** Alternatively, click the upload area to select files from your file explorer.

* **File Display:** Shows the name of the file(s) selected for upload.



## Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**

    ```
    git clone (https://github.com/winnerezy/shareit)
    cd (https://github.com/winnerezy/shareit.git)

    ```

2.  **Install dependencies:**

    ```
    bun install
    # or using yarn
    yarn install

    ```

3.  **Run the development server:**

    ```
    bun dev
    # or using yarn
    yarn dev

    ```

The application should now be running at `http://localhost:3000`.

## Usage

1.  Open the application in your web browser.

2.  You will see an upload area labeled "Click or Drag n Drop To Upload".

3.  **To upload:**

    * Drag and drop one or more files into this area.

    * Alternatively, click on the upload area, and a file explorer window will open. Select the file(s) you wish to upload.

4.  The name(s) of the selected file(s) will appear below the upload area.

5.  Click the "Send" button to initiate the file sharing process (Note: The provided code snippet only handles file selection; the actual sending/sharing logic needs to be implemented).

## Technologies Used

* React

* Next.js (assuming based on `use client`)

* Tailwind CSS

* lucide-react (for icons)

* react-dropzone (for drag-and-drop functionality)

## Contributing

I welcome contributions! If you have any ideas, improvements, or bug fixes, feel free to open an issue or submit a pull request. Let's make this platform even more amazing together!
