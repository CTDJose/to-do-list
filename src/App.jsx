import './App.css'

function App() {
  const todoList = [
    {id: 1, title: "wake up"},
    {id: 2, title: "brush teeth"},
    {id: 3, title: "drink coffee"},
]

  return (
    <div>
      <h1>To-do-list</h1>
      <ul>
            {todoList.map(todo => <li key={todo.id}>{todo.title}</li>)}
        </ul>
    </div>
      
  )
}

export default App
