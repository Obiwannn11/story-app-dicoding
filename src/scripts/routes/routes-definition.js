import LoginPage from '../pages/login/login.js';
import RegisterPage from '../pages/register/register.js';
import HomePage from '../pages/home/home.js';
import AddStoryPage from '../pages/add-story/add-story.js';
import SavedPage from '../pages/saved/saved.js';

const routes = {
    '/': HomePage,
    '/login': LoginPage,
    '/register': RegisterPage,
    '/home': HomePage, 
    '/add-story': AddStoryPage,
    '/saved': SavedPage,
};

export default routes;