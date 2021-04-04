import * as Typings from "./types";
import {createActions, createReducer} from 'reduxsauce';


const {Types, Creators} = createActions<{
    SET_SEARCH: string;
    SET_PAGE: string;
    SET_PER_PAGE: string;
    SET_ORDER: string;
    SET_CLEAN: string;
    UPDATE_EXTRA_FILTER: string;
}, {
    setSearch(payload: Typings.SetSearchAction["payload"]): Typings.SetSearchAction;
    setPage(payload: Typings.SetPageAction["payload"]): Typings.SetPageAction;
    setPerPage(payload: Typings.SetPerPageAction["payload"]): Typings.SetPerPageAction;
    setOrder(payload: Typings.SetOrderAction["payload"]): Typings.SetOrderAction;
    setClean(payload: Typings.SetSearchAction["payload"]): Typings.SetSearchAction;
    updateExtraFilter(payload: Typings.UpdateExtraFilterAction["payload"]): Typings.UpdateExtraFilterAction;
}>({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
    setClean: ['payload'],
    updateExtraFilter: ['payload'],
});

const INITIAL_STATE: Typings.State = {
    search: '',
    pagination: {
        page: 1,
        per_page: 15
    },
    order: {
        sort: null,
        dir: null,
    }
};

const reducer = createReducer(INITIAL_STATE, {
    [Types.SET_SEARCH]: setSearch,
    [Types.SET_PAGE]: setPage,
    [Types.SET_PER_PAGE]: setPerPage,
    [Types.SET_ORDER]: setOrder,
    [Types.SET_CLEAN]: setClean,
    [Types.UPDATE_EXTRA_FILTER]: updateExtraFilter,
});

const Search = {
    Types,
    Creators,
    INITIAL_STATE,
    reducer
};

export default Search;

function setSearch(state = INITIAL_STATE, action: Typings.SetSearchAction): Typings.State {
    return {
        ...state,
        search: `${action.payload.search}`,
        pagination: {
            ...state.pagination,
            page: 1
        }
    };
}

function setPage(state = INITIAL_STATE, action: Typings.SetPageAction): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: action.payload.page
        }
    };
}

function setPerPage(state = INITIAL_STATE, action: Typings.SetPerPageAction): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            per_page: action.payload.per_page
        }
    };
}

function setOrder(state = INITIAL_STATE, action: Typings.SetOrderAction): Typings.State {
    return {
        ...state,
        order: {
            sort: action.payload.sort,
            dir: action.payload.dir
        }
    };
}

function setClean(state = INITIAL_STATE, action: Typings.SetSearchAction): Typings.State {
    return setSearch({
        ...INITIAL_STATE,
        pagination: {
            ...INITIAL_STATE.pagination,
            per_page: state.pagination.per_page,
        }
    }, action);
}

function updateExtraFilter(state = INITIAL_STATE, action: Typings.UpdateExtraFilterAction): Typings.State {
    return {
        ...state,
        extraFilter: {
            ...state.extraFilter,
            ...action.payload
        }
    };
}
