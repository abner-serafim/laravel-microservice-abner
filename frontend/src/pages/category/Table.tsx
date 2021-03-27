// @flow
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import categoryHttp from "../../services/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../services/models";
import {DefaultTable, makeActionStyles, TableColumn} from "../../components/Table";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {Link} from "react-router-dom";
import {useSnackbar} from "notistack";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";

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

const Table = () => {
    const snackBar = useSnackbar();
    const isCancel = useRef(false);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<boolean>(false);
    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter();
    const getDataCallback = useCallback(async () => {
        setData([]);
        setLoading(true);

        try {
            const {data} = await categoryHttp.list<ListResponse<Category>>({queryParams: {
                    search: search,
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                }});
            if (isCancel.current) return;
            setData(data.data);
            setTotalRecords(data.meta.total);
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
        search,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order.sort,
        debouncedFilterState.order.dir,
        setTotalRecords,
        snackBar
    ]);

    useEffect(() => {
        isCancel.current = false;
        getDataCallback().then(r => {});
        return () => {
            isCancel.current = true;
        }
    }, [
        search,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        getDataCallback
    ]);

    useEffect(() => {
        let text = filterManager.cleanFilterText(debouncedFilterState.search);
        if (text !== search) {
            setSearch(text);
        }
    }, [
        search,
        debouncedFilterState.search,
        filterManager
    ]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnDefinitions.length-1)}>
            <DefaultTable
                isLoading={loading}
                columns={columnDefinitions}
                data={data}
                title={""}
                options={{
                    serverSide: true,
                    searchText: filterState.search,
                    page: filterState.pagination.page-1,
                    rowsPerPage: filterState.pagination.per_page,
                    count: totalRecords,
                    rowsPerPageOptions: filterManager.rowsPerPageOptions,
                    sortOrder: {
                        direction: filterState.order.dir === "desc" ? "desc" : "asc",
                        name: filterState.order.sort + ""
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => filterManager.reset()}
                        />
                    ),
                    onSearchChange: searchText => filterManager.changeSearch(searchText),
                    onChangePage: currentPage => filterManager.changePage(currentPage),
                    onChangeRowsPerPage: numberOfRows => filterManager.changePerPage(numberOfRows),
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
