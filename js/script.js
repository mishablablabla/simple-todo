window.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector("#submit_button"),
    taskTitle = document.querySelector("#taskTitle"),
    taskDescription = document.querySelector("#taskDescription"),
    notification = document.querySelector("#responseMessage"),
    form = document.querySelector("#taskForm"),
    taskList = document.querySelector(".task-list"),
    dbUrl = "http://localhost:3000/todos";

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
      descriptionOfTask = taskDescription.value,
      priorityOfTask = document.querySelector("#taskPriority").value;

    if (!titileOfTask || !descriptionOfTask) {
      showNotification("Заполните все поля", 3000);

      return;
    } else {
      const formData = new FormData(form);

      const json = JSON.stringify({
        ...Object.fromEntries(formData.entries()),
        completed: false,
        priorityNum: numPriority(priorityOfTask),
      });
      try {
        const res = await createTask(dbUrl, json);

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

  function numPriority(priority) {
    switch (priority) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      case "none":
      default:
        return 0;
    }
  }

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
    constructor(title, description, priority) {
      this.title = title;
      this.description = description;
      this.priority = priority;
      this.completed = false;
    }

    render(taskNumber, taskId) {
      const li = document.createElement("li");
      li.classList.add("task-item");

      li.innerHTML = `
        <span class="task-number">${taskNumber}.</span>
        <span class="task-title">${this.title}</span>
        <span class="task-description">${this.description}</span>
        <div class="task-actions">
            <button class="task-priority ${this.priority}">Приоритетность : ${this.priority}</button>
          <button class="complete-btn" data-id="${taskId}">Выполнено</button>
          <button class="change-btn" data-id="${taskId}">Изменить</button>
          <button class="delete-btn" data-id="${taskId}">Удалить</button>
        </div>
      `;
      return li;
    }
  }

  async function loadTasks() {
    try {
      const tasks = await getTasks(dbUrl);
      console.log("Полученные задачи:", tasks);

      if (tasks.length > 0) {
        taskList.innerHTML = "";
        generatingTasks(tasks);
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
    const taskId = event.target.dataset.id;

    if (event.target.matches(".complete-btn")) {
      const parent = event.target.closest(".task-item");

      if (event.target.textContent === "Выполнено") {
        toggleTaskStatus(
          event.target,
          "Отмена",
          "red",
          parent,
          "#2ee95a",
          true,
          taskId
        );
      } else if (event.target.textContent === "Отмена") {
        showMessage("success", "Статус задачи обновлен!");

        toggleTaskStatus(
          event.target,
          "Выполнено",
          "#28a745",
          parent,
          "#fff",
          false,
          taskId
        );
      }
    } else if (event.target.matches(".delete-btn")) {
      deleteTask(taskId);
    } else if (event.target.matches(".change-btn")) {
      const parent = event.target.closest(".task-item"),
        num = parent.querySelector(".task-number"),
        title = parent.querySelector(".task-title"),
        descr = parent.querySelector(".task-description"),
        statusBtn = parent.querySelector(".complete-btn"),
        changeBtn = parent.querySelector(".change-btn"),
        deleteBtn = parent.querySelector(".delete-btn"),
        priorityBtn = parent.querySelector(".task-priority");

      changeTask(
        title,
        descr,
        taskId,
        parent,
        num,
        statusBtn,
        changeBtn,
        deleteBtn,
        priorityBtn
      );
    }
  });

  function toggleTaskStatus(
    item,
    completeBtn,
    bckrColor,
    parent,
    color,
    status,
    taskId
  ) {
    item.textContent = completeBtn;
    item.style.backgroundColor = bckrColor;
    parent.style.backgroundColor = color;
    updateTaskStatus(taskId, status);
  }

  async function deleteTask(num) {
    try {
      const response = await fetch(`http://localhost:3000/todos/${num}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Задача удалена успешно");

        showMessage("success", "Задача удалена успешно");
        loadTasks();
      } else {
        console.log("Произошла ошибка", response.status);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  }

  async function updateTaskStatus(id, status) {
    try {
      const updatedStatus = {
        completed: status,
      };

      const response = await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },

        body: JSON.stringify(updatedStatus),
      });

      if (response.ok) {
        console.log("Статус задачи обновлен!");
        showMessage("success", "Статус задачи обновлен!");
      }
    } catch (error) {
      showMessage("fail", `Ошибка ${error}`);
      console.error(error);
    }
  }

  function changeTask(
    title,
    descr,
    id,
    parent,
    num,
    statusBtn,
    changeBtn,
    deleteBtn,
    priorityBtn
  ) {
    parent.classList.add("highlight");

    title.style.display = "none";
    descr.style.display = "none";

    const elementTitile = document.createElement("input"),
      elementDescr = document.createElement("input"),
      changePriority = document.createElement("select");

    changePriority.innerHTML = `
        <option value="none">None</option>
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      `;

    elementTitile.classList.add("input-title");
    elementDescr.classList.add("input-field");
    changePriority.classList.add("changeTaskPriority");

    elementTitile.type = "text";
    elementDescr.type = "text";
    changePriority.name = "priority";
    elementTitile.placeholder = "Введите новый заголовок";
    elementDescr.placeholder = "Введите новое описание ";

    parent.insertBefore(elementTitile, num.nextSibling);
    parent.insertBefore(elementDescr, elementTitile.nextSibling);
    parent.insertBefore(changePriority, elementDescr.nextSibling);

    statusBtn.style.display = "none";
    priorityBtn.style.display = "none";
    changeBtn.style.display = "none";
    deleteBtn.style.display = "none";

    const confirm = document.createElement("button"),
      cancel = document.createElement("button"),
      changeTaskPriority = document.querySelector(".changeTaskPriority");

    confirm.classList.add("confirm-btn");
    cancel.classList.add("cancel-btn");

    confirm.textContent = "Подтвердить";
    cancel.textContent = "Отмена";

    parent.append(confirm);
    parent.append(cancel);

    confirm.addEventListener("click", async () => {
      parent.classList.remove("highlight");

      const updateTitile = parent.querySelector(".input-title").value,
        updateDescr = parent.querySelector(".input-field").value,
        updatePriority = parent.querySelector(".changeTaskPriority").value;

      dataToUpdate = {
        title: updateTitile,
        description: updateDescr,
        priority: updatePriority,
      };

      try {
        const response = await fetch(`http://localhost:3000/todos/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToUpdate),
        });

        if (response.ok) {
          console.log("Описание задачи обновлено!");

          showMessage("success", "Описание задачи обновлено!");
        }

        update(
          statusBtn,
          changeBtn,
          deleteBtn,
          title,
          descr,
          confirm,
          cancel,
          elementTitile,
          elementDescr,
          changeTaskPriority
        );
        loadTasks();
      } catch (error) {
        showMessage("fail", `Ошибка ${error}`);

        console.error(error);
      }
    });

    cancel.addEventListener("click", () => {
      parent.classList.remove("highlight");

      update(
        statusBtn,
        changeBtn,
        deleteBtn,
        title,
        descr,
        confirm,
        cancel,
        elementTitile,
        elementDescr,
        changeTaskPriority
      );
      priorityBtn.style.display = "";
    });
  }

  function update(
    statusBtn,
    changeBtn,
    deleteBtn,
    title,
    descr,
    confirm,
    cancel,
    elementTitile,
    elementDescr,
    priority
  ) {
    statusBtn.style.display = "block";
    changeBtn.style.display = "block";
    deleteBtn.style.display = "block";
    title.style.display = "block";
    descr.style.display = "block";

    confirm.remove();
    cancel.remove();
    elementTitile.remove();
    elementDescr.remove();
    priority.remove();
  }

  function showMessage(status, descr) {
    const notification = document.querySelector("#notificationMessage");

    if (notification.classList.contains("show")) {
      notification.classList.remove("show");
    }

    notification.textContent = descr;

    notification.classList.remove("hide");
    notification.classList.add("show");
    notification.classList.add(status);

    setTimeout(() => {
      notification.classList.remove("show");
      notification.classList.add("hide");
      notification.classList.remove(status);
    }, 5000);
  }

  const filtrTask = document.querySelector("#filter");

  filtrTask.addEventListener("change", (event) => {
    const value = event.target.value;

    switch (value) {
      case "priority":
        sortTaskListByPriority();
        break;
      case "completed":
        sortTaskListByCompleted();
        break;
      case "notCompleted":
        sortTaskListByNotCompleted();
        break;
      case "all":
        loadTasks();
        break;
      default:
        showMessage("fail", "Неизвестная фильтрация");
    }
  });

  async function sortTaskListByPriority() {
    taskList.innerHTML = "";

    const tasks = await getTasks(dbUrl);

    const sortedTasks = tasks.sort((a, b) => b.priorityNum - a.priorityNum);
    console.log(sortedTasks);

    generatingTasks(sortedTasks);
  }

  async function sortTaskListByCompleted() {
    const tasks = await getTasks(dbUrl),
      arr = [],
      allNotCompleted = tasks.every((task) => task.completed === false);
    if (allNotCompleted) {
      showMessage("fail", "Ни одна задача еще не выполнена");
      loadTasks();
    } else {
      taskList.innerHTML = "";

      tasks.forEach((item) => {
        if (item.completed === true) {
          arr.push(item);
        }
      });
      generatingTasks(arr);
    }
  }

  async function sortTaskListByNotCompleted() {
    taskList.innerHTML = "";

    const tasks = await getTasks(dbUrl),
      arr = [];

    tasks.forEach((item) => {
      if (item.completed === false) {
        arr.push(item);
      }
    });

    generatingTasks(arr);
  }

  function generatingTasks(arr) {
    arr.forEach(({ id, title, description, priority, completed }, index) => {
      const newTask = new TaskCard(title, description, priority).render(
        index + 1,
        id
      );
      const completeBtn = newTask.querySelector(".complete-btn");

      if (completed) {
        completeBtn.textContent = "Отмена";
        newTask.style.backgroundColor = "#2ee95a";
        completeBtn.style.backgroundColor = "red";
      } else {
        completeBtn.textContent = "Выполнено";
        completeBtn.style.backgroundColor = "#28a745";
        newTask.style.backgroundColor = "#fff";
      }

      taskList.appendChild(newTask);
    });
  }
});
