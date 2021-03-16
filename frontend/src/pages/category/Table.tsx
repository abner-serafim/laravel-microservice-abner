// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {Chip} from "@material-ui/core";
import {formatIsoToDTH} from "../../utils/date";
import categoryHttp from "../../services/http/category-http";

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

interface Category {
    id: string;
    name: string;
}

type Props = {

};
const Table = (props: Props) => {

    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        categoryHttp 
            .list<{data: Category[]}>()
            .then(({data}) => setData(data.data));
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
