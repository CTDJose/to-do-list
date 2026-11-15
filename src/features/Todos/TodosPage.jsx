import { useState, useEffect } from 'react';
import TodoList from './TodoList/TodoList.jsx';
import TodoForm from './TodoForm.jsx';

function TodosPage({token}) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);

  useEffect(() => {
    if (token) {
      async function fetchTodos() {
        setIsTodoListLoading(true);
          try {
            const params = new URLSearchParams({
              limit: 100,
            });
            const response = await fetch(`/api/tasks?${params}`, {
              headers: {
                'X-CSRF-TOKEN': token,
              },
              credentials: 'include',
            });

            if (response.status === 401) {
              throw new Error('unauthorized');
            }
            if (!response.ok) {
              throw new Error('!Error Cannot Fetch To dos');
            }
            if (response.ok) {
              const data = await response.json();
              setTodoList(data.tasks);
            }
          } catch (error) {
            setError(error.message);
          } finally {
            setIsTodoListLoading(false);
          }
      }
      fetchTodos()
    }

  },[token]);

  async function updateTodo(editedTodo) {
    const originalTodo = todoList.find(todo=> todo.id === editedTodo.id)
    const updatedTodos = todoList.map((todo) => {
      return todo.id === editedTodo.id ? { ...editedTodo } : todo;
    });
    setTodoList(updatedTodos);
    try {
      const response = await fetch(`/api/tasks/${editedTodo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN' : token ,
        },
        credentials: 'include',
        body: JSON.stringify({ title : editedTodo.title , isCompleted : editedTodo.isCompleted })

      });
      if(!response.ok) {
        throw new Error("Error")
      }
    } catch (error) {
      setTodoList(previous => previous.map((todo) => {
                     return todo.id === originalTodo.id ?
                     { ...originalTodo } : todo;
                  }));
      setError(error.message);
    }
  }

 async function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false
    };
    setTodoList(previous => [newTodo, ...previous]);
    try {
      const response = await fetch('/api/tasks', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN' : token ,
        },
        credentials: 'include',
        body: JSON.stringify({ title : newTodo.title , isCompleted : newTodo.isCompleted })
      });

      if (!response.ok) {
        throw new Error("Error")
      }

      if (response.ok) {
              const data = await response.json();
                setTodoList(previous => previous.map((todo) => {
                     return todo.id === newTodo.id ?
                     { ...data } : todo;
                  }));
        }
      
    
    } catch (error) {
      setTodoList(previous =>
        previous.filter(todo => todo.id !== newTodo.id)
      );
      setError(error.message);
    }
  }

  async function completeTodo(id) {
    const originalTodo = todoList.find(todo=> todo.id === id)
    setTodoList(
      todoList.map((todo) => {
        return todo.id === id
          ? { ...todo, isCompleted: true }
          : todo;
      })
    );
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN' : token ,
        },
        credentials: 'include',
        body: JSON.stringify({ isCompleted:true })
      } )
      if(!response.ok) {
        throw new Error("Error");
      }
    } catch (error) {
      setTodoList(previous => previous.map((todo) => {
                     return todo.id === originalTodo.id ?
                     { ...originalTodo } : todo;
                  }));
      setError(error.message);
    }
  }

  return (
    <div>
      <h1>To-do-list</h1>
      { error && (
        <>
          <p> {error}
          </p>
          <button onClick={()=> setError('')}>Clear Error</button>
        </>
      )}
      { isTodoListLoading && (
        <p>Loading</p>
      )}
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
    </div>
  );
}

export default TodosPage;
