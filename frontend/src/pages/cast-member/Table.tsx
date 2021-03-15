// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpvideo} from "../../services/http";
import {formatIsoToDTH} from "../../utils/date";

const columnDefinitions: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
    },
    {
        name: 'type_name',
        label: 'Tipo',
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
        httpvideo.get('cast_members').then(
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
