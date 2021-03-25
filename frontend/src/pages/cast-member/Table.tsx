// @flow
import * as React from 'react';
import {useEffect, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import castMemberHttp from "../../services/http/cast-member-http";
import {CastMember, ListResponse} from "../../services/models";
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
        width: '33%',
        options: {
            sort: false
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '40%',
    },
    {
        name: 'type_name',
        label: 'Tipo',
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
                        to={`/cast_members/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            setLoading(true);

            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
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
