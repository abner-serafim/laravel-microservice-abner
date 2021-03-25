// @flow
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import categoryHttp from "../../services/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../services/models";
import {DefaultTable, limparSearch, makeActionStyles, TableColumn} from "../../components/Table";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {Link} from "react-router-dom";
import {useSnackbar} from "notistack";
import {FilterResetButton} from "../../components/Table/FilterResetButton";

const columnDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '33%',
        options: {
            sort: false,
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '40%',
    },
    {
        name: 'is_active',
        label: 'Ativo?',
        width: '4%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{formatIsoToDTH(value)}</span>;
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options: {
            sort: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                );
            }
        }
    },
];

interface Pagination {
    page: number;
    total: number;
    per_page: number;
}

interface Order {
    sort: string | null;
    dir: string | null;
}

interface SearchState {
    search: string | undefined;
    pagination: Pagination;
    order: Order;
}

type Props = {

};
const Table = (props: Props) => {
    const initialState = {
        search: '',
        pagination: {
            page: 1,
            total: 0,
            per_page: 10
        },
        order: {
            sort: null,
            dir: null,
        }
    };
    const snackBar = useSnackbar();
    const isCancel = useRef(false);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, setSearchState] = useState<SearchState>(initialState);
    const getDataCallback = useCallback(async () => {
        setData([]);
        setLoading(true);

        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({queryParams: {
                    search: cleanSearchText(searchState.search),
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page,
                    sort: searchState.order.sort,
                    dir: searchState.order.dir,
                }});
            if (isCancel.current) return;
            setData(data.data);
            setSearchState(prevState => ({
                ...prevState,
                pagination: {
                    ...prevState.pagination,
                    total: data.meta.total
                }
            }))
        } catch (e) {
            console.log(e)
            if (categoryHttp.isCancelledRequest(e)) {
                return;
            }

            snackBar.enqueueSnackbar(
                'Não foi possível carregar as informações',
                {variant: "error"}
            );
        } finally {
            setLoading(false);
        }
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order.sort,
        searchState.order.dir,
        snackBar
    ]);

    function cleanSearchText(text) {
        let newText = text;
        if (text === limparSearch) {
            newText = '';
        }
        return newText;
    }

    useEffect(() => {
        isCancel.current = false;
        getDataCallback();
        return () => {
            isCancel.current = true;
        }
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order,
        getDataCallback
    ]);

    //console.log({teste: searchState.search})

    return (
        <MuiThemeProvider theme={makeActionStyles(columnDefinitions.length-1)}>
            <DefaultTable
                isLoading={loading}
                columns={columnDefinitions}
                data={data}
                title={""}
                options={{
                    serverSide: true,
                    searchText: searchState.search,
                    page: searchState.pagination.page-1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: searchState.pagination.total,
                    sortOrder: {
                        direction: searchState.order.dir === "desc" ? "desc" : "asc",
                        name: searchState.order.sort + ""
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => {
                                setSearchState({
                                    ...initialState,
                                    search: limparSearch
                                });
                            }}
                        />
                    ),
                    onSearchChange: (value) => {
                        value = value || '';
                        setSearchState(prevState => ({
                            ...prevState,
                            search: `${value}`,
                            pagination: {
                                ...prevState.pagination,
                                page: 1
                            }
                        }));
                    },
                    onChangePage: (value) => {
                        setSearchState(prevState => ({
                            ...prevState,
                            pagination: {
                                ...prevState.pagination,
                                page: value + 1
                            }
                        }));
                    },
                    onChangeRowsPerPage: (value) => {
                        setSearchState(prevState => ({
                            ...prevState,
                            pagination: {
                                ...prevState.pagination,
                                per_page: value
                            }
                        }));
                    },
                    onColumnSortChange: (changedColumn, direction) => {
                        setSearchState(prevState => ({
                            ...prevState,
                            order: {
                                sort: changedColumn,
                                dir: direction
                            }
                        }));
                    }
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
