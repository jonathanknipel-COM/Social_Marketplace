async function loadUser() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const token = localStorage.getItem('token')

        if (!currentUser || !token) {
            // Delete storage keys & naviagte to login page
            localStorage.removeItem('currentUser')
            localStorage.removeItem('token')
            if (!location.href.startsWith('/login')) {
                location.href = '/login.html'
            }
        }

        const userId = currentUser._id
        const response = await fetch(API_BASE_URL + '/api/users/' + userId, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': token
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json()

        localStorage.setItem('currentUser', JSON.stringify(data.user));
    } catch (err) {
        console.error('An error ocured while loading user data', err)
    }
}

function getLoadedUser() {
    const user = localStorage.getItem('currentUser')
    const parsedUser = JSON.parse(user || '{}')
    
    if (!parsedUser) {
        // Delete storage keys & naviagte to login page
        localStorage.removeItem('currentUser')
        localStorage.removeItem('token')
        if (!location.href.startsWith('/login')) {
            location.href = '/login.html'
        }
    }

    return parsedUser
}