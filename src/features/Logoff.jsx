//Logoff.jsx
import { useAuth } from '../contexts/AuthContext.jsx'

function Logoff() {
    const { logout } = useAuth()

    async function handleLogout() {
        const result = await logout()

        if (!result.success) {
            console.error(result.error)
        }
    }

    return (
        <button onClick={handleLogout}>
            Log Out
        </button>
    )
}

export default Logoff
