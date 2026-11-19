import { useState, useEffect, useCallback } from 'react';
import TodoList from './TodoList/TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import SortBy from '../../shared/SortBy.jsx'
import useDebounce from '../../utils/useDebounce.js'
import FilterInput from '../../shared/FilterInput.jsx'

function TodosPage({token}) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterTerm, setFilterTerm] = useState('');
  const debouncedFilterTerm = useDebounce(filterTerm, 300);
  const [dataVersion, setDataVersion] = useState(0);
  const [filterError, setFilterError] = useState('');


  const invalidateCache = useCallback(() => {
    setDataVersion(prev => prev + 1)
    //console.log("Invalidating memo cache after todo mutation");
  }, []);
  const handleFilterChange = (newTerm) => { setFilterTerm(newTerm); };

  useEffect(() => {
    if (token) {
      async function fetchTodos() {
        setIsTodoListLoading(true);
          try {
            const paramsObject = {
              sortBy,
              sortDirection,
              limit: 100,

            };
            if (debouncedFilterTerm) {
              paramsObject.find = debouncedFilterTerm;
            }
            const params = new URLSearchParams(paramsObject);
            const response = await fetch(`/api/tasks?${params}`,  {
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
              setFilterError('');
            }
            
          } catch (error) {
            if (debouncedFilterTerm || sortBy !== 'createdAt' || sortDirection !== 'desc') {
            setFilterError(`Error filtering/sorting todos: ${error.message}`);
            } else {
             setError(`Error fetching todos: ${error.message}`);
             }
          } finally {
            setIsTodoListLoading(false);
          }
      }
      fetchTodos()
    }

  },[sortBy, sortDirection, token, debouncedFilterTerm]);

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

      invalidateCache();

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
      invalidateCache();
    
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
      invalidateCache();
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

      {filterError && (
        <div>
          <p>
            {filterError}
          </p>
        <button onClick={()=> setFilterError('')}> Clear Filter Error</button>
        <button onClick={()=> {
          setFilterTerm(''),
          setSortBy('createdAt'),
          setSortDirection('desc'),
          setFilterError('')
        }}>Reset Filters</button>
        </div>

      )}

      { isTodoListLoading && (
        <p>Loading</p>
      )}
      <SortBy sortBy={sortBy} sortDirection={sortDirection} onSortByChange={setSortBy} onSortDirectionChange={setSortDirection}/>
      <FilterInput filterTerm={filterTerm} onFilterChange={handleFilterChange}/>
      <TodoForm onAddTodo={addTodo} />
      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        dataVersion={dataVersion}
      />
    </div>
  );
}

export default TodosPage;
