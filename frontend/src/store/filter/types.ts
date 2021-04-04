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
    extraFilter?: { [key: string]: any}
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string;
    }
}

export interface SetPageAction extends AnyAction {
    payload: {
        page: number;
    }
}

export interface SetPerPageAction extends AnyAction {
    payload: {
        per_page: number;
    }
}

export interface SetOrderAction extends AnyAction {
    payload: {
        sort: string | null;
        dir: string | null;
    }
}

export interface UpdateExtraFilterAction extends AnyAction {
    payload: { [key: string]: any}
}

export type Actions = SetSearchAction | SetPageAction | SetPerPageAction | SetOrderAction | UpdateExtraFilterAction;
