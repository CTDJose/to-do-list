//App.jsx
import './App.css'
import Header from './shared/Header.jsx'
import TodosPage from './features/Todos/TodosPage.jsx'
import Logon from './features/Logon.jsx'
import {useAuth} from './contexts/AuthContext.jsx'
import Logoff from './features/Logoff.jsx'

function App() {
const {isAuthenticated} = useAuth()
  return (
    <div>
      <Header/>
      {isAuthenticated ? (
        <>
        <TodosPage /> 
        <Logoff />
        </>
      ) : (
        <Logon />
      )}
    </div>
      
  )
}

export default App
