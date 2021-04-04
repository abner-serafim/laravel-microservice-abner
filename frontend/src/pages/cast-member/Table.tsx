// @flow
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import castMemberHttp from "../../services/http/cast-member-http";
import {CastMember, CastMemberTypeMap, ListResponse} from "../../services/models";
import {DefaultTable, makeActionStyles, TableColumn} from "../../components/Table";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";
import useFilter from "../../hooks/useFilter";
import categoryHttp from "../../services/http/category-http";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import yup from '../../utils/vendor/yup';
import {invert} from 'lodash';

const castMemberNames = Object.values(CastMemberTypeMap);

const columnDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '33%',
        options: {
            filter: false,
            sort: false,
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '40%',
        options: {
            filter: false,
        },
    },
    {
        name: 'type_name',
        label: 'Tipo',
        options: {
            filterOptions: {
                names: castMemberNames,
                fullWidth: true
            }
        },
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
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
                        to={`/cast_members/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                );
            }
        }
    },
];

function convertColumn(column: string) {
    if (column === 'type_name') {
        return 'type'
    }
    return column;
}

type Props = {

};
const Table = (props: Props) => {
    const snackBar = useSnackbar();
    const isCancel = useRef(false);
    const [data, setData] = useState<CastMember[]>([]);
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
                    type: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !castMemberNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                });
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter
                    ? {
                        ...(
                            debouncedState.extraFilter.type &&
                            { type: debouncedState.extraFilter.type }
                        )
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    type: queryParams.get('type')
                }
            }
        }
    });

    const columns = filterManager.columns;
    const indexColumnType = columns.findIndex(c => c.name === 'type_name');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const typeFilter = debouncedFilterState.extraFilter?.type;

    const getDataCallback = useCallback(async () => {
        setData([]);
        setLoading(true);

        try {
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: search,
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                    ...(
                        typeFilter &&
                        {type: invert(CastMemberTypeMap)[typeFilter]}
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
        typeFilter,
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
                            [convertColumn(column)]: filterList[columnIndex].length ? filterList[columnIndex][0] : null,
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
