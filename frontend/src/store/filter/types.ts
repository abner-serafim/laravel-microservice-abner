import { AnyAction } from 'redux';

export interface Pagination {
    page: number;
    per_page: number;
}

export interface Order {
    sort: string | null;
    dir: string | null;
}

export interface State {
    search: string;
    pagination: Pagination;
    order: Order;
}

export interface SetSearchActions extends AnyAction {
    payload: {
        search: string;
    }
}

export interface SetPageActions extends AnyAction {
    payload: {
        page: number;
    }
}

export interface SetPerPageActions extends AnyAction {
    payload: {
        per_page: number;
    }
}

export interface SetOrderActions extends AnyAction {
    payload: {
        sort: string | null;
        dir: string | null;
    }
}

export type Actions = SetSearchActions | SetPageActions | SetPerPageActions | SetOrderActions;
