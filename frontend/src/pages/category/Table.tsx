// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpvideo} from "../../services/http";
import {Chip} from "@material-ui/core";
import {formatIsoToDTH} from "../../utils/date";

const columnDefinitions: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
    },
    {
        name: 'is_active',
        label: 'Ativo?',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ?
                    <Chip label="Sim" color="primary" />
                    :
                    <Chip label="Não" color="secondary" />
                ;
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
];

type Props = {

};
const Table = (props: Props) => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpvideo.get('categories').then(
            res => setData(res.data.data)
        );
    }, []);

    return (
        <MUIDataTable
            columns={columnDefinitions}
            data={data}
            title={""}
        />
    );
};

export default Table;
