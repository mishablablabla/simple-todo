window.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector("#submit_button"),
    taskTitle = document.querySelector("#taskTitle"),
    taskDescription = document.querySelector("#taskDescription"),
    notification = document.querySelector("#responseMessage"),
    form = document.querySelector("#taskForm"),
    taskList = document.querySelector(".task-list");

  const message = {
    success: "Успешно",
    loading: "Загрузка...",
    failure: "Что-то пошло не так...",
  };

  loadTasks();

  // Submiting data to server

  submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("Форма отправляется...");

    const titileOfTask = taskTitle.value,
      descriptionOfTask = taskDescription.value;

    if (!titileOfTask || !descriptionOfTask) {
      showNotification("Заполните все поля", 3000);

      return;
    } else {
      const formData = new FormData(form);

      const json = JSON.stringify(Object.fromEntries(formData.entries()));
      try {
        const res = await createTask("http://localhost:3000/todos", json);

        showNotification(message.success, 2000);
        console.log("Задача добавлена:", res);

        loadTasks();
      } catch (error) {
        showNotification(message.failure, 3000);
        console.error(error);
      } finally {
        form.reset();
      }
    }
  });

  function showNotification(message, time = 500) {
    notification.textContent = `${message}`;
    notification.classList.add("show");
    notification.classList.remove("hide");

    setTimeout(() => {
      notification.classList.add("hide");
      notification.classList.remove("show");
    }, time);
  }

  async function createTask(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: data,
      });

      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  // Class for list of tasks

  class TaskCard {
    constructor(title, description) {
      this.title = title;
      this.description = description;
    }

    render(taskNumber, taskId) {
      const li = document.createElement("li");
      li.classList.add("task-item");

      li.innerHTML = `
        <span class="task-number">${taskNumber}.</span>
        <span class="task-title">${this.title}</span>
        <span class="task-description">${this.description}</span>
        <div class="task-actions">
          <button class="complete-btn">Выполнено</button>
          <button class="change-btn">Изменить</button>
          <button class="delete-btn" data-id="${taskId}">Удалить</button>
        </div>
      `;
      return li;
    }
  }

  async function loadTasks() {
    try {
      const tasks = await getTasks("http://localhost:3000/todos");
      console.log("Полученные задачи:", tasks);

      if (tasks.length > 0) {
        taskList.innerHTML = "";
        tasks.forEach(({ id, title, description }, index) => {
          const newTask = new TaskCard(title, description).render(
            index + 1,
            id
          );
          taskList.appendChild(newTask);
        });
      } else {
        console.error("Список задач пуст");
      }
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    }
  }

  async function getTasks(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
      throw error;
    }
  }

  // Task actions

  taskList.addEventListener("click", (event) => {
    if (event.target.matches(".complete-btn")) {
      const parent = event.target.closest(".task-item");

      if (
        event.target.matches(".complete-btn") &&
        event.target.matches(".strike-through")
      ) {
        event.target.classList.remove("strike-through");
        event.target.textContent = "Выполнено";

        parent.style.backgroundColor = "#fff";
      } else {
        event.target.classList.add("strike-through");
        event.target.textContent = "Отмена";

        parent.style.backgroundColor = "#2ee95a";
      }
    } else if (event.target.matches(".delete-btn")) {
      const taskId = event.target.dataset.id;

      deleteTask(taskId);
    }
  });

  function deleteTask(num) {
    fetch(`http://localhost:3000/todos/${num}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Задача удалена успешно");

          loadTasks();
        } else {
          console.log("Произошла ошибка", response.status);
        }
      })
      .catch((error) => {
        console.error("Ошибка запроса:", error);
      });
  }
});
