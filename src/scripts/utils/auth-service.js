const TOKEN_KEY = 'story_app_token';
const USER_KEY = 'story_app_user'; //  info user

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY); 
}

export function isAuthenticated() {
    return !!getToken();
}

export function saveUser(user) { 
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() { 
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function logout() {
    removeToken();
    // redirect ke halaman login
    console.log('User logged out');
}