import {Dispatch, Reducer, useEffect, useReducer, useState} from "react";
import Filter from "../store/filter";
import {Actions as FilterActions, State as FilterState} from "../store/filter/types";
import {limparSearch, TableColumn} from "../components/Table";
import {useDebounce} from "use-debounce";
import {useHistory} from "react-router";
import {History} from 'history';
import {isEqual} from 'lodash';
import yup from '../utils/vendor/yup';

interface FilterManagerOptions {
    columns: TableColumn[];
    rowsPerPage?: number;
    rowsPerPageOptions?: number[];
    extraFilter?: ExtraFilter
}

interface ExtraFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any,
    formatSearchParams: (debouncedState: FilterState) => any,
    createValidationSchema: () => any,
}

export default function useFilter(options: FilterManagerOptions) {
    const history = useHistory();
    const filterManager = new FilterManager(history, options);
    const INITIAL_STATE = filterManager.getStateFromURL();
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(Filter.reducer, INITIAL_STATE);
    const [debouncedFilterState] = useDebounce(filterState, 700);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    filterManager.state = filterState;
    filterManager.debouncedState = debouncedFilterState;
    filterManager.dispatch = dispatch;

    useEffect(() => {
        filterManager.replaceHistory();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    schema;
    columns: TableColumn[];
    state: FilterState = null as any;
    debouncedState: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    history: History;
    extraFilter?: ExtraFilter = null as any;

    constructor(history: History, options: FilterManagerOptions) {
        this.columns = options.columns;
        this.rowsPerPage = options?.rowsPerPage || 15;
        this.rowsPerPageOptions = options?.rowsPerPageOptions || [15, 25, 50];
        this.history = history;
        this.extraFilter = options?.extraFilter;
        this.createValidationSchema();
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

    changeExtraFilter(value) {
        this.dispatch(Filter.Creators.updateExtraFilter(value));
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

    replaceHistory() {
        this.history.replace(
            {
                pathname: this.history.location.pathname,
                search: "?" + new URLSearchParams(this.formatSearchParams()),
                state: {
                    ...this.debouncedState,
                    search: this.cleanFilterText(this.debouncedState.search)
                }
            }
        )
    }

    pushHistory() {
        const newLocation = {
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams()),
            state: {
                ...this.debouncedState,
                search: this.cleanFilterText(this.debouncedState.search)
            }
        }

        const currentState = this.history.location.state;
        const nextState = newLocation.state;

        if (isEqual(currentState, nextState)) {
            return;
        }

        this.history.push(newLocation);
    }

    private formatSearchParams() {
        const search = this.cleanFilterText(this.debouncedState.search);
        const page = this.debouncedState.pagination.page;
        const per_page = this.debouncedState.pagination.per_page;
        const sort = this.debouncedState.order.sort;
        const dir = this.debouncedState.order.dir;

        return {
            ...(search && search !== '' && {search: search}),
            ...(page && page > 1 && {page: page}),
            ...(per_page && per_page !== 15 && {per_page: per_page}),
            ...(sort && sort !== '' && {sort: sort}),
            ...(dir && dir !== '' && {dir: dir}),
            ...(
                this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState)
            )
        }
    }

    getStateFromURL() {
        const queryParams = new URLSearchParams(this.history.location.search.substr(1));
        return this.schema.cast({
            search: queryParams.get('search'),
            pagination: {
                page: queryParams.get('page'),
                per_page: queryParams.get('per_page'),
            },
            order: {
                sort: queryParams.get('sort'),
                dir: queryParams.get('dir'),
            },
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.getStateFromURL(queryParams)
                }
            )
        });
    }

    private createValidationSchema() {
        this.schema = yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .transform(value => isNaN(value) || !this.rowsPerPageOptions.includes(parseInt(value)) ? undefined : value)
                    .default(15),
            }),
            order: yup.object().shape({
                page: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = this.columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name);
                        return columnsName.includes(value) ? value : undefined;
                    })
                    .default(null),
                per_page: yup.string()
                    .nullable()
                    .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default(null),
            }),
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            )
        });
    }
}
