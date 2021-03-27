import * as Typings from "./types";
import {createActions, createReducer} from 'reduxsauce';


const {Types, Creators} = createActions<{
    SET_SEARCH: string;
    SET_PAGE: string;
    SET_PER_PAGE: string;
    SET_ORDER: string;
    SET_CLEAN: string;
}, {
    setSearch(payload: Typings.SetSearchActions["payload"]): Typings.SetSearchActions;
    setPage(payload: Typings.SetPageActions["payload"]): Typings.SetPageActions;
    setPerPage(payload: Typings.SetPerPageActions["payload"]): Typings.SetPerPageActions;
    setOrder(payload: Typings.SetOrderActions["payload"]): Typings.SetOrderActions;
    setClean(payload: Typings.SetSearchActions["payload"]): Typings.SetSearchActions;
}>({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
    setClean: ['payload'],
});

const INITIAL_STATE: Typings.State = {
    search: '',
    pagination: {
        page: 1,
        per_page: 10
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
});

const Search = {
    Types,
    Creators,
    INITIAL_STATE,
    reducer
};

export default Search;

function setSearch(state = INITIAL_STATE, action: Typings.SetSearchActions): Typings.State {
    return {
        ...state,
        search: `${action.payload.search}`,
        pagination: {
            ...state.pagination,
            page: 1
        }
    };
}

function setPage(state = INITIAL_STATE, action: Typings.SetPageActions): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: action.payload.page
        }
    };
}

function setPerPage(state = INITIAL_STATE, action: Typings.SetPerPageActions): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            per_page: action.payload.per_page
        }
    };
}

function setOrder(state = INITIAL_STATE, action: Typings.SetOrderActions): Typings.State {
    return {
        ...state,
        order: {
            sort: action.payload.sort,
            dir: action.payload.dir
        }
    };
}

function setClean(state = INITIAL_STATE, action: Typings.SetSearchActions): Typings.State {
    return setSearch(INITIAL_STATE, action);
}
