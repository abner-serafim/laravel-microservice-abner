// @flow
import * as React from 'react';
import {useEffect, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import genreHttp from "../../services/http/genre-http";
import { Category, Genre, ListResponse} from "../../services/models";
import {DefaultTable, makeActionStyles, TableColumn} from "../../components/Table";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";

const columnDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '25%',
        options: {
            sort: false
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '25%',
    },
    {
        name: 'categories',
        label: 'Categorias',
        width: '25%',
        options: {
            customBodyRender(values, tableMeta, updateValue) {
                return values.map((value: Category) => value.name).join(', ');
            }
        }
    },
    {
        name: 'is_active',
        label: 'Ativo?',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
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
    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            setLoading(true);

            try {
                const {data} = await genreHttp.list<ListResponse<Genre>>();
                if (isCancelled) return;
                setData(data.data);
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
    }, [snackBar]);

    return (
        <MuiThemeProvider theme={makeActionStyles(columnDefinitions.length-1)}>
            <DefaultTable
                isLoading={loading}
                columns={columnDefinitions}
                data={data}
                title={""}
            />
        </MuiThemeProvider>
    );
};

export default Table;
