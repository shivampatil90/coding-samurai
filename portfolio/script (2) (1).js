// app.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksList = document.getElementById('tasks-list');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const editModal = document.getElementById('edit-modal');
    const editTaskInput = document.getElementById('edit-task-input');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const closeBtn = document.querySelector('.close-btn');

    // Profile stats elements
    const productivityLevelEl = document.getElementById('productivity-level');
    const tasksTodayEl = document.getElementById('tasks-today');
    const tasksCompletedEl = document.getElementById('tasks-completed');
    const tasksPendingEl = document.getElementById('tasks-pending');

    // State
    let tasks = [];
    let currentEditIndex = -1;

    // Initialize app
    loadTasks();
    renderTasks();
    updateStats();

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearAllBtn.addEventListener('click', clearAllTasks);
    saveEditBtn.addEventListener('click', saveEditedTask);
    cancelEditBtn.addEventListener('click', closeEditModal);
    closeBtn.addEventListener('click', closeEditModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // Functions
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            alert('Please enter a task');
            return;
        }

        const newTask = {
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateStats();

        // Clear input
        taskInput.value = '';
        taskInput.focus();
    }

    function renderTasks() {
        tasksList.innerHTML = '';

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks">No tasks yet. Add a task to get started!</p>';
            return;
        }

        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';

            if (task.completed) {
                taskItem.classList.add('completed');
            }

            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;

            tasksList.appendChild(taskItem);
        });

        // Add event listeners to checkboxes, edit and delete buttons
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskComplete);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', openEditModal);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTask);
        });
    }

    function toggleTaskComplete(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        tasks[index].completed = e.target.checked;
        saveTasks();
        renderTasks();
        updateStats();
    }

    function openEditModal(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        currentEditIndex = index;
        editTaskInput.value = tasks[index].text;
        editModal.style.display = 'flex';
        editTaskInput.focus();
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditIndex = -1;
    }

    function saveEditedTask() {
        if (currentEditIndex === -1) return;

        const newText = editTaskInput.value.trim();

        if (newText === '') {
            alert('Task cannot be empty');
            return;
        }

        tasks[currentEditIndex].text = newText;
        saveTasks();
        renderTasks();
        closeEditModal();
    }

    function deleteTask(e) {
        const index = parseInt(e.target.getAttribute('data-index'));

        if (confirm('Are you sure you want to delete this task?')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    function clearAllTasks() {
        if (tasks.length === 0) {
            alert('No tasks to clear');
            return;
        }

        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        // Update main stats
        totalTasksEl.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        completedTasksEl.textContent = `${completedTasks} completed`;

        // Update profile stats
        const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const today = new Date().toDateString();
        const tasksToday = tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === today;
        }).length;

        productivityLevelEl.textContent = `${productivity}%`;
        tasksTodayEl.textContent = tasksToday;
        tasksCompletedEl.textContent = completedTasks;
        tasksPendingEl.textContent = totalTasks - completedTasks;
    }
});