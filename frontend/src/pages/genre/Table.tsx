// @flow
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import genreHttp from "../../services/http/genre-http";
import {Category, Genre, ListResponse} from "../../services/models";
import {DefaultTable, makeActionStyles, TableColumn} from "../../components/Table";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";
import useFilter from "../../hooks/useFilter";
import categoryHttp from "../../services/http/category-http";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import yup from "../../utils/vendor/yup";

const columnDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '25%',
        options: {
            filter: false,
            sort: false
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '25%',
        options: {
            filter: false,
        },
    },
    {
        name: 'categories',
        label: 'Categorias',
        width: '25%',
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: [],
                fullWidth: true
            },
            customBodyRender(values, tableMeta, updateValue) {
                return values.map((value: Category) => value.name).join(', ');
            }
        }
    },
    {
        name: 'is_active',
        label: 'Ativo?',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            filter: false,
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
            filter: false,
            sort: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                );
            }
        }
    },
];

type Props = {

};
const Table = (props: Props) => {
    const snackBar = useSnackbar();
    const isCancel = useRef(false);
    const [data, setData] = useState<Genre[]>([]);
    //const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<boolean>(false);
    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnDefinitions,
        extraFilter: {
            createValidationSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',');
                        })
                        .default(null)
                });
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter
                    ? {
                        ...(
                            debouncedState.extraFilter.categories &&
                            { categories: debouncedState.extraFilter.categories.join(',') }
                        )
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    categories: queryParams.get('categories')
                }
            }
        }
    });

    const columns = filterManager.columns;
    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            setLoading(true);

            try {
                const res = await categoryHttp.list<ListResponse<Category>>({queryParams: {all: ''}});

                if (isCancelled) return;

                //setCategories(res.data.data);
                (columnCategories.options as any).filterOptions.names = res.data.data.map(category => category.name);
            } catch (e) {
                console.log(e)
                snackBar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: "error"}
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isCancelled = true;
        }
        // eslint-disable-next-line
    }, []);

    const categoriesFilter = debouncedFilterState.extraFilter?.categories;

    const getDataCallback = useCallback(async () => {
        setData([]);
        setLoading(true);

        try {
            const {data} = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search: search,
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                    ...(
                        categoriesFilter &&
                        {categories: categoriesFilter.join(',')}
                    ),
                }
            });
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
        categoriesFilter,
        setTotalRecords,
        snackBar
    ]);

    useEffect(() => {
        isCancel.current = false;
        filterManager.pushHistory();
        getDataCallback().then(r => {});
        return () => {
            isCancel.current = true;
        }
    }, [ // eslint-disable-line react-hooks/exhaustive-deps
        getDataCallback
    ]);

    useEffect(() => {
        let text = filterManager.cleanFilterText(debouncedFilterState.search);
        if (text !== search) {
            setSearch(text);
        }
    }, [ // eslint-disable-line react-hooks/exhaustive-deps
        search,
        debouncedFilterState.search
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
                    onFilterChange: (changedColumn, filterList) => {
                        const column = changedColumn as string;
                        const columnIndex = columns.findIndex(c => c.name === column);
                        filterManager.changeExtraFilter({
                            [column]: filterList[columnIndex].length ? filterList[columnIndex] : null,
                        });
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
