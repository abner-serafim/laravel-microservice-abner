import {RouteProps} from 'react-router-dom';
import Dashboard from "../pages/Dashboard";
import CastMemberPageList from "../pages/cast-member/PageList";
import CategoryPageList from "../pages/category/PageList";
import GenrePageList from "../pages/genre/PageList";

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
        name: 'cast_members.list',
        label: 'Listar membros de elencos',
        path: '/cast_members',
        component: CastMemberPageList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: 'Criar membro de elencos',
        path: '/cast_members/create',
        component: CastMemberPageList,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: 'Editar membro de elencos',
        path: '/cast_members/:id/edit',
        component: CastMemberPageList,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Listar Categorias',
        path: '/categories',
        component: CategoryPageList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Criar Categoria',
        path: '/categories/create',
        component: CategoryPageList,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar Categoria',
        path: '/categories/:id/edit',
        component: CategoryPageList,
        exact: true
    },
    {
        name: 'genres.list',
        label: 'Listar gêneros',
        path: '/genres',
        component: GenrePageList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'Criar gênero',
        path: '/genres/create',
        component: GenrePageList,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gênero',
        path: '/genres/:id/edit',
        component: GenrePageList,
        exact: true
    },
];

export default routes;
