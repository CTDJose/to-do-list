import './App.css'
import TodoList from './TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import { useState } from 'react';

const todos = [
    {id: 1, title: "wake up"},
    {id: 2, title: "brush teeth"},
    {id: 3, title: "drink coffee"},
]

function App() {
const [todoList, setTodoList] = useState(todos);
  return (
    <div>
      <h1>To-do-list</h1>
      <TodoForm />
      <TodoList todoList={todoList}  />
    </div>
      
  )
}

export default App
