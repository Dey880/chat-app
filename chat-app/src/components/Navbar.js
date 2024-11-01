import "../css/Navbar.css"

export default function Navbar() {
    return(
        <nav>
            <ul>
                <li><a href='/'>Home</a></li>
                <li><a href='/About'>About</a></li>
                <li><a href='/Login'>Login</a></li>
                <li><a href='/CreateUser'>Create User</a></li>
            </ul>
        </nav>
    )
}