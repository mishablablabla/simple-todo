# Task Manager App 📝

## Project Description

**Task Manager App** is a simple yet functional application for managing tasks. It allows users to create, edit, delete, and sort tasks by priority or completion status. This project demonstrates DOM manipulation, API integration, and modern approaches to building interactive user interfaces.

---

## Features

- **Add Tasks**: Enter a task title, description, and priority, then send the data to the server.
- **Edit Tasks**: Update the title, description, and priority of existing tasks.
- **Delete Tasks**: Remove tasks with confirmation and update the task list.
- **Toggle Task Completion**: Mark tasks as completed or revert them to "not completed."
- **Sorting Options**:  
  - By priority (high → low).  
  - By completed tasks.  
  - By not completed tasks.  
- **Notifications**: Pop-up messages to inform the user about the success or failure of actions.
- **API Integration**: CRUD operations using the `fetch` API.

---

## Technologies

This project is built using the following technologies:

- **HTML5**: For structuring the web page.
- **CSS3**: For styling the user interface.
- **Vanilla JavaScript**: For application logic, asynchronous requests, and DOM manipulation.
- **JSON Server**: For local task storage.

---

## Installation and Setup

1. Clone the repository: (you have to have something like MAMP, and clone into htdocs folder)

   ```bash
   git clone https://github.com/mishablablabla/simple-todo.git

2. Navigate to the project directory:

    `cd task-manager-app`

4. Install dependencies :

   `npm install`

5. Start the JSON Server:

   `npx json-server --watch db.json --port 3000`

6. Open MAMP in your browser click "My website" and open simple-todo 
