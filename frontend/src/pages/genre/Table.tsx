// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpvideo} from "../../services/http";
import {formatIsoToDTH} from "../../utils/date";
import {BadgeNo, BadgeYes} from "../../components/Badge";

const columnDefinitions: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
    },
    {
        name: 'categories',
        label: 'Categorias',
        options: {
            customBodyRender(values, tableMeta, updateValue) {
                return values.map((value: any) => value.name).join(', ');
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
];

type Props = {

};
const Table = (props: Props) => {

    const [data, setData] = useState([]);

    useEffect(() => {
        httpvideo.get('genres').then(
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
