import {RouteProps} from 'react-router-dom';
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/List";

export interface MyRouteProps extends RouteProps {
    name: string,
    label: string,
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Categorias',
        path: '/categorias',
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Categorias Edit',
        path: '/categorias/:id/edit',
        component: CategoryList,
        exact: true
    },
];

export default routes;
