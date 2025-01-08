const submitBtn = document.querySelector("#submit_button"),
  taskTitle = document.querySelector("#taskTitle"),
  taskDescription = document.querySelector("#taskDescription"),
  notification = document.querySelector("#responseMessage"),
  form = document.querySelector("#taskForm");

const message = {
  success: "Успешно",
  loading: "Загрузка...",
  failure: "Что-то пошло не так...",
};

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const titileOfTask = taskTitle.value,
    descriptionOfTask = taskDescription.value;

  if (!titileOfTask || !descriptionOfTask) {
    showNotification("Заполните все поля", 2500);

    return;
  } else {
    const formData = new FormData(form);

    const json = JSON.stringify(Object.fromEntries(formData.entries()));
    try {
      const res = await createTask("http://localhost:3000/todos", json);

      showNotification(message.success, 1000);
      console.log("Задача добавлена:", res);
    } catch (error) {
      showNotification(message.failure, 2500);
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
