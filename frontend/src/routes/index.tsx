import {RouteProps} from 'react-router-dom';
import Dashboard from "../pages/Dashboard";
import CastMemberPageList from "../pages/cast-member/PageList";
import CastMemberPageForm from "../pages/cast-member/PageForm";
import CategoryPageList from "../pages/category/PageList";
import CategoryPageForm from "../pages/category/PageForm";
import GenrePageList from "../pages/genre/PageList";
import GenrePageForm from "../pages/genre/PageForm";
import VideoPageList from "../pages/video/PageList";
import VideoPageForm from "../pages/video/PageForm";

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
        component: CastMemberPageForm,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: 'Editar membro de elencos',
        path: '/cast_members/:id/edit',
        component: CastMemberPageForm,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Listar categorias',
        path: '/categories',
        component: CategoryPageList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        component: CategoryPageForm,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
        component: CategoryPageForm,
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
        component: GenrePageForm,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gênero',
        path: '/genres/:id/edit',
        component: GenrePageForm,
        exact: true
    },
    {
        name: 'videos.list',
        label: 'Listar vídeos',
        path: '/videos',
        component: VideoPageList,
        exact: true
    },
    {
        name: 'videos.create',
        label: 'Criar vídeo',
        path: '/videos/create',
        component: VideoPageForm,
        exact: true
    },
    {
        name: 'videos.edit',
        label: 'Editar vídeo',
        path: '/videos/:id/edit',
        component: VideoPageForm,
        exact: true
    },
];

export default routes;
