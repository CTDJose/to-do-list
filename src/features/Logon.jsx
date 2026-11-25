//Logon.jsx
import {useState} from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
function Logon() {
    const {login} = useAuth()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [isLoggingOn, setIsLoggingOn] = useState(false);
    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoggingOn(true);
        setAuthError("");
        try {
            const result = await login(email, password);

            if (!result.success) {
                setAuthError(result.error);
            }
        } catch (error) {
            setAuthError(`Error: ${error.message}`);
        } finally {
            setIsLoggingOn(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {authError && <p>{authError}</p>}

            <label htmlFor="emailID">Email
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    id="emailID"
                />
            </label>

            <label htmlFor="passwordID">Password
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    id="passwordID"
                />
            </label>

            <button type="submit" disabled={isLoggingOn}>
                {isLoggingOn ? "Logging in..." : "Log On"}
            </button>
        </form>
    )
}

export default Logon;