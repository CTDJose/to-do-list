//TodosPage.jsx
import { useReducer, useEffect, useCallback } from 'react';
import TodoList from './TodoList/TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import SortBy from '../../shared/SortBy.jsx'
import useDebounce from '../../utils/useDebounce.js'
import FilterInput from '../../shared/FilterInput.jsx'
import {
  todoReducer,
  initialTodoState,
  TODO_ACTIONS,
} from '../../reducers/todoReducer';
import { useAuth } from '../../contexts/AuthContext.jsx';
function TodosPage() {
  const {token} = useAuth();
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const {
  todoList,
  error,
  filterError,
  isTodoListLoading,
  sortBy,
  sortDirection,
  filterTerm,
  dataVersion,
} = state;
  const debouncedFilterTerm = useDebounce(filterTerm, 300);
  const invalidateCache = useCallback(() => {
    dispatch({type:TODO_ACTIONS.COMPLETE_TODO_SUCCESS })
    //console.log("Invalidating memo cache after todo mutation");
  }, []);
  const handleFilterChange = (newTerm) => { 
    dispatch({type: TODO_ACTIONS.SET_FILTER,
    payload: {newTerm}
    })};

  useEffect(() => {
    if (token) {
      async function fetchTodos() {
        dispatch({type: TODO_ACTIONS.FETCH_START})
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
              dispatch({type: TODO_ACTIONS.FETCH_SUCCESS,
                        payload: {
                          tasks: data.tasks
                        }
              })
            }
            
          } catch (error) {
            dispatch ({type: TODO_ACTIONS.FETCH_ERROR,
                       payload: {
                        debouncedFilterTerm: debouncedFilterTerm,
                        sortBy: sortBy,
                        sortDirection: sortDirection,
                        message: error.message
                       }
             })
             
          } 
      }
      fetchTodos()
    }

  },[sortBy, sortDirection, token, debouncedFilterTerm]);

  async function updateTodo(editedTodo) {
    const originalTodo = todoList.find(todo=> todo.id === editedTodo.id)
    
    
    dispatch({type: TODO_ACTIONS.UPDATE_TODO_START,
              payload: {editedTodo}
    })
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

      dispatch({type: TODO_ACTIONS.UPDATE_TODO_SUCCESS})

    } catch (error) {
      dispatch({type:TODO_ACTIONS.UPDATE_TODO_ERROR,
                payload: {
                    originalTodo: originalTodo,
                    message: error.message,
                }
      })
      
    }
  }

 async function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false
    };
    dispatch({type: TODO_ACTIONS.ADD_TODO_START,
              payload: {newTodo}
    });
              
    
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
                dispatch({type:TODO_ACTIONS.ADD_TODO_SUCCESS,
                          payload: {
                            newTodo: newTodo,
                            data: data
                          }
                })
        }
      invalidateCache();
    
    } catch (error) {
      dispatch({type: TODO_ACTIONS.ADD_TODO_ERROR,
                payload: {
                  newTodo: newTodo,
                  message: error.message,
                }
      });
      
    }
  }

  async function completeTodo(id) {
    const originalTodo = todoList.find(todo=> todo.id === id)
    dispatch({type: TODO_ACTIONS.COMPLETE_TODO_START,
              payload: {id}
    })
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
      dispatch({type: TODO_ACTIONS.COMPLETE_TODO_SUCCESS})
    } catch (error) {
      dispatch({type: TODO_ACTIONS.COMPLETE_TODO_ERROR,
                payload: {
                  originalTodo: originalTodo,
                  message: error.message
                }
      })
    }
  }

  return (
    <div>
      <h1>To-do-list</h1>
      { error && (
        <>
          <p> {error}
          </p>
          <button onClick={()=> dispatch({type: TODO_ACTIONS.CLEAR_ERROR})}>Clear Error</button>
        </>
      )}

      {filterError && (
        <div>
          <p>
            {filterError}
          </p>
        <button onClick={()=> dispatch({type: TODO_ACTIONS.CLEAR_ERROR})}> Clear Filter Error</button>
        <button onClick={()=> {
          dispatch({type: TODO_ACTIONS.RESET_FILTERS})
        }}>Reset Filters</button>
        </div>

      )}

      { isTodoListLoading && (
        <p>Loading</p>
      )}
      <SortBy sortBy={sortBy} sortDirection={sortDirection} 
      onSortByChange={(newSortBy) =>
        dispatch({type: TODO_ACTIONS.SET_SORT,
                  payload: { sortBy: newSortBy, sortDirection },
        })

      } 
      onSortDirectionChange={(newSortDirection) => 
        dispatch({type: TODO_ACTIONS.SET_SORT,
                  payload: {sortDirection: newSortDirection, sortBy},
        })
      }/>
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
