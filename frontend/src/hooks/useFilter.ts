import {Dispatch, Reducer, useReducer, useState} from "react";
import Filter from "../store/filter";
import {Actions as FilterActions, State as FilterState} from "../store/filter/types";
import {limparSearch} from "../components/Table";
import {useDebounce} from "use-debounce";

interface FilterManagerOptions {
    rowsPerPage: number;
    rowsPerPageOptions: number[];
}

export default function useFilter(options?: FilterManagerOptions) {
    const filterManager = new FilterManager(options);
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(Filter.reducer, Filter.INITIAL_STATE);
    const [debouncedFilterState] = useDebounce(filterState, 700);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    filterManager.state = filterState;
    filterManager.dispatch = dispatch;

    return {
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    rowsPerPage: number;
    rowsPerPageOptions: number[];

    constructor(options?: FilterManagerOptions) {
        this.rowsPerPage = 10;
        this.rowsPerPageOptions = [10, 25, 50];

        if (options) {
            const {rowsPerPage, rowsPerPageOptions} = options;
            this.rowsPerPage = rowsPerPage;
            this.rowsPerPageOptions = rowsPerPageOptions;
        }
    }


    changeSearch(value: string | null) {
        value = value || '';
        this.dispatch(Filter.Creators.setSearch({search: value}));
    }

    changePage(value: number) {
        this.dispatch(Filter.Creators.setPage({page: value + 1}));
    }

    changePerPage(value: number) {
        this.dispatch(Filter.Creators.setPerPage({per_page: value}));
    }

    changeColumnSort(changedColumn: string, direction: 'asc' | 'desc') {
        this.dispatch(Filter.Creators.setOrder({
            sort: changedColumn,
            dir: direction
        }));
    }

    reset() {
        this.dispatch(Filter.Creators.setClean({search: limparSearch}));
    }

    cleanFilterText(text) {
        let newText = text;
        if (text === limparSearch) {
            newText = '';
        }
        return newText;
    }
}
