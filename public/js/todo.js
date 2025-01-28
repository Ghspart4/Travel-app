
document.addEventListener('DOMContentLoaded', function() {
    // Fetch the list of todos when the page loads
    fetchTodos();

    // Handle add todo form submission
    document.getElementById('todoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const task = document.getElementById('task').value;
        const due_date = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;
        const status = document.getElementById('status').value;
        
        const todoData = {
            task,
            due_date,
            priority,
            status
        };

        const response = await fetch('/addTodo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoData)
        });

        if (response.ok) {
            alert('Todo successfully added');
            fetchTodos(); // Refresh todo list
        } else {
            alert('Error adding todo');
        }
    });
});

document.getElementById('addTodoForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const task = document.getElementById('task').value;
    const status = document.getElementById('status').value;
    const due_date = document.getElementById('due_date').value;
    const priority = document.getElementById('priority').value;
  
    const formData = {
        task,
        status,
        due_date,
        priority
    };
  
    try {
        const response = await fetch('/addTodo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
  
        const result = await response.json();
        if (response.ok) {
            alert('Todo added successfully!');
            fetchTodos();
        } else {
            alert('Error adding todo: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add todo');
    }
  });


fetchTodos();        

// Fetch todos from the server
async function fetchTodos() {
    try {
        const response = await fetch('/getTodos');
        const todos = await response.json();
        const todosContainer = document.getElementById('todosContainer');
        const tittle = document.getElementById('tittle');
        todosContainer.innerHTML = ''; // Clear previous todos
        
        todos.forEach(todo => {
            const todoCard = document.createElement('div');
            todoCard.className = 'todo-card';
            todoCard.setAttribute('data-priority', todo.priority.toLowerCase());
            
            todoCard.innerHTML = `
                <h3 id="tittle">Task</h3>
                <p class="todostatus">Status: ${todo.status}</p>
                <p class="todotask">${todo.task}</p>
                <p>Priority: ${todo.priority}</p>
                <p>Due Date: ${new Date(todo.due_date).toLocaleDateString('en-GB')}</p>
                <button onclick="editTodo(${todo.id})">Edit</button>
                <button onclick="deleteTodo(${todo.id})">Delete</button>
            `;
            todosContainer.appendChild(todoCard);
        });
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

// Render todos dynamically
function renderTodos(todos) {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.innerHTML = `
            <strong>${todo.task}</strong> - ${todo.status} - ${todo.priority}
            <em>(Due Date: ${new Date(todo.due_date).toLocaleDateString('en-GB')})</em>
            <button onclick="editTodo(${todo.id})">Edit</button>
            <button onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(todoItem);
    });
}

// Edit Todo Route
app.post('/editTodo/:id', isAuthenticated, async (req, res) => {
    const { task, status, due_date, priority } = req.body;
    const todoId = req.params.id;
    const userId = req.session.userId;
  
    try {
        // Verify the todo belongs to the logged-in user
        const [checkResult] = await pool.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', [todoId, userId]);
        
        if (checkResult.length === 0) {
            return res.status(403).json({ success: false, error: 'Unauthorized to edit this todo' });
        }
  
        await pool.execute(
            'UPDATE todos SET task = ?, status = ?, due_date = ?, priority = ? WHERE id = ?',
            [task, status, due_date, priority, todoId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ success: false, error: 'Failed to update todo' });
    }
  });



// Handle submitting the edited todo
// Handle submitting the edited todo
document.getElementById('edit-todo-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('edit-todo-id').value;
    const task = document.getElementById('edit-task').value;
    const due_date = document.getElementById('edit-due-date').value;
    const priority = document.getElementById('edit-priority').value;
    const status = document.getElementById('edit-status').value;

    const updatedTodo = { id, task, due_date, priority, status };

    try {
        const response = await fetch(`/editTodo/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTodo),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Todo updated successfully!');
                fetchTodos(); // Update the todo list
                document.getElementById('edit-todo-modal').style.display = 'none'; // Close modal
            } else {
                throw new Error(result.error || 'Failed to update todo');
            }
        } else {
            throw new Error('Failed to update todo');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});

// Delete Todo Route
app.post('/deleteTodo/:id', isAuthenticated, async (req, res) => {
    const todoId = req.params.id;
    const userId = req.session.userId;
  
    try {
        // Verify the todo belongs to the logged-in user
        const [checkResult] = await pool.execute('SELECT * FROM todos WHERE id = ? AND user_id = ?', [todoId, userId]);
        
        if (checkResult.length === 0) {
            return res.status(403).json({ success: false, error: 'Unauthorized to delete this todo' });
        }
  
        const [result] = await pool.execute('DELETE FROM todos WHERE id = ?', [todoId]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Todo deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Todo not found' });
        }
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ success: false, error: 'Error deleting todo' });
    }
  });
  

     // Update a todo
     async function updateTodo(formData) {
        try {
            const response = await fetch('/editTodo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.text();
            if (response.ok) {
                alert('Todo updated successfully!');
                fetchTodos(); // Re-fetch todos to show updated list
            } else {
                alert('Error updating todo: ' + result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update todo');
        }
    }

    // Open the Edit Todo Modal with the selected todo's data
function openEditTodoModal(todo) {
    document.getElementById('edit-todo-id').value = todo.id;
    document.getElementById('edit-task').value = todo.task;
    document.getElementById('edit-due-date').value = todo.due_date;
    document.getElementById('edit-priority').value = todo.priority;
    document.getElementById('edit-status').value = todo.status;

    // Open the modal
    document.getElementById('edit-todo-modal').style.display = 'block';
}

// Close the modal
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('edit-todo-modal').style.display = 'none';
});

