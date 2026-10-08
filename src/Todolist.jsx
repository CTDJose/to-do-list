function Todolist() {
    const todoList = [
    {id: 1, title: "wake up"},
    {id: 2, title: "brush teeth"},
    {id: 3, title: "drink coffee"},
]
    return (
        <ul>
            {todoList.map(todo => <li key={todo.id}>{todo.title}</li>)}
        </ul>
    );
}

export default Todolist;
