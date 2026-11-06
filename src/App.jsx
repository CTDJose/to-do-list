import './App.css'
import TodoList from './features/TodoList/TodoList.jsx';
import TodoForm from './features/TodoForm.jsx';
import { useState } from 'react';



function App() {
const [todoList, setTodoList] = useState([]);
function updateTodo(editedTodo) {
  const updatedTodos = todoList.map((todo) => {
     return todo.id === editedTodo.id ? { ...editedTodo} : todo
  })
  setTodoList(updatedTodos);
}
function addTodo(todoTitle) {
  const newTodo = {id: Date.now(), title: todoTitle, isCompleted: false};
  setTodoList(previous => [newTodo, ...previous])
}
function completeTodo(id) {
  setTodoList(
    todoList.map((todo) => {
      return todo.id === id
      ?({...todo, isCompleted: true})
      :todo
    })
  );
}
  return (
    <div>
      <h1>To-do-list</h1>
      <TodoForm onAddTodo={addTodo} />
      <TodoList todoList={todoList} onCompleteTodo={completeTodo} onUpdateTodo={updateTodo} />
    </div>
      
  )
}

export default App
